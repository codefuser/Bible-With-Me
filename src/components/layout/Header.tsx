import React from 'react';
import { Menu, BookOpen, Search, Bookmark, Globe, Flame, ArrowLeft, Sliders, RotateCcw } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';

export const Header: React.FC = () => {
  const {
    currentBook,
    currentChapter,
    language,
    appLanguage,
    setIsSearchOpen,
    setIsBookSelectorOpen,
    setIsBookmarksOpen,
    setIsSideNavOpen,
    setIsLanguageModalOpen,
    bookmarks,
    streakData,
    setIsStreakModalOpen,
    isPreferencesOpen,
    setIsPreferencesOpen,
    resetPreferences
  } = useReading();

  const isEnUI = (appLanguage || 'ta') === 'en';
  const bookName = language === 'en' ? currentBook.name_en : currentBook.name_ta;

  const getMobileLanguageLabel = () => {
    if (language === 'ta') return 'தமிழ்';
    if (language === 'en') return 'ENG';
    return 'த + ENG';
  };

  const getDesktopLanguageLabel = () => {
    if (language === 'ta') return 'தமிழ்';
    if (language === 'en') return 'EN';
    return 'தமிழ் + EN';
  };

  if (isPreferencesOpen) {
    return (
      <header className="header preferences-top-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="btn-pill"
            onClick={() => setIsPreferencesOpen(false)}
            title={isEnUI ? 'Return to Bible Reader' : 'வேதாகம வாசிப்பிற்குத் திரும்புக'}
            style={{
              gap: '0.375rem',
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--accent-color)',
              borderColor: 'var(--accent-color)',
              fontWeight: 700
            }}
          >
            <ArrowLeft size={16} />
            <span>{isEnUI ? 'Home' : 'முகப்பு'}</span>
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: 800,
            fontSize: '0.9375rem',
            color: 'var(--text-primary)'
          }}
        >
          <Sliders size={17} color="var(--accent-color)" />
          <span>{isEnUI ? 'Reading Preferences' : 'வாசிப்பு அமைப்புகள்'}</span>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn-pill"
            onClick={resetPreferences}
            title={isEnUI ? 'Reset All Preferences to Default' : 'அனைத்து அமைப்புகளையும் இயல்பு நிலைக்கு மீட்டமை'}
            style={{ gap: '0.35rem' }}
          >
            <RotateCcw size={14} />
            <span>{isEnUI ? 'Reset' : 'மீட்டமை'}</span>
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="header">
      <div className="header-brand">
        {/* Mobile Hamburger Button */}
        <button
          className="btn-icon mobile-nav-trigger"
          onClick={() => setIsSideNavOpen(true)}
          title={isEnUI ? 'Open Navigation Menu' : 'பக்கவாட்டு மெனுவைத் திறக்கவும்'}
        >
          <Menu size={20} />
        </button>

        {/* Bible Logo Icon (Hidden on Mobile) */}
        <span className="header-brand-icon header-brand-icon-mobile-hidden">
          <BookOpen size={20} />
        </span>
        <span className="header-brand-text">{isEnUI ? 'Bible' : 'வேதாகமம்'}</span>
      </div>

      {/* Book & Chapter Selector Pill */}
      <button
        className="btn-pill header-book-btn"
        onClick={() => setIsBookSelectorOpen(true)}
        title={isEnUI ? 'Select Book & Chapter' : 'புத்தகம் மற்றும் அதிகாரத்தைத் தேர்ந்தெடுக்கவும்'}
      >
        <span className="book-name-label">{bookName}</span>
        <span style={{ fontWeight: 700 }}>{currentChapter}</span>
      </button>

      {/* Header Actions */}
      <div className="header-actions">
        {/* Language & Version Modal Trigger Pill */}
        <button
          className="btn-pill lang-toggle-btn"
          onClick={() => setIsLanguageModalOpen(true)}
          title={isEnUI ? 'Choose Language Mode & Bible Version' : 'மொழி மற்றும் வேதாகம பதிப்பை மாற்றுக'}
          style={{ gap: '0.3125rem', padding: '0.375rem 0.625rem' }}
        >
          <Globe size={14} />
          <span className="lang-label-mobile" style={{ fontWeight: 700 }}>
            {getMobileLanguageLabel()}
          </span>
          <span className="lang-label-desktop" style={{ fontWeight: 600 }}>
            {getDesktopLanguageLabel()}
          </span>
        </button>

        {/* Daily Streak Trigger Pill */}
        {streakData && (
          <button
            className="header-streak-pill"
            onClick={() => setIsStreakModalOpen(true)}
            title={isEnUI ? `Daily Streak: ${streakData.streak} days` : `வாசிப்புத் தொடர்: ${streakData.streak} நாட்கள்`}
          >
            <Flame size={14} color="var(--accent-color)" />
            <span>{streakData.streak}</span>
          </button>
        )}

        {/* Search Action */}
        <button
          className="btn-icon"
          onClick={() => setIsSearchOpen(true)}
          title={isEnUI ? 'Search Bible' : 'வேதாகமத்தில் தேடுங்கள்'}
        >
          <Search size={18} />
        </button>

        {/* Desktop Bookmarks Action (Hidden on Mobile) */}
        <button
          className="btn-icon header-bookmark-btn"
          onClick={() => setIsBookmarksOpen(true)}
          title={isEnUI ? 'Saved Bookmarks' : 'சேமித்த வசனங்கள்'}
          style={{ position: 'relative' }}
        >
          <Bookmark size={18} />
          {bookmarks.length > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--bookmark-active)'
              }}
            />
          )}
        </button>
      </div>
    </header>
  );
};
