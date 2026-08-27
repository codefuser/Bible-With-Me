import React, { useState } from 'react';
import { X, Mail, Lock, User, LogIn, UserPlus, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { resetPassword } from '../../services/authService';
import { UserProfileDashboard } from './UserProfileDashboard';

// Read language preference directly from localStorage to avoid ReadingProvider dependency
const getModalLanguage = (): 'en' | 'ta' => {
  try {
    const raw = localStorage.getItem('bible_app_preferences');
    if (raw) {
      const prefs = JSON.parse(raw);
      return prefs.language === 'en' ? 'en' : 'ta';
    }
  } catch {
    // ignore
  }
  return 'ta';
};

export const AuthModal: React.FC = () => {
  const { isAuthenticated, isAuthModalOpen, setIsAuthModalOpen, login, signup } = useAuth();
  const language = getModalLanguage();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const isEn = language === 'en';

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setError(null);
    setSuccessMsg(null);
  };

  const handleClose = () => {
    resetForm();
    setIsAuthModalOpen(false);
  };

  if (isAuthenticated) {
    return (
      <div
        className="auth-modal-overlay"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 300,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}
        onClick={handleClose}
      >
        <div
          className="auth-modal-dialog profile-dialog-wrapper"
          onClick={(e) => e.stopPropagation()}
        >
          <UserProfileDashboard onClose={handleClose} />
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (mode === 'signup' && password !== confirmPassword) {
      setError(isEn ? 'Passwords do not match.' : 'கடவுச்சொற்கள் பொருந்தவில்லை.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setError(isEn ? 'Password must be at least 6 characters.' : 'கடவுச்சொல் குறைந்தபட்சம் 6 எழுத்துகள் இருக்க வேண்டும்.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'forgot') {
        const res = await resetPassword(email.trim());
        if (!res.error) {
          setSuccessMsg(isEn ? 'Password reset link sent to your email.' : 'மீட்டமைப்பு லிங்க் அனுப்பப்பட்டது.');
        } else {
          setError(res.error.message || (isEn ? 'Failed to send reset email.' : 'மின்னஞ்சல் அனுப்ப முடியவில்லை.'));
        }
      } else if (mode === 'login') {
        const res = await login(email.trim(), password);
        if (res.success) {
          handleClose();
        } else {
          setError(res.error || (isEn ? 'Invalid email or password.' : 'தவறான மின்னஞ்சல் அல்லது கடவுச்சொல்.'));
        }
      } else if (mode === 'signup') {
        const res = await signup(email.trim(), password, displayName.trim());
        if (res.success) {
          setSuccessMsg(isEn ? 'Account created! Signing in...' : 'கணக்கு உருவாக்கப்பட்டது!');
          setTimeout(() => handleClose(), 1500);
        } else {
          setError(res.error || (isEn ? 'Registration failed.' : 'பதிவு செய்ய முடியவில்லை.'));
        }
      }
    } catch {
      setError(isEn ? 'An unexpected error occurred.' : 'ஒரு பிழை ஏற்பட்டது.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          color: '#0f172a',
          borderRadius: '1.25rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          width: '100%',
          maxWidth: '440px',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#1e40af',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {mode === 'login' ? <LogIn size={18} color="#fff" /> : <UserPlus size={18} color="#fff" />}
            </div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
              {mode === 'login'
                ? isEn ? 'Sign In' : 'உள்நுழைக'
                : mode === 'signup'
                ? isEn ? 'Create Account' : 'பதிவு செய்க'
                : isEn ? 'Reset Password' : 'கடவுச்சொல் மீட்டமைக்க'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '0.375rem',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' && (
            <div
              style={{
                display: 'flex',
                backgroundColor: '#f1f5f9',
                borderRadius: '0.75rem',
                padding: '4px',
                marginBottom: '1.25rem'
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  backgroundColor: mode === 'login' ? '#ffffff' : 'transparent',
                  color: mode === 'login' ? '#1e40af' : '#64748b',
                  fontWeight: mode === 'login' ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  boxShadow: mode === 'login' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {isEn ? 'Sign In' : 'உள்நுழைக'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  backgroundColor: mode === 'signup' ? '#ffffff' : 'transparent',
                  color: mode === 'signup' ? '#1e40af' : '#64748b',
                  fontWeight: mode === 'signup' ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  boxShadow: mode === 'signup' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {isEn ? 'Sign Up' : 'பதிவு செய்க'}
              </button>
            </div>
          )}

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.625rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '0.8125rem',
                marginBottom: '1rem'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.625rem',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#16a34a',
                fontSize: '0.8125rem',
                marginBottom: '1rem'
              }}
            >
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mode === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  {isEn ? 'Full Name' : 'பெயர்'}
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder={isEn ? 'e.g. John Doe' : 'பெயர்'}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem 0.625rem 2.375rem',
                      borderRadius: '0.625rem',
                      border: '1.5px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      color: '#0f172a',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                {isEn ? 'Email Address' : 'மின்னஞ்சல்'}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem 0.625rem 2.375rem',
                    borderRadius: '0.625rem',
                    border: '1.5px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    color: '#0f172a',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  {isEn ? 'Password' : 'கடவுச்சொல்'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.625rem 2.375rem 0.625rem 2.375rem',
                      borderRadius: '0.625rem',
                      border: '1.5px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      color: '#0f172a',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  {isEn ? 'Confirm Password' : 'கடவுச்சொல்லை உறுதிசெய்'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem 0.625rem 2.375rem',
                      borderRadius: '0.625rem',
                      border: '1.5px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      color: '#0f172a',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div style={{ textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError(null);
                  }}
                  style={{ border: 'none', background: 'none', fontSize: '0.8125rem', color: '#1e40af', fontWeight: 600, cursor: 'pointer' }}
                >
                  {isEn ? 'Forgot password?' : 'கடவுச்சொல் மறந்துவிட்டதா?'}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.625rem',
                border: 'none',
                backgroundColor: '#1e40af',
                color: '#ffffff',
                fontSize: '0.9375rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '0.25rem'
              }}
            >
              {loading
                ? isEn ? 'Loading...' : 'செயல்படுகிறது...'
                : mode === 'login'
                ? isEn ? 'Sign In' : 'உள்நுழைக'
                : mode === 'signup'
                ? isEn ? 'Create Account' : 'பதிவு செய்க'
                : isEn ? 'Send Reset Link' : 'மீட்டமைப்பு லிங்க் அனுப்பு'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
