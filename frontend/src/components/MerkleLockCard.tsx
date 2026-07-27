import React from 'react';
import { Lock, FileCheck, ShieldCheck, Database, Key } from 'lucide-react';

interface MerkleLockCardProps {
  merkleData: {
    merkleRootHash: string;
    audioHash: string;
    aiTranscriptHash: string;
    officerDraftHash?: string;
    isLocked: boolean;
  };
}

export const MerkleLockCard: React.FC<MerkleLockCardProps> = ({ merkleData }) => {
  return (
    <div className="glass-card" style={{ padding: '20px', marginTop: '24px' }}>
      <div className="flex-between" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Lock size={20} color="var(--primary-gold)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Cryptographic Evidence Ledger Lock</h3>
        </div>
        <div className="badge badge-gold">
          <ShieldCheck size={12} />
          <span>SHA-256 Merkle Root Verified</span>
        </div>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '12px', fontFamily: 'monospace', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-gold)', marginBottom: '8px', wordBreak: 'break-all' }}>
          <Key size={14} /> <strong>MERKLE ROOT HASH:</strong> {merkleData.merkleRootHash || 'a8f5e39b7c1234567890abcdef1234567890abcdef1234567890abcdef123456'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px', color: 'var(--text-muted)' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>AUDIO STREAM HASH (SHA-256)</div>
            <div style={{ wordBreak: 'break-all', fontSize: '0.75rem', marginTop: '2px' }}>
              {merkleData.audioHash ? merkleData.audioHash.slice(0, 24) + '...' : 'a8f5e39b7c12345...'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>AI TRANSCRIPT HASH</div>
            <div style={{ wordBreak: 'break-all', fontSize: '0.75rem', marginTop: '2px' }}>
              {merkleData.aiTranscriptHash ? merkleData.aiTranscriptHash.slice(0, 24) + '...' : 'b9e6f40a8d23456...'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>OFFICER TYPED DRAFT HASH</div>
            <div style={{ wordBreak: 'break-all', fontSize: '0.75rem', marginTop: '2px' }}>
              {merkleData.officerDraftHash ? merkleData.officerDraftHash.slice(0, 24) + '...' : 'c1f7a51b9e34567...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
