import React from 'react';
import { X, Trash2, Bookmark as BookmarkIcon, Calendar } from 'lucide-react';
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

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsBookmarksOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookmarkIcon size={18} style={{ color: 'var(--bookmark-active)' }} />
            <h2 className="modal-title">
              {language === 'ta' ? 'சேமிக்கப்பட்ட வசனங்கள்' : 'Saved Bookmarks'} ({bookmarks.length})
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
              description={language === 'ta' ? 'வாசிக்கும் போது வசனத்தைக் கிளிக் செய்து "சேமி" பொத்தானைத் தட்டவும்.' : 'Click any verse while reading and select "Bookmark" to save it here.'}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bookmarks.map((bm) => {
                const bookName = language === 'ta' ? bm.book_name_ta : bm.book_name_en;
                const text = language === 'ta' ? bm.text_ta : bm.text_en;
                const dateStr = formatDate(bm.created_at);

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
                      transition: 'all var(--transition-fast)'
                    }}
                    onClick={() => handleSelectBookmark(bm)}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface)')}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--accent-color)' }}>
                          {bookName} {bm.chapter}:{bm.verse}
                        </span>
                        {dateStr && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={12} />
                            {dateStr}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontFamily: language === 'ta' ? 'var(--font-tamil)' : 'var(--font-serif)', lineHeight: 1.6 }}>
                        "{text}"
                      </div>
                    </div>

                    <button
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        const dummyVerseObj = { id: 0, book_id: bm.book_id, chapter: bm.chapter, verse: bm.verse, text_en: bm.text_en, text_ta: bm.text_ta };
                        handleToggleBookmark(dummyVerseObj);
                      }}
                      title={language === 'ta' ? 'சேமிப்பை நீக்கு' : 'Remove Bookmark'}
                      style={{ color: 'var(--text-muted)', flexShrink: 0 }}
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
