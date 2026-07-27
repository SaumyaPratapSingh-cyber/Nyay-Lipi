import { Schema, model, Document } from 'mongoose';

export enum FIRStatus {
  DRAFT = 'DRAFT',
  MATCH_VERIFIED = 'MATCH_VERIFIED',
  DISCREPANCY_FLAGGED = 'DISCREPANCY_FLAGGED',
  REGISTERED = 'REGISTERED',
  REJECTED_PENDING_EXPLANATION = 'REJECTED_PENDING_EXPLANATION',
  ESCALATED_TO_SP = 'ESCALATED_TO_SP',
}

export interface IDiarizationSnippet {
  speaker: 'VICTIM' | 'COMPLAINANT' | 'OFFICER' | 'WITNESS' | 'UNKNOWN';
  text: string;
  timestampStart: number;
  timestampEnd: number;
}

export interface IBNSMatch {
  sectionNumber: string;
  title: string;
  confidence: number;
  reasoning: string;
}

export interface IDiscrepancyItem {
  field: string;
  aiValue: string;
  officerValue: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
}

export interface IFIR extends Document {
  tokenNumber: string;                  // Unique Station Queue Token Number (e.g. TOKEN-UP-LKN-01-2026-8891)
  firNumber: string;
  stationId: Schema.Types.ObjectId;
  officerId: Schema.Types.ObjectId;
  incidentCategory: string;

  complainantDetails: {
    name: string;
    phone: string;
    address: string;
    gender: string;
    age?: number;
    email?: string;
  };

  audioRecord: {
    fileUrl: string;
    fileHashSHA256: string;
    durationSeconds: number;
    languageDetected: string;
  };

  aiAudioTranscriptDraft: {
    rawTranscript: string;
    cleanedTranscript: string;
    diarization: IDiarizationSnippet[];
    extractedEntities: {
      incidentTime?: string;
      location?: string;
      weaponsUsed?: string[];
      accusedDetails?: string[];
      stolenProperty?: string[];
      summary: string;
    };
    suggestedBNSSections: IBNSMatch[];
  };

  officerTypedDraft?: {
    typedText: string;
    officerBNSSections: string[];
    typedAt: Date;
  };

  similarityAnalysis?: {
    overallScore: number;                 // 0 - 100%
    semanticScore: number;                // 0 - 100%
    entityOverlapScore: number;           // 0 - 100%
    bnsSectionAlignment: 'EXACT_MATCH' | 'PARTIAL_MATCH' | 'MISMATCH';
    discrepancies: IDiscrepancyItem[];
    recommendation: 'AUTO_APPROVE' | 'WARNING_NEEDS_JUSTIFICATION' | 'FLAG_FOR_SP';
  };

  cryptographicMerkleLock: {
    merkleRootHash: string;
    audioHash: string;
    aiTranscriptHash: string;
    officerDraftHash?: string;
    isLocked: boolean;
    lockedAt?: Date;
  };

  escalation: {
    isEscalated: boolean;
    timerStartedAt?: Date;
    deadlineAt?: Date;
    officerRejectionReason?: string;
    spReviewStatus?: 'NONE' | 'PENDING' | 'SP_OVERRIDE_REGISTER' | 'SP_APPROVED_REJECTION';
    spNotes?: string;
    spDecisionAt?: Date;
  };

  status: FIRStatus;
  createdAt: Date;
  updatedAt: Date;
}

const FIRSchema = new Schema<IFIR>(
  {
    tokenNumber: { type: String, required: true, unique: true, index: true },
    firNumber: { type: String, required: true, unique: true, index: true },
    stationId: { type: Schema.Types.ObjectId, ref: 'PoliceStation', required: true, index: true },
    officerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    incidentCategory: { type: String, required: true, default: 'General Offense' },

    complainantDetails: {
      name: { type: String, required: true, trim: true, default: 'Complainant' },
      phone: { type: String, trim: true, default: '' },
      address: { type: String, default: '' },
      gender: { type: String, default: 'Male' },
      age: { type: Number },
      email: { type: String, trim: true, lowercase: true, default: '' },
    },

    audioRecord: {
      fileUrl: { type: String, default: 'https://storage.nyaya-lipi.gov.in/audio/station_ambient_stream.wav' },
      fileHashSHA256: { type: String, default: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
      durationSeconds: { type: Number, default: 0 },
      languageDetected: { type: String, default: 'hi-IN' },
    },

    aiAudioTranscriptDraft: {
      rawTranscript: { type: String, default: '' },
      cleanedTranscript: { type: String, default: '' },
      diarization: [
        {
          speaker: { type: String, enum: ['VICTIM', 'COMPLAINANT', 'OFFICER', 'WITNESS', 'UNKNOWN'], default: 'UNKNOWN' },
          text: { type: String },
          timestampStart: { type: Number },
          timestampEnd: { type: Number },
        },
      ],
      extractedEntities: {
        incidentTime: { type: String, default: '' },
        location: { type: String, default: '' },
        weaponsUsed: [{ type: String }],
        accusedDetails: [{ type: String }],
        stolenProperty: [{ type: String }],
        summary: { type: String, default: '' },
      },
      suggestedBNSSections: [
        {
          sectionNumber: { type: String },
          title: { type: String },
          confidence: { type: Number },
          reasoning: { type: String },
        },
      ],
    },

    officerTypedDraft: {
      typedText: { type: String, default: '' },
      officerBNSSections: [{ type: String }],
      typedAt: { type: Date },
    },

    similarityAnalysis: {
      overallScore: { type: Number, default: 0 },
      semanticScore: { type: Number, default: 0 },
      entityOverlapScore: { type: Number, default: 0 },
      bnsSectionAlignment: { type: String, enum: ['EXACT_MATCH', 'PARTIAL_MATCH', 'MISMATCH'], default: 'MISMATCH' },
      discrepancies: [
        {
          field: { type: String },
          aiValue: { type: String },
          officerValue: { type: String },
          severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
          description: { type: String },
        },
      ],
      recommendation: { type: String, enum: ['AUTO_APPROVE', 'WARNING_NEEDS_JUSTIFICATION', 'FLAG_FOR_SP'], default: 'WARNING_NEEDS_JUSTIFICATION' },
    },

    cryptographicMerkleLock: {
      merkleRootHash: { type: String, required: true, index: true },
      audioHash: { type: String, required: true },
      aiTranscriptHash: { type: String, required: true },
      officerDraftHash: { type: String },
      isLocked: { type: Boolean, default: true },
      lockedAt: { type: Date, default: Date.now },
    },

    escalation: {
      isEscalated: { type: Boolean, default: false, index: true },
      timerStartedAt: { type: Date },
      deadlineAt: { type: Date, index: true },
      officerRejectionReason: { type: String },
      spReviewStatus: { type: String, enum: ['NONE', 'PENDING', 'SP_OVERRIDE_REGISTER', 'SP_APPROVED_REJECTION'], default: 'NONE' },
      spNotes: { type: String },
      spDecisionAt: { type: Date },
    },

    status: {
      type: String,
      enum: Object.values(FIRStatus),
      default: FIRStatus.DRAFT,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const FIR = model<IFIR>('FIR', FIRSchema);
