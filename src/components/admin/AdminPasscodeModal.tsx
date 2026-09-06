import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { verifyAdminPasscode } from '../../services/adminService';

interface AdminPasscodeModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  isEn?: boolean;
}

export const AdminPasscodeModal: React.FC<AdminPasscodeModalProps> = ({
  isOpen,
  onSuccess,
  onCancel,
  isEn = false
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError(isEn ? 'Please enter the admin passcode.' : 'தயவுசெய்து நிர்வாக கடவுச்சொல்லை உள்ளிடவும்.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      const valid = verifyAdminPasscode(passcode);
      setIsVerifying(false);
      if (valid) {
        setError('');
        onSuccess();
      } else {
        setError(
          isEn
            ? 'Incorrect administrative passcode. (Hint: bible2026)'
            : 'தவறான கடவுச்சொல்! (குறிப்பு: bible2026)'
        );
      }
    }, 200);
  };

  const handleQuickFill = (code: string) => {
    setPasscode(code);
    setError('');
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-card">
        <div className="admin-modal-icon">
          <KeyRound size={28} />
        </div>

        <h2 className="admin-modal-title">
          {isEn ? 'Admin Authorization' : 'நிர்வாக அணுகல் அனுமதி'}
        </h2>
        <p className="admin-modal-desc">
          {isEn
            ? 'Enter your master administrative security passcode to access all control systems, user databases, and content management.'
            : 'அனைத்து கட்டுப்பாட்டு அமைப்புகள், பயனர் விபரங்கள் மற்றும் தியான உள்ளடக்கங்களை நிர்வகிக்க நிர்வாக கடவுச்சொல்லை உள்ளிடவும்.'}
        </p>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#dc2626',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.825rem',
              marginBottom: '1rem',
              textAlign: 'left'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group" style={{ textAlign: 'left' }}>
            <label className="admin-form-label">
              {isEn ? 'Administrative Passcode' : 'நிர்வாக கடவுச்சொல்'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="admin-input"
                placeholder={isEn ? 'Enter passcode (e.g. bible2026)' : 'கடவுச்சொல் உள்ளிடுக...'}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
                style={{ paddingLeft: '2.4rem' }}
              />
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              fontSize: '0.75rem',
              color: 'var(--text-muted)'
            }}
          >
            <span>{isEn ? 'Master Key Hint:' : 'முக்கிய கடவுச்சொல்:'}</span>
            <button
              type="button"
              onClick={() => handleQuickFill('bible2026')}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                cursor: 'pointer',
                fontWeight: 600,
                textDecoration: 'underline'
              }}
            >
              bible2026
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="admin-btn admin-btn-outline"
              onClick={onCancel}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <ArrowLeft size={16} />
              <span>{isEn ? 'Cancel' : 'ரத்து'}</span>
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={isVerifying}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              {isVerifying ? (
                <span>{isEn ? 'Verifying...' : 'சரிபார்க்கிறது...'}</span>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>{isEn ? 'Unlock Admin' : 'திறக்க'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
