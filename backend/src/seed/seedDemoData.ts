import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/database';
import { PoliceStation } from '../models/PoliceStation';
import { User, UserRole } from '../models/User';
import { FIR } from '../models/FIR';
import { AuditLog } from '../models/AuditLog';

dotenv.config();

const seedMasterAdminOnly = async () => {
  try {
    await connectDB();

    console.log('[Seeder] Cleaning all database collections (Users, Stations, FIRs, AuditLogs)...');
    await User.deleteMany({});
    await PoliceStation.deleteMany({});
    await FIR.deleteMany({});
    await AuditLog.deleteMany({});

    // Create ONLY the Master System Admin Account
    console.log('[Seeder] Provisioning Master System Admin account...');
    const adminPasswordHash = await bcrypt.hash('Admin@9987', 10);

    const masterAdmin = await User.create({
      badgeNumber: 'ADMIN-HQ-MAIN',
      name: 'System Director General (Admin HQ)',
      rank: 'Director General of Police',
      email: 'saumyrajpoot666@gmail.com',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      district: 'State Police Headquarters',
      state: 'Uttar Pradesh',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    });

    console.log('====================================================================================');
    console.log('✅ DATABASE CLEANED & MASTER ADMIN PROVISIONED');
    console.log(`👑 MASTER ADMIN LOGIN: Email: saumyrajpoot666@gmail.com | Pass: Admin@9987`);
    console.log('ℹ️  All demo stations, demo officers, and demo FIRs have been completely removed.');
    console.log('ℹ️  Master Admin can now provision Police Stations, SPs, and Officers via /admin');
    console.log('====================================================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
};

seedMasterAdminOnly();
