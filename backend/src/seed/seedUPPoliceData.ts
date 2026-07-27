import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/database';
import { PoliceStation } from '../models/PoliceStation';
import { User, UserRole } from '../models/User';
import { BNSCode } from '../models/BNSCode';
import { FIR } from '../models/FIR';
import { AuditLog } from '../models/AuditLog';

dotenv.config();

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

// Expanded Substantive BNS 2023 Penal Codes & Procedural BNSS 2023 Dataset
const bnsLegalDataset = [
  {
    sectionNumber: 'BNSS 173',
    title: 'Information in Cognizable Cases (Mandatory FIR Registration & Digital Recording)',
    chapter: 'BNSS 2023 Chapter XIV - Information to Police & Investigation',
    ipcEquivalent: 'CrPC Section 154',
    description: 'Mandates that information relating to cognizable offences reduced to writing or recorded electronically shall be signed by informant. Free copy of FIR to be provided immediately. preliminary enquiry permitted for offences between 3 to 7 years.',
    punishment: 'Mandatory Compliance by Station Officer; Failure triggers BNSS 173(4) SP Appeal.',
    isCognizable: true,
    isBailable: false,
    severityLevel: 'CRITICAL',
    keywords: ['fir', 'bnss 173', 'cognizable', 'registration', 'electronic recording', 'information'],
  },
  {
    sectionNumber: 'BNSS 176',
    title: 'Procedure for Investigation & Mandatory Forensic Audio-Video Recording',
    chapter: 'BNSS 2023 Chapter XIV - Investigation',
    ipcEquivalent: 'CrPC Section 157',
    description: 'Procedure for police investigation. Mandates mandatory videography / audio-video electronic recording of search, seizure, and forensic evidence collection at crime scene for offences punishable with 7+ years.',
    punishment: 'Procedural Mandate for Police Forensic Audit.',
    isCognizable: true,
    isBailable: false,
    severityLevel: 'CRITICAL',
    keywords: ['bnss 176', 'investigation procedure', 'forensic recording', 'video evidence'],
  },
  {
    sectionNumber: 'BNSS 105',
    title: 'Recording of Search and Seizure through Audio Video Electronic Means',
    chapter: 'BNSS 2023 Chapter VII - Processes to Compel Production of Things',
    ipcEquivalent: 'CrPC Section 100',
    description: 'Process of search and seizure must be recorded through audio-video electronic means, and seizure list prepared shall be forwarded without delay to Magistrate.',
    punishment: 'Mandatory Digital Evidence Seal Rule.',
    isCognizable: true,
    isBailable: false,
    severityLevel: 'HIGH',
    keywords: ['bnss 105', 'search', 'seizure', 'audio video recording', 'electronic proof'],
  },
  {
    sectionNumber: 'BNSS 530',
    title: 'Trial and Proceedings to be Held in Electronic Mode',
    chapter: 'BNSS 2023 Chapter XXXIX - Miscellaneous',
    ipcEquivalent: 'New BNSS Digital Mandate',
    description: 'All trials, inquiries, proceedings, issuance of summons/warrants, examination of witnesses, and digital evidence ledgers under BNSS may be held in electronic mode.',
    punishment: 'Judicial Recognition of Digital Witness System.',
    isCognizable: true,
    isBailable: true,
    severityLevel: 'MEDIUM',
    keywords: ['bnss 530', 'electronic mode', 'digital trial', 'electronic evidence'],
  },
  {
    sectionNumber: '303(2)',
    title: 'Theft',
    chapter: 'Offences Against Property',
    ipcEquivalent: 'IPC Section 379',
    description: 'Whoever, intending to take dishonestly any movable property out of possession without consent, moves that property in order to such taking.',
    punishment: 'Imprisonment up to 3 years, or fine, or both. Community service for first-time theft under Rs 5,000.',
    isCognizable: true,
    isBailable: false,
    severityLevel: 'MEDIUM',
    keywords: ['theft', 'chori', 'stolen', 'pocket', 'wallet', 'mobile', 'property', 'goods'],
  },
  {
    sectionNumber: '115(2)',
    title: 'Voluntarily Causing Hurt',
    chapter: 'Offences Affecting Human Body',
    ipcEquivalent: 'IPC Section 323',
    description: 'Whoever voluntarily causes hurt to any person shall be punished with imprisonment or fine.',
    punishment: 'Imprisonment up to 1 year, or fine up to Rs 10,000, or both.',
    isCognizable: true,
    isBailable: true,
    severityLevel: 'LOW',
    keywords: ['hurt', 'marpeet', 'slap', 'beaten', 'injury', 'assault', 'fight', 'physical'],
  },
  {
    sectionNumber: '309(4)',
    title: 'Robbery',
    chapter: 'Offences Against Property',
    ipcEquivalent: 'IPC Section 392',
    description: 'Theft is robbery if offender voluntarily causes or attempts to cause death, hurt or wrongful restraint or fear thereof.',
    punishment: 'Rigorous imprisonment up to 10 years and fine.',
    isCognizable: true,
    isBailable: false,
    severityLevel: 'HIGH',
    keywords: ['robbery', 'loot', 'gunpoint', 'knife', 'snatching', 'extortion', 'threat', 'weapon'],
  },
  {
    sectionNumber: '318(4)',
    title: 'Cheating & Dishonest Inducement',
    chapter: 'Offences Against Property',
    ipcEquivalent: 'IPC Section 420',
    description: 'Whoever cheats and thereby dishonestly induces the person deceived to deliver any property or alter a valuable security.',
    punishment: 'Imprisonment up to 7 years and fine.',
    isCognizable: true,
    isBailable: false,
    severityLevel: 'MEDIUM',
    keywords: ['cheating', 'fraud', 'dhokhadhadi', 'money fraud', 'banking', 'cyber fraud', 'fake'],
  },
  {
    sectionNumber: '103(1)',
    title: 'Murder',
    chapter: 'Offences Affecting Human Body',
    ipcEquivalent: 'IPC Section 302',
    description: 'Whoever commits murder by causing death with intention or knowledge that act will cause death.',
    punishment: 'Death penalty or Life Imprisonment, and fine.',
    isCognizable: true,
    isBailable: false,
    severityLevel: 'CRITICAL',
    keywords: ['murder', 'hatya', 'kill', 'death', 'deadly attack', 'fatal'],
  },
  {
    sectionNumber: '109',
    title: 'Attempt to Murder',
    chapter: 'Offences Affecting Human Body',
    ipcEquivalent: 'IPC Section 307',
    description: 'Whoever does any act with such intention or knowledge and under such circumstances that if he caused death he would be guilty of murder.',
    punishment: 'Imprisonment up to 10 years and fine; if hurt caused, life imprisonment.',
    isCognizable: true,
    isBailable: false,
    severityLevel: 'CRITICAL',
    keywords: ['attempt to murder', 'jaan se marne ki koshish', 'firing', 'stabbing'],
  },
  {
    sectionNumber: '117(2)',
    title: 'Voluntarily Causing Grievous Hurt',
    chapter: 'Offences Affecting Human Body',
    ipcEquivalent: 'IPC Section 325',
    description: 'Whoever voluntarily causes grievous hurt (fracture, organ impairment, severe bodily pain).',
    punishment: 'Imprisonment up to 7 years and fine.',
    isCognizable: true,
    isBailable: false,
    severityLevel: 'HIGH',
    keywords: ['grievous hurt', 'fracture', 'rod hit', 'head injury', 'severe beating'],
  },
  {
    sectionNumber: '310(2)',
    title: 'Dacoity',
    chapter: 'Offences Against Property',
    ipcEquivalent: 'IPC Section 395',
    description: 'When 5 or more persons conjointly commit or attempt to commit robbery.',
    punishment: 'Imprisonment for life or rigorous imprisonment up to 10 years and fine.',
    isCognizable: true,
    isBailable: false,
    severityLevel: 'CRITICAL',
    keywords: ['dacoity', 'daka', 'gang robbery', 'armed gang'],
  },
  {
    sectionNumber: '319(2)',
    title: 'Cheating by Personation / Cyber Fraud',
    chapter: 'Offences Against Property',
    ipcEquivalent: 'IPC Section 419',
    description: 'Whoever cheats by pretending to be some other person or substituting one person for another.',
    punishment: 'Imprisonment up to 5 years, or fine, or both.',
    isCognizable: true,
    isBailable: false,
    severityLevel: 'MEDIUM',
    keywords: ['cyber crime', 'otp fraud', 'fake identity', 'impersonation', 'phishing'],
  },
  {
    sectionNumber: '351(2)',
    title: 'Criminal Intimidation',
    chapter: 'Offences Against Public Tranquility',
    ipcEquivalent: 'IPC Section 506',
    description: 'Whoever threatens another with injury to person, reputation or property with intent to cause alarm.',
    punishment: 'Imprisonment up to 2 years, or fine, or both.',
    isCognizable: true,
    isBailable: true,
    severityLevel: 'LOW',
    keywords: ['threat', 'dhamki', 'intimidation', 'abusive', 'harm', 'kill threat'],
  },
  {
    sectionNumber: '85',
    title: 'Cruelty by Husband or Relatives for Dowry',
    chapter: 'Offences Against Women',
    ipcEquivalent: 'IPC Section 498A',
    description: 'Whoever being husband or relative subjects a woman to cruelty or unlawful harassment for dowry demands.',
    punishment: 'Imprisonment up to 3 years and fine.',
    isCognizable: true,
    isBailable: false,
    severityLevel: 'HIGH',
    keywords: ['dowry cruelty', 'dahez', 'husband assault', 'in laws harassment'],
  },
];

const seedUPPoliceNetwork = async () => {
  try {
    await connectDB();

    console.log('[UP Police Seeder] Resetting database collections...');
    await User.deleteMany({});
    await PoliceStation.deleteMany({});
    await BNSCode.deleteMany({});
    await FIR.deleteMany({});
    await AuditLog.deleteMany({});

    // 1. Seed Master Admin
    console.log('[UP Police Seeder] Creating Master DG HQ Admin account...');
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

    // 2. Seed UP Police Stations
    console.log(`[UP Police Seeder] Seeding ${upPoliceStations.length} UP Police Stations...`);
    await PoliceStation.insertMany(upPoliceStations);

    // 3. Seed Expanded BNS 2023 & BNSS 2023 Legal Codes
    console.log(`[UP Police Seeder] Seeding ${bnsLegalDataset.length} BNS 2023 & BNSS 2023 legal sections...`);
    await BNSCode.insertMany(bnsLegalDataset);

    console.log('====================================================================================');
    console.log('✅ UTTAR PRADESH POLICE NETWORK & BNSS 2023 LEGAL DATASET SEEDED SUCCESSFULLY!');
    console.log(`👑 MASTER ADMIN LOGIN: Email: saumyrajpoot666@gmail.com | Pass: Admin@9987`);
    console.log(`🏢 Pre-seeded UP Police Stations: ${upPoliceStations.length} stations across Lucknow, Noida, Varanasi, Kanpur, Agra, etc.`);
    console.log(`⚖️  Seeded BNSS 2023 Procedural & BNS 2023 Penal Codes: ${bnsLegalDataset.length} sections.`);
    console.log('====================================================================================');

    process.exit(0);
  } catch (error) {
    console.error('[UP Police Seeder Error]:', error);
    process.exit(1);
  }
};

seedUPPoliceNetwork();
