import React from 'react';
import { CloudUpload, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useReading } from '../../context/ReadingContext';

export const SyncBanner: React.FC = () => {
  const { isSyncModalOpen, setIsSyncModalOpen, triggerSync, syncStatus } = useAuth();
  const { language } = useReading();

  if (!isSyncModalOpen) return null;

  const isEn = language === 'en';

  const handleSync = async () => {
    await triggerSync();
    setIsSyncModalOpen(false);
  };

  const handleSkip = () => {
    setIsSyncModalOpen(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '4.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 500,
        width: '90%',
        maxWidth: '480px',
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--accent-color)',
        borderRadius: '0.75rem',
        boxShadow: 'var(--shadow-md)',
        padding: '0.875rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        animation: 'slideUp 200ms cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
            flexShrink: 0
          }}
        >
          <CloudUpload size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
            {isEn ? 'Sync Local Data to Cloud?' : 'உள்ளூர் தரவை ஒத்திசைக்கவா?'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {isEn
              ? 'Upload your local bookmarks, notes, highlights and settings.'
              : 'உங்கள் உள்ளூர் சேமிப்புகள் மற்றும் அமைப்புகளை மேகக்கணியில் பதிவேற்றவும்.'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
        <button
          className="btn-primary"
          onClick={handleSync}
          disabled={syncStatus === 'syncing'}
          style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem', gap: '0.25rem' }}
        >
          <Check size={14} />
          <span>{isEn ? 'Sync' : 'ஒத்திசை'}</span>
        </button>
        <button
          className="btn-icon"
          onClick={handleSkip}
          title="Dismiss"
          style={{ width: '28px', height: '28px' }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
