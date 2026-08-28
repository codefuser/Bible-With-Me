import React from 'react';
import { Menu, BookOpen, Search, Bookmark, Globe, ChevronDown, User } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const {
    currentBook,
    currentChapter,
    language,
    setIsSearchOpen,
    setIsBookSelectorOpen,
    setIsBookmarksOpen,
    setIsSideNavOpen,
    setIsLanguageModalOpen,
    bookmarks
  } = useReading();

  const { user, profile, setIsAuthModalOpen } = useAuth();

  const bookName = language === 'en' ? currentBook.name_en : currentBook.name_ta;

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

        {/* Bible Logo Icon (Hidden on Mobile) */}
        <span className="header-brand-icon header-brand-icon-mobile-hidden">
          <BookOpen size={20} />
        </span>
        <span className="header-brand-text">{language === 'en' ? 'Bible' : 'வேதாகமம்'}</span>
      </div>

      {/* Book & Chapter Selector Pill */}
      <button
        className="btn-pill header-book-btn"
        onClick={() => setIsBookSelectorOpen(true)}
        title="Select Book & Chapter"
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
          title="Choose Language Mode & Bible Version"
          style={{ gap: '0.375rem', padding: '0.375rem 0.625rem' }}
        >
          <Globe size={14} />
          <span style={{ fontWeight: 600 }}>{getLanguageLabel()}</span>
          <ChevronDown size={13} />
        </button>

        {/* Search Action */}
        <button className="btn-icon" onClick={() => setIsSearchOpen(true)} title="Search Bible">
          <Search size={18} />
        </button>

        {/* Desktop Bookmarks Action (Hidden on Mobile) */}
        <button
          className="btn-icon header-bookmark-btn"
          onClick={() => setIsBookmarksOpen(true)}
          title="Saved Bookmarks"
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

        {/* Mobile User Profile Action (Shown only on Mobile) */}
        <button
          className="btn-icon header-profile-btn"
          onClick={() => setIsAuthModalOpen(true)}
          title={user ? 'User Account' : 'Login / Sign In'}
        >
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Profile"
              style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <User size={18} />
          )}
        </button>
      </div>
    </header>
  );
};
