import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
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
import { AdminRoutePlaceholder } from './components/admin/AdminRoute';
import { Clock, ArrowRight } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { historyItem, books, language, setBookAndChapter, preferences } = useReading();
  const [isAdminView, setIsAdminView] = useState<boolean>(window.location.hash.toLowerCase() === '#admin');

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
              maxWidth: preferences.maxWidth === 'compact' ? 'var(--width-compact)' : preferences.maxWidth === 'wide' ? 'var(--width-wide)' : 'var(--width-standard)',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <Clock size={16} />
                <span>
                  {language === 'ta' ? 'தொடர்ந்து வாசிக்க:' : 'Continue Reading:'}{' '}
                  <strong>
                    {language === 'ta' ? historyItem.book_name_ta : historyItem.book_name_en} {historyItem.chapter}
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
            maxWidth: preferences.maxWidth === 'compact' ? 'var(--width-compact)' : preferences.maxWidth === 'wide' ? 'var(--width-wide)' : 'var(--width-standard)',
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

      {/* Global Modals, Study Views & Auth Modals */}
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

export function App() {
  return (
    <AuthProvider>
      <ReadingProvider>
        <MainLayout />
      </ReadingProvider>
    </AuthProvider>
  );
}

export default App;
