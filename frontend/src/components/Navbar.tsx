import React from 'react';
import { Shield, Lock, Radio, LogOut } from 'lucide-react';

interface NavbarProps {
  currentUser: any;
  onLogout: () => void;
  isAdminRoute?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout, isAdminRoute }) => {
  const roleName = currentUser?.role === 'ADMIN' ? 'Central System Admin' : currentUser?.role === 'SP' ? 'Superintendent of Police' : 'Station Investigating Officer';
  const roleBadgeClass = currentUser?.role === 'ADMIN' ? 'badge-info' : currentUser?.role === 'SP' ? 'badge-danger' : 'badge-gold';

  return (
    <header className="glass-card glass-card-gold" style={{ borderRadius: '0 0 16px 16px', padding: '16px 32px', marginBottom: '24px' }}>
      <div className="flex-between">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #d4af37, #996515)',
            padding: '10px',
            borderRadius: '12px',
            boxShadow: '0 0 15px rgba(212, 175, 55, 0.4)'
          }}>
            <Shield size={32} color="#000" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(90deg, #fff, #d4af37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              NYAYA-LIPI <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--primary-gold)' }} className="hindi-text">(न्याय-लिपि)</span>
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {isAdminRoute ? 'Central Command & Statewide FIR Master Registry' : 'Edge Ambient Witness & Dual-Verification FIR System'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* MongoDB Atlas Ledger Badge */}
          <div className="badge badge-gold">
            <Lock size={12} />
            <span>MongoDB Atlas Ledger: Active</span>
          </div>

          {/* Active User Card */}
          {currentUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.4)', padding: '6px 14px', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
              <img
                src={currentUser.photoUrl || 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150'}
                alt={currentUser.name}
                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--primary-gold)' }}
              />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Badge: {currentUser.badgeNumber} • <span className={`badge ${roleBadgeClass}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>{roleName}</span>
                </div>
              </div>
            </div>
          )}

          <button className="btn-secondary" onClick={onLogout} style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};
