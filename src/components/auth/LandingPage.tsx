import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Star,
  ArrowRight,
  Users,
  Shield,
  Wifi,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Search,
  Bookmark,
  History
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ─── Rotating Verses ──────────────────────────────────────────────────────────
const LANDING_VERSES = [
  {
    ta: '"உங்கள் வார்த்தை என் கால்களுக்கு தீபமும், என் பாதைக்கு வெளிச்சமுமாயிருக்கிறது."',
    en: '"Your word is a lamp for my feet, a light on my path."',
    ref: 'சங்கீதம் 119:105 | Psalm 119:105'
  },
  {
    ta: '"கர்த்தர் என் மேய்ப்பன்; எனக்கு குறைவு உண்டாவதில்லை."',
    en: '"The Lord is my shepherd, I lack nothing."',
    ref: 'சங்கீதம் 23:1 | Psalm 23:1'
  },
  {
    ta: '"என்னிடத்தில் வருகிறவனை நான் புறம்பே தள்ளுவதில்லை."',
    en: '"Whoever comes to me I will never drive away."',
    ref: 'யோவான் 6:37 | John 6:37'
  }
];

interface LandingPageProps {
  onEnterAsGuest: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterAsGuest }) => {
  const { login, signup } = useAuth();

  // Mode: 'login' | 'signup'
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

  // Verse Rotation
  const [verseIdx, setVerseIdx] = useState(0);
  const [fadeVerse, setFadeVerse] = useState(true);

  const isTA = lang === 'ta';

  useEffect(() => {
    const timer = setInterval(() => {
      setFadeVerse(false);
      setTimeout(() => {
        setVerseIdx((prev) => (prev + 1) % LANDING_VERSES.length);
        setFadeVerse(true);
      }, 350);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

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

  const currentVerse = LANDING_VERSES[verseIdx];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        fontFamily: isTA ? 'var(--font-ta-noto), sans-serif' : 'var(--font-sans)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {/* Background Glow Blobs */}
      <div
        style={{
          position: 'absolute',
          top: '-150px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(30, 64, 175, 0.4) 0%, rgba(15, 23, 42, 0) 70%)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          right: '-100px',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(217, 119, 6, 0.12) 0%, rgba(15, 23, 42, 0) 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Top Header Navigation */}
      <header
        style={{
          padding: '1.25rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)'
            }}
          >
            <BookOpen size={22} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '-0.02em' }}>
              {isTA ? 'வேதாகமம்' : 'Bible App'}
            </h1>
            <span style={{ fontSize: '0.725rem', color: '#94a3b8', display: 'block' }}>
              {isTA ? 'தமிழ் + English Bible' : 'Personal Reading & Study'}
            </span>
          </div>
        </div>

        {/* Language Switcher Pill */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '9999px',
            padding: '3px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <button
            onClick={() => setLang('ta')}
            style={{
              padding: '0.35rem 0.875rem',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: isTA ? '#2563eb' : 'transparent',
              color: isTA ? '#ffffff' : '#94a3b8',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🇮🇳 தமிழ்
          </button>
          <button
            onClick={() => setLang('en')}
            style={{
              padding: '0.35rem 0.875rem',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: !isTA ? '#2563eb' : 'transparent',
              color: !isTA ? '#ffffff' : '#94a3b8',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🇬🇧 English
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 1.5rem',
          position: 'relative',
          zIndex: 10,
          maxWidth: '1100px',
          margin: '0 auto',
          width: '100%'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            width: '100%',
            alignItems: 'center'
          }}
        >
          {/* Left Column: Hero Intro & Rotating Verse */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0.875rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(37, 99, 235, 0.15)',
                border: '1px solid rgba(37, 99, 235, 0.3)',
                color: '#60a5fa',
                fontSize: '0.8125rem',
                fontWeight: 600,
                width: 'fit-content'
              }}
            >
              <Sparkles size={14} />
              <span>{isTA ? 'ஆன்மீக வாசிப்பு மற்றும் தியானம்' : 'Personal Bible Study Platform'}</span>
            </div>

            <h2
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                margin: 0,
                color: '#ffffff',
                letterSpacing: '-0.02em'
              }}
            >
              {isTA ? (
                <>
                  தேவனின் வார்த்தை <br />
                  <span style={{ color: '#60a5fa' }}>உங்கள் கரங்களில்</span>
                </>
              ) : (
                <>
                  Experience Scripture <br />
                  <span style={{ color: '#60a5fa' }}>Like Never Before</span>
                </>
              )}
            </h2>

            <p style={{ fontSize: '1.0625rem', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              {isTA
                ? 'தமிழ் மற்றும் ஆங்கில வேதாகமத்தை எளிதாக வாசிக்கவும், சேமிக்கவும், Cloud Sync மூலம் எப்போது வேண்டுமானாலும் தொடரவும்.'
                : 'Read, bookmark, highlight, and search the Holy Bible in Tamil and English with seamless multi-device cloud synchronization.'}
            </p>

            {/* Rotating Scripture Box */}
            <div
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '1.25rem',
                padding: '1.5rem',
                backdropFilter: 'blur(12px)',
                position: 'relative',
                transition: 'opacity 0.35s ease',
                opacity: fadeVerse ? 1 : 0
              }}
            >
              <div
                style={{
                  width: '4px',
                  height: '100%',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  borderTopLeftRadius: '1.25rem',
                  borderBottomLeftRadius: '1.25rem',
                  backgroundColor: '#f59e0b'
                }}
              />
              <p
                style={{
                  fontSize: '1rem',
                  color: '#f1f5f9',
                  fontStyle: 'italic',
                  lineHeight: 1.7,
                  margin: '0 0 0.75rem',
                  fontFamily: isTA ? 'var(--font-ta-noto), serif' : 'var(--font-serif)'
                }}
              >
                {isTA ? currentVerse.ta : currentVerse.en}
              </p>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#fbbf24' }}>
                {currentVerse.ref}
              </span>
            </div>

            {/* Feature Highlights Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.875rem'
              }}
            >
              {[
                { icon: BookOpen, ta: 'தமிழ் + English இணையாக', en: 'Parallel Tamil & EN' },
                { icon: Bookmark, ta: 'வசனங்கள் சேமிப்பு', en: 'Bookmarks & Highlights' },
                { icon: History, ta: 'வாசித்த வரலாறு', en: 'Reading History' },
                { icon: Search, ta: 'Tanglish தேடுதல்', en: 'Phonetic Search' }
              ].map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      padding: '0.75rem',
                      borderRadius: '0.75rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)'
                    }}
                  >
                    <IconComp size={16} color="#60a5fa" />
                    <span style={{ fontSize: '0.8125rem', color: '#cbd5e1', fontWeight: 500 }}>
                      {isTA ? item.ta : item.en}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Embedded Modern Auth Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '1.5rem',
              padding: '2.25rem 2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              color: '#0f172a'
            }}
          >
            {/* Auth Card Tabs */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#f1f5f9',
                borderRadius: '0.875rem',
                padding: '4px',
                marginBottom: '1.75rem'
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMsg(null);
                }}
                style={{
                  flex: 1,
                  padding: '0.625rem',
                  borderRadius: '0.625rem',
                  border: 'none',
                  backgroundColor: authMode === 'login' ? '#ffffff' : 'transparent',
                  color: authMode === 'login' ? '#1e40af' : '#64748b',
                  fontWeight: authMode === 'login' ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  boxShadow: authMode === 'login' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {isTA ? 'உள்நுழைக' : 'Sign In'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMsg(null);
                }}
                style={{
                  flex: 1,
                  padding: '0.625rem',
                  borderRadius: '0.625rem',
                  border: 'none',
                  backgroundColor: authMode === 'signup' ? '#ffffff' : 'transparent',
                  color: authMode === 'signup' ? '#1e40af' : '#64748b',
                  fontWeight: authMode === 'signup' ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  boxShadow: authMode === 'signup' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease'
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
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  fontSize: '0.8125rem',
                  marginBottom: '1.25rem'
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
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
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#16a34a',
                  fontSize: '0.8125rem',
                  marginBottom: '1.25rem'
                }}
              >
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              {authMode === 'signup' && (
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '0.375rem'
                    }}
                  >
                    {isTA ? 'உங்கள் பெயர்' : 'Full Name'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <UserIcon
                      size={18}
                      style={{
                        position: 'absolute',
                        left: '0.875rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94a3b8'
                      }}
                    />
                    <input
                      type="text"
                      placeholder={isTA ? 'உதாரணம்: யோவான்' : 'e.g. John Doe'}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.875rem 0.75rem 2.625rem',
                        borderRadius: '0.75rem',
                        border: '1.5px solid #cbd5e1',
                        backgroundColor: '#f8fafc',
                        color: '#0f172a',
                        fontSize: '0.9375rem',
                        outline: 'none',
                        transition: 'border-color 0.15s ease'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                      onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
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
                    color: '#334155',
                    marginBottom: '0.375rem'
                  }}
                >
                  {isTA ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '0.875rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8'
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
                      padding: '0.75rem 0.875rem 0.75rem 2.625rem',
                      borderRadius: '0.75rem',
                      border: '1.5px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      color: '#0f172a',
                      fontSize: '0.9375rem',
                      outline: 'none',
                      transition: 'border-color 0.15s ease'
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                    onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
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
                    color: '#334155',
                    marginBottom: '0.375rem'
                  }}
                >
                  {isTA ? 'கடவுச்சொல்' : 'Password'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '0.875rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94a3b8'
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
                      padding: '0.75rem 2.625rem 0.75rem 2.625rem',
                      borderRadius: '0.75rem',
                      border: '1.5px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      color: '#0f172a',
                      fontSize: '0.9375rem',
                      outline: 'none',
                      transition: 'border-color 0.15s ease'
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                    onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.875rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      border: 'none',
                      background: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(30, 64, 175, 0.35)',
                  transition: 'all 0.15s ease',
                  marginTop: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(30, 64, 175, 0.45)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(30, 64, 175, 0.35)';
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
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                margin: '1.5rem 0'
              }}
            >
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                {isTA ? 'அல்லது' : 'OR'}
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
            </div>

            {/* Continue as Guest Button */}
            <button
              type="button"
              onClick={onEnterAsGuest}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '0.75rem',
                border: '1.5px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#1e40af';
                e.currentTarget.style.color = '#1e40af';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.color = '#475569';
              }}
            >
              <Users size={16} />
              <span>{isTA ? 'விருந்தினராக தொடரவும்' : 'Continue as Guest'}</span>
            </button>

            <p
              style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
                textAlign: 'center',
                marginTop: '1rem',
                margin: '1rem 0 0'
              }}
            >
              {isTA
                ? '✦ கணக்கு இல்லாமல் வாசிக்கலாம் (Cloud Sync இல்லை).'
                : '✦ Read without an account (Cloud Sync disabled).'}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: '1.25rem 2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center',
          fontSize: '0.8125rem',
          color: '#64748b',
          position: 'relative',
          zIndex: 10
        }}
      >
        {isTA
          ? '© வேதாகமம் செயலி — பரிசுத்த வேதாகம வாசிப்பு மற்றும் தியானம்'
          : '© Bible App — Personal Reading & Meditation Platform'}
      </footer>
    </div>
  );
};
