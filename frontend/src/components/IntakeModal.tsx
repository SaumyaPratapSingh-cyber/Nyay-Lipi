import React, { useState } from 'react';
import { UserCheck, Phone, MapPin, Mail, Calendar, Shield, Sparkles, X, PlusCircle } from 'lucide-react';

interface IntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInitiateFIR: (intakeData: any) => void;
  stationName?: string;
}

export const IntakeModal: React.FC<IntakeModalProps> = ({ isOpen, onClose, onInitiateFIR, stationName }) => {
  const [form, setForm] = useState({
    complainantName: '',
    complainantPhone: '',
    complainantAddress: '',
    complainantEmail: '',
    complainantGender: 'Male',
    complainantAge: '',
    incidentCategory: 'Theft & Robbery',
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onInitiateFIR(form);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
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
      zIndex: 1500,
      padding: '20px',
    }}>
      <div className="glass-card glass-card-gold" style={{ width: '620px', padding: '32px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', background: 'linear-gradient(135deg, #d4af37, #996515)', padding: '12px', borderRadius: '14px', marginBottom: '12px' }}>
            <Shield size={28} color="#000" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-gold)' }}>
            Initiate Official FIR Intake Token
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {stationName || 'Hazratganj Police Station'} • BNSS 2023 Form-I Registration
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Complainant Full Name *
              </label>
              <input
                type="text"
                value={form.complainantName}
                onChange={(e) => setForm({ ...form, complainantName: e.target.value })}
                placeholder="Enter Complainant Name"
                required
                style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Contact Phone Number *
              </label>
              <input
                type="text"
                value={form.complainantPhone}
                onChange={(e) => setForm({ ...form, complainantPhone: e.target.value })}
                placeholder="Enter 10-digit Phone Number"
                required
                style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Full Residential Address *
            </label>
            <input
              type="text"
              value={form.complainantAddress}
              onChange={(e) => setForm({ ...form, complainantAddress: e.target.value })}
              placeholder="Enter House No., Street, City, District"
              required
              style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Gender
              </label>
              <select
                value={form.complainantGender}
                onChange={(e) => setForm({ ...form, complainantGender: e.target.value })}
                style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Age
              </label>
              <input
                type="number"
                value={form.complainantAge}
                onChange={(e) => setForm({ ...form, complainantAge: e.target.value })}
                placeholder="Age in Years"
                style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Email ID (Optional)
              </label>
              <input
                type="email"
                value={form.complainantEmail}
                onChange={(e) => setForm({ ...form, complainantEmail: e.target.value })}
                placeholder="email@example.com"
                style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Incident Offense Category Selection
            </label>
            <select
              value={form.incidentCategory}
              onChange={(e) => setForm({ ...form, incidentCategory: e.target.value })}
              style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff' }}
            >
              <option value="Theft & Robbery">Theft & Robbery (BNS 303/309)</option>
              <option value="Physical Assault & Hurt">Physical Assault & Hurt (BNS 115/117)</option>
              <option value="Domestic Violence & Dowry Cruelty">Domestic Violence & Dowry Cruelty (BNS 85/498A)</option>
              <option value="Cheating & Financial Fraud">Cheating & Financial Fraud (BNS 318/420)</option>
              <option value="Cyber Fraud & Impersonation">Cyber Fraud & Impersonation (BNS 319)</option>
              <option value="Criminal Intimidation & Threat">Criminal Intimidation & Threat (BNS 351)</option>
              <option value="Murder / Attempt to Murder">Murder / Attempt to Murder (BNS 103/109)</option>
            </select>
          </div>

          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '12px', justifyContent: 'center', padding: '12px', fontSize: '0.95rem' }}>
            {loading ? <Sparkles size={18} className="animate-spin" /> : <PlusCircle size={18} />} Generate Station Queue Token & Launch Dual Workstation
          </button>
        </form>
      </div>
    </div>
  );
};
