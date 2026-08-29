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
import { SideNavDrawer, DesktopSidebar } from './components/navigation/SideNavDrawer';
import { KeyboardShortcuts } from './components/common/KeyboardShortcuts';
import { AuthModal } from './components/auth/AuthModal';
import { SyncBanner } from './components/auth/SyncBanner';
import { LandingPage } from './components/auth/LandingPage';
import { AdminRoutePlaceholder } from './components/admin/AdminRoute';
import { VerseCardModal } from './components/bible/VerseCardModal';
import { ExitConfirmationModal } from './components/common/ExitConfirmationModal';
import { LanguageSelectorModal } from './components/language/LanguageSelectorModal';
import { FullscreenVerseReader } from './components/bible/FullscreenVerseReader';
import { StreakStatsModal } from './components/streaks/StreakStatsModal';
import { useMobileBackButton } from './hooks/useMobileBackButton';
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
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: 'var(--accent-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <BookOpen size={24} color="#fff" />
    </div>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
      வேதாகமம் தயாராகிறது...
    </p>
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
      gap: '1.25rem',
      padding: '2rem'
    }}
  >
    <div
      style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: 'var(--accent-color)',
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
          fontSize: '0.9375rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: '0 0 0.25rem',
          fontFamily: 'var(--font-tamil)'
        }}
      >
        வேதாகம வசனங்கள் ஏற்றப்படுகின்றன...
      </p>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
        Loading Bible verses...
      </p>
    </div>
  </div>
);

// ─── Main Bible Layout (shown after loading + auth) ───────────────────────────

const MainLayout: React.FC = () => {
  const { historyItem, books, language, setBookAndChapter, preferences, isBibleDataLoading, isPreferencesOpen } =
    useReading();
  const { isExitModalOpen, handleConfirmExit, handleCancelExit } = useMobileBackButton();
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

      <div className="app-body-layout">
        {/* Permanent Desktop Side Navigation Sidebar */}
        <DesktopSidebar />

        <div className="main-content">
          {isPreferencesOpen ? (
            <PreferencesModal />
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      {/* Sticky Bottom Reading Navigation Bar */}
      <ReadingControls />

      {/* Global Modals */}
      <SideNavDrawer />
      <BookSelectorModal />
      <SearchModal />
      <BookmarksModal />
      {/* Study Modals (Disabled/Hidden - Uncomment to enable):
      <VerseStudyModal />
      <ChapterStudyModal />
      */}
      <DailyHistoryModal />
      <ReadingHistoryModal />
      <AuthModal />
      <SyncBanner />
      <VerseCardModal />
      <FullscreenVerseReader />
      <LanguageSelectorModal />
      <StreakStatsModal />

      {/* Mobile Back Button Exit Confirmation Modal */}
      <ExitConfirmationModal
        isOpen={isExitModalOpen}
        onConfirmExit={handleConfirmExit}
        onCancelExit={handleCancelExit}
      />
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
    return <MainLayout />;
  }

  // Guest mode chosen this session → show Bible reader without auth
  if (guestModeEntered) {
    return (
      <>
        <MainLayout />
        {/* Auth modal accessible from side nav in guest mode */}
        <AuthModal />
      </>
    );
  }

  // New user / not logged in → show Landing Page
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
      <ReadingProvider>
        <AppGate />
      </ReadingProvider>
    </AuthProvider>
  );
}

export default App;
