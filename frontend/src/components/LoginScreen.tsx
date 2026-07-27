import React, { useState } from 'react';
import { Shield, Lock, User, AlertCircle, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  isAdminRoute: boolean;
  onLoginSuccess: (user: any, token: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ isAdminRoute, onLoginSuccess }) => {
  const [credentialInput, setCredentialInput] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentialInput: credentialInput.trim(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid police credentials');
      }

      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top center, #1e293b 0%, #090d16 100%)',
      padding: '20px',
    }}>
      <div className="glass-card glass-card-gold" style={{ width: '420px', padding: '36px', borderRadius: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', background: 'linear-gradient(135deg, #d4af37, #996515)', padding: '14px', borderRadius: '16px', marginBottom: '14px', boxShadow: '0 8px 20px rgba(212, 175, 55, 0.3)' }}>
            <Shield size={34} color="#000" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-gold)', letterSpacing: '0.5px' }}>
            NYAYA-LIPI (न्याय-लिपि)
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {isAdminRoute ? 'Director General HQ Admin Portal' : 'Uttar Pradesh Police Officers Gateway'}
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--status-danger)', padding: '10px 14px', borderRadius: '8px', marginBottom: '18px', color: '#fca5a5', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              {isAdminRoute ? 'Master Admin Email ID' : 'Badge Number / PNO Number / Official Email'}
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={credentialInput}
                onChange={(e) => setCredentialInput(e.target.value)}
                placeholder={isAdminRoute ? 'e.g. saumyrajpoot666@gmail.com' : 'Enter Badge No. or Email'}
                required
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 38px',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '8px',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Secure Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 38px',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '8px',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '0.88rem'
                }}
              />
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={loading} style={{ justifyContent: 'center', padding: '12px', marginTop: '6px', fontSize: '0.95rem' }}>
            {loading ? <Sparkles size={18} className="animate-spin" /> : null}
            {isAdminRoute ? 'Authenticate Admin HQ Access' : 'Sign In to Police Portal'}
          </button>
        </form>
      </div>
    </div>
  );
};
