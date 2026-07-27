import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { connectDB, autoSeedIfEmpty } from '../config/database';

export class AuthController {
  /**
   * Public Registration Endpoint (DISABLED for Anti-Corruption Security Protocol)
   */
  public static async register(req: Request, res: Response): Promise<void> {
    res.status(403).json({
      success: false,
      message: 'Access Denied: Public registration is disabled under Nyaya-Lipi security protocol. Officer accounts can only be provisioned by System Administrator.',
    });
  }

  /**
   * Protocolized Login Endpoint for Officers, SPs, and System Admins
   */
  public static async login(req: Request, res: Response): Promise<void> {
    try {
      // Ensure DB connection is active
      if (mongoose.connection.readyState !== 1) {
        await connectDB();
      }

      await autoSeedIfEmpty();

      const { credentialInput: rawCred, badgeNumber, email, password } = req.body;
      const credentialInput = (rawCred || badgeNumber || email || '').trim();

      if (!credentialInput || !password) {
        res.status(400).json({ success: false, message: 'Email / Badge Number and Password are required.' });
        return;
      }

      const escapedInput = credentialInput.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const user = await User.findOne({
        $or: [
          { badgeNumber: new RegExp(`^${escapedInput}$`, 'i') },
          { email: credentialInput.toLowerCase() },
          { name: new RegExp(escapedInput, 'i') },
        ],
      }).populate('stationId', 'name stationCode district');

      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid Badge Number, Email or Password.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid Badge Number, Email or Password.' });
        return;
      }

      if (!user.active) {
        res.status(403).json({ success: false, message: 'Account disabled. Contact System Administrator.' });
        return;
      }

      const token = jwt.sign(
        {
          userId: user._id,
          role: user.role,
          badgeNumber: user.badgeNumber,
          stationId: user.stationId,
        },
        process.env.JWT_SECRET || 'nyaya_lipi_super_secret_jwt_key_2026',
        { expiresIn: '24h' }
      );

      res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          badgeNumber: user.badgeNumber,
          name: user.name,
          rank: user.rank,
          role: user.role,
          district: user.district,
          photoUrl: user.photoUrl,
          station: user.stationId,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get Logged-in User Profile
   */
  public static async getProfile(req: any, res: Response): Promise<void> {
    try {
      if (mongoose.connection.readyState !== 1) {
        await connectDB();
      }

      const user = await User.findById(req.user?.userId)
        .select('-passwordHash')
        .populate('stationId', 'name stationCode district spEmail');
      if (!user) {
        res.status(404).json({ success: false, message: 'User profile not found.' });
        return;
      }
      res.status(200).json({ success: true, user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
