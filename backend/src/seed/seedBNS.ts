import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import { BNSCode } from '../models/BNSCode';

dotenv.config();

const bnsDataset = [
  {
    sectionNumber: '303(2)',
    title: 'Theft',
    chapter: 'Offences Against Property',
    ipcEquivalent: 'IPC Section 379',
    description: 'Whoever, intending to take dishonestly any movable property out of the possession of any person without that person consent, moves that property in order to such taking, commits theft.',
    punishment: 'Imprisonment up to 3 years, or with fine, or both. Community service for first-time offenders where stolen value is under Rs 5,000.',
    isCognizable: true,
    isBailable: false,
    severityLevel: 'MEDIUM',
    keywords: ['theft', 'chori', 'stolen', 'pocket', 'stole', 'wallet', 'mobile', 'bike', 'goods'],
  },
  {
    sectionNumber: '115(2)',
    title: 'Voluntarily Causing Hurt',
    chapter: 'Offences Affecting Human Body',
    ipcEquivalent: 'IPC Section 323',
    description: 'Whoever voluntarily causes hurt to any person shall be punished with imprisonment or fine.',
    punishment: 'Imprisonment of either description for a term which may extend to 1 year, or fine up to Rs 10,000, or both.',
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
    description: 'In all robbery there is either theft or extortion. Theft is robbery if, in order to the committing of the theft, offender voluntarily causes or attempts to cause death, hurt or wrongful restraint.',
    punishment: 'Rigorously imprisoned up to 10 years and fine.',
    isCognizable: true,
    isBailable: false,
    severityLevel: 'HIGH',
    keywords: ['robbery', 'loot', 'gunpoint', 'knife', 'snatching', 'extortion', 'threat', 'weapons'],
  },
  {
    sectionNumber: '318(4)',
    title: 'Cheating and Dishonestly Inducing Delivery of Property',
    chapter: 'Offences Against Property',
    ipcEquivalent: 'IPC Section 420',
    description: 'Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person.',
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
    description: 'Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine.',
    punishment: 'Death penalty or Life Imprisonment, and fine.',
    isCognizable: true,
    isBailable: false,
    severityLevel: 'CRITICAL',
    keywords: ['murder', 'hatya', 'kill', 'death', 'deadly attack', 'fatal'],
  },
  {
    sectionNumber: '351(2)',
    title: 'Criminal Intimidation',
    chapter: 'Offences Against Public Tranquility',
    ipcEquivalent: 'IPC Section 506',
    description: 'Whoever threatens another with any injury to his person, reputation or property with intent to cause alarm.',
    punishment: 'Imprisonment up to 2 years, or fine, or both.',
    isCognizable: true,
    isBailable: true,
    severityLevel: 'LOW',
    keywords: ['threat', 'dhamki', 'intimidation', 'abusive', 'harm', 'kill threat'],
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[BNS Seeder] Cleaning existing BNS codes...');
    await BNSCode.deleteMany({});

    console.log(`[BNS Seeder] Inserting ${bnsDataset.length} Bharatiya Nyaya Sanhita sections...`);
    await BNSCode.insertMany(bnsDataset);

    console.log('[BNS Seeder] Successfully seeded BNS 2023 legal dataset into MongoDB!');
    process.exit(0);
  } catch (error) {
    console.error('[BNS Seeder] Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
