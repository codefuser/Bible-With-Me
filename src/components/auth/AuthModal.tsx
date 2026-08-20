import React, { useState } from 'react';
import { X, Mail, Lock, User, LogIn, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useReading } from '../../context/ReadingContext';
import { resetPassword } from '../../services/authService';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, signup } = useAuth();
  const { language } = useReading();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const isEn = language === 'en';

  const resetForm = () => {
    setError(null);
    setSuccessMsg(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
  };

  const handleClose = () => {
    resetForm();
    setIsAuthModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setError(isEn ? 'Please enter your email.' : 'மின்னஞ்சலை உள்ளிடவும்.');
      return;
    }

    if (mode === 'forgot') {
      setLoading(true);
      const res = await resetPassword(email);
      setLoading(false);
      if (res.error) {
        setError(res.error.message);
      } else {
        setSuccessMsg(isEn ? 'Password reset link sent to your email.' : 'கடவுச்சொல் மீட்டமைப்பு இணைப்பு அனுப்பப்பட்டது.');
      }
      return;
    }

    if (!password) {
      setError(isEn ? 'Please enter your password.' : 'கடவுச்சொல்லை உள்ளிடவும்.');
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setError(isEn ? 'Password must be at least 6 characters.' : 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்.');
        return;
      }
      if (password !== confirmPassword) {
        setError(isEn ? 'Passwords do not match.' : 'கடவுச்சொற்கள் பொருந்தவில்லை.');
        return;
      }
      setLoading(true);
      const res = await signup(email, password, displayName);
      setLoading(false);
      if (res.error) {
        setError(res.error);
      } else {
        handleClose();
      }
    } else {
      setLoading(true);
      const res = await login(email, password);
      setLoading(false);
      if (res.error) {
        setError(res.error);
      } else {
        handleClose();
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', padding: '1.5rem' }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {mode === 'login' ? <LogIn size={20} className="accent-text" /> : <UserPlus size={20} className="accent-text" />}
            <h2 className="modal-title" style={{ fontSize: '1.125rem' }}>
              {mode === 'login'
                ? (isEn ? 'Sign In to Sync' : 'உள்நுழைய')
                : mode === 'signup'
                ? (isEn ? 'Create Account' : 'புதிய கணக்கு உருவாக்க')
                : (isEn ? 'Reset Password' : 'கடவுச்சொல் மீட்டமை')}
            </h2>
          </div>
          <button className="btn-icon" onClick={handleClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Auth Tabs */}
        {mode !== 'forgot' && (
          <div className="book-tabs" style={{ marginBottom: '1.25rem' }}>
            <button
              className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setMode('login');
                setError(null);
              }}
            >
              {isEn ? 'Sign In' : 'உள்நுழைவு'}
            </button>
            <button
              className={`tab-btn ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
            >
              {isEn ? 'Create Account' : 'பதிவு செய்ய'}
            </button>
          </div>
        )}

        {/* Error / Success Alerts */}
        {error && (
          <div className="auth-alert error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="auth-alert success">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'signup' && (
            <div className="input-group">
              <label className="input-label">{isEn ? 'Display Name (Optional)' : 'பெயர் (விருப்பமான)'}</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  placeholder={isEn ? 'John Doe' : 'உங்கள் பெயர்'}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="auth-input"
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">{isEn ? 'Email Address' : 'மின்னஞ்சல் முகவரி'}</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="input-label">{isEn ? 'Password' : 'கடவுச்சொல்'}</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                    }}
                    style={{ fontSize: '0.75rem', color: 'var(--accent-color)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {isEn ? 'Forgot Password?' : 'கடவுச்சொல் மறந்துவிட்டதா?'}
                  </button>
                )}
              </div>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="auth-input"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div className="input-group">
              <label className="input-label">{isEn ? 'Confirm Password' : 'கடவுச்சொல்லை உறுதிப்படுத்தவும்'}</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="auth-input"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.625rem', justifyContent: 'center' }}
          >
            {loading ? (
              <span>{isEn ? 'Please wait...' : 'காத்திருக்கவும்...'}</span>
            ) : mode === 'login' ? (
              <span>{isEn ? 'Sign In' : 'உள்நுழைக'}</span>
            ) : mode === 'signup' ? (
              <span>{isEn ? 'Create Account' : 'கணக்கை உருவாக்க'}</span>
            ) : (
              <span>{isEn ? 'Send Reset Link' : 'மீட்டமைப்பு இணைப்பு அனுப்புக'}</span>
            )}
          </button>

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center' }}
            >
              {isEn ? 'Back to Sign In' : 'உள்நுழைவுக்குத் திரும்புக'}
            </button>
          )}

          <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0.5rem 0' }} />

          <button
            type="button"
            className="btn-secondary"
            onClick={handleClose}
            style={{ width: '100%', padding: '0.5rem', justifyContent: 'center', fontSize: '0.8125rem' }}
          >
            {isEn ? 'Continue as Guest' : 'விருந்தினராகத் தொடரவும்'}
          </button>
        </form>
      </div>
    </div>
  );
};
