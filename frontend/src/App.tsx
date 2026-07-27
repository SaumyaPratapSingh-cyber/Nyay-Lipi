import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { AudioRecorder } from './components/AudioRecorder';
import { DualDraftViewer } from './components/DualDraftViewer';
import { MerkleLockCard } from './components/MerkleLockCard';
import { SPOversightDashboard } from './components/SPOversightDashboard';
import { AdminPortal } from './components/AdminPortal';
import { BNSModal } from './components/BNSModal';
import { IntakeModal } from './components/IntakeModal';
import { OfficialFIRPDF } from './components/OfficialFIRPDF';
import { BookOpen, RefreshCw, FileText, PlusCircle, Tag, Shield, ChevronRight, Clock, User, Sparkles, Scale } from 'lucide-react';
import { getApiUrl, apiFetch } from './api';

export const App: React.FC = () => {
  const [pathname, setPathname] = useState(window.location.pathname);
  const isAdminRoute = pathname.startsWith('/admin');

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [token, setToken] = useState<string>('');

  const [firs, setFirs] = useState<any[]>([]);
  const [activeFir, setActiveFir] = useState<any>(null);
  const [escalatedFirs, setEscalatedFirs] = useState<any[]>([]);

  const [isBNSOpen, setIsBNSOpen] = useState(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [pdfFir, setPdfFir] = useState<any>(null);
  const [appLoading, setAppLoading] = useState(true);

  // Animated UP Police Splash Screen on initial launch
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 1600);
    return () => clearTimeout(timer);
  }, []);

  // Sync pathname on navigation
  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check stored auth session
  useEffect(() => {
    const savedToken = localStorage.getItem('nyaya_lipi_token');
    const savedUser = localStorage.getItem('nyaya_lipi_user');
    if (savedToken && savedUser) {
      const u = JSON.parse(savedUser);
      setToken(savedToken);
      setCurrentUser(u);
    }
  }, []);

  const handleLoginSuccess = (user: any, authToken: string) => {
    setCurrentUser(user);
    setToken(authToken);
    localStorage.setItem('nyaya_lipi_token', authToken);
    localStorage.setItem('nyaya_lipi_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken('');
    localStorage.removeItem('nyaya_lipi_token');
    localStorage.removeItem('nyaya_lipi_user');
  };

  // Fetch FIRs from backend
  const fetchFIRs = async () => {
    try {
      const data = await apiFetch('/api/firs');
      if (data.success) {
        setFirs(data.firs || []);
      }

      // Fetch SP Escalations Queue
      const spData = await apiFetch('/api/firs/sp/escalations');
      if (spData.success) {
        setEscalatedFirs(spData.firs || []);
      }
    } catch (err) {
      console.error('Error fetching FIRs from API:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchFIRs();
    }
  }, [currentUser]);

  // Initiate New FIR Token Session via Intake Modal
  const handleInitiateFIR = async (intakeData: any) => {
    try {
      const data = await apiFetch('/api/firs/audio-draft', {
        method: 'POST',
        body: JSON.stringify({
          stationId: currentUser?.station?._id || currentUser?.station || undefined,
          officerId: currentUser?.id || currentUser?._id || undefined,
          ...intakeData,
        }),
      });
      if (data.success) {
        setActiveFir(data.fir);
        fetchFIRs();
      } else {
        alert(`Failed to create FIR token session: ${data.message}`);
      }
    } catch (err: any) {
      alert(`Error initiating FIR token session: ${err.message}`);
    }
  };

  // Handle Ambient Audio Recording completion (Real Spoken Audio)
  const handleTranscriptGenerated = async (liveTranscript: string, diarization: any[], audioFileUrl?: string) => {
    if (!activeFir) return;
    try {
      const data = await apiFetch(`/api/firs/${activeFir._id}/typed-draft`, {
        method: 'POST',
        body: JSON.stringify({
          typedText: activeFir.officerTypedDraft?.typedText || '',
          officerBNSSections: activeFir.officerTypedDraft?.officerBNSSections || ['303(2)'],
          liveAudioTranscript: liveTranscript,
          audioFileUrl: audioFileUrl || undefined,
          diarizationSnippets: diarization,
        }),
      });
      if (data.success) {
        setActiveFir(data.fir);
        fetchFIRs();
      }
    } catch (err) {
      console.error('Error updating live transcript:', err);
    }
  };

  // Handle Officer Manual Typed Submission -> Triggers Dual-Draft Similarity Check
  const handleOfficerTypedSubmit = async (typedText: string, selectedSections: string[]) => {
    if (!activeFir) return;
    try {
      const data = await apiFetch(`/api/firs/${activeFir._id}/typed-draft`, {
        method: 'POST',
        body: JSON.stringify({
          typedText,
          officerBNSSections: selectedSections,
          liveAudioTranscript: activeFir.aiAudioTranscriptDraft?.cleanedTranscript || '',
        }),
      });
      if (data.success) {
        setActiveFir(data.fir);
        fetchFIRs();
      }
    } catch (err) {
      console.error('Error submitting typed draft:', err);
    }
  };

  // Handle Register FIR or View Form-I PDF
  const handleRegister = async (justification?: string) => {
    if (!activeFir) return;
    if (justification === 'INSPECT_COPY') {
      setPdfFir(activeFir);
      return;
    }

    try {
      const data = await apiFetch(`/api/firs/${activeFir._id}/register`, {
        method: 'POST',
        body: JSON.stringify({ justificationNotes: justification }),
      });
      if (data.success) {
        alert(`FIR ${activeFir.firNumber} (Token: ${activeFir.tokenNumber}) officially registered! Opening Form-I PDF...`);
        setActiveFir(data.fir);
        setPdfFir(data.fir);
        fetchFIRs();
      }
    } catch (err: any) {
      alert(`Error registering FIR: ${err.message}`);
      console.error('Error registering FIR:', err);
    }
  };

  // Handle Reject FIR (Starts 24h Timer)
  const handleReject = async (reason: string) => {
    if (!activeFir) return;
    try {
      const data = await apiFetch(`/api/firs/${activeFir._id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ officerRejectionReason: reason }),
      });
      if (data.success) {
        alert('FIR marked for rejection. 24-Hour Supervisor Countdown Started!');
        fetchFIRs();
      }
    } catch (err: any) {
      alert(`Error rejecting FIR: ${err.message}`);
      console.error('Error rejecting FIR:', err);
    }
  };

  // Handle SP Action
  const handleSPDecision = async (firId: string, action: 'OVERRIDE_REGISTER' | 'APPROVE_REJECTION', notes: string) => {
    try {
      const data = await apiFetch(`/api/firs/${firId}/sp-action`, {
        method: 'POST',
        body: JSON.stringify({ action, spNotes: notes, spBadgeNumber: currentUser?.badgeNumber }),
      });
      if (data.success) {
        alert(`SP Decision recorded: ${action}`);
        fetchFIRs();
      }
    } catch (err: any) {
      alert(`Error processing SP decision: ${err.message}`);
      console.error('Error processing SP decision:', err);
    }
  };

  // Render UP Police Animated Brand Loading Splash Screen
  if (appLoading) {
    return (
      <div className="police-splash-overlay">
        <div className="police-emblem-ring">
          <div className="police-emblem-center">
            <Shield size={38} color="#f59e0b" />
            <Scale size={20} color="#fff" style={{ marginTop: '2px' }} />
          </div>
        </div>

        <h1 className="police-title-glow">NYAYA-LIPI (न्याय-लिपि)</h1>
        <p className="police-subtext">UTTAR PRADESH POLICE • उत्तर प्रदेश पुलिस निष्पक्ष साक्ष्य प्रणाली</p>

        <div className="loading-bar-track">
          <div className="loading-bar-fill"></div>
        </div>

        <div style={{ marginTop: '16px', fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} color="#f59e0b" /> Initializing Cryptographic Evidence Engine & Devanagari NLP...
        </div>
      </div>
    );
  }

  // Render Login Screen if not logged in
  if (!currentUser) {
    return <LoginScreen isAdminRoute={isAdminRoute} onLoginSuccess={handleLoginSuccess} />;
  }

  // Route 1: Central Admin Portal (/admin)
  if (isAdminRoute) {
    if (currentUser.role !== 'ADMIN') {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--status-danger)' }}>Access Denied</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
              Your account ({currentUser.role}) does not have Central Admin HQ privileges.
            </p>
            <button className="btn-secondary" style={{ marginTop: '16px' }} onClick={handleLogout}>
              Sign Out & Switch Account
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={{ minHeight: '100vh', paddingBottom: '40px' }}>
        <Navbar currentUser={currentUser} onLogout={handleLogout} isAdminRoute={true} />
        <main className="container">
          <AdminPortal token={token} />
        </main>
      </div>
    );
  }

  // Route 2: Station Officer Workstation Portal (/)
  return (
    <div style={{ minHeight: '100vh', paddingBottom: '40px' }}>
      <Navbar currentUser={currentUser} onLogout={handleLogout} isAdminRoute={false} />

      <main className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 20px' }}>
        {currentUser.role === 'SP' ? (
          <SPOversightDashboard
            escalatedFIRs={escalatedFirs}
            onSPDecision={handleSPDecision}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
            {/* LEFT SIDEBAR: TOKEN QUEUE & ACTION CENTER */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Initiate New FIR Hero Action */}
              <div className="glass-card glass-card-gold" style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏛️</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-gold)', marginBottom: '4px' }}>
                  UTTAR PRADESH POLICE
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  {currentUser?.station?.name || 'Station Workstation'}
                </p>

                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '0.95rem' }} onClick={() => setIsIntakeOpen(true)}>
                  <PlusCircle size={18} /> Initiate New FIR Token
                </button>
              </div>

              {/* Station Active Queue Sidebar */}
              <div className="glass-card" style={{ padding: '18px' }}>
                <div className="flex-between" style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={16} /> Token Queue ({firs.length})
                  </span>
                  <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={fetchFIRs}>
                    <RefreshCw size={12} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '550px', overflowY: 'auto' }}>
                  {firs.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '20px 10px', textAlign: 'center' }}>
                      No active tokens. Click <strong>'+ Initiate New FIR Token'</strong> above to begin.
                    </div>
                  ) : (
                    firs.map((fir) => {
                      const isActive = activeFir?._id === fir._id;
                      return (
                        <div
                          key={fir._id}
                          onClick={() => setActiveFir(fir)}
                          style={{
                            padding: '12px',
                            borderRadius: '10px',
                            background: isActive ? 'rgba(245, 158, 11, 0.2)' : 'rgba(0,0,0,0.3)',
                            border: isActive ? '1px solid var(--primary-gold)' : '1px solid var(--border-card)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          className="hover-card"
                        >
                          <div className="flex-between">
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isActive ? 'var(--primary-gold)' : '#fff' }}>
                              {fir.tokenNumber || fir.firNumber}
                            </span>
                            <span className={`badge ${fir.status === 'REGISTERED' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                              {fir.status}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <User size={12} /> {fir.complainantDetails?.name}
                          </div>

                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={12} /> {new Date(fir.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setIsBNSOpen(true)}>
                <BookOpen size={16} /> BNSS 2023 Codebook
              </button>
            </div>

            {/* MAIN WORKSTATION CONTENT */}
            <div>
              {!activeFir ? (
                /* CLEAN FRONT HERO SCREEN WHEN NO TOKEN IS SELECTED */
                <div className="glass-card glass-card-gold" style={{ padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '520px' }}>
                  <div style={{ fontSize: '4.5rem', marginBottom: '16px' }}>🏛️</div>
                  <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-gold)', letterSpacing: '1px', marginBottom: '8px' }}>
                    UTTAR PRADESH POLICE / उत्तर प्रदेश पुलिस
                  </h1>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
                    NYAYA-LIPI (न्याय-लिपि) AMBIENT DIGITAL WITNESS WORKSTATION
                  </h2>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', maxWidth: '650px', lineHeight: 1.6, marginBottom: '28px' }}>
                    Impartial edge-to-cloud witness system designed under <strong>Bharatiya Nagarik Suraksha Sanhita (BNSS 2023) Section 173</strong>. Select an existing token from the left queue or initiate a new complainant FIR token.
                  </p>

                  <button className="btn-primary" style={{ padding: '14px 32px', fontSize: '1.05rem', boxShadow: '0 10px 25px rgba(245, 158, 11, 0.4)' }} onClick={() => setIsIntakeOpen(true)}>
                    <PlusCircle size={20} /> Initiate New FIR Token
                  </button>
                </div>
              ) : (
                /* ACTIVE DUAL WORKSTATION SESSION */
                <div>
                  {/* Ambient Microphone Sensor */}
                  <AudioRecorder onTranscriptGenerated={handleTranscriptGenerated} />

                  {/* Central Dual-Verification Editor */}
                  <DualDraftViewer
                    firData={activeFir}
                    onRegister={handleRegister}
                    onReject={handleReject}
                    onOfficerTypedSubmit={handleOfficerTypedSubmit}
                  />
                  <MerkleLockCard merkleData={activeFir.cryptographicMerkleLock} />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <IntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        onInitiateFIR={handleInitiateFIR}
        stationName={currentUser?.station?.name}
      />
      <BNSModal isOpen={isBNSOpen} onClose={() => setIsBNSOpen(false)} />
      <OfficialFIRPDF fir={pdfFir} onClose={() => setPdfFir(null)} />
    </div>
  );
};
