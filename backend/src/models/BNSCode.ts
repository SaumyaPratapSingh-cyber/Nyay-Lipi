import { Schema, model, Document } from 'mongoose';

export interface IBNSCode extends Document {
  sectionNumber: string;         // e.g. "303(2)", "115(2)", "309"
  title: string;                 // e.g. "Theft", "Voluntarily causing hurt"
  chapter: string;               // e.g. "Offences Against Property"
  ipcEquivalent?: string;        // e.g. "IPC Section 379"
  description: string;           // Legal definition under BNS 2023
  punishment: string;            // e.g. "Imprisonment up to 3 years or fine"
  isCognizable: boolean;         // Cognizable vs Non-Cognizable
  isBailable: boolean;           // Bailable vs Non-Bailable
  severityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  keywords: string[];            // Indic & English search keywords
  embedding?: number[];          // Dense vector array for semantic RAG lookups
  createdAt: Date;
  updatedAt: Date;
}

const BNSCodeSchema = new Schema<IBNSCode>(
  {
    sectionNumber: { type: String, required: true, unique: true, index: true, trim: true },
    title: { type: String, required: true, trim: true, index: true },
    chapter: { type: String, required: true, trim: true },
    ipcEquivalent: { type: String, trim: true },
    description: { type: String, required: true },
    punishment: { type: String, required: true },
    isCognizable: { type: Boolean, default: true },
    isBailable: { type: Boolean, default: false },
    severityLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
    },
    keywords: [{ type: String, trim: true }],
    embedding: [{ type: Number }],
  },
  {
    timestamps: true,
  }
);

BNSCodeSchema.index({ title: 'text', description: 'text', keywords: 'text' });

export const BNSCode = model<IBNSCode>('BNSCode', BNSCodeSchema);
