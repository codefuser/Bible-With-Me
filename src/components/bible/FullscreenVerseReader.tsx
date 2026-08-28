import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Palette,
  Check,
  RotateCw,
} from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import '../../styles/fullscreen-reader.css';

type FsrTheme = 'light' | 'dark' | 'sepia' | 'midnight' | 'emerald';

const THEMES: { key: FsrTheme; bg: string; text: string; label: string; labelTa: string }[] = [
  { key: 'light',    bg: '#f8f7f4', text: '#1a1a2e', label: 'Light',    labelTa: 'வெளிர்' },
  { key: 'sepia',    bg: '#f3ead8', text: '#3b2f1e', label: 'Sepia',    labelTa: 'சேபியா' },
  { key: 'dark',     bg: '#0f172a', text: '#f1f5f9', label: 'Dark',     labelTa: 'இருண்ட' },
  { key: 'midnight', bg: '#0d1b2a', text: '#cfe2ff', label: 'Midnight', labelTa: 'நள்ளிரவு' },
  { key: 'emerald',  bg: '#0f1f13', text: '#d1fae5', label: 'Emerald',  labelTa: 'பச்சை' },
];

export const FullscreenVerseReader: React.FC = () => {
  const {
    isFullscreenReaderOpen,
    fullscreenVerseList,
    fullscreenVerseIndex,
    setFullscreenVerseIndex,
    closeFullscreenReader,
    language,
    currentBook,
  } = useReading();

  const [theme, setTheme] = useState<FsrTheme>(() => {
    return (localStorage.getItem('fsr_theme') as FsrTheme) || 'dark';
  });
  const [fontSize, setFontSize] = useState<number>(() => {
    return Number(localStorage.getItem('fsr_fontsize')) || 24;
  });
  const [slideDir, setSlideDir] = useState<'next' | 'prev' | null>(null);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isRotated, setIsRotated] = useState(false);

  // Touch gesture tracking
  const touchStartX = useRef<number | null>(null);
  const themePopoverRef = useRef<HTMLDivElement | null>(null);

  const verse = fullscreenVerseList[fullscreenVerseIndex];
  const total = fullscreenVerseList.length;
  const progress = total > 0 ? ((fullscreenVerseIndex + 1) / total) * 100 : 0;

  // Close theme popover on outside click
  useEffect(() => {
    if (!isThemeOpen) return;
    const handler = (e: MouseEvent) => {
      if (themePopoverRef.current && !themePopoverRef.current.contains(e.target as Node)) {
        setIsThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isThemeOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isFullscreenReaderOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isThemeOpen) { setIsThemeOpen(false); return; }
        closeFullscreenReader();
      }
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreenReaderOpen, fullscreenVerseIndex, total, isThemeOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isFullscreenReaderOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setIsRotated(false);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isFullscreenReaderOpen]);

  const goNext = useCallback(() => {
    if (fullscreenVerseIndex < total - 1) {
      setSlideDir('next');
      setFullscreenVerseIndex(fullscreenVerseIndex + 1);
      setTimeout(() => setSlideDir(null), 320);
    }
  }, [fullscreenVerseIndex, total, setFullscreenVerseIndex]);

  const goPrev = useCallback(() => {
    if (fullscreenVerseIndex > 0) {
      setSlideDir('prev');
      setFullscreenVerseIndex(fullscreenVerseIndex - 1);
      setTimeout(() => setSlideDir(null), 320);
    }
  }, [fullscreenVerseIndex, setFullscreenVerseIndex]);

  const handleTheme = (t: FsrTheme) => {
    setTheme(t);
    localStorage.setItem('fsr_theme', t);
    setIsThemeOpen(false);
  };

  const handleFontSize = (delta: number) => {
    const next = Math.min(42, Math.max(14, fontSize + delta));
    setFontSize(next);
    localStorage.setItem('fsr_fontsize', String(next));
  };

  const toggleRotate = async () => {
    const nextState = !isRotated;
    setIsRotated(nextState);

    try {
      if (nextState) {
        // Try native orientation lock if browser supports it
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen().catch(() => {});
        }
        if (screen.orientation && (screen.orientation as any).lock) {
          await (screen.orientation as any).lock('landscape').catch(() => {});
        }
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen().catch(() => {});
        }
        if (screen.orientation && (screen.orientation as any).unlock) {
          (screen.orientation as any).unlock();
        }
      }
    } catch (err) {
      // Fallback CSS handles visual rotation seamlessly
    }
  };

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      if (delta > 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  if (!isFullscreenReaderOpen || !verse) return null;

  const bookName = language === 'en' ? currentBook.name_en : currentBook.name_ta;
  const refLabel = `${bookName} ${verse.chapter}:${verse.verse}`;
  const slideClass = slideDir === 'next' ? 'slide-next' : slideDir === 'prev' ? 'slide-prev' : '';
  const isTa = language !== 'en';

  return (
    <div
      className={`fsr-backdrop fsr-theme-${theme} ${isRotated ? 'fsr-rotated-mode' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={isTa ? 'முழுத்திரை வசன வாசிப்பு' : 'Fullscreen Verse Reader'}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="fsr-header">
        <span className="fsr-reference">{refLabel}</span>

        <div className="fsr-header-controls">
          {/* Font − + */}
          <button className="fsr-font-btn" onClick={() => handleFontSize(-2)} title="Smaller">A−</button>
          <button className="fsr-font-btn" onClick={() => handleFontSize(2)} title="Larger">A+</button>

          {/* Screen Rotation Button */}
          <button
            className={`fsr-header-btn ${isRotated ? 'active' : ''}`}
            onClick={toggleRotate}
            title={isTa ? 'திரை சுழற்று' : 'Rotate Screen'}
            aria-label="Rotate Screen"
          >
            <RotateCw size={15} />
          </button>

          {/* Theme picker button + popover */}
          <div className="fsr-theme-picker-wrap" ref={themePopoverRef}>
            <button
              className={`fsr-header-btn ${isThemeOpen ? 'active' : ''}`}
              onClick={() => setIsThemeOpen((v) => !v)}
              title={isTa ? 'தீம் மாற்று' : 'Change Theme'}
              aria-label="Theme picker"
            >
              <Palette size={15} />
            </button>

            {isThemeOpen && (
              <div className="fsr-theme-popover">
                <p className="fsr-theme-popover-title">
                  {isTa ? 'தோற்றம் தேர்வு' : 'Choose Theme'}
                </p>
                {THEMES.map((t) => (
                  <button
                    key={t.key}
                    className={`fsr-theme-option ${theme === t.key ? 'active' : ''}`}
                    onClick={() => handleTheme(t.key)}
                  >
                    <span
                      className="fsr-theme-swatch"
                      style={{ backgroundColor: t.bg, border: `2px solid ${t.text}22` }}
                    />
                    <span className="fsr-theme-option-label">
                      {isTa ? t.labelTa : t.label}
                    </span>
                    {theme === t.key && <Check size={13} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Close */}
          <button
            className="fsr-header-btn"
            onClick={closeFullscreenReader}
            title={isTa ? 'மூடு' : 'Close'}
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>
      </header>

      {/* ── Progress Bar ──────────────────────────────────── */}
      <div className="fsr-progress-bar">
        <div className="fsr-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* ── Verse Content (Clean, Distraction Free) ───────── */}
      <main
        className="fsr-content"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Prev arrow */}
        <button
          className="fsr-nav-btn prev"
          onClick={goPrev}
          disabled={fullscreenVerseIndex === 0}
          aria-label="Previous Verse"
        >
          <ChevronLeft size={22} />
        </button>

        {/* Verse card */}
        <div className={`fsr-verse-card ${slideClass}`}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <span className="fsr-verse-num">{verse.verse}</span>
          </div>

          {language !== 'en' && (
            <p className="fsr-verse-text lang-ta" style={{ fontSize: `${fontSize}px` }}>
              {verse.text_ta}
            </p>
          )}

          {language === 'parallel' && <div className="fsr-verse-text-divider" />}

          {language !== 'ta' && (
            <p className="fsr-verse-text lang-en" style={{ fontSize: `${Math.max(16, fontSize - 2)}px` }}>
              {verse.text_en}
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
            <span className="fsr-counter">{fullscreenVerseIndex + 1} / {total}</span>
          </div>
        </div>

        {/* Next arrow */}
        <button
          className="fsr-nav-btn next"
          onClick={goNext}
          disabled={fullscreenVerseIndex === total - 1}
          aria-label="Next Verse"
        >
          <ChevronRight size={22} />
        </button>
      </main>
    </div>
  );
};
