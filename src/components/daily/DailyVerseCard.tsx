import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { BibleVerse } from '../../types/bible';
import { getVerseByLocation, loadBibleDatasets } from '../../services/csvBibleService';

const COLLAPSE_STORAGE_KEY = 'bible_daily_verse_collapsed';

export const DailyVerseCard: React.FC = () => {
  const { books, language, setBookAndChapter } = useReading();
  const [verse, setVerse] = useState<BibleVerse | null>(null);

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COLLAPSE_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    loadBibleDatasets().then(() => {
      // Retrieve John 3:16 from the actual loaded CSV dataset (John = book_id 43)
      const realVerse = getVerseByLocation(43, 3, 16);
      if (realVerse) {
        setVerse(realVerse);
      }
    });
  }, []);

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

  const handleReadChapter = () => {
    const johnBook = books.find((b) => b.id === 43);
    if (johnBook) {
      setBookAndChapter(johnBook, 3, 16);
    }
  };

  if (!verse) return null;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.75rem',
        padding: isCollapsed ? '0.625rem 1rem' : '1rem 1.125rem',
        marginBottom: '1.25rem',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 200ms ease'
      }}
    >
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Sparkles size={15} />
          <span>{language === 'ta' ? 'இன்றைய வசனம்' : "Today's Verse"}</span>
          <span style={{ fontWeight: 600, color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
            · {language === 'ta' ? 'யோவான் 3:16' : 'John 3:16'}
          </span>
        </div>

        <button
          className="btn-icon"
          onClick={toggleCollapse}
          title={isCollapsed ? 'Expand Today\'s Verse' : 'Collapse Today\'s Verse'}
          aria-expanded={!isCollapsed}
          style={{ width: '1.75rem', height: '1.75rem' }}
        >
          {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {/* Expanded Content */}
      {!isCollapsed && (
        <div style={{ marginTop: '0.625rem', animation: 'fadeIn 180ms ease' }}>
          <p
            style={{
              fontFamily: language === 'ta' ? 'var(--font-tamil)' : 'var(--font-serif)',
              fontSize: '1rem',
              lineHeight: 1.65,
              color: 'var(--text-primary)',
              marginBottom: '0.875rem'
            }}
          >
            "{language === 'ta' ? verse.text_ta : verse.text_en}"
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.625rem', borderTop: '1px dashed var(--border-color)' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {language === 'ta' ? 'தினசரி தியானம்' : 'Daily Reading & Reflection'}
            </span>
            <button
              className="btn-pill"
              onClick={handleReadChapter}
              style={{ fontSize: '0.8125rem', gap: '0.375rem' }}
            >
              <span>{language === 'ta' ? 'அதிகாரத்தை வாசிக்க' : 'Read Chapter'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
