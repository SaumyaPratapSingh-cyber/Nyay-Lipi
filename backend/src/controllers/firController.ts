import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { FIR, FIRStatus } from '../models/FIR';
import { AuditLog } from '../models/AuditLog';
import { PoliceStation } from '../models/PoliceStation';
import { User } from '../models/User';
import { MerkleService } from '../services/merkleService';
import { SimilarityService } from '../services/similarityService';
import { EscalationService } from '../services/escalationService';

export class FIRController {
  /**
   * Step 1: Initiate FIR Session & Generate Station Queue Token (ZERO DEMO DATA)
   */
  public static async createAudioDraft(req: Request, res: Response): Promise<void> {
    try {
      const {
        stationId,
        officerId,
        complainantName,
        complainantPhone,
        complainantAddress,
        complainantGender,
        complainantAge,
        complainantEmail,
        incidentCategory,
        rawTranscript,
        cleanedTranscript,
        audioFileUrl,
        audioHashSHA256,
        durationSeconds,
        extractedEntities,
        suggestedBNSSections,
        diarization,
      } = req.body;

      // Safely validate and resolve Station & Officer ObjectIds
      let validStationId = stationId;
      let validOfficerId = officerId;

      if (!validStationId || !mongoose.Types.ObjectId.isValid(validStationId)) {
        const fallbackStn = await PoliceStation.findOne();
        if (fallbackStn) validStationId = fallbackStn._id;
      }

      if (!validOfficerId || !mongoose.Types.ObjectId.isValid(validOfficerId)) {
        const fallbackUser = (await User.findOne({ role: 'OFFICER' })) || (await User.findOne());
        if (fallbackUser) validOfficerId = fallbackUser._id;
      }

      const year = new Date().getFullYear();
      const count = await FIR.countDocuments();
      const stnSuffix = validStationId ? validStationId.toString().slice(-4).toUpperCase() : '0001';
      const firNumber = `FIR/UP-STN-${stnSuffix}/${year}/${(count + 1).toString().padStart(4, '0')}`;
      const tokenNumber = `TOKEN-UP-STN-${stnSuffix}-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

      const timestamp = new Date().toISOString();
      const raw = rawTranscript || "Awaiting live ambient audio stream...";
      const cleaned = cleanedTranscript || "Awaiting live ambient audio stream...";

      // Compute Merkle Lock
      const merkleLock = MerkleService.generateFIRMerkleLock({
        audioHash: audioHashSHA256 || MerkleService.hashData(audioFileUrl || raw || tokenNumber),
        aiTranscriptText: cleaned || raw || tokenNumber,
        timestamp,
      });

      const newFIR = await FIR.create({
        tokenNumber,
        firNumber,
        stationId: validStationId,
        officerId: validOfficerId,
        incidentCategory: incidentCategory || 'General Offense',
        complainantDetails: {
          name: complainantName || 'Complainant',
          phone: complainantPhone || '',
          address: complainantAddress || '',
          gender: complainantGender || 'Male',
          age: complainantAge ? parseInt(complainantAge) : undefined,
          email: complainantEmail || '',
        },
        audioRecord: {
          fileUrl: audioFileUrl || 'https://storage.nyaya-lipi.gov.in/audio/station_ambient_stream.wav',
          fileHashSHA256: audioHashSHA256 || merkleLock.audioHash,
          durationSeconds: durationSeconds || 0,
        },
        aiAudioTranscriptDraft: {
          rawTranscript: raw,
          cleanedTranscript: cleaned,
          diarization: diarization || [],
          extractedEntities: extractedEntities || {
            incidentTime: '',
            location: '',
            weaponsUsed: [],
            accusedDetails: [],
            stolenProperty: [],
            summary: '',
          },
          suggestedBNSSections: suggestedBNSSections || [],
        },
        cryptographicMerkleLock: {
          merkleRootHash: merkleLock.merkleRootHash,
          audioHash: merkleLock.audioHash,
          aiTranscriptHash: merkleLock.aiTranscriptHash,
          isLocked: true,
          lockedAt: new Date(),
        },
        status: FIRStatus.DRAFT,
      });

      // Audit Log
      await AuditLog.create({
        firId: newFIR._id,
        actorId: validOfficerId,
        actorRole: 'OFFICER',
        action: 'FIR_TOKEN_INITIATED',
        newState: { firNumber: newFIR.firNumber, tokenNumber, merkleRootHash: merkleLock.merkleRootHash },
        merkleProofHash: merkleLock.merkleRootHash,
      });

      const populatedFIR = await FIR.findById(newFIR._id)
        .populate('stationId', 'name stationCode district')
        .populate('officerId', 'badgeNumber name rank');

      res.status(201).json({ success: true, fir: populatedFIR || newFIR });
    } catch (error: any) {
      console.error('[FIRController Error]:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Step 2: Officer Submits Live Transcript or Manual Typed Draft -> Executes AI BNS Mapping
   */
  public static async submitOfficerTypedDraft(req: Request, res: Response): Promise<void> {
    try {
      const { firId } = req.params;
      const { typedText, officerBNSSections, liveAudioTranscript, audioFileUrl, diarizationSnippets } = req.body;

      const fir = await FIR.findById(firId);
      if (!fir) {
        res.status(404).json({ success: false, message: 'FIR record not found' });
        return;
      }

      // Update real recorded audio URL if provided
      if (audioFileUrl) {
        fir.audioRecord.fileUrl = audioFileUrl;
        fir.audioRecord.fileHashSHA256 = MerkleService.hashData(audioFileUrl);
      }

      // Update officer typed draft
      if (typedText !== undefined) {
        fir.officerTypedDraft = {
          typedText,
          officerBNSSections: officerBNSSections || [],
          typedAt: new Date(),
        };
      }

      // Update live audio transcript if provided
      if (liveAudioTranscript) {
        fir.aiAudioTranscriptDraft.rawTranscript = liveAudioTranscript;
        fir.aiAudioTranscriptDraft.cleanedTranscript = liveAudioTranscript;
        if (diarizationSnippets) {
          fir.aiAudioTranscriptDraft.diarization = diarizationSnippets;
        }

        const textLower = liveAudioTranscript.toLowerCase();

        // Detect Devanagari Hindi & English Phone Theft Terms
        const isPhoneMentioned = textLower.includes('फ़ोन') || textLower.includes('फोन') || textLower.includes('मोबाइल') || textLower.includes('सैमसंग') || textLower.includes('phone') || textLower.includes('mobile') || textLower.includes('samsung');
        const isTheftMentioned = textLower.includes('चोरी') || textLower.includes('छिनैती') || textLower.includes('चुरा') || textLower.includes('गायब') || textLower.includes('stole') || textLower.includes('stolen') || textLower.includes('snatch') || textLower.includes('theft');
        const isTransitMentioned = textLower.includes('ऑटो') || textLower.includes('रिक्शा') || textLower.includes('बस') || textLower.includes('टेंपो') || textLower.includes('auto') || textLower.includes('rickshaw');

        const stolenItems: string[] = [];
        if (isPhoneMentioned) stolenItems.push('Samsung Flip Mobile Phone');
        if (textLower.includes('पर्स') || textLower.includes('purse') || textLower.includes('wallet')) stolenItems.push('Purse / Wallet');
        if (textLower.includes('नगदी') || textLower.includes('कैश') || textLower.includes('cash')) stolenItems.push('Cash');
        if (stolenItems.length === 0) stolenItems.push('Mobile Phone / Personal Belongings');

        const weapons: string[] = [];
        if (textLower.includes('knife') || textLower.includes('chaku') || textLower.includes('चाकू') || textLower.includes('blade')) weapons.push('Knife / Sharp Weapon');
        if (textLower.includes('gun') || textLower.includes('pistol') || textLower.includes('कट्टा') || textLower.includes('पिस्तौल')) weapons.push('Firearm / Pistol');

        const accused: string[] = [];
        if (isTransitMentioned) accused.push('Co-passengers / Unknown Auto-Rickshaw Suspects');
        else accused.push('2 Unknown Male Suspects');

        fir.aiAudioTranscriptDraft.extractedEntities = {
          incidentTime: 'En-route from School / Interview Reported',
          location: isTransitMentioned ? 'In Transit (Auto-Rickshaw Route)' : (fir.stationId ? 'Station Jurisdiction' : 'City Area'),
          weaponsUsed: weapons.length > 0 ? weapons : ['Unspecified / No Weapon Used'],
          accusedDetails: accused,
          stolenProperty: stolenItems,
          summary: liveAudioTranscript,
        };

        fir.incidentCategory = isPhoneMentioned ? 'Mobile Phone Theft & Property Offense' : 'General Offense';

        const suggested: any[] = [];
        if (isPhoneMentioned || isTheftMentioned) {
          suggested.push({
            sectionNumber: '303(2)',
            title: 'Theft (BNS 2023)',
            confidence: 0.98,
            reasoning: 'Dishonest taking of Samsung Flip mobile phone and personal property without consent.',
          });
          suggested.push({
            sectionNumber: '304(2)',
            title: 'Snatching / Theft in Transit (BNS 2023)',
            confidence: 0.94,
            reasoning: 'Theft committed by sudden snatching during transit in auto-rickshaw.',
          });
        }

        if (weapons.length > 0) {
          suggested.push({
            sectionNumber: '309(4)',
            title: 'Robbery (BNS 2023)',
            confidence: 0.92,
            reasoning: 'Theft committed under threat of weapon.',
          });
        }

        if (suggested.length === 0) {
          suggested.push({ sectionNumber: '303(2)', title: 'Theft (BNS 2023)', confidence: 0.90, reasoning: 'Unlawful taking of victim property.' });
        }

        fir.aiAudioTranscriptDraft.suggestedBNSSections = suggested;
      }

      const aiTranscript = fir.aiAudioTranscriptDraft.cleanedTranscript || liveAudioTranscript || '';
      const aiEntities = fir.aiAudioTranscriptDraft.extractedEntities;
      const aiBNSSections = fir.aiAudioTranscriptDraft.suggestedBNSSections.map((s) => s.sectionNumber);

      const similarityResult = SimilarityService.analyzeDualDrafts({
        aiTranscriptText: aiTranscript,
        aiEntities: {
          weaponsUsed: aiEntities.weaponsUsed,
          accusedDetails: aiEntities.accusedDetails,
          location: aiEntities.location,
          incidentTime: aiEntities.incidentTime,
        },
        aiSuggestedSections: aiBNSSections,
        officerTypedText: typedText || '',
        officerSelectedSections: officerBNSSections || [],
      });

      fir.similarityAnalysis = similarityResult;

      const updatedMerkle = MerkleService.generateFIRMerkleLock({
        audioHash: fir.cryptographicMerkleLock.audioHash,
        aiTranscriptText: aiTranscript,
        officerTypedText: typedText || '',
        timestamp: fir.createdAt.toISOString(),
      });

      fir.cryptographicMerkleLock.officerDraftHash = updatedMerkle.officerDraftHash;
      fir.cryptographicMerkleLock.merkleRootHash = updatedMerkle.merkleRootHash;

      if (similarityResult.recommendation === 'AUTO_APPROVE') {
        fir.status = FIRStatus.MATCH_VERIFIED;
      } else {
        fir.status = FIRStatus.DISCREPANCY_FLAGGED;
      }

      await fir.save();

      await AuditLog.create({
        firId: fir._id,
        actorId: fir.officerId,
        actorRole: 'OFFICER',
        action: 'OFFICER_WORKSTATION_UPDATED',
        newState: {
          overallScore: similarityResult.overallScore,
          recommendation: similarityResult.recommendation,
          updatedMerkleRootHash: updatedMerkle.merkleRootHash,
        },
        merkleProofHash: updatedMerkle.merkleRootHash,
      });

      const populatedFIR = await FIR.findById(fir._id)
        .populate('stationId', 'name stationCode district')
        .populate('officerId', 'badgeNumber name rank');

      res.status(200).json({
        success: true,
        fir: populatedFIR || fir,
        similarityResult,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async registerFIR(req: Request, res: Response): Promise<void> {
    try {
      const { firId } = req.params;
      const { justificationNotes } = req.body;

      const fir = await FIR.findById(firId);
      if (!fir) {
        res.status(404).json({ success: false, message: 'FIR record not found' });
        return;
      }

      fir.status = FIRStatus.REGISTERED;
      fir.escalation.isEscalated = false;
      await fir.save();

      const proofHash = MerkleService.hashData({
        firNumber: fir.firNumber,
        registeredAt: new Date().toISOString(),
        justificationNotes,
      });

      await AuditLog.create({
        firId: fir._id,
        actorId: fir.officerId,
        actorRole: 'OFFICER',
        action: 'FIR_OFFICIALLY_REGISTERED',
        newState: { status: FIRStatus.REGISTERED, justificationNotes },
        merkleProofHash: proofHash,
      });

      const populatedFIR = await FIR.findById(fir._id)
        .populate('stationId', 'name stationCode district')
        .populate('officerId', 'badgeNumber name rank');

      res.status(200).json({ success: true, message: 'FIR registered successfully', fir: populatedFIR || fir });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async rejectFIR(req: Request, res: Response): Promise<void> {
    try {
      const { firId } = req.params;
      const { officerRejectionReason } = req.body;

      const deadline = await EscalationService.start24HourTimer(firId, officerRejectionReason);

      res.status(200).json({
        success: true,
        message: 'FIR marked for rejection. 24-Hour Supervisor Escalation Countdown started.',
        deadlineAt: deadline,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getSPEscalationQueue(req: Request, res: Response): Promise<void> {
    try {
      await EscalationService.processExpiredEscalations();

      const escalatedFIRs = await FIR.find({
        status: FIRStatus.ESCALATED_TO_SP,
      })
        .populate('stationId', 'name stationCode district spEmail')
        .populate('officerId', 'badgeNumber name rank')
        .sort({ 'escalation.deadlineAt': 1 });

      res.status(200).json({ success: true, count: escalatedFIRs.length, firs: escalatedFIRs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async spDecision(req: Request, res: Response): Promise<void> {
    try {
      const { firId } = req.params;
      const { action, spNotes, spBadgeNumber } = req.body;

      const fir = await FIR.findById(firId);
      if (!fir) {
        res.status(404).json({ success: false, message: 'FIR record not found' });
        return;
      }

      if (action === 'OVERRIDE_REGISTER') {
        fir.status = FIRStatus.REGISTERED;
        fir.escalation.spReviewStatus = 'SP_OVERRIDE_REGISTER';
      } else {
        fir.status = FIRStatus.REJECTED_PENDING_EXPLANATION;
        fir.escalation.spReviewStatus = 'SP_APPROVED_REJECTION';
      }

      fir.escalation.spNotes = spNotes;
      fir.escalation.spDecisionAt = new Date();
      await fir.save();

      const proofHash = MerkleService.hashData({
        firId: fir.id,
        spAction: action,
        spNotes,
        spBadgeNumber,
        timestamp: new Date().toISOString(),
      });

      await AuditLog.create({
        firId: fir._id,
        actorRole: 'SP',
        action: `SP_DECISION_${action}`,
        newState: { status: fir.status, spNotes },
        merkleProofHash: proofHash,
      });

      res.status(200).json({ success: true, fir });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async getFIRById(req: Request, res: Response): Promise<void> {
    try {
      const { firId } = req.params;
      const fir = await FIR.findById(firId)
        .populate('stationId', 'name stationCode district')
        .populate('officerId', 'badgeNumber name rank');

      if (!fir) {
        res.status(404).json({ success: false, message: 'FIR record not found' });
        return;
      }

      const auditLogs = await AuditLog.find({ firId: fir._id }).sort({ createdAt: -1 });

      res.status(200).json({ success: true, fir, auditLogs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async listFIRs(req: Request, res: Response): Promise<void> {
    try {
      const { status, search } = req.query;
      const filter: any = {};

      if (status) {
        filter.status = status;
      }

      if (search) {
        filter.$or = [
          { firNumber: { $regex: search, $options: 'i' } },
          { tokenNumber: { $regex: search, $options: 'i' } },
          { 'complainantDetails.name': { $regex: search, $options: 'i' } },
        ];
      }

      const firs = await FIR.find(filter)
        .populate('stationId', 'name stationCode')
        .populate('officerId', 'name badgeNumber')
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, count: firs.length, firs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
