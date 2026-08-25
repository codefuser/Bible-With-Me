import React, { useState } from 'react';
import {
  BookOpen,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Users,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LandingPageProps {
  onEnterAsGuest: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterAsGuest }) => {
  const { login, signup } = useAuth();

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [lang, setLang] = useState<'ta' | 'en'>('ta');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form States
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isTA = lang === 'ta';

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg(isTA ? 'மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடுக.' : 'Please enter email and password.');
      return;
    }

    if (authMode === 'signup' && password.length < 6) {
      setErrorMsg(isTA ? 'கடவுச்சொல் குறைந்தபட்சம் 6 எழுத்துகள் இருக்க வேண்டும்.' : 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (authMode === 'login') {
        const res = await login(email.trim(), password);
        if (!res.success) {
          setErrorMsg(res.error || (isTA ? 'உள்நுழைவு தோல்வியடைந்தது. விவரங்களை சரிபார்க்கவும்.' : 'Login failed. Please check credentials.'));
        }
      } else {
        const res = await signup(email.trim(), password, displayName.trim());
        if (!res.success) {
          setErrorMsg(res.error || (isTA ? 'பதிவு செய்ய முடியவில்லை.' : 'Registration failed.'));
        } else {
          setSuccessMsg(isTA ? 'கணக்கு உருவாக்கப்பட்டது! உள்நுழைகிறது...' : 'Account created! Signing in...');
        }
      }
    } catch {
      setErrorMsg(isTA ? 'ஒரு பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.' : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary, #f8fafc)',
        color: 'var(--text-primary, #0f172a)',
        fontFamily: isTA ? 'var(--font-ta-noto), sans-serif' : 'var(--font-sans)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem 1rem'
      }}
    >
      {/* Centered Minimal Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          margin: '0 auto'
        }}
      >
        {/* Top Header: Logo + Language Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'var(--accent-color, #1e40af)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <BookOpen size={20} color="#ffffff" />
            </div>
            <div>
              <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
                {isTA ? 'வேதாகமம்' : 'Bible App'}
              </span>
            </div>
          </div>

          {/* Language Switcher */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-secondary, #f1f5f9)',
              borderRadius: '9999px',
              padding: '2px',
              border: '1px solid var(--border-color, #e2e8f0)'
            }}
          >
            <button
              onClick={() => setLang('ta')}
              style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: isTA ? 'var(--accent-color, #1e40af)' : 'transparent',
                color: isTA ? '#ffffff' : 'var(--text-muted, #64748b)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              தமிழ்
            </button>
            <button
              onClick={() => setLang('en')}
              style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                border: 'none',
                backgroundColor: !isTA ? 'var(--accent-color, #1e40af)' : 'transparent',
                color: !isTA ? '#ffffff' : 'var(--text-muted, #64748b)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              EN
            </button>
          </div>
        </div>

        {/* Minimal Auth Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface, #ffffff)',
            borderRadius: '1rem',
            padding: '2rem 1.75rem',
            border: '1px solid var(--border-color, #e2e8f0)',
            boxShadow: 'var(--shadow-md, 0 4px 12px rgba(0,0,0,0.06))'
          }}
        >
          {/* Static Verse Banner */}
          <div
            style={{
              padding: '0.875rem 1rem',
              borderRadius: '0.625rem',
              backgroundColor: 'var(--bg-secondary, #f1f5f9)',
              borderLeft: '3px solid var(--accent-color, #1e40af)',
              marginBottom: '1.5rem'
            }}
          >
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-primary, #0f172a)',
                margin: '0 0 0.25rem',
                fontStyle: 'italic',
                lineHeight: 1.5
              }}
            >
              {isTA
                ? '"உங்கள் வார்த்தை என் கால்களுக்கு தீபமும், என் பாதைக்கு வெளிச்சமுமாயிருக்கிறது."'
                : '"Your word is a lamp for my feet, a light on my path."'}
            </p>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>
              {isTA ? 'சங்கீதம் 119:105' : 'Psalm 119:105'}
            </span>
          </div>

          {/* Mode Tabs */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--bg-secondary, #f1f5f9)',
              borderRadius: '0.625rem',
              padding: '3px',
              marginBottom: '1.25rem'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                backgroundColor: authMode === 'login' ? 'var(--bg-surface, #ffffff)' : 'transparent',
                color: authMode === 'login' ? 'var(--accent-color, #1e40af)' : 'var(--text-muted, #64748b)',
                fontWeight: authMode === 'login' ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: authMode === 'login' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              {isTA ? 'உள்நுழைக' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                backgroundColor: authMode === 'signup' ? 'var(--bg-surface, #ffffff)' : 'transparent',
                color: authMode === 'signup' ? 'var(--accent-color, #1e40af)' : 'var(--text-muted, #64748b)',
                fontWeight: authMode === 'signup' ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: authMode === 'signup' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              {isTA ? 'புதிய கணக்கு' : 'Create Account'}
            </button>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 0.875rem',
                borderRadius: '0.5rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '0.8125rem',
                marginBottom: '1rem'
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 0.875rem',
                borderRadius: '0.5rem',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#16a34a',
                fontSize: '0.8125rem',
                marginBottom: '1rem'
              }}
            >
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {authMode === 'signup' && (
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary, #475569)',
                    marginBottom: '0.25rem'
                  }}
                >
                  {isTA ? 'பெயர்' : 'Full Name'}
                </label>
                <div style={{ position: 'relative' }}>
                  <UserIcon
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted, #94a3b8)'
                    }}
                  />
                  <input
                    type="text"
                    placeholder={isTA ? 'பெயர்' : 'Full Name'}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--border-color, #cbd5e1)',
                      backgroundColor: 'var(--bg-primary, #f8fafc)',
                      color: 'var(--text-primary, #0f172a)',
                      fontSize: '0.875rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary, #475569)',
                  marginBottom: '0.25rem'
                }}
              >
                {isTA ? 'மின்னஞ்சல்' : 'Email Address'}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted, #94a3b8)'
                  }}
                />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    backgroundColor: 'var(--bg-primary, #f8fafc)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary, #475569)',
                  marginBottom: '0.25rem'
                }}
              >
                {isTA ? 'கடவுச்சொல்' : 'Password'}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted, #94a3b8)'
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 2.25rem 0.625rem 2.25rem',
                    borderRadius: '0.5rem',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    backgroundColor: 'var(--bg-primary, #f8fafc)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '0.875rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'none',
                    color: 'var(--text-muted, #94a3b8)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: 'none',
                backgroundColor: 'var(--accent-color, #1e40af)',
                color: '#ffffff',
                fontSize: '0.9375rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                marginTop: '0.25rem'
              }}
            >
              {loading ? (
                <span>{isTA ? 'செயல்படுகிறது...' : 'Processing...'}</span>
              ) : (
                <>
                  <span>
                    {authMode === 'login'
                      ? isTA
                        ? 'உள்நுழைக'
                        : 'Sign In'
                      : isTA
                      ? 'கணக்கு உருவாக்கு'
                      : 'Create Account'}
                  </span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              margin: '1.25rem 0'
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color, #e2e8f0)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>
              {isTA ? 'அல்லது' : 'OR'}
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color, #e2e8f0)' }} />
          </div>

          {/* Continue as Guest Button */}
          <button
            type="button"
            onClick={onEnterAsGuest}
            style={{
              width: '100%',
              padding: '0.625rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border-color, #cbd5e1)',
              backgroundColor: 'transparent',
              color: 'var(--text-secondary, #475569)',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <Users size={16} />
            <span>{isTA ? 'விருந்தினராக தொடரவும்' : 'Continue as Guest'}</span>
          </button>

          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted, #94a3b8)',
              textAlign: 'center',
              margin: '0.875rem 0 0'
            }}
          >
            {isTA
              ? '✦ கணக்கு இல்லாமல் வாசிக்கலாம் (Cloud Sync இல்லை)'
              : '✦ Read without an account (Cloud sync disabled)'}
          </p>
        </div>
      </div>

      {/* Minimal Footer */}
      <footer
        style={{
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted, #94a3b8)'
        }}
      >
        {isTA ? '© பரிசுத்த வேதாகமம்' : '© Holy Bible App'}
      </footer>
    </div>
  );
};
