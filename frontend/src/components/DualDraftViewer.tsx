import React, { useState, useEffect } from 'react';
import { Bot, UserCheck, AlertTriangle, CheckCircle, Lock, ShieldAlert, Sparkles, FileText, Printer } from 'lucide-react';

interface DualDraftViewerProps {
  firData: any;
  onRegister: (justification?: string) => void;
  onReject: (reason: string) => void;
  onOfficerTypedSubmit: (typedText: string, selectedSections: string[]) => void;
}

export const DualDraftViewer: React.FC<DualDraftViewerProps> = ({
  firData,
  onRegister,
  onReject,
  onOfficerTypedSubmit,
}) => {
  const [typedText, setTypedText] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>(['303(2)', '309(4)']);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (firData?.officerTypedDraft?.typedText) {
      setTypedText(firData.officerTypedDraft.typedText);
    } else {
      setTypedText('');
    }
  }, [firData]);

  const handleSubmitOfficerDraft = (e: React.FormEvent) => {
    e.preventDefault();
    onOfficerTypedSubmit(typedText, selectedSections);
  };

  const handleToggleSection = (sec: string) => {
    if (selectedSections.includes(sec)) {
      setSelectedSections(selectedSections.filter((s) => s !== sec));
    } else {
      setSelectedSections([...selectedSections, sec]);
    }
  };

  const aiDraft = firData?.aiAudioTranscriptDraft;
  const similarity = firData?.similarityAnalysis;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header Card */}
      <div className="glass-card glass-card-gold" style={{ padding: '20px' }}>
        <div className="flex-between">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-gold">{firData?.tokenNumber}</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-gold)' }}>
                {firData?.firNumber}
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Complainant: <strong>{firData?.complainantDetails?.name || 'Complainant'}</strong> ({firData?.complainantDetails?.phone}) • Station: {firData?.stationId?.name || 'Lucknow Central'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={() => onRegister('INSPECT_COPY')}>
              <FileText size={16} /> View Official Form-I FIR Copy
            </button>
            <button className="btn-primary" onClick={() => onRegister()}>
              <CheckCircle size={16} /> Officially Register FIR
            </button>
            <button className="btn-danger" onClick={() => setShowRejectModal(true)}>
              <AlertTriangle size={16} /> Reject (Start 24h SP Timer)
            </button>
          </div>
        </div>
      </div>

      {/* DUAL WORKSTATION GRID */}
      <div className="grid-2">
        {/* LEFT WORKSTATION PANEL: AI AMBIENT VOCAL AUDIO DRAFT */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="flex-between" style={{ marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={20} /> 1. AI Ambient Audio Witness Draft
            </h3>
            <span className="badge badge-gold">LANGGRAPH IMPARTIAL WITNESS</span>
          </div>

          {!aiDraft?.cleanedTranscript && !aiDraft?.rawTranscript ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', border: '1px dashed var(--border-card)' }}>
              Awaiting ambient audio stream... Click <strong>'Start Live Audio Stream'</strong> above to capture spoken interview with victim.
            </div>
          ) : (
            <>
              {/* Captured Audio Transcript */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Raw Verbatim Audio Transcript (Indic Dialect Stream)
                </label>
                <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', color: '#e2e8f0', fontFamily: 'serif' }}>
                  "{aiDraft?.cleanedTranscript || aiDraft?.rawTranscript}"
                </div>
              </div>

              {/* Extracted Fact Entities */}
              {aiDraft?.extractedEntities && (
                <div style={{ marginBottom: '16px', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
                    Extracted Fact Entities
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem' }}>
                    <div><strong>Time:</strong> {aiDraft.extractedEntities.incidentTime || 'Unspecified'}</div>
                    <div><strong>Location:</strong> {aiDraft.extractedEntities.location || 'Station Jurisdiction'}</div>
                    <div><strong>Weapons:</strong> {aiDraft.extractedEntities.weaponsUsed?.join(', ') || 'None'}</div>
                    <div><strong>Accused:</strong> {aiDraft.extractedEntities.accusedDetails?.join(', ') || 'Unspecified'}</div>
                  </div>
                </div>
              )}

              {/* AI Auto-Mapped BNS 2023 Penal Sections */}
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  AI Auto-Mapped BNS 2023 Penal Codes
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {aiDraft?.suggestedBNSSections?.map((sec: any, idx: number) => (
                    <div key={idx} style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--primary-gold)', padding: '10px', borderRadius: '6px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--primary-gold)', fontSize: '0.88rem' }}>
                        BNS Section {sec.sectionNumber} - {sec.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {sec.reasoning}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* RIGHT WORKSTATION PANEL: OFFICER MANUAL TYPED STATEMENT EDITOR */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div className="flex-between" style={{ marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={20} color="#38bdf8" /> 2. Station Officer Manual Typed Statement
            </h3>
            <span className="badge badge-warning">OFFICER MANUAL ENTRY</span>
          </div>

          <form onSubmit={handleSubmitOfficerDraft} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Officer Manual Typed Statement (Simultaneous Interview Notes)
              </label>
              <textarea
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                placeholder="Type officer statement narrative here simultaneously while recording audio..."
                rows={7}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Select BNS 2023 Penal Sections (Officer Charge Selection)
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['303(2) Theft', '309(4) Robbery', '115(2) Hurt', '318(4) Fraud', '351(2) Threat', '85 Dowry Cruelty'].map((sec) => {
                  const secCode = sec.split(' ')[0];
                  const isSelected = selectedSections.includes(secCode);
                  return (
                    <button
                      type="button"
                      key={secCode}
                      onClick={() => handleToggleSection(secCode)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        border: isSelected ? '1px solid var(--primary-gold)' : '1px solid var(--border-card)',
                        background: isSelected ? 'rgba(212, 175, 55, 0.2)' : 'rgba(0,0,0,0.3)',
                        color: isSelected ? 'var(--primary-gold)' : 'var(--text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      BNS {sec}
                    </button>
                  );
                })}
              </div>
            </div>

            <button className="btn-primary" type="submit" style={{ justifyContent: 'center', padding: '12px' }}>
              <Sparkles size={16} /> Draft & Finalize FIR (Run AI Legal Comparison)
            </button>
          </form>
        </div>
      </div>

      {/* DYNAMIC SIMILARITY & FACT INTEGRITY METER */}
      {similarity && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', color: 'var(--primary-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} /> Dynamic Dual-Draft Fact Integrity & Discrepancy Analysis
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '14px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Fact Similarity Meter</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: similarity.overallScore > 75 ? '#34d399' : '#f87171', marginTop: '4px' }}>
                {similarity.overallScore}%
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '14px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Semantic Narrative Alignment</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
                {similarity.semanticScore}%
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '14px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>BNS Legal Alignment</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-gold)', marginTop: '10px' }}>
                {similarity.bnsSectionAlignment}
              </div>
            </div>
          </div>

          {similarity.discrepancies?.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.9rem', color: '#fca5a5', marginBottom: '8px' }}>
                Flagged Fact Discrepancies ({similarity.discrepancies.length}):
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {similarity.discrepancies.map((d: any, idx: number) => (
                  <div key={idx} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--status-danger)', padding: '10px 14px', borderRadius: '6px', fontSize: '0.82rem', color: '#fca5a5' }}>
                    <strong>{d.field}:</strong> {d.description}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* REJECT MODAL (24H SP COUNTDOWN TIMER) */}
      {showRejectModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '480px', padding: '24px', border: '1px solid var(--status-danger)' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--status-danger)', marginBottom: '10px' }}>
              Confirm Officer FIR Rejection
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Submitting a rejection triggers a mandatory <strong>24-Hour SP Oversight Countdown</strong> under Nyaya-Lipi anti-suppression protocol.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="State explicit legal reason for rejecting this FIR..."
              rows={4}
              style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff', fontSize: '0.88rem', marginBottom: '14px' }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => {
                onReject(rejectReason);
                setShowRejectModal(false);
              }}>
                Start 24h SP Escalation Timer
              </button>
              <button className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowRejectModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
