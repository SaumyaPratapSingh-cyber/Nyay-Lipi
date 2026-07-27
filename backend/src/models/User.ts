import { Schema, model, Document } from 'mongoose';

export enum UserRole {
  ADMIN = 'ADMIN',               // System Admin (HQ) - Master control, provisioning, global audits
  SP = 'SP',                     // Superintendent of Police - District Oversight & Escalations
  SHO = 'SHO',                   // Station House Officer / Inspector
  OFFICER = 'OFFICER'            // Station Investigating Officer
}

export interface IUser extends Document {
  badgeNumber: string;
  name: string;
  rank: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  stationId?: Schema.Types.ObjectId;
  district: string;
  state: string;
  photoUrl?: string;
  assignedByAdminId?: Schema.Types.ObjectId;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    badgeNumber: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    rank: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.OFFICER, index: true },
    stationId: { type: Schema.Types.ObjectId, ref: 'PoliceStation' },
    district: { type: String, required: true, trim: true, index: true },
    state: { type: String, required: true, trim: true, default: 'Uttar Pradesh' },
    photoUrl: { type: String, default: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150' },
    assignedByAdminId: { type: Schema.Types.ObjectId, ref: 'User' },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>('User', UserSchema);
