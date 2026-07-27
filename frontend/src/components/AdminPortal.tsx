import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, FileText, Building2, Lock, RefreshCw, Eye, Sparkles, Edit3, X, KeyRound, CheckCircle2, Play, Volume2, Shield } from 'lucide-react';
import { OfficialFIRPDF } from './OfficialFIRPDF';

interface AdminPortalProps {
  token: string;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ token }) => {
  const [activeTab, setActiveTab] = useState<'GLOBAL_FIRS' | 'OFFICERS' | 'STATIONS'>('GLOBAL_FIRS');
  const [stations, setStations] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [globalFIRs, setGlobalFIRs] = useState<any[]>([]);
  const [selectedFirForPdf, setSelectedFirForPdf] = useState<any>(null);
  const [selectedOfficer, setSelectedOfficer] = useState<any>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);

  // New Officer Onboarding Form State
  const [officerForm, setOfficerForm] = useState({
    badgeNumber: '',
    name: '',
    rank: 'Sub-Inspector (SI)',
    email: '',
    password: '',
    role: 'OFFICER',
    stationCode: '',
    district: '',
    photoUrl: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [stnRes, usrRes, firRes] = await Promise.all([
        fetch('/api/admin/stations', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/global-firs', { headers }),
      ]);

      const [stnData, usrData, firData] = await Promise.all([stnRes.json(), usrRes.json(), firRes.json()]);

      if (stnData.success) {
        setStations(stnData.stations);
        if (stnData.stations.length > 0 && !officerForm.stationCode) {
          setOfficerForm((prev) => ({ ...prev, stationCode: stnData.stations[0].stationCode, district: stnData.stations[0].district }));
        }
      }
      if (usrData.success) setOfficers(usrData.users);
      if (firData.success) setGlobalFIRs(firData.firs);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStationChange = (code: string) => {
    const matched = stations.find((s) => s.stationCode === code);
    setOfficerForm({
      ...officerForm,
      stationCode: code,
      district: matched ? matched.district : officerForm.district,
    });
  };

  const handleCreateOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerForm.badgeNumber || !officerForm.name || !officerForm.email || !officerForm.password) {
      alert('Please fill out all required officer onboarding fields!');
      return;
    }

    try {
      const res = await fetch('/api/admin/officers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(officerForm),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Account provisioned successfully for ${officerForm.name} (${officerForm.badgeNumber})!`);
        setOfficerForm({
          badgeNumber: '',
          name: '',
          rank: 'Sub-Inspector (SI)',
          email: '',
          password: '',
          role: 'OFFICER',
          stationCode: stations[0]?.stationCode || '',
          district: stations[0]?.district || '',
          photoUrl: '',
        });
        fetchData();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err: any) {
      alert(`Error provisioning officer: ${err.message}`);
    }
  };

  const handleSaveProfileUpdates = async () => {
    if (!selectedOfficer) return;
    try {
      const res = await fetch(`/api/admin/users/${selectedOfficer._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: selectedOfficer.name,
          rank: selectedOfficer.rank,
          email: selectedOfficer.email,
          photoUrl: selectedOfficer.photoUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Officer profile updated successfully for ${selectedOfficer.name}!`);
        setSelectedOfficer(null);
        fetchData();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err: any) {
      alert(`Error updating officer profile: ${err.message}`);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedOfficer || !newPasswordInput || newPasswordInput.trim().length < 6) {
      alert('New password must be at least 6 characters long!');
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${selectedOfficer._id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newPassword: newPasswordInput }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Password reset successfully for ${selectedOfficer.name} (${selectedOfficer.badgeNumber})!`);
        setNewPasswordInput('');
        setSelectedOfficer(null);
        fetchData();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (err: any) {
      alert(`Error resetting password: ${err.message}`);
    }
  };

  const handlePhotoUploadSimulation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOfficerForm((prev) => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getPlayableAudioUrl = (fileUrl?: string) => {
    if (!fileUrl) return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    if (fileUrl.startsWith('data:audio') || fileUrl.startsWith('blob:')) return fileUrl;
    if (fileUrl.startsWith('https://storage.nyaya-lipi.gov.in/')) {
      return 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    }
    return fileUrl;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="glass-card glass-card-gold" style={{ padding: '24px' }}>
        <div className="flex-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '2.5rem' }}>🏛️</div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-gold)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={26} /> Director General of Police (Admin HQ) Master Command
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Uttar Pradesh Police Governance System • Raw Audio Audit, Cryptographic Seals & Statewide FIR Registry
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('GLOBAL_FIRS')}
              className={`btn-secondary ${activeTab === 'GLOBAL_FIRS' ? 'glass-card-gold' : ''}`}
            >
              <FileText size={16} /> Statewide FIR Master Ledger ({globalFIRs.length})
            </button>
            <button
              onClick={() => setActiveTab('OFFICERS')}
              className={`btn-secondary ${activeTab === 'OFFICERS' ? 'glass-card-gold' : ''}`}
            >
              <UserPlus size={16} /> Onboard Personnel ({officers.length})
            </button>
            <button
              onClick={() => setActiveTab('STATIONS')}
              className={`btn-secondary ${activeTab === 'STATIONS' ? 'glass-card-gold' : ''}`}
            >
              <Building2 size={16} /> UP Stations Directory ({stations.length})
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Global Statewide FIR Master Registry & Raw Audio Player */}
      {activeTab === 'GLOBAL_FIRS' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div className="flex-between" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={20} color="var(--primary-gold)" /> Statewide Master FIR & Tamper-Proof Audio Evidence Ledger
            </h3>
            <button className="btn-secondary" onClick={fetchData}>
              <RefreshCw size={14} /> Refresh Master Ledger
            </button>
          </div>

          {globalFIRs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px dashed var(--border-card)' }}>
              No FIRs currently filed in the system. As station officers submit FIRs, their audio recordings and legal FIRs will automatically sync here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {globalFIRs.map((fir) => {
                const audioSrc = getPlayableAudioUrl(fir.audioRecord?.fileUrl);
                return (
                  <div key={fir._id} style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', padding: '20px', borderRadius: '14px' }}>
                    <div className="flex-between">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className="badge badge-gold" style={{ fontWeight: 800 }}>{fir.tokenNumber || 'TOKEN-STN'}</span>
                          <span style={{ fontWeight: 800, color: '#fff', fontSize: '1.1rem' }}>{fir.firNumber}</span>
                          <span className="badge badge-gold">{fir.incidentCategory}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span className={`badge ${fir.status === 'REGISTERED' ? 'badge-success' : fir.status === 'ESCALATED_TO_SP' ? 'badge-danger' : 'badge-warning'}`}>
                          {fir.status}
                        </span>
                        <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => setSelectedFirForPdf(fir)}>
                          <Eye size={14} /> Inspect Formal FIR Copy
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginTop: '14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <div><strong>Complainant:</strong> {fir.complainantDetails?.name} ({fir.complainantDetails?.phone})</div>
                      <div><strong>Station:</strong> {fir.stationId?.name || 'Hazratganj PS'}</div>
                      <div><strong>Officer:</strong> {fir.officerId?.name || 'Investigating Officer'}</div>
                      <div><strong>Filed Date:</strong> {new Date(fir.createdAt).toLocaleDateString()}</div>
                    </div>

                    {/* RAW AUDIO EVIDENCE PLAYER SECTION FOR ADMIN AUDIT */}
                    <div style={{ marginTop: '14px', background: 'rgba(15, 23, 42, 0.8)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-gold)' }}>
                      <div style={{ fontSize: '0.82rem', color: 'var(--primary-gold)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Volume2 size={16} /> Tamper-Proof Audio Recording (Database Locked):
                      </div>
                      <audio
                        controls
                        src={audioSrc}
                        style={{ width: '100%', height: '40px', outline: 'none' }}
                      />
                      <div style={{ marginTop: '8px', fontFamily: 'monospace', fontSize: '0.74rem', color: '#a7f3d0', display: 'flex', justifyContent: 'space-between' }}>
                        <span><strong>SHA-256 AUDIO STREAM HASH:</strong> {fir.audioRecord?.fileHashSHA256}</span>
                        <span><strong>MERKLE PROOF:</strong> {fir.cryptographicMerkleLock?.merkleRootHash}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Personnel Onboarding */}
      {activeTab === 'OFFICERS' && (
        <div className="grid-2">
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', color: 'var(--primary-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={18} /> Provision Personnel Credentials (UP Police Protocol)
            </h3>
            <form onSubmit={handleCreateOfficer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Governance Authority Level</label>
                <select
                  value={officerForm.role}
                  onChange={(e) => {
                    const r = e.target.value;
                    setOfficerForm({
                      ...officerForm,
                      role: r,
                      rank: r === 'SP' ? 'Superintendent of Police (SP)' : 'Sub-Inspector (SI)',
                    });
                  }}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
                >
                  <option value="OFFICER">Station Level — Station / Investigating Officer (Files FIR)</option>
                  <option value="SP">District Level — Superintendent of Police (SP Oversight / Override)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Select Police Rank (Indian Police System)</label>
                <select
                  value={officerForm.rank}
                  onChange={(e) => setOfficerForm({ ...officerForm, rank: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
                >
                  {officerForm.role === 'OFFICER' ? (
                    <>
                      <option value="Constable">Constable</option>
                      <option value="Head Constable">Head Constable</option>
                      <option value="Assistant Sub-Inspector (ASI)">Assistant Sub-Inspector (ASI)</option>
                      <option value="Sub-Inspector (SI)">Sub-Inspector (SI)</option>
                      <option value="Inspector (Station House Officer - SHO)">Inspector (Station House Officer - SHO)</option>
                    </>
                  ) : (
                    <>
                      <option value="Deputy Superintendent of Police (DSP / CO)">Deputy Superintendent of Police (DSP / CO)</option>
                      <option value="Additional Superintendent of Police (Addl. SP)">Additional Superintendent of Police (Addl. SP)</option>
                      <option value="Superintendent of Police (SP)">Superintendent of Police (SP)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Assign Pre-Seeded UP Police Station</label>
                <select
                  value={officerForm.stationCode}
                  onChange={(e) => handleStationChange(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
                >
                  {stations.map((stn) => (
                    <option key={stn._id} value={stn.stationCode}>
                      {stn.name} ({stn.stationCode}) — {stn.district}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Officer Full Name *</label>
                <input
                  type="text"
                  value={officerForm.name}
                  onChange={(e) => setOfficerForm({ ...officerForm, name: e.target.value })}
                  placeholder="Enter Officer Full Name"
                  required
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Official Badge Number / PNO Number *</label>
                <input
                  type="text"
                  value={officerForm.badgeNumber}
                  onChange={(e) => setOfficerForm({ ...officerForm, badgeNumber: e.target.value })}
                  placeholder="e.g. PNO-2024881"
                  required
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff', textTransform: 'uppercase' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Official UP Police Email *</label>
                <input
                  type="email"
                  value={officerForm.email}
                  onChange={(e) => setOfficerForm({ ...officerForm, email: e.target.value })}
                  placeholder="officer@up.police.gov.in"
                  required
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Assign Initial Password *</label>
                <input
                  type="password"
                  value={officerForm.password}
                  onChange={(e) => setOfficerForm({ ...officerForm, password: e.target.value })}
                  placeholder="Enter Password"
                  required
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Officer Photograph (Upload File or Enter Image URL)</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUploadSimulation}
                    style={{ fontSize: '0.8rem', color: '#fff' }}
                  />
                </div>
                <input
                  type="text"
                  value={officerForm.photoUrl}
                  onChange={(e) => setOfficerForm({ ...officerForm, photoUrl: e.target.value })}
                  placeholder="Or paste Photo URL (e.g. https://...)"
                  style={{ width: '100%', padding: '10px', marginTop: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
                />
                {officerForm.photoUrl && (
                  <img src={officerForm.photoUrl} alt="Preview" style={{ width: '50px', height: '50px', borderRadius: '50%', marginTop: '8px', objectFit: 'cover', border: '1px solid var(--primary-gold)' }} />
                )}
              </div>

              <button className="btn-primary" type="submit" style={{ marginTop: '8px' }}>
                <UserPlus size={16} /> Onboard & Provision Account
              </button>
            </form>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '14px' }}>Active Personnel Directory ({officers.length})</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Click any personnel profile card to inspect credentials, edit details, or reset/assign a new password.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '550px', overflowY: 'auto' }}>
              {officers.map((usr) => (
                <div
                  key={usr._id}
                  onClick={() => setSelectedOfficer(usr)}
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-card)',
                    padding: '12px',
                    borderRadius: '8px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  className="hover-card"
                >
                  <img src={usr.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'} alt="Officer" style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--primary-gold)' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{usr.name} ({usr.badgeNumber})</span>
                      <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>{usr.role}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Rank: <strong>{usr.rank}</strong> • Station: {usr.stationId?.name || 'HQ'}
                    </div>
                  </div>
                  <Edit3 size={16} color="var(--primary-gold)" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Pre-Seeded UP Police Stations Directory */}
      {activeTab === 'STATIONS' && (
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', color: 'var(--primary-gold)' }}>
            Pre-Seeded Uttar Pradesh Police Stations Directory ({stations.length} Stations)
          </h3>
          <div className="grid-2">
            {stations.map((stn) => (
              <div key={stn._id} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', padding: '14px', borderRadius: '10px' }}>
                <div className="flex-between">
                  <span style={{ fontWeight: 700, color: 'var(--primary-gold)', fontSize: '0.95rem' }}>{stn.name} ({stn.stationCode})</span>
                  <span className="badge badge-gold">{stn.district}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  <strong>Address:</strong> {stn.address}<br />
                  <strong>SP Alert Email:</strong> {stn.spEmail}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INSPECT, EDIT & RESET PASSWORD MODAL */}
      {selectedOfficer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px',
        }}>
          <div className="glass-card glass-card-gold" style={{ width: '580px', padding: '28px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setSelectedOfficer(null)} style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <img src={selectedOfficer.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'} alt="Officer" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-gold)', margin: '0 auto 10px auto' }} />
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-gold)', fontWeight: 800 }}>{selectedOfficer.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>PNO Badge Number: <strong>{selectedOfficer.badgeNumber}</strong></p>
            </div>

            {/* Profile Editing Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
              <h4 style={{ color: 'var(--primary-gold)', fontSize: '0.95rem', borderBottom: '1px solid var(--border-card)', paddingBottom: '6px' }}>
                Officer Profile Details
              </h4>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Full Name</label>
                <input
                  type="text"
                  value={selectedOfficer.name}
                  onChange={(e) => setSelectedOfficer({ ...selectedOfficer, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Assigned Indian Police Rank</label>
                <input
                  type="text"
                  value={selectedOfficer.rank}
                  onChange={(e) => setSelectedOfficer({ ...selectedOfficer, rank: e.target.value })}
                  style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Official Email</label>
                <input
                  type="email"
                  value={selectedOfficer.email}
                  onChange={(e) => setSelectedOfficer({ ...selectedOfficer, email: e.target.value })}
                  style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Photo URL</label>
                <input
                  type="text"
                  value={selectedOfficer.photoUrl || ''}
                  onChange={(e) => setSelectedOfficer({ ...selectedOfficer, photoUrl: e.target.value })}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <button className="btn-primary" style={{ justifyContent: 'center', marginTop: '6px' }} onClick={handleSaveProfileUpdates}>
                <CheckCircle2 size={16} /> Save Profile Updates
              </button>

              {/* Password Reset Section */}
              <div style={{ marginTop: '16px', background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '8px', border: '1px dashed var(--primary-gold)' }}>
                <h4 style={{ color: 'var(--primary-gold)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <KeyRound size={18} /> Reset & Assign New Password
                </h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Admin can assign a new login password if requested by the officer.
                </p>

                <input
                  type="password"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff', marginBottom: '10px' }}
                />

                <button className="btn-secondary glass-card-gold" style={{ width: '100%', justifyContent: 'center', color: '#fff' }} onClick={handleResetPassword}>
                  <KeyRound size={16} /> Submit & Assign New Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORM-I FIR INSPECTOR MODAL */}
      <OfficialFIRPDF fir={selectedFirForPdf} onClose={() => setSelectedFirForPdf(null)} />
    </div>
  );
};
