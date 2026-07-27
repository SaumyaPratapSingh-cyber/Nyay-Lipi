import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middlewares/authMiddleware';
import { User, UserRole } from '../models/User';
import { PoliceStation } from '../models/PoliceStation';
import { FIR } from '../models/FIR';
import { AuditLog } from '../models/AuditLog';
import { MerkleService } from '../services/merkleService';

export class AdminController {
  /**
   * Admin Endpoint: Register a new Police Station
   */
  public static async createStation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { stationCode, name, district, state, spEmail, spBadgeNumber, address, phone } = req.body;

      const existingStation = await PoliceStation.findOne({ stationCode: stationCode.trim().toUpperCase() });
      if (existingStation) {
        res.status(400).json({ success: false, message: `Station with code ${stationCode} already exists` });
        return;
      }

      const station = await PoliceStation.create({
        stationCode: stationCode.trim().toUpperCase(),
        name,
        district,
        state: state || 'Uttar Pradesh',
        spEmail: spEmail.toLowerCase(),
        spBadgeNumber,
        address,
        phone,
      });

      // Audit Log
      await AuditLog.create({
        actorId: req.user?.userId,
        actorRole: 'ADMIN',
        action: 'POLICE_STATION_PROVISIONED',
        newState: { stationCode: station.stationCode, name: station.name },
        merkleProofHash: MerkleService.hashData(station.toObject()),
      });

      res.status(201).json({ success: true, message: 'Police station registered successfully', station });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Admin Endpoint: Provision a new Officer or SP account (Protocolized Provisioning)
   */
  public static async createOfficer(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { badgeNumber, name, rank, email, password, role, stationCode, district, state, photoUrl } = req.body;

      const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { badgeNumber: badgeNumber.trim().toUpperCase() }] });
      if (existingUser) {
        res.status(400).json({ success: false, message: 'Officer with this Email or Badge Number already exists' });
        return;
      }

      let stationId;
      if (stationCode) {
        const station = await PoliceStation.findOne({ stationCode: stationCode.trim().toUpperCase() });
        if (!station) {
          res.status(404).json({ success: false, message: `Police Station with code '${stationCode}' not found.` });
          return;
        }
        stationId = station._id;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        badgeNumber: badgeNumber.trim().toUpperCase(),
        name,
        rank,
        email: email.toLowerCase(),
        passwordHash,
        role: role || UserRole.OFFICER,
        stationId,
        district: district || 'Lucknow Central',
        state: state || 'Uttar Pradesh',
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        assignedByAdminId: req.user?.userId,
      });

      // Audit Log
      await AuditLog.create({
        actorId: req.user?.userId,
        actorRole: 'ADMIN',
        action: 'OFFICER_ACCOUNT_PROVISIONED',
        newState: { badgeNumber: newUser.badgeNumber, role: newUser.role, name: newUser.name },
        merkleProofHash: MerkleService.hashData(newUser.toObject()),
      });

      res.status(201).json({
        success: true,
        message: 'Officer account provisioned successfully',
        officer: {
          id: newUser._id,
          badgeNumber: newUser.badgeNumber,
          name: newUser.name,
          rank: newUser.rank,
          role: newUser.role,
          district: newUser.district,
          photoUrl: newUser.photoUrl,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Admin Endpoint: Update User / Officer Details (Name, Rank, Station, Photo)
   */
  public static async updateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { name, rank, email, stationId, photoUrl, isActive } = req.body;

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'Personnel record not found' });
        return;
      }

      if (name) user.name = name;
      if (rank) user.rank = rank;
      if (email) user.email = email.toLowerCase();
      if (stationId) user.stationId = stationId;
      if (photoUrl) user.photoUrl = photoUrl;
      if (isActive !== undefined) user.active = isActive;

      await user.save();

      await AuditLog.create({
        actorId: req.user?.userId,
        actorRole: 'ADMIN',
        action: 'OFFICER_PROFILE_UPDATED',
        newState: { userId: user._id, badgeNumber: user.badgeNumber, name: user.name, rank: user.rank },
        merkleProofHash: MerkleService.hashData(user.toObject()),
      });

      res.status(200).json({ success: true, message: 'Officer profile updated successfully', user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Admin Endpoint: Reset & Assign New Password for Any User Account
   */
  public static async resetUserPassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.trim().length < 6) {
        res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
        return;
      }

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'Personnel record not found' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
      await user.save();

      // Audit Log
      await AuditLog.create({
        actorId: req.user?.userId,
        actorRole: 'ADMIN',
        action: 'USER_PASSWORD_RESET_BY_ADMIN',
        newState: { userId: user._id, badgeNumber: user.badgeNumber, email: user.email },
        merkleProofHash: MerkleService.hashData({ userId: user._id, resetAt: new Date().toISOString() }),
      });

      res.status(200).json({ success: true, message: `New password assigned successfully for ${user.name} (${user.badgeNumber})` });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Admin Endpoint: List all Police Stations
   */
  public static async getStations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stations = await PoliceStation.find({}).sort({ createdAt: -1 });
      res.status(200).json({ success: true, count: stations.length, stations });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Admin Endpoint: List all Users / Officers
   */
  public static async getUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const users = await User.find({})
        .select('-passwordHash')
        .populate('stationId', 'name stationCode district')
        .sort({ createdAt: -1 });
      res.status(200).json({ success: true, count: users.length, users });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Admin Master Endpoint: Global FIR Registry & Audit Inspector
   */
  public static async getGlobalFIRs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status, stationId, search } = req.query;
      const filter: any = {};

      if (status) filter.status = status;
      if (stationId) filter.stationId = stationId;
      if (search) {
        filter.$or = [
          { firNumber: { $regex: search, $options: 'i' } },
          { 'complainantDetails.name': { $regex: search, $options: 'i' } },
          { 'audioRecord.fileHashSHA256': { $regex: search, $options: 'i' } },
          { 'cryptographicMerkleLock.merkleRootHash': { $regex: search, $options: 'i' } },
        ];
      }

      const firs = await FIR.find(filter)
        .populate('stationId', 'name stationCode district spEmail')
        .populate('officerId', 'name badgeNumber rank photoUrl')
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, count: firs.length, firs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
