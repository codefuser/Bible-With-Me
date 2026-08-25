import React, { useEffect, useMemo } from 'react';
import { X, BookOpen, Clock, ArrowRight, CalendarDays, History } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { ReadingHistoryItem } from '../../types/bible';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatRelativeTime = (isoString: string, language: string): string => {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (language === 'ta') {
      if (diffMins < 1) return 'இப்போது';
      if (diffMins < 60) return `${diffMins} நிமிடங்கள் முன்`;
      if (diffHours < 24) return `${diffHours} மணி முன்`;
      if (diffDays === 1) return 'நேற்று';
      if (diffDays < 7) return `${diffDays} நாட்கள் முன்`;
      return date.toLocaleDateString('ta-IN', { day: 'numeric', month: 'short' });
    } else {
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    }
  } catch {
    return '';
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

export const ReadingHistoryModal: React.FC = () => {
  const {
    isReadingHistoryOpen,
    setIsReadingHistoryOpen,
    historyList,
    language,
    books,
    setBookAndChapter
  } = useReading();

  useEffect(() => {
    if (isReadingHistoryOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isReadingHistoryOpen]);

  // Group history by day
  const grouped = useMemo(() => {
    const map = new Map<string, ReadingHistoryItem[]>();
    historyList.forEach((item) => {
      const date = new Date(item.updated_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      let label: string;
      if (date.toDateString() === today.toDateString()) {
        label = language === 'ta' ? 'இன்று' : 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        label = language === 'ta' ? 'நேற்று' : 'Yesterday';
      } else {
        label = date.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric'
        });
      }
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(item);
    });
    return Array.from(map.entries());
  }, [historyList, language]);

  const handleResumeItem = (item: ReadingHistoryItem) => {
    const book = books.find((b) => b.id === item.book_id);
    if (book) {
      setBookAndChapter(book, item.chapter, item.verse || 1);
      setIsReadingHistoryOpen(false);
    }
  };

  if (!isReadingHistoryOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsReadingHistoryOpen(false)}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px', padding: 0, overflow: 'hidden' }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-surface) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--accent-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <History size={18} color="#fff" />
            </div>
            <div>
              <h2
                style={{
                  fontSize: '1.0625rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0
                }}
              >
                {language === 'ta' ? 'வாசிக்கும் வரலாறு' : 'Reading History'}
              </h2>
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  margin: 0
                }}
              >
                {historyList.length > 0
                  ? language === 'ta'
                    ? `${historyList.length} அத்தியாயங்கள்`
                    : `${historyList.length} chapters`
                  : language === 'ta'
                  ? 'வரலாறு இல்லை'
                  : 'No history yet'}
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={() => setIsReadingHistoryOpen(false)} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div
          className="modal-body"
          style={{ maxHeight: '70vh', overflowY: 'auto', padding: '1rem 1.25rem' }}
        >
          {historyList.length === 0 ? (
            /* Empty State */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 1rem',
                gap: '0.75rem',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CalendarDays size={28} style={{ color: 'var(--text-muted)' }} />
              </div>
              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  margin: 0
                }}
              >
                {language === 'ta' ? 'இன்னும் வரலாறு இல்லை' : 'No reading history yet'}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', margin: 0 }}>
                {language === 'ta'
                  ? 'நீங்கள் வாசிக்கும் அத்தியாயங்கள் இங்கே தெரியும்'
                  : 'Chapters you read will appear here'}
              </p>
            </div>
          ) : (
            /* History List — grouped by day */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {grouped.map(([label, items]) => (
                <div key={label}>
                  {/* Day Label */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.625rem'
                    }}
                  >
                    <Clock size={12} style={{ color: 'var(--accent-color)' }} />
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--accent-color)'
                      }}
                    >
                      {label}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: '1px',
                        backgroundColor: 'var(--border-color)'
                      }}
                    />
                  </div>

                  {/* Items for this day */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {items.map((item, idx) => {
                      const bookName =
                        language === 'ta' ? item.book_name_ta : item.book_name_en;
                      const timeAgo = formatRelativeTime(item.updated_at, language);

                      return (
                        <button
                          key={`${item.book_id}_${item.chapter}_${idx}`}
                          onClick={() => handleResumeItem(item)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: '0.625rem',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-surface)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                            e.currentTarget.style.borderColor = 'var(--accent-color)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          {/* Icon */}
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '8px',
                              backgroundColor: 'var(--bg-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              border: '1px solid var(--border-color)'
                            }}
                          >
                            <BookOpen size={16} style={{ color: 'var(--accent-color)' }} />
                          </div>

                          {/* Text */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: '0.9375rem',
                                color: 'var(--text-primary)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            >
                              {bookName}{' '}
                              <span style={{ color: 'var(--accent-color)' }}>
                                {language === 'ta' ? 'அதிகாரம்' : 'Ch.'} {item.chapter}
                              </span>
                            </div>
                            {timeAgo && (
                              <div
                                style={{
                                  fontSize: '0.75rem',
                                  color: 'var(--text-muted)',
                                  marginTop: '0.125rem'
                                }}
                              >
                                {timeAgo}
                              </div>
                            )}
                          </div>

                          {/* Arrow */}
                          <ArrowRight
                            size={15}
                            style={{ color: 'var(--text-muted)', flexShrink: 0 }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
