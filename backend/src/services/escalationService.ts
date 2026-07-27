import { FIR, FIRStatus } from '../models/FIR';
import { AuditLog } from '../models/AuditLog';
import { MerkleService } from './merkleService';

export class EscalationService {
  /**
   * Scans MongoDB for any pending FIRs where 24-hour deadline has passed without valid officer registration or justification
   */
  public static async processExpiredEscalations(): Promise<{ escalatedCount: number; firIds: string[] }> {
    const now = new Date();

    // Find FIRs that are pending explanation or flagged for discrepancy and have passed deadline
    const expiredFIRs = await FIR.find({
      status: { $in: [FIRStatus.REJECTED_PENDING_EXPLANATION, FIRStatus.DISCREPANCY_FLAGGED] },
      'escalation.deadlineAt': { $lte: now },
      'escalation.isEscalated': false,
    });

    const escalatedIds: string[] = [];

    for (const fir of expiredFIRs) {
      fir.status = FIRStatus.ESCALATED_TO_SP;
      fir.escalation.isEscalated = true;
      fir.escalation.spReviewStatus = 'PENDING';
      await fir.save();

      escalatedIds.push(fir.id);

      // Log immutable audit entry
      const proofHash = MerkleService.hashData({
        firId: fir.id,
        firNumber: fir.firNumber,
        escalatedAt: now.toISOString(),
        reason: 'AUTOMATED_24HR_SUPERVISOR_TIMER_EXPIRED',
      });

      await AuditLog.create({
        firId: fir._id,
        actorRole: 'SYSTEM_SUPERVISOR_AGENT',
        action: 'AUTOMATED_SP_ESCALATION_TRIGGERED',
        previousState: { status: FIRStatus.REJECTED_PENDING_EXPLANATION },
        newState: { status: FIRStatus.ESCALATED_TO_SP },
        merkleProofHash: proofHash,
      });

      console.warn(`[EscalationService] FIR ${fir.firNumber} escalated automatically to SP queue.`);
    }

    return { escalatedCount: escalatedIds.length, firIds: escalatedIds };
  }

  /**
   * Initializes a 24-hour escalation countdown on an FIR document
   */
  public static async start24HourTimer(firId: string, officerReason?: string): Promise<Date> {
    const fir = await FIR.findById(firId);
    if (!fir) throw new Error('FIR record not found');

    const now = new Date();
    const deadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    fir.escalation.timerStartedAt = now;
    fir.escalation.deadlineAt = deadline;
    if (officerReason) {
      fir.escalation.officerRejectionReason = officerReason;
    }
    fir.status = FIRStatus.REJECTED_PENDING_EXPLANATION;

    await fir.save();

    const proofHash = MerkleService.hashData({
      firId: fir.id,
      timerStartedAt: now.toISOString(),
      deadlineAt: deadline.toISOString(),
      officerReason,
    });

    await AuditLog.create({
      firId: fir._id,
      actorId: fir.officerId,
      actorRole: 'OFFICER',
      action: 'ESCALATION_24HR_TIMER_STARTED',
      newState: { deadlineAt: deadline, rejectionReason: officerReason },
      merkleProofHash: proofHash,
    });

    return deadline;
  }
}
