import React, { useState, useEffect } from 'react';
import { X, Search, Bookmark, Settings, BookOpen, ChevronRight, History, Compass, User, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { useAuth } from '../../context/AuthContext';
import { Testament, BibleBook } from '../../types/bible';

// ─── Inner Navigation Catalog Content (Shared between Mobile Drawer & Desktop Sidebar) ─────

const SideNavContentBody: React.FC<{ onCloseNav?: () => void }> = ({ onCloseNav }) => {
  const {
    books,
    currentBook,
    currentChapter,
    language,
    setIsSearchOpen,
    setIsBookmarksOpen,
    setIsPreferencesOpen,
    setIsReadingHistoryOpen,
    setBookAndChapter,
    historyItem
  } = useReading();

  const { isAuthenticated, setIsAuthModalOpen } = useAuth();

  const [activeTestament, setActiveTestament] = useState<Testament>('OT');
  const [expandedBookId, setExpandedBookId] = useState<number | null>(currentBook.id);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const handleSelectChapter = (book: BibleBook, ch: number) => {
    setBookAndChapter(book, ch);
    if (onCloseNav) onCloseNav();
  };

  const filteredBooks = books.filter((b) => {
    const matchesTestament = b.testament === activeTestament;
    const name = language === 'en' ? b.name_en : b.name_ta;
    const matchesSearch =
      !searchFilter.trim() ||
      name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.code.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesTestament && matchesSearch;
  });

  return (
    <div className="sidenav-body" style={{ paddingBottom: '5rem' }}>
      {/* Quick Menu Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.375rem', marginBottom: '1rem' }}>
        <button
          className="btn-pill"
          onClick={() => {
            if (onCloseNav) onCloseNav();
            setIsSearchOpen(true);
          }}
          style={{ justifyContent: 'flex-start', fontSize: '0.8125rem', gap: '0.375rem', padding: '0.4375rem 0.625rem' }}
        >
          <Search size={15} />
          <span>{language === 'en' ? 'Search' : 'தேடுதல்'}</span>
        </button>

        <button
          className="btn-pill"
          onClick={() => {
            if (onCloseNav) onCloseNav();
            setIsBookmarksOpen(true);
          }}
          style={{ justifyContent: 'flex-start', fontSize: '0.8125rem', gap: '0.375rem', padding: '0.4375rem 0.625rem' }}
        >
          <Bookmark size={15} />
          <span>{language === 'en' ? 'Bookmarks' : 'சேமிப்புகள்'}</span>
        </button>

        <button
          className="btn-pill"
          onClick={() => {
            if (onCloseNav) onCloseNav();
            setIsReadingHistoryOpen(true);
          }}
          style={{ justifyContent: 'flex-start', fontSize: '0.8125rem', gap: '0.375rem', padding: '0.4375rem 0.625rem' }}
        >
          <History size={15} />
          <span>{language === 'en' ? 'History' : 'வரலாறு'}</span>
        </button>

        <button
          className="btn-pill"
          onClick={() => {
            if (onCloseNav) onCloseNav();
            setIsPreferencesOpen(true);
          }}
          style={{ justifyContent: 'flex-start', fontSize: '0.8125rem', gap: '0.375rem', padding: '0.4375rem 0.625rem' }}
        >
          <Settings size={15} />
          <span>{language === 'en' ? 'Settings' : 'அமைப்புகள்'}</span>
        </button>

        <button
          className="btn-pill"
          onClick={() => {
            if (onCloseNav) onCloseNav();
            setIsAuthModalOpen(true);
          }}
          style={{ justifyContent: 'flex-start', fontSize: '0.8125rem', gap: '0.375rem', padding: '0.4375rem 0.625rem' }}
        >
          <User size={15} />
          <span>{isAuthenticated ? (language === 'en' ? 'Account' : 'கணக்கு') : (language === 'en' ? 'Sign In' : 'உள்நுழைக')}</span>
        </button>
      </div>

      {/* Stored History Resume Banner */}
      {historyItem && (
        <div
          onClick={() => {
            const target = books.find((b) => b.id === historyItem.book_id);
            if (target) handleSelectChapter(target, historyItem.chapter);
          }}
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '0.5rem',
            padding: '0.625rem 0.75rem',
            marginBottom: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={16} style={{ color: 'var(--accent-color)' }} />
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                {language === 'en' ? 'Continue Reading' : 'கடைசியாக வாசித்தது'}
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {language === 'en' ? historyItem.book_name_en : historyItem.book_name_ta} {historyItem.chapter}
              </span>
            </div>
          </div>
          <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
        </div>
      )}

      {/* Book Catalog Header & Search */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          <Compass size={14} />
          <span>{language === 'en' ? 'Bible Catalog' : 'புத்தகங்கள்'}</span>
        </div>

        {/* Testament Tabs */}
        <div className="book-tabs" style={{ marginBottom: '0.625rem' }}>
          <button
            className={`tab-btn ${activeTestament === 'OT' ? 'active' : ''}`}
            onClick={() => setActiveTestament('OT')}
            style={{ fontSize: '0.8125rem', padding: '0.375rem' }}
          >
            {language === 'en' ? 'OT (39)' : 'பழைய ஏற்பாடு (39)'}
          </button>
          <button
            className={`tab-btn ${activeTestament === 'NT' ? 'active' : ''}`}
            onClick={() => setActiveTestament('NT')}
            style={{ fontSize: '0.8125rem', padding: '0.375rem' }}
          >
            {language === 'en' ? 'NT (27)' : 'புதிய ஏற்பாடு (27)'}
          </button>
        </div>

        {/* Search Input */}
        <input
          type="text"
          placeholder={language === 'en' ? 'Filter book...' : 'புத்தகத்தை வடிகட்டுக...'}
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          style={{
            width: '100%',
            fontSize: '0.8125rem',
            padding: '0.375rem 0.625rem',
            borderRadius: '0.375rem',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)'
          }}
        />
      </div>

      {/* Book Accordion List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {filteredBooks.map((book) => {
          const isSelectedBook = currentBook.id === book.id;
          const isExpanded = expandedBookId === book.id;
          const name = language === 'en' ? book.name_en : book.name_ta;

          return (
            <div key={book.id} style={{ borderRadius: '0.375rem', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <button
                onClick={() => setExpandedBookId(isExpanded ? null : book.id)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: isSelectedBook ? 'var(--accent-soft)' : 'var(--bg-surface)',
                  color: isSelectedBook ? 'var(--accent-color)' : 'var(--text-primary)',
                  fontWeight: isSelectedBook ? 600 : 500,
                  fontSize: '0.875rem',
                  textAlign: 'left'
                }}
              >
                <span>{name}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.75, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {book.total_chapters} ch
                  <ChevronRight
                    size={14}
                    style={{
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 180ms ease'
                    }}
                  />
                </span>
              </button>

              {/* Chapter Selector Grid when Expanded */}
              {isExpanded && (
                <div
                  style={{
                    padding: '0.5rem',
                    backgroundColor: 'var(--bg-secondary)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '0.375rem',
                    borderTop: '1px solid var(--border-color)'
                  }}
                >
                  {Array.from({ length: book.total_chapters }, (_, i) => i + 1).map((ch) => {
                    const isCurrentCh = isSelectedBook && currentChapter === ch;
                    return (
                      <button
                        key={ch}
                        className={`chapter-btn ${isCurrentCh ? 'selected' : ''}`}
                        onClick={() => handleSelectChapter(book, ch)}
                        style={{ padding: '0.375rem', fontSize: '0.75rem', borderRadius: '0.25rem' }}
                      >
                        {ch}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── 1. Mobile Drawer Navigation Overlay ──────────────────────────────────────

export const SideNavDrawer: React.FC = () => {
  const { isSideNavOpen, setIsSideNavOpen, language } = useReading();

  // Global Touch Swipe Gesture Handling on Mobile
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 1) {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const deltaX = endX - startX;
        const deltaY = endY - startY;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
          if (deltaX > 0 && !isSideNavOpen) {
            setIsSideNavOpen(true);
          } else if (deltaX < 0 && isSideNavOpen) {
            setIsSideNavOpen(false);
          }
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isSideNavOpen, setIsSideNavOpen]);

  const handleClose = () => {
    setIsSideNavOpen(false);
  };

  return (
    <div
      className="sidenav-overlay"
      onClick={handleClose}
      style={{
        opacity: isSideNavOpen ? 1 : 0,
        pointerEvents: isSideNavOpen ? 'auto' : 'none',
        transition: 'opacity 280ms ease'
      }}
    >
      <div
        className="sidenav-drawer"
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: isSideNavOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 280ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Drawer Header */}
        <div className="sidenav-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} style={{ color: 'var(--accent-color)' }} />
            <h2 className="modal-title" style={{ fontSize: '1.125rem' }}>
              {language === 'en' ? 'Bible Index' : 'வேதாகம அட்டவணை'}
            </h2>
          </div>
          <button className="btn-icon" onClick={handleClose} title="Close Navigation">
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body Content */}
        <SideNavContentBody onCloseNav={handleClose} />
      </div>
    </div>
  );
};

// ─── 2. Permanent Desktop Sidebar Component ───────────────────────────────────

export const DesktopSidebar: React.FC = () => {
  const {
    isDesktopSidebarCollapsed,
    toggleDesktopSidebar,
    language,
    setIsSearchOpen,
    setIsBookmarksOpen,
    setIsReadingHistoryOpen,
    setIsPreferencesOpen
  } = useReading();

  const { isAuthenticated, setIsAuthModalOpen } = useAuth();

  if (isDesktopSidebarCollapsed) {
    return (
      <aside
        className="desktop-sidebar collapsed"
        onClick={toggleDesktopSidebar}
        title={language === 'en' ? 'Click anywhere to expand side navigation' : 'அட்டவணையை விரிவாக்க கிளிக் செய்யவும்'}
      >
        <div className="desktop-sidebar-collapsed-inner">
          <button
            className="btn-icon"
            onClick={(e) => {
              e.stopPropagation();
              toggleDesktopSidebar();
            }}
            title={language === 'en' ? 'Expand Side Navigation' : 'பக்கவாட்டு அட்டவணையை விரிவாக்கவும்'}
            style={{ marginBottom: '1rem' }}
          >
            <PanelLeftOpen size={20} style={{ color: 'var(--accent-color)' }} />
          </button>

          <button
            className="btn-icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsSearchOpen(true);
            }}
            title={language === 'en' ? 'Search' : 'தேடுதல்'}
          >
            <Search size={18} />
          </button>
          <button
            className="btn-icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsBookmarksOpen(true);
            }}
            title={language === 'en' ? 'Bookmarks' : 'சேமிப்புகள்'}
          >
            <Bookmark size={18} />
          </button>
          <button
            className="btn-icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsReadingHistoryOpen(true);
            }}
            title={language === 'en' ? 'History' : 'வரலாறு'}
          >
            <History size={18} />
          </button>
          <button
            className="btn-icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsPreferencesOpen(true);
            }}
            title={language === 'en' ? 'Settings' : 'அமைப்புகள்'}
          >
            <Settings size={18} />
          </button>
          <button
            className="btn-icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsAuthModalOpen(true);
            }}
            title={isAuthenticated ? (language === 'en' ? 'Account' : 'கணக்கு') : (language === 'en' ? 'Sign In' : 'உள்நுழைக')}
          >
            <User size={18} />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="desktop-sidebar expanded">
      {/* Sidebar Header with Collapse Button */}
      <div className="desktop-sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={18} style={{ color: 'var(--accent-color)' }} />
          <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {language === 'en' ? 'Bible Index' : 'வேதாகம அட்டவணை'}
          </span>
        </div>
        <button
          className="btn-icon"
          onClick={toggleDesktopSidebar}
          title={language === 'en' ? 'Collapse Side Navigation' : 'பக்கவாட்டு அட்டவணையை சுருக்கவும்'}
        >
          <PanelLeftClose size={18} />
        </button>
      </div>

      {/* Catalog Body */}
      <SideNavContentBody />
    </aside>
  );
};
