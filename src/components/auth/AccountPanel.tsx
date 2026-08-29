import React from 'react';
import { User, LogIn, LogOut, Cloud, RefreshCw, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
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
          padding: '1.125rem',
          borderRadius: '0.75rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-color)',
              flexShrink: 0
            }}
          >
            <User size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.90625rem', color: 'var(--text-primary)', marginBottom: '0.125rem' }}>
              {isEn ? 'Guest Mode' : 'விருந்தினர் முறை'}
            </div>
            <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
              {isEn
                ? 'Sign in to sync bookmarks, highlights, and history across all your devices.'
                : 'அமைப்புகள் மற்றும் குறிச்சொற்களை அனைத்து சாதனங்களிலும் பெற உள்நுழையவும்.'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAuthModalOpen(true)}
          style={{
            width: '100%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1rem',
            borderRadius: '0.5rem',
            backgroundColor: 'var(--accent-color)',
            color: '#ffffff',
            border: 'none',
            fontWeight: 600,
            fontSize: '0.84375rem',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
            transition: 'opacity 150ms ease'
          }}
        >
          <LogIn size={16} />
          <span>{isEn ? 'Sign In / Create Account' : 'உள்நுழைக / கணக்கு உருவாக்குக'}</span>
        </button>
      </div>
    );
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  const getSyncIcon = () => {
    if (syncStatus === 'syncing') return <RefreshCw size={14} className="spin" style={{ color: 'var(--accent-color)' }} />;
    if (syncStatus === 'error') return <AlertTriangle size={14} style={{ color: '#ef4444' }} />;
    return <CheckCircle2 size={14} style={{ color: '#10b981' }} />;
  };

  const getSyncLabel = () => {
    if (syncStatus === 'syncing') return isEn ? 'Syncing with Cloud...' : 'ஒத்திசைக்கப்படுகிறது...';
    if (syncStatus === 'error') return isEn ? 'Sync Error' : 'ஒத்திசைவு பிழை';
    return isEn ? 'Cloud Sync Active' : 'மேகக்கணி ஒத்திசைவு இயங்குகிறது';
  };

  return (
    <div
      style={{
        padding: '1.125rem',
        borderRadius: '0.75rem',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem'
      }}
    >
      {/* Profile Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
          {/* Refined Vector Avatar Initial Circle */}
          {profile?.avatar_url && (profile.avatar_url.startsWith('http') || profile.avatar_url.startsWith('data:')) ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1px solid var(--border-color)',
                flexShrink: 0
              }}
            />
          ) : (
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-soft)',
                color: 'var(--accent-color)',
                fontWeight: 700,
                fontSize: '1.0625rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid var(--accent-color)',
                flexShrink: 0
              }}
            >
              {initial}
            </div>
          )}

          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</span>
              {profile?.role === 'admin' && (
                <span
                  style={{
                    fontSize: '0.65625rem',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '0.25rem',
                    backgroundColor: 'var(--accent-soft)',
                    color: 'var(--accent-color)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.125rem'
                  }}
                >
                  <Shield size={10} /> Admin
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>
        </div>

        {/* Minimal Professional Sign Out Button */}
        <button
          type="button"
          onClick={logout}
          title={isEn ? 'Sign Out' : 'வெளியேறு'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.375rem 0.625rem',
            borderRadius: '0.375rem',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
            fontSize: '0.78125rem',
            fontWeight: 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 150ms ease'
          }}
        >
          <LogOut size={14} />
          <span>{isEn ? 'Sign Out' : 'வெளியேறு'}</span>
        </button>
      </div>
    </div>
  );
};
