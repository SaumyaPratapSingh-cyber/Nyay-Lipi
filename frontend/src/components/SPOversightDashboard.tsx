import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Clock, Volume2, ArrowRight } from 'lucide-react';

interface SPOversightDashboardProps {
  escalatedFIRs: any[];
  onSPDecision: (firId: string, action: 'OVERRIDE_REGISTER' | 'APPROVE_REJECTION', notes: string) => void;
}

export const SPOversightDashboard: React.FC<SPOversightDashboardProps> = ({
  escalatedFIRs,
  onSPDecision,
}) => {
  const [selectedFir, setSelectedFir] = React.useState<any>(escalatedFIRs[0] || null);
  const [spNotes, setSpNotes] = React.useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-card" style={{ padding: '20px', borderLeft: '6px solid var(--status-danger)' }}>
        <div className="flex-between">
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--status-danger)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={26} /> Superintendent of Police (SP) Anti-Corruption Oversight Feed
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Priority queue of FIRs where station officers rejected AI drafts or 24-hour supervisor countdowns expired.
            </p>
          </div>
          <div className="badge badge-danger" style={{ fontSize: '0.9rem', padding: '6px 16px' }}>
            {escalatedFIRs.length} Cases Requiring SP Intervention
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Left Column: Escalated FIR List */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', color: 'var(--text-main)' }}>Escalated Cases Queue</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {escalatedFIRs.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No escalated cases pending SP review.
              </div>
            ) : (
              escalatedFIRs.map((fir) => (
                <div
                  key={fir._id || fir.firNumber}
                  onClick={() => setSelectedFir(fir)}
                  style={{
                    background: selectedFir?._id === fir._id ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0,0,0,0.3)',
                    border: selectedFir?._id === fir._id ? '1px solid var(--status-danger)' : '1px solid var(--border-card)',
                    borderRadius: '12px',
                    padding: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div className="flex-between">
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{fir.firNumber}</span>
                    <span className="badge badge-danger">
                      <Clock size={12} /> 24h Timer Expired
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--primary-gold)', marginTop: '4px' }}>
                    Complainant: {fir.complainantDetails?.name} • Station: {fir.stationId?.name || 'Hazratganj PS'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#fca5a5', marginTop: '6px' }}>
                    <strong>Category:</strong> {fir.incidentCategory}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Case Deep-Dive & Action Controls */}
        {selectedFir ? (
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', color: 'var(--primary-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Volume2 size={18} /> Audit & Comparison Details: {selectedFir.firNumber}
            </h3>

            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem' }}>
              <strong style={{ color: 'var(--text-muted)' }}>Raw Audio Ambient Transcript:</strong>
              <div style={{ marginTop: '4px', color: '#fff' }} className="hindi-text">
                "{selectedFir.aiAudioTranscriptDraft?.rawTranscript}"
              </div>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem' }}>
              <strong style={{ color: 'var(--status-danger)' }}>Officer Manual Draft (Flagged for Suppression):</strong>
              <div style={{ marginTop: '4px', color: '#fff' }}>
                "{selectedFir.officerTypedDraft?.typedText || 'Officer claimed minor argument without weapon evidence.'}"
              </div>
              <div style={{ marginTop: '8px', color: '#fca5a5', fontSize: '0.8rem' }}>
                <strong>Officer Stated Rejection Reason:</strong> {selectedFir.escalation?.officerRejectionReason || 'Claimed insufficient evidence.'}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                SP Decision Directives / Notes:
              </label>
              <textarea
                value={spNotes}
                onChange={(e) => setSpNotes(e.target.value)}
                placeholder="Enter SP official order (e.g., Directing immediate registration under BNS 115 & 351)..."
                rows={3}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '8px',
                  padding: '10px',
                  color: '#fff',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => onSPDecision(selectedFir._id, 'OVERRIDE_REGISTER', spNotes)}
              >
                <CheckCircle size={16} /> SP Override: Register FIR
              </button>
              <button
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => onSPDecision(selectedFir._id, 'APPROVE_REJECTION', spNotes)}
              >
                Approve Rejection
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Select an escalated case from the queue to inspect audio audit details.
          </div>
        )}
      </div>
    </div>
  );
};
