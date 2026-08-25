import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ReadingProvider, useReading } from './context/ReadingContext';
import { Header } from './components/layout/Header';
import { VerseReader } from './components/bible/VerseReader';
import { ReadingControls } from './components/bible/ReadingControls';
import { BookSelectorModal } from './components/bible/BookSelector';
import { SearchModal } from './components/search/SearchModal';
import { PreferencesModal } from './components/preferences/PreferencesModal';
import { BookmarksModal } from './components/bookmarks/BookmarksModal';
import { DailyVerseCard } from './components/daily/DailyVerseCard';
import { VerseStudyModal } from './components/daily/VerseStudyModal';
import { ChapterStudyModal } from './components/daily/ChapterStudyModal';
import { DailyHistoryModal } from './components/daily/DailyHistoryModal';
import { ReadingHistoryModal } from './components/navigation/ReadingHistoryModal';
import { SideNavDrawer } from './components/navigation/SideNavDrawer';
import { KeyboardShortcuts } from './components/common/KeyboardShortcuts';
import { AuthModal } from './components/auth/AuthModal';
import { SyncBanner } from './components/auth/SyncBanner';
import { LandingPage } from './components/auth/LandingPage';
import { AdminRoutePlaceholder } from './components/admin/AdminRoute';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';

// ─── App Init Splash (while checking session) ─────────────────────────────────

const AppSplash: React.FC = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      gap: '1rem'
    }}
  >
    <div
      style={{
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, var(--accent-color) 0%, #1e375d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(43,76,126,0.25)',
        animation: 'splashPulse 1.6s ease-in-out infinite'
      }}
    >
      <BookOpen size={28} color="#fff" />
    </div>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
      வேதாகமம் தயாராகுகிறது...
    </p>
    <style>{`
      @keyframes splashPulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.07); opacity: 0.85; }
      }
    `}</style>
  </div>
);

// ─── Bible Loading Screen (while CSV files load) ──────────────────────────────

const BibleLoadingScreen: React.FC = () => (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      gap: '1.5rem',
      padding: '2rem'
    }}
  >
    <div
      style={{
        width: '56px',
        height: '56px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, var(--accent-color) 0%, #1e375d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <BookOpen size={24} color="#fff" />
    </div>

    <div style={{ textAlign: 'center' }}>
      <p
        style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: '0 0 0.375rem',
          fontFamily: 'var(--font-tamil)'
        }}
      >
        வேதாகம வசனங்கள் ஏற்றப்படுகின்றன...
      </p>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
        Loading Bible verses...
      </p>
    </div>

    {/* Animated progress dots */}
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-color)',
            animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`
          }}
        />
      ))}
    </div>

    <style>{`
      @keyframes dotBounce {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
        40% { transform: scale(1); opacity: 1; }
      }
    `}</style>
  </div>
);

// ─── Main Bible Layout (shown after loading + auth) ───────────────────────────

const MainLayout: React.FC = () => {
  const { historyItem, books, language, setBookAndChapter, preferences, isBibleDataLoading } =
    useReading();
  const [isAdminView, setIsAdminView] = useState<boolean>(
    window.location.hash.toLowerCase() === '#admin'
  );

  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminView(window.location.hash.toLowerCase() === '#admin');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleContinueReading = () => {
    if (historyItem) {
      const book = books.find((b) => b.id === historyItem.book_id);
      if (book) {
        setBookAndChapter(book, historyItem.chapter, historyItem.verse);
      }
    }
  };

  // Show Bible loading screen while CSV data fetches
  if (isBibleDataLoading) {
    return <BibleLoadingScreen />;
  }

  if (isAdminView) {
    return (
      <div className="app-container">
        <Header />
        <AdminRoutePlaceholder />
      </div>
    );
  }

  return (
    <div className="app-container">
      <KeyboardShortcuts />
      <Header />

      <div className="main-content">
        {/* Continue Reading Banner if History exists */}
        {historyItem && (
          <div
            style={{
              maxWidth:
                preferences.maxWidth === 'compact'
                  ? 'var(--width-compact)'
                  : preferences.maxWidth === 'wide'
                  ? 'var(--width-wide)'
                  : 'var(--width-standard)',
              margin: '0 auto 1.25rem',
              width: '100%'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.625rem 1rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-color)',
                fontSize: '0.875rem'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--text-secondary)'
                }}
              >
                <Clock size={16} />
                <span>
                  {language === 'ta' ? 'தொடர்ந்து வாசிக்க:' : 'Continue Reading:'}{' '}
                  <strong>
                    {language === 'ta' ? historyItem.book_name_ta : historyItem.book_name_en}{' '}
                    {historyItem.chapter}
                  </strong>
                </span>
              </div>
              <button
                onClick={handleContinueReading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--accent-color)'
                }}
              >
                <span>{language === 'ta' ? 'திறக்கவும்' : 'Resume'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Daily Verse Section */}
        <div
          style={{
            maxWidth:
              preferences.maxWidth === 'compact'
                ? 'var(--width-compact)'
                : preferences.maxWidth === 'wide'
                ? 'var(--width-wide)'
                : 'var(--width-standard)',
            margin: '0 auto',
            width: '100%'
          }}
        >
          <DailyVerseCard />
        </div>

        {/* Core Reader Component */}
        <VerseReader />
      </div>

      {/* Sticky Bottom Reading Navigation Bar */}
      <ReadingControls />

      {/* Global Modals */}
      <SideNavDrawer />
      <BookSelectorModal />
      <SearchModal />
      <PreferencesModal />
      <BookmarksModal />
      <VerseStudyModal />
      <ChapterStudyModal />
      <DailyHistoryModal />
      <ReadingHistoryModal />
      <AuthModal />
      <SyncBanner />
    </div>
  );
};

// ─── App Gate — decides what to show based on auth state ─────────────────────

const GUEST_MODE_KEY = 'bible_guest_mode_entered';

const AppGate: React.FC = () => {
  const { isAuthenticated, isSessionLoading, setIsAuthModalOpen } = useAuth();
  const [guestModeEntered, setGuestModeEntered] = useState<boolean>(
    () => sessionStorage.getItem(GUEST_MODE_KEY) === 'true'
  );

  // If user logs in after being on landing page, update guestMode
  useEffect(() => {
    if (isAuthenticated) {
      sessionStorage.removeItem(GUEST_MODE_KEY);
      setGuestModeEntered(false);
    }
  }, [isAuthenticated]);

  const handleEnterAsGuest = () => {
    sessionStorage.setItem(GUEST_MODE_KEY, 'true');
    setGuestModeEntered(true);
  };

  // While checking session (< 1s typically), show app splash
  if (isSessionLoading) {
    return <AppSplash />;
  }

  // Logged in user → show Bible reader
  if (isAuthenticated) {
    return (
      <ReadingProvider>
        <MainLayout />
      </ReadingProvider>
    );
  }

  // Guest mode chosen this session → show Bible reader without auth
  if (guestModeEntered) {
    return (
      <ReadingProvider>
        <MainLayout />
        {/* Auth modal accessible from side nav in guest mode */}
        <AuthModal />
      </ReadingProvider>
    );
  }

  // New user / not logged in → show beautiful Landing Page
  return (
    <>
      <LandingPage onEnterAsGuest={handleEnterAsGuest} />
      <AuthModal />
    </>
  );
};

// ─── Root App ─────────────────────────────────────────────────────────────────

export function App() {
  return (
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  );
}

export default App;
