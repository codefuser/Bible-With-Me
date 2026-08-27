import React, { useState, useRef, useEffect } from 'react';
import { Menu, BookOpen, Search, Bookmark, Globe, Check, ChevronDown, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { Language } from '../../types/bible';

export const Header: React.FC = () => {
  const {
    currentBook,
    currentChapter,
    language,
    setLanguage,
    setIsSearchOpen,
    setIsBookSelectorOpen,
    setIsBookmarksOpen,
    setIsSideNavOpen,
    isDesktopSidebarCollapsed,
    toggleDesktopSidebar,
    bookmarks
  } = useReading();

  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const bookName = language === 'en' ? currentBook.name_en : currentBook.name_ta;

  // Click outside listener for Language Dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setIsLangDropdownOpen(false);
  };

  const getLanguageLabel = () => {
    if (language === 'ta') return 'தமிழ்';
    if (language === 'en') return 'EN';
    return 'தமிழ் + EN';
  };

  return (
    <header className="header">
      <div className="header-brand">
        {/* Mobile Hamburger Button */}
        <button
          className="btn-icon mobile-nav-trigger"
          onClick={() => setIsSideNavOpen(true)}
          title="Open Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <span className="header-brand-icon">
          <BookOpen size={20} />
        </span>
        <span className="header-brand-text">{language === 'en' ? 'Bible' : 'வேதாகமம்'}</span>
      </div>

      {/* Book & Chapter Selector Pill */}
      <button className="btn-pill header-book-btn" onClick={() => setIsBookSelectorOpen(true)} title="Select Book & Chapter">
        <span className="book-name-label">{bookName}</span>
        <span style={{ fontWeight: 700 }}>{currentChapter}</span>
      </button>

      {/* Header Actions */}
      <div className="header-actions">
        {/* Language Dropdown Container */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            className={`btn-pill lang-toggle-btn ${isLangDropdownOpen ? 'active' : ''}`}
            onClick={() => setIsLangDropdownOpen((prev) => !prev)}
            title="Choose Language Mode"
            aria-expanded={isLangDropdownOpen}
            style={{ gap: '0.375rem', padding: '0.375rem 0.625rem' }}
          >
            <Globe size={14} />
            <span style={{ fontWeight: 600 }}>{getLanguageLabel()}</span>
            <ChevronDown size={13} style={{ transform: isLangDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 180ms ease' }} />
          </button>

          {/* Sleek Theme-Matching Dropdown Menu */}
          {isLangDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 0.375rem)',
                right: 0,
                width: '210px',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.625rem',
                boxShadow: 'var(--shadow-md)',
                zIndex: 200,
                padding: '0.375rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                animation: 'slideUp 160ms cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <button
                className={`dropdown-item ${language === 'ta' ? 'selected' : ''}`}
                onClick={() => handleSelectLanguage('ta')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.625rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  backgroundColor: language === 'ta' ? 'var(--accent-soft)' : 'transparent',
                  color: language === 'ta' ? 'var(--accent-color)' : 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontWeight: language === 'ta' ? 600 : 500,
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left'
                }}
              >
                <span>🇮🇳 தமிழ் (Tamil Only)</span>
                {language === 'ta' && <Check size={14} />}
              </button>

              <button
                className={`dropdown-item ${language === 'en' ? 'selected' : ''}`}
                onClick={() => handleSelectLanguage('en')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.625rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  backgroundColor: language === 'en' ? 'var(--accent-soft)' : 'transparent',
                  color: language === 'en' ? 'var(--accent-color)' : 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontWeight: language === 'en' ? 600 : 500,
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left'
                }}
              >
                <span>🇬🇧 English (English Only)</span>
                {language === 'en' && <Check size={14} />}
              </button>

              <button
                className={`dropdown-item ${language === 'parallel' ? 'selected' : ''}`}
                onClick={() => handleSelectLanguage('parallel')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.625rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  backgroundColor: language === 'parallel' ? 'var(--accent-soft)' : 'transparent',
                  color: language === 'parallel' ? 'var(--accent-color)' : 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontWeight: language === 'parallel' ? 600 : 500,
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left'
                }}
              >
                <span>📖 தமிழ் + English (Parallel)</span>
                {language === 'parallel' && <Check size={14} />}
              </button>
            </div>
          )}
        </div>

        {/* Search Action */}
        <button className="btn-icon" onClick={() => setIsSearchOpen(true)} title="Search Bible">
          <Search size={18} />
        </button>

        {/* Bookmarks Action */}
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
      </div>
    </header>
  );
};
