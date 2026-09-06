import React, { useEffect, useState } from 'react';
import { Sparkles, BookOpen, ChevronDown, History, Image as ImageIcon, Bookmark } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { useAuth } from '../../context/AuthContext';
import { getDailyVerse, LoadedDailyVerse } from '../../services/dailyVerseService';
import { ALL_BIBLE_BOOKS } from '../../services/bibleService';
import { trackActivity } from '../../services/activityService';

const COLLAPSE_STORAGE_KEY = 'bible_daily_verse_collapsed';

export const DailyVerseCard: React.FC = () => {
  const { books, setBookAndChapter, language, setIsDailyHistoryOpen, openVerseCard } = useReading();
  const { user } = useAuth();
  const userId = user?.id || null;

  const [dailyData, setDailyData] = useState<LoadedDailyVerse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(COLLAPSE_STORAGE_KEY);
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    let isMounted = true;
    getDailyVerse().then((res) => {
      if (isMounted) {
        setDailyData(res);
        setLoading(false);
        if (userId && res?.verse) {
          const bookCode = ALL_BIBLE_BOOKS.find((b) => b.id === res.verse.book_id)?.code || String(res.verse.book_id);
          trackActivity(userId, 'DAILY_VERSE_VIEWED', bookCode, res.verse.chapter, res.verse.verse);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? 'true' : 'false');
      } catch (err) {
        console.error('Error saving daily verse collapse preference:', err);
      }
      return next;
    });
  };

  if (loading || !dailyData) return null;

  const { verse, book_name_ta, book_name_en } = dailyData;
  const refTa = `${book_name_ta} ${verse.chapter}:${verse.verse}`;
  const refEn = `${book_name_en} ${verse.chapter}:${verse.verse}`;
  const verseText = language === 'ta' ? verse.text_ta : verse.text_en;

  const handleGoToChapter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!dailyData) return;
    const book = books.find((b) => b.id === dailyData.verse.book_id);
    if (book) {
      setBookAndChapter(book, dailyData.verse.chapter, dailyData.verse.verse);
    }
  };

  const handleOpenHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDailyHistoryOpen(true);
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.875rem',
        padding: '0.875rem 1rem',
        marginBottom: '1.25rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
        transition: 'all 240ms cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Header Bar */}
      <div
        onClick={toggleCollapse}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {/* Devotional Badge Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3125rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '9999px',
              backgroundColor: 'var(--accent-soft)',
              color: 'var(--accent-color)',
              border: '1px solid var(--border-color)',
              fontSize: '0.71875rem',
              fontWeight: 700,
              width: 'fit-content',
              letterSpacing: '0.01em'
            }}
          >
            <Sparkles size={12} />
            <span>{language === 'ta' ? 'இன்றைய எழுப்புதல் வார்த்தை' : "Today's Revival Word"}</span>
          </div>

          {/* Verse Reference Title */}
          <h4
            style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}
          >
            <Bookmark size={14} style={{ color: 'var(--accent-color)' }} />
            <span>{language === 'ta' ? refTa : refEn}</span>
          </h4>
        </div>

        {/* Right Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
          <button
            className="btn-icon"
            onClick={handleOpenHistory}
            title={language === 'ta' ? 'முந்தைய எழுப்புதல் வார்த்தைகள்' : 'Revival Word History'}
            style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-muted)'
            }}
          >
            <History size={15} />
          </button>

          <button
            className="btn-icon"
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse();
            }}
            title={isCollapsed ? "Expand Today's Revival Word" : "Collapse Today's Revival Word"}
            aria-expanded={!isCollapsed}
            style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-muted)'
            }}
          >
            <ChevronDown
              size={16}
              style={{
                transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 280ms cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          </button>
        </div>
      </div>

      {/* Smooth Collapsible Content */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: isCollapsed ? '0fr' : '1fr',
          transition: 'grid-template-rows 280ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div
            style={{
              paddingTop: '0.75rem',
              opacity: isCollapsed ? 0 : 1,
              transition: 'opacity 220ms ease, transform 280ms ease',
              transform: isCollapsed ? 'translateY(-6px)' : 'translateY(0)'
            }}
          >
            {/* Verse Quote Block with Left Accent Border */}
            <div
              style={{
                borderLeft: '3px solid var(--accent-color)',
                paddingLeft: '0.875rem',
                margin: '0.25rem 0 0.875rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '0 0.5rem 0.5rem 0',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem'
              }}
            >
              <p
                style={{
                  fontFamily: language === 'ta' ? 'var(--font-tamil)' : 'var(--font-serif)',
                  fontSize: '1.0625rem',
                  lineHeight: 1.65,
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  margin: 0
                }}
              >
                "{verseText}"
              </p>
            </div>

            {/* Action Bar (Refined Responsive Devotional Pill Action Buttons) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                paddingTop: '0.625rem',
                borderTop: '1px solid var(--border-color)',
                flexWrap: 'wrap'
              }}
            >
              {/* Create Image Card Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (dailyData) {
                    const book = books.find((b) => b.id === dailyData.verse.book_id);
                    if (book) openVerseCard(dailyData.verse, book, dailyData.verse.chapter);
                  }
                }}
                style={{
                  flex: '1 1 120px',
                  minWidth: 0,
                  whiteSpace: 'nowrap',
                  height: '2.25rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  padding: '0 0.5rem',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.78125rem',
                  fontWeight: 600,
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
              >
                <ImageIcon size={13} style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {language === 'ta' ? 'கார்டு உருவாக்க' : 'Create Card'}
                </span>
              </button>

              {/* Read Chapter Primary Action Button */}
              <button
                onClick={handleGoToChapter}
                style={{
                  flex: '1 1 120px',
                  minWidth: 0,
                  whiteSpace: 'nowrap',
                  height: '2.25rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem',
                  padding: '0 0.5rem',
                  borderRadius: '9999px',
                  backgroundColor: 'var(--accent-soft)',
                  color: 'var(--accent-color)',
                  fontSize: '0.78125rem',
                  fontWeight: 600,
                  border: '1px solid var(--accent-color)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
              >
                <BookOpen size={13} style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {language === 'ta' ? 'அதிகாரம் வாசிக்க' : 'Read Chapter'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
