import React, { useState, useEffect } from 'react';
import { ArrowDownCircle, Sparkles, X, ExternalLink } from 'lucide-react';
import {
  checkForAppUpdate,
  dismissUpdateForSession,
  triggerUpdateDownload,
  AppUpdateInfo
} from '../../services/appUpdateService';
import { useReading } from '../../context/ReadingContext';

export const UpdateModal: React.FC = () => {
  const { appLanguage } = useReading();
  const [updateInfo, setUpdateInfo] = useState<AppUpdateInfo | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Non-blocking asynchronous update check after app stabilizes (2.5 seconds)
    const timer = setTimeout(async () => {
      try {
        const info = await checkForAppUpdate(appLanguage || 'ta');
        if (info && info.hasUpdate) {
          setUpdateInfo(info);
          setIsOpen(true);
        }
      } catch {
        // Safe silence
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [appLanguage]);

  if (!isOpen || !updateInfo) return null;

  const isTa = appLanguage === 'ta';

  const handleUpdate = () => {
    triggerUpdateDownload(updateInfo.downloadUrl);
    setIsOpen(false);
  };

  const handleDismiss = () => {
    dismissUpdateForSession();
    setIsOpen(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'calc(1rem + env(safe-area-inset-top, 0px)) max(1rem, env(safe-area-inset-right, 0px)) calc(1rem + env(safe-area-inset-bottom, 0px)) max(1rem, env(safe-area-inset-left, 0px))'
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'var(--bg-surface, #ffffff)',
          borderRadius: '16px',
          border: '1px solid var(--border-color, #e2e8f0)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: 'var(--text-primary, #0f172a)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.25rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-color, #e2e8f0)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                {isTa ? 'புதிய பதிப்பு கிடைக்கிறது' : 'Update Available'}
              </h4>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#2563eb'
                }}
              >
                v{updateInfo.latestVersion}
              </span>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            style={{
              padding: '0.35rem',
              borderRadius: '6px',
              color: 'var(--text-muted, #64748b)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1rem 1.25rem' }}>
          <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: 'var(--text-muted, #64748b)' }}>
            {isTa
              ? 'பயன்பாட்டின் புதிய பதிப்பு வெளியிடப்பட்டுள்ளது. சிறந்த வாசிப்பு அனுபவத்திற்கு புதுப்பிக்கவும்:'
              : 'A newer version is ready. Update now for improved performance and features:'}
          </p>

          {/* Changelog Bullets */}
          {updateInfo.changelog && updateInfo.changelog.length > 0 && (
            <div
              style={{
                backgroundColor: 'var(--bg-secondary, #f8fafc)',
                borderRadius: '10px',
                padding: '0.75rem 0.85rem',
                border: '1px solid var(--border-color, #e2e8f0)',
                marginBottom: '0.75rem'
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted, #64748b)',
                  marginBottom: '0.4rem'
                }}
              >
                {isTa ? 'புதிய சிறப்பம்சங்கள்' : "What's New"}
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8125rem', lineHeight: 1.5 }}>
                {updateInfo.changelog.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: '0.2rem' }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div
          style={{
            padding: '0.75rem 1.25rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <button
            type="button"
            onClick={handleDismiss}
            style={{
              flex: 1,
              padding: '0.65rem 1rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color, #cbd5e1)',
              backgroundColor: 'var(--bg-secondary, #f1f5f9)',
              color: 'var(--text-primary, #0f172a)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            {isTa ? 'பின்னர்' : 'Later'}
          </button>

          <button
            type="button"
            onClick={handleUpdate}
            style={{
              flex: 1.5,
              padding: '0.65rem 1rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}
          >
            <ArrowDownCircle size={16} />
            {isTa ? 'புதுப்பி' : 'Update Now'}
          </button>
        </div>
      </div>
    </div>
  );
};
