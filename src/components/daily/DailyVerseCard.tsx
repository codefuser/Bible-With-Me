import React, { useEffect, useState } from 'react';
import { Sparkles, BookOpen, Compass, Calendar, ChevronDown, History } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { useAuth } from '../../context/AuthContext';
import { getDailyVerse, LoadedDailyVerse } from '../../services/dailyVerseService';
import { ALL_BIBLE_BOOKS } from '../../services/bibleService';
import { trackActivity } from '../../services/activityService';

const COLLAPSE_STORAGE_KEY = 'bible_daily_verse_collapsed';

export const DailyVerseCard: React.FC = () => {
  const { books, setBookAndChapter, language, setIsDailyHistoryOpen } = useReading();
  const { user } = useAuth();
  const userId = user?.id || null;

  const [dailyData, setDailyData] = useState<LoadedDailyVerse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COLLAPSE_STORAGE_KEY) === 'true';
    } catch {
      return false;
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

  const { verse, book_name_ta, book_name_en, prompt_ta, prompt_en } = dailyData;
  const refTa = `${book_name_ta} ${verse.chapter}:${verse.verse}`;
  const refEn = `${book_name_en} ${verse.chapter}:${verse.verse}`;
  const verseText = language === 'ta' ? verse.text_ta : verse.text_en;
  const promptText = language === 'ta' ? prompt_ta : prompt_en;

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
        padding: '0.875rem 1.125rem',
        marginBottom: '1.25rem',
        boxShadow: 'var(--shadow-sm)',
        transition: 'padding 280ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 200ms ease'
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--accent-color)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          <Sparkles size={15} />
          <span>{language === 'ta' ? 'இன்றைய எழுப்புதல் வார்த்தை' : "Today's Revival Word"}</span>
          <span style={{ fontWeight: 600, color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
            · {language === 'ta' ? refTa : refEn}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <button
            className="btn-icon"
            onClick={handleOpenHistory}
            title={language === 'ta' ? 'முந்தைய எழுப்புதல் வார்த்தைகள்' : 'Revival Word History'}
            style={{ width: '1.75rem', height: '1.75rem', color: 'var(--text-muted)' }}
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
            style={{ width: '1.75rem', height: '1.75rem' }}
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
            <p
              style={{
                fontFamily: language === 'ta' ? 'var(--font-tamil)' : 'var(--font-serif)',
                fontSize: '1.0625rem',
                lineHeight: 1.65,
                color: 'var(--text-primary)',
                marginBottom: '0.625rem'
              }}
            >
              "{verseText}"
            </p>

            <p
              style={{
                fontSize: '0.8125rem',
                fontStyle: 'italic',
                color: 'var(--text-muted)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem'
              }}
            >
              <Calendar size={13} />
              <span>{promptText}</span>
            </p>

            {/* Read Chapter Primary Action Button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingTop: '0.75rem',
                borderTop: '1px dashed var(--border-color)'
              }}
            >
              <button
                className="btn-pill"
                onClick={handleGoToChapter}
                style={{
                  fontSize: '0.8125rem',
                  padding: '0.4375rem 0.875rem',
                  gap: '0.375rem',
                  backgroundColor: 'var(--accent-color)',
                  color: '#ffffff',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)',
                  cursor: 'pointer'
                }}
              >
                <BookOpen size={14} />
                <span>{language === 'ta' ? 'அதிகாரத்தை வாசிக்க' : 'Read Full Chapter'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
