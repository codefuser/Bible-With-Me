import React from 'react';
import { BookOpen, Search, Settings, Bookmark, Globe } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';

export const Header: React.FC = () => {
  const {
    currentBook,
    currentChapter,
    language,
    toggleLanguage,
    setIsSearchOpen,
    setIsPreferencesOpen,
    setIsBookSelectorOpen,
    setIsBookmarksOpen,
    bookmarks
  } = useReading();

  const bookName = language === 'ta' ? currentBook.name_ta : currentBook.name_en;

  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-brand-icon">
          <BookOpen size={20} />
        </span>
        <span className="header-brand-text">{language === 'ta' ? 'வேதாகமம்' : 'Bible'}</span>
      </div>

      <button className="btn-pill header-book-btn" onClick={() => setIsBookSelectorOpen(true)} title="Select Book & Chapter">
        <span className="book-name-label">{bookName}</span>
        <span style={{ fontWeight: 700 }}>{currentChapter}</span>
      </button>

      <div className="header-actions">
        <button className="btn-pill lang-toggle-btn" onClick={toggleLanguage} title="Switch Language">
          <Globe size={14} />
          <span>{language === 'en' ? 'EN' : 'தமிழ்'}</span>
        </button>

        <button className="btn-icon" onClick={() => setIsSearchOpen(true)} title="Search Bible">
          <Search size={18} />
        </button>

        <button className="btn-icon" onClick={() => setIsBookmarksOpen(true)} title="Saved Bookmarks" style={{ position: 'relative' }}>
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

        <button className="btn-icon" onClick={() => setIsPreferencesOpen(true)} title="Reading Settings">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};
