import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/authRoutes';
import firRoutes from './routes/firRoutes';
import bnsRoutes from './routes/bnsRoutes';
import adminRoutes from './routes/adminRoutes';
import { EscalationService } from './services/escalationService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    system: 'Nyaya-Lipi Core API Gateway',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/firs', firRoutes);
app.use('/api/bns', bnsRoutes);
app.use('/api/admin', adminRoutes);

// Background Escalation Supervisor (Runs every 10 minutes)
setInterval(async () => {
  try {
    const result = await EscalationService.processExpiredEscalations();
    if (result.escalatedCount > 0) {
      console.log(`[Supervisor Agent] Automatically escalated ${result.escalatedCount} expired FIRs to SP dashboard.`);
    }
  } catch (err) {
    console.error('[Supervisor Agent Error]:', err);
  }
}, 10 * 60 * 1000);

// Initialize DB and Start Server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Nyaya-Lipi Core API Gateway running on port ${PORT}`);
    console.log(`📁 MongoDB Ledger: Active`);
    console.log(`🔒 Merkle Tree Cryptographic Hash Engine: Online`);
    console.log(`⏱️ 24-Hour Supervisor Escalation Engine: Active`);
    console.log(`=======================================================`);
  });
};

startServer();
