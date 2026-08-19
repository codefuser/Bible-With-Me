import React, { useState } from 'react';
import { X, Search, Bookmark, Settings, Globe, BookOpen, ChevronRight, History, Compass } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { Testament, BibleBook } from '../../types/bible';

export const SideNavDrawer: React.FC = () => {
  const {
    books,
    currentBook,
    currentChapter,
    language,
    toggleLanguage,
    isSideNavOpen,
    setIsSideNavOpen,
    setIsSearchOpen,
    setIsBookmarksOpen,
    setIsPreferencesOpen,
    setBookAndChapter,
    historyItem
  } = useReading();

  const [activeTestament, setActiveTestament] = useState<Testament>('OT');
  const [expandedBookId, setExpandedBookId] = useState<number | null>(currentBook.id);
  const [searchFilter, setSearchFilter] = useState<string>('');

  if (!isSideNavOpen) return null;

  const handleClose = () => {
    setIsSideNavOpen(false);
  };

  const handleSelectChapter = (book: BibleBook, ch: number) => {
    setBookAndChapter(book, ch);
    handleClose();
  };

  const filteredBooks = books.filter((b) => {
    const matchesTestament = b.testament === activeTestament;
    const name = language === 'ta' ? b.name_ta : b.name_en;
    const matchesSearch = !searchFilter.trim() || name.toLowerCase().includes(searchFilter.toLowerCase()) || b.code.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesTestament && matchesSearch;
  });

  return (
    <div className="modal-overlay" onClick={handleClose} style={{ padding: 0, justifyContent: 'flex-start' }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '340px',
          height: '100vh',
          maxHeight: '100vh',
          borderRadius: 0,
          boxShadow: 'var(--shadow-lg)',
          animation: 'slideRight 220ms ease'
        }}
      >
        {/* Drawer Header */}
        <div className="modal-header" style={{ padding: '0.875rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={20} style={{ color: 'var(--accent-color)' }} />
            <h2 className="modal-title" style={{ fontSize: '1.125rem' }}>
              {language === 'ta' ? 'வேதாகம அட்டவணை' : 'Bible Index'}
            </h2>
          </div>
          <button className="btn-icon" onClick={handleClose} title="Close Navigation">
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="modal-body" style={{ padding: '0.75rem 0.875rem' }}>
          {/* Quick Menu Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.375rem', marginBottom: '1rem' }}>
            <button
              className="btn-pill"
              onClick={() => {
                handleClose();
                setIsSearchOpen(true);
              }}
              style={{ justifyContent: 'flex-start', fontSize: '0.8125rem', gap: '0.375rem', padding: '0.4375rem 0.625rem' }}
            >
              <Search size={15} />
              <span>{language === 'ta' ? 'தேடுதல்' : 'Search'}</span>
            </button>

            <button
              className="btn-pill"
              onClick={() => {
                handleClose();
                setIsBookmarksOpen(true);
              }}
              style={{ justifyContent: 'flex-start', fontSize: '0.8125rem', gap: '0.375rem', padding: '0.4375rem 0.625rem' }}
            >
              <Bookmark size={15} />
              <span>{language === 'ta' ? 'சேமிப்புகள்' : 'Bookmarks'}</span>
            </button>

            <button
              className="btn-pill"
              onClick={() => {
                handleClose();
                setIsPreferencesOpen(true);
              }}
              style={{ justifyContent: 'flex-start', fontSize: '0.8125rem', gap: '0.375rem', padding: '0.4375rem 0.625rem' }}
            >
              <Settings size={15} />
              <span>{language === 'ta' ? 'அமைப்புகள்' : 'Settings'}</span>
            </button>

            <button
              className="btn-pill"
              onClick={toggleLanguage}
              style={{ justifyContent: 'flex-start', fontSize: '0.8125rem', gap: '0.375rem', padding: '0.4375rem 0.625rem' }}
            >
              <Globe size={15} />
              <span>{language === 'en' ? 'தமிழ்' : 'English'}</span>
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
                    {language === 'ta' ? 'கடைசியாக வாசித்தது' : 'Continue Reading'}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {language === 'ta' ? historyItem.book_name_ta : historyItem.book_name_en} {historyItem.chapter}
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
              <span>{language === 'ta' ? 'புத்தகங்கள்' : 'Bible Catalog'}</span>
            </div>

            {/* Testament Tabs */}
            <div className="book-tabs" style={{ marginBottom: '0.625rem' }}>
              <button
                className={`tab-btn ${activeTestament === 'OT' ? 'active' : ''}`}
                onClick={() => setActiveTestament('OT')}
                style={{ fontSize: '0.8125rem', padding: '0.375rem' }}
              >
                {language === 'ta' ? 'பழைய ஏற்பாடு (39)' : 'OT (39)'}
              </button>
              <button
                className={`tab-btn ${activeTestament === 'NT' ? 'active' : ''}`}
                onClick={() => setActiveTestament('NT')}
                style={{ fontSize: '0.8125rem', padding: '0.375rem' }}
              >
                {language === 'ta' ? 'புதிய ஏற்பாடு (27)' : 'NT (27)'}
              </button>
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder={language === 'ta' ? 'புத்தகத்தை வடிகட்டுக...' : 'Filter book...'}
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
              const name = language === 'ta' ? book.name_ta : book.name_en;

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
      </div>
    </div>
  );
};
