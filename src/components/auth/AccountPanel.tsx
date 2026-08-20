import React from 'react';
import { User, LogIn, LogOut, Cloud, RefreshCw, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useReading } from '../../context/ReadingContext';

export const AccountPanel: React.FC = () => {
  const { user, profile, isAuthenticated, syncStatus, logout, setIsAuthModalOpen, triggerSync } = useAuth();
  const { language } = useReading();

  const isEn = language === 'en';

  if (!isAuthenticated) {
    return (
      <div
        style={{
          padding: '1rem',
          borderRadius: '0.625rem',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-color)'
            }}
          >
            <User size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              {isEn ? 'Guest Mode' : 'விருந்தினர் முறை'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {isEn ? 'Data saved locally on this device only.' : 'தரவு இந்த சாதனத்தில் மட்டுமே சேமிக்கப்படுகிறது.'}
            </div>
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={() => setIsAuthModalOpen(true)}
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.8125rem', gap: '0.375rem', padding: '0.5rem' }}
        >
          <LogIn size={15} />
          <span>{isEn ? 'Sign In / Create Account to Sync' : 'உள்நுழைய / கணக்கு உருவாக்க'}</span>
        </button>
      </div>
    );
  }

  const getSyncIcon = () => {
    if (syncStatus === 'syncing') return <RefreshCw size={14} className="spin" style={{ color: 'var(--accent-color)' }} />;
    if (syncStatus === 'error') return <AlertTriangle size={14} style={{ color: '#ef4444' }} />;
    return <Cloud size={14} style={{ color: '#10b981' }} />;
  };

  const getSyncLabel = () => {
    if (syncStatus === 'syncing') return isEn ? 'Syncing...' : 'ஒத்திசைக்கப்படுகிறது...';
    if (syncStatus === 'error') return isEn ? 'Sync Failed' : 'ஒத்திசைவு தோல்வி';
    return isEn ? 'Synced with Cloud' : 'மேகக்கணியுடன் ஒத்திசைக்கப்பட்டது';
  };

  return (
    <div
      style={{
        padding: '1rem',
        borderRadius: '0.625rem',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-color)',
              fontWeight: 700
            }}
          >
            {(profile?.display_name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span>{profile?.display_name || user?.email?.split('@')[0]}</span>
              {profile?.role === 'admin' && (
                <span
                  style={{
                    fontSize: '0.6875rem',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '0.25rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: '#ef4444',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.125rem'
                  }}
                >
                  <Shield size={10} /> Admin
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign Out"
          className="btn-icon"
          style={{ color: 'var(--text-muted)' }}
        >
          <LogOut size={16} />
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.375rem 0.625rem',
          borderRadius: '0.375rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          fontSize: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-secondary)' }}>
          {getSyncIcon()}
          <span>{getSyncLabel()}</span>
        </div>
        <button
          onClick={triggerSync}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent-color)',
            fontWeight: 600,
            fontSize: '0.75rem',
            cursor: 'pointer'
          }}
        >
          {isEn ? 'Sync Now' : 'இப்போது ஒத்திசைக்க'}
        </button>
      </div>
    </div>
  );
};
