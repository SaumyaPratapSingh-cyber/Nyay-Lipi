import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, UserRole } from '../models/User';
import { PoliceStation } from '../models/PoliceStation';
import { BNSCode } from '../models/BNSCode';
import { FIR } from '../models/FIR';

const DEFAULT_ATLAS_URI = 'mongodb+srv://saumyrajpoot666_db_user:NP8tXALxPLhalnIN@cluster0.z8gouio.mongodb.net/nyaya_lipi?retryWrites=true&w=majority';

// Comprehensive UP Police Stations Dataset
const upPoliceStations = [
  { stationCode: 'UP-LKN-01', name: 'Hazratganj Police Station', district: 'Lucknow Central', state: 'Uttar Pradesh', spEmail: 'sp.lucknow.central@up.police.gov.in', address: 'Hazratganj Chauraha, Lucknow - 226001', phone: '0522-2233441' },
  { stationCode: 'UP-LKN-02', name: 'Gomti Nagar Police Station', district: 'Lucknow East', state: 'Uttar Pradesh', spEmail: 'sp.lucknow.east@up.police.gov.in', address: 'Patrakarpuram Chauraha, Gomti Nagar, Lucknow - 226010', phone: '0522-2309881' },
  { stationCode: 'UP-LKN-03', name: 'Aminabad Police Station', district: 'Lucknow West', state: 'Uttar Pradesh', spEmail: 'sp.lucknow.west@up.police.gov.in', address: 'Aminabad Market, Lucknow - 226018', phone: '0522-2214432' },
  { stationCode: 'UP-VNS-01', name: 'Dashashwamedh Police Station', district: 'Varanasi', state: 'Uttar Pradesh', spEmail: 'sp.varanasi@up.police.gov.in', address: 'Dashashwamedh Ghat Road, Varanasi - 221001', phone: '0542-2451122' },
  { stationCode: 'UP-VNS-02', name: 'Bhelupur Police Station', district: 'Varanasi', state: 'Uttar Pradesh', spEmail: 'sp.varanasi@up.police.gov.in', address: 'Bhelupur Chauraha, Varanasi - 221005', phone: '0542-2310099' },
  { stationCode: 'UP-GBN-01', name: 'Sector 20 Police Station', district: 'Gautam Buddha Nagar (Noida)', state: 'Uttar Pradesh', spEmail: 'cp.noida@up.police.gov.in', address: 'Sector 20, Noida - 201301', phone: '0120-2520020' },
  { stationCode: 'UP-GBN-02', name: 'Sector 39 Police Station', district: 'Gautam Buddha Nagar (Noida)', state: 'Uttar Pradesh', spEmail: 'cp.noida@up.police.gov.in', address: 'Sector 39, Noida - 201303', phone: '0120-2570039' },
  { stationCode: 'UP-KNP-01', name: 'Kotwali Police Station', district: 'Kanpur Nagar', state: 'Uttar Pradesh', spEmail: 'cp.kanpur@up.police.gov.in', address: 'Bada Chauraha, Kanpur - 208001', phone: '0512-2304411' },
  { stationCode: 'UP-PRG-01', name: 'Civil Lines Police Station', district: 'Prayagraj', state: 'Uttar Pradesh', spEmail: 'cp.prayagraj@up.police.gov.in', address: 'Civil Lines, Prayagraj - 211001', phone: '0532-2420011' },
  { stationCode: 'UP-AGR-01', name: 'Tajganj Police Station', district: 'Agra', state: 'Uttar Pradesh', spEmail: 'cp.agra@up.police.gov.in', address: 'Fatehabad Road, Tajganj, Agra - 282001', phone: '0562-2226611' },
  { stationCode: 'UP-GKP-01', name: 'Cantt Police Station', district: 'Gorakhpur', state: 'Uttar Pradesh', spEmail: 'ssp.gorakhpur@up.police.gov.in', address: 'Civil Lines, Cantt, Gorakhpur - 273001', phone: '0551-2200100' },
  { stationCode: 'UP-AYD-01', name: 'Ram Janmabhoomi Police Station', district: 'Ayodhya', state: 'Uttar Pradesh', spEmail: 'ssp.ayodhya@up.police.gov.in', address: 'Ram Janmabhoomi Campus, Ayodhya - 224123', phone: '05278-232323' },
  { stationCode: 'UP-GZB-01', name: 'Indirapuram Police Station', district: 'Ghaziabad', state: 'Uttar Pradesh', spEmail: 'cp.ghaziabad@up.police.gov.in', address: 'Ahinsa Khand, Indirapuram, Ghaziabad - 201014', phone: '0120-2640100' },
  { stationCode: 'UP-MRT-01', name: 'Civil Lines Police Station', district: 'Meerut', state: 'Uttar Pradesh', spEmail: 'ssp.meerut@up.police.gov.in', address: 'Civil Lines, Meerut - 250001', phone: '0121-2660100' },
];

const bnsLegalDataset = [
  {
    sectionNumber: 'BNSS 173',
    title: 'Information in Cognizable Cases (Mandatory FIR Registration & Digital Recording)',
    chapter: 'BNSS 2023 Chapter XIV - Information to Police & Investigation',
    ipcEquivalent: 'CrPC Section 154',
    description: 'Mandates that information relating to cognizable offences reduced to writing or recorded electronically shall be signed by informant. Free copy of FIR to be provided immediately.',
    punishment: 'Mandatory Compliance by Station Officer; Failure triggers BNSS 173(4) SP Appeal.',
    isCognizable: true,
    isBailable: false,
    severityLevel: 'CRITICAL',
    keywords: ['fir', 'bnss 173', 'cognizable', 'registration', 'electronic recording'],
  },
  {
    sectionNumber: '303(2)',
    title: 'Theft',
    chapter: 'Offences Against Property',
    ipcEquivalent: 'IPC Section 379',
    description: 'Whoever, intending to take dishonestly any movable property out of possession without consent, moves that property in order to such taking.',
    punishment: 'Imprisonment up to 3 years, or fine, or both.',
    isCognizable: true,
    isBailable: false,
    severityLevel: 'MEDIUM',
    keywords: ['theft', 'chori', 'stolen', 'pocket', 'wallet', 'mobile', 'property'],
  },
  {
    sectionNumber: '304(2)',
    title: 'Snatching in Transit',
    chapter: 'Offences Against Property',
    ipcEquivalent: 'IPC Section 379 / 392 Equivalent',
    description: 'Snatching of mobile phone, purse, or jewellery while traveling in transit or public transport.',
    punishment: 'Rigorous imprisonment up to 3 years and fine.',
    isCognizable: true,
    isBailable: false,
    severityLevel: 'HIGH',
    keywords: ['snatching', 'auto', 'rickshaw', 'mobile snatching', 'purse snatching'],
  },
];

export const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const mongoURI = process.env.MONGODB_URI || DEFAULT_ATLAS_URI;

  try {
    const conn = await mongoose.connect(mongoURI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 15000,
    });

    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    console.log(`[MongoDB] Database Name: ${conn.connection.name}`);
    await autoSeedIfEmpty();
  } catch (error) {
    console.error('[MongoDB] Primary Atlas Connection Warning. Retrying fallback URI...', error);
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
    // 1. Seed UP Police Stations if 0 exist
    const stationCount = await PoliceStation.countDocuments();
    if (stationCount === 0) {
      console.log(`[Auto-Seeder] Seeding ${upPoliceStations.length} UP Police Stations...`);
      await PoliceStation.insertMany(upPoliceStations);
    }

    // 2. Seed BNS Codes if 0 exist
    const bnsCount = await BNSCode.countDocuments();
    if (bnsCount === 0) {
      console.log(`[Auto-Seeder] Seeding ${bnsLegalDataset.length} BNS Legal Codes...`);
      await BNSCode.insertMany(bnsLegalDataset);
    }

    // 3. Seed Users if 0 exist
    const userCount = await User.countDocuments();
    let sampleStation = await PoliceStation.findOne();
    if (userCount === 0) {
      console.log('[Auto-Seeder] Seeding Master Admin & Officers...');
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
        stationId: sampleStation?._id,
        district: sampleStation?.district || 'Lucknow Central',
        state: 'Uttar Pradesh',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      });
      console.log('[Auto-Seeder] Master Admin & Officer Surjeet provisioned!');
    }

    // 4. Seed Initial FIR Token Session if 0 exist
    const firCount = await FIR.countDocuments();
    if (firCount === 0) {
      console.log('[Auto-Seeder] Seeding Initial Vanshika Singh FIR token session...');
      const sampleOfficer = await User.findOne({ role: UserRole.OFFICER });
      const station = sampleStation || await PoliceStation.findOne();

      await FIR.create({
        tokenNumber: 'TOKEN-UP-STN-10ED-2026-7832',
        firNumber: 'FIR/UP-STN-10ED/2026/0001',
        stationId: station?._id,
        officerId: sampleOfficer?._id,
        complainantDetails: {
          name: 'Vanshika Singh',
          phone: '+91 9876543210',
          address: 'Civil Lines, Prayagraj, UP',
        },
        incidentCategory: 'Mobile Phone Theft & Snatching',
        status: 'REGISTERED',
        aiAudioTranscriptDraft: {
          cleanedTranscript: 'मेरा फ़ोन चोरी हो गया है। सैमसंग फ्लिप था, ऑटो रिक्शा में यात्रा करते समय पर्स से निकाल लिया गया।',
          extractedFacts: {
            stolenItem: 'Samsung Flip Mobile Phone',
            location: 'In Transit - Auto-Rickshaw Route',
          },
          mappedBNSSections: ['303(2)', '304(2)'],
        },
        officerTypedDraft: {
          typedText: 'पीड़िता वंशिका सिंह का सैमसंग फ्लिप मोबाइल फोन ऑटो रिक्शा यात्रा के दौरान अज्ञात आरोपी द्वारा चोरी कर लिया गया।',
          officerBNSSections: ['303(2)'],
        },
        similarityAnalysis: {
          similarityScore: 94,
          status: 'MATCHED',
        },
        audioRecord: {
          fileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          fileHashSHA256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        },
        cryptographicMerkleLock: {
          merkleRootHash: 'a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
          isLocked: true,
          lockedAt: new Date(),
        },
      });
      console.log('[Auto-Seeder] Initial Vanshika Singh FIR token created!');
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
