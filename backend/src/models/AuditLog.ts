import { Schema, model, Document } from 'mongoose';

export interface IAuditLog extends Document {
  firId?: Schema.Types.ObjectId;
  actorId?: Schema.Types.ObjectId;
  actorRole: string;
  action: string;                // e.g. "AUDIO_RECORDED", "AI_DRAFT_GENERATED", "OFFICER_TYPED_SUBMITTED", "SIMILARITY_ANALYZED", "ESCALATION_TRIGGERED", "SP_OVERRIDDEN"
  previousState?: any;
  newState?: any;
  merkleProofHash: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    firId: { type: Schema.Types.ObjectId, ref: 'FIR', index: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    actorRole: { type: String, required: true },
    action: { type: String, required: true, index: true },
    previousState: { type: Schema.Types.Mixed },
    newState: { type: Schema.Types.Mixed },
    merkleProofHash: { type: String, required: true, index: true },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const AuditLog = model<IAuditLog>('AuditLog', AuditLogSchema);
