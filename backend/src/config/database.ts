import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, UserRole } from '../models/User';

const DEFAULT_ATLAS_URI = 'mongodb+srv://saumyrajpoot666_db_user:NP8tXALxPLhalnIN@cluster0.z8gouio.mongodb.net/nyaya_lipi?retryWrites=true&w=majority';

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI || DEFAULT_ATLAS_URI;
  
  // Disable query buffering so disconnected operations fail instantly with clear status
  mongoose.set('bufferCommands', false);

  try {
    const conn = await mongoose.connect(mongoURI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      tlsInsecure: true,
    });

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    console.log(`[MongoDB] Database Name: ${conn.connection.name}`);
    await autoSeedIfEmpty();
  } catch (error) {
    console.error('[MongoDB] Atlas Connection Warning. Retrying fallback URI...', error);
    try {
      const connFallback = await mongoose.connect(DEFAULT_ATLAS_URI, {
        serverSelectionTimeoutMS: 15000,
      });
      console.log(`[MongoDB Fallback] Connected successfully to host: ${connFallback.connection.host}`);
      await autoSeedIfEmpty();
    } catch (fallbackErr) {
      console.error('[MongoDB Fallback Failure]:', fallbackErr);
    }
  }
};

export const autoSeedIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Auto-Seeder] Empty database detected. Provisioning Master Admin & Officers...');
      const adminPasswordHash = await bcrypt.hash('Admin@9987', 10);
      await User.create({
        badgeNumber: 'ADMIN-HQ-MAIN',
        name: 'Director General of Police (Admin HQ)',
        rank: 'Director General of Police',
        email: 'saumyrajpoot666@gmail.com',
        passwordHash: adminPasswordHash,
        role: UserRole.ADMIN,
        district: 'UP State Police Headquarters, Lucknow',
        state: 'Uttar Pradesh',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      });

      const officerPasswordHash = await bcrypt.hash('Officer@123', 10);
      await User.create({
        badgeNumber: 'PNO-9837',
        name: 'Surjeet Rana',
        rank: 'Sub-Inspector (SI)',
        email: 'surjeet.rana@up.police.gov.in',
        passwordHash: officerPasswordHash,
        role: UserRole.OFFICER,
        district: 'Lucknow Central',
        state: 'Uttar Pradesh',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      });
      console.log('[Auto-Seeder] Master Admin (saumyrajpoot666@gmail.com) & Officer Surjeet provisioned!');
    }
  } catch (err) {
    console.error('[Auto-Seeder Error]:', err);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Disconnected. Reconnection will be handled automatically.');
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Runtime error:', err);
});
