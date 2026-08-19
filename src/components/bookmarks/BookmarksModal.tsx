import React from 'react';
import { X, Trash2, Bookmark as BookmarkIcon } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { EmptyState } from '../common/EmptyState';
import { Bookmark } from '../../types/bible';

export const BookmarksModal: React.FC = () => {
  const {
    books,
    bookmarks,
    language,
    isBookmarksOpen,
    setIsBookmarksOpen,
    setBookAndChapter,
    handleToggleBookmark
  } = useReading();

  if (!isBookmarksOpen) return null;

  const handleSelectBookmark = (b: Bookmark) => {
    const book = books.find((bk) => bk.id === b.book_id);
    if (book) {
      setBookAndChapter(book, b.chapter, b.verse);
      setIsBookmarksOpen(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsBookmarksOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookmarkIcon size={18} style={{ color: 'var(--bookmark-active)' }} />
            <h2 className="modal-title">
              {language === 'ta' ? 'சேமிக்கப்பட்ட வசனங்கள்' : 'Saved Bookmarks'}
            </h2>
          </div>
          <button className="btn-icon" onClick={() => setIsBookmarksOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {bookmarks.length === 0 ? (
            <EmptyState
              title={language === 'ta' ? 'புத்தகக்குறிகள் எதுவும் இல்லை' : 'No bookmarks saved'}
              description={language === 'ta' ? 'வாசிக்கும் போது வசனத்தின் அருகிலுள்ள புக்மார்க் பொத்தானைக் கிளிக் செய்து சேமிக்கவும்.' : 'Click the bookmark icon next to any verse while reading to save it here.'}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bookmarks.map((bm) => {
                const bookName = language === 'ta' ? bm.book_name_ta : bm.book_name_en;
                const text = language === 'ta' ? bm.text_ta : bm.text_en;
                return (
                  <div
                    key={bm.id}
                    style={{
                      padding: '0.875rem 1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-surface)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      transition: 'background-color var(--transition-fast)'
                    }}
                    onClick={() => handleSelectBookmark(bm)}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface)')}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--accent-color)', marginBottom: '0.25rem' }}>
                        {bookName} {bm.chapter}:{bm.verse}
                      </div>
                      <div style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontFamily: language === 'ta' ? 'var(--font-tamil)' : 'var(--font-serif)' }}>
                        {text}
                      </div>
                    </div>

                    <button
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        const dummyVerseObj = { id: 0, book_id: bm.book_id, chapter: bm.chapter, verse: bm.verse, text_en: bm.text_en, text_ta: bm.text_ta };
                        const dummyBookObj = books.find(b => b.id === bm.book_id) || { id: bm.book_id, name_en: bm.book_name_en, name_ta: bm.book_name_ta } as any;
                        handleToggleBookmark(dummyVerseObj);
                      }}
                      title="Remove Bookmark"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
