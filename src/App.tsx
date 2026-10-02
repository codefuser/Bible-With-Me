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
import { AdminPanel } from './components/admin/AdminPanel';
import { AnnouncementBanner } from './components/layout/AnnouncementBanner';
import { VerseCardModal } from './components/bible/VerseCardModal';
import { ExitConfirmationModal } from './components/common/ExitConfirmationModal';
import { LanguageSelectorModal } from './components/language/LanguageSelectorModal';
import { FullscreenVerseReader } from './components/bible/FullscreenVerseReader';
import { StreakStatsModal } from './components/streaks/StreakStatsModal';
import { useMobileBackButton } from './hooks/useMobileBackButton';
import { isAdminRoute } from './services/routerService';
import { initAdminRealtimeSync } from './services/adminService';
import { initNotificationScheduler } from './services/notificationService';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { ReadingGoalTracker } from './components/bible/ReadingGoalTracker';
import { OfflineBanner } from './components/common/OfflineBanner';
import { UpdateModal } from './components/common/UpdateModal';
import { ThemeOption, AppLanguage, BibleLanguage } from './types/bible';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';

// ─── App Init Splash (while checking session) ─────────────────────────────────

// ─── Devotional App Loading Screen (Splash & CSV Initialization) ─────────────

const DevotionalLoadingScreen: React.FC<{ messageTa: string; messageEn: string }> = ({
  messageTa,
  messageEn
}) => (
  <div
    style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary, #0f172a)',
      gap: '1.25rem',
      padding: '2rem',
      boxSizing: 'border-box'
    }}
  >
    <div
      style={{
        width: '76px',
        height: '76px',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.35), 0 0 24px rgba(217, 119, 6, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1e293b'
      }}
    >
      <img
        src="/icon-192.png"
        alt="Bible Logo"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>

    <div
      style={{
        width: '28px',
        height: '28px',
        border: '3px solid var(--border-color, rgba(148, 163, 184, 0.25))',
        borderTopColor: 'var(--accent-color, #f59e0b)',
        borderRadius: '50%',
        animation: 'spin 0.85s linear infinite'
      }}
    />

    <div style={{ textAlign: 'center' }}>
      <p
        style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--text-primary, #f8fafc)',
          margin: '0 0 0.35rem',
          fontFamily: 'var(--font-tamil, inherit)'
        }}
      >
        {messageTa}
      </p>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #94a3b8)', margin: 0 }}>
        {messageEn}
      </p>
    </div>
  </div>
);

const AppSplash: React.FC = () => (
  <DevotionalLoadingScreen
    messageTa="வேதாகமம் தயாராகிறது..."
    messageEn="Preparing Holy Bible..."
  />
);

const BibleLoadingScreen: React.FC = () => (
  <DevotionalLoadingScreen
    messageTa="வேதாகம வசனங்கள் ஏற்றப்படுகின்றன..."
    messageEn="Loading Bible verses..."
  />
);

// ─── Main Bible Layout (shown after loading + auth) ───────────────────────────

const MainLayout: React.FC = () => {
  const { historyItem, books, language, appLanguage, setBookAndChapter, preferences, isBibleDataLoading, isPreferencesOpen, isSearchOpen } =
    useReading();
  const { isExitModalOpen, handleConfirmExit, handleCancelExit } = useMobileBackButton();
  const [isAdminView, setIsAdminView] = useState<boolean>(() => isAdminRoute());

  useEffect(() => {
    // If URL has legacy #admin, replace it with clean /admin path
    if (window.location.hash.toLowerCase() === '#admin') {
      window.history.replaceState({ view: 'admin' }, '', '/admin');
    }

    const handleRouteChange = () => {
      setIsAdminView(isAdminRoute());
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('app-route-change', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('app-route-change', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
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
      <div className="app-container admin-app-container">
        <AnnouncementBanner />
        <AdminPanel />
      </div>
    );
  }

  return (
    <div className="app-container">
      <KeyboardShortcuts />
      <Header />
      <AnnouncementBanner />
      <OfflineBanner language={appLanguage} />

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

      {/* Floating Active Reading Session Timer & Goal Tracker */}
      <ReadingGoalTracker />

      {/* Global Modals */}
      <SideNavDrawer />
      <BookSelectorModal />
      <SearchModal />
      <BookmarksModal />
      {/* Active Verse & Chapter Deep Study Modals */}
      <VerseStudyModal />
      <ChapterStudyModal />
      <DailyHistoryModal />
      <ReadingHistoryModal />
      <AuthModal />
      <SyncBanner />
      <VerseCardModal />
      <FullscreenVerseReader />
      <LanguageSelectorModal />
      <StreakStatsModal />
      <UpdateModal />

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

const GUEST_MODE_KEY = 'bible_guest_mode_entered_v2';
const ONBOARDED_KEY = 'bible_user_onboarded_v1';

const AppGate: React.FC = () => {
  const { isAuthenticated, isSessionLoading, setIsAuthModalOpen } = useAuth();
  const { updatePreferences, setAppLanguage, setBibleLanguage } = useReading();
  const [isOnboarded, setIsOnboarded] = useState<boolean>(
    () => localStorage.getItem(ONBOARDED_KEY) === 'true'
  );
  const [guestModeEntered, setGuestModeEntered] = useState<boolean>(
    () => localStorage.getItem(GUEST_MODE_KEY) === 'true'
  );

  // If user logs in after being on landing page, update guestMode
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.removeItem(GUEST_MODE_KEY);
      setGuestModeEntered(false);
    }
  }, [isAuthenticated]);

  const handleEnterAsGuest = () => {
    localStorage.setItem(GUEST_MODE_KEY, 'true');
    setGuestModeEntered(true);
  };

  const handleOnboardingComplete = (data: {
    goalMinutes: number;
    theme: ThemeOption;
    reminderTime: string;
    notificationsEnabled: boolean;
    appLanguage: AppLanguage;
    bibleLanguage: BibleLanguage;
    action: 'guest' | 'auth';
  }) => {
    localStorage.setItem(ONBOARDED_KEY, 'true');
    setIsOnboarded(true);
    if (data.appLanguage) setAppLanguage(data.appLanguage);
    if (data.bibleLanguage) setBibleLanguage(data.bibleLanguage);
    updatePreferences({
      dailyGoalMinutes: data.goalMinutes,
      theme: data.theme,
      reminderTime: data.reminderTime,
      notificationsEnabled: data.notificationsEnabled,
      appLanguage: data.appLanguage,
      bibleLanguage: data.bibleLanguage,
      onboardingCompleted: true
    });
    if (data.action === 'guest') {
      localStorage.setItem(GUEST_MODE_KEY, 'true');
      setGuestModeEntered(true);
    } else {
      localStorage.setItem(GUEST_MODE_KEY, 'true');
      setIsAuthModalOpen(true);
    }
  };

  // While checking session (< 1s typically), show app splash
  if (isSessionLoading) {
    return <AppSplash />;
  }

  // Admin route requested via /admin or legacy #admin → allow admin access
  if (typeof window !== 'undefined' && isAdminRoute()) {
    return <MainLayout />;
  }

  // First time visitor → show animated Onboarding Wizard
  if (!isOnboarded && !isAuthenticated) {
    return (
      <>
        <OnboardingWizard onComplete={handleOnboardingComplete} />
        <AuthModal />
      </>
    );
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
  useEffect(() => {
    const cleanup = initAdminRealtimeSync();
    const cleanupNotifs = initNotificationScheduler();
    return () => {
      cleanup();
      cleanupNotifs();
    };
  }, []);

  return (
    <AuthProvider>
      <ReadingProvider>
        <AppGate />
      </ReadingProvider>
    </AuthProvider>
  );
}

export default App;
