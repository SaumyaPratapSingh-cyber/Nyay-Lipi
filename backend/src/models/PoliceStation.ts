import { Schema, model, Document } from 'mongoose';

export interface IPoliceStation extends Document {
  stationCode: string;
  name: string;
  district: string;
  state: string;
  spEmail: string;              // Auto-escalation target email
  spBadgeNumber?: string;
  address: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

const PoliceStationSchema = new Schema<IPoliceStation>(
  {
    stationCode: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    district: { type: String, required: true, index: true, trim: true },
    state: { type: String, required: true, trim: true, default: 'Uttar Pradesh' },
    spEmail: { type: String, required: true, trim: true, lowercase: true },
    spBadgeNumber: { type: String, trim: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const PoliceStation = model<IPoliceStation>('PoliceStation', PoliceStationSchema);
