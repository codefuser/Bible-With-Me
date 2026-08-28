import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Bookmark as BookmarkIcon,
  Copy,
  Share2,
  Volume2,
  VolumeX,
  Image as ImageIcon,
  Minus,
  Plus,
  Sun,
  Moon
} from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import '../../styles/fullscreen-reader.css';

type FsrTheme = 'light' | 'dark' | 'sepia' | 'midnight' | 'emerald';

const THEME_DOTS: { key: FsrTheme; bg: string; label: string }[] = [
  { key: 'light',    bg: '#f8f7f4', label: 'Light' },
  { key: 'sepia',    bg: '#f3ead8', label: 'Sepia' },
  { key: 'dark',     bg: '#0f172a', label: 'Dark' },
  { key: 'midnight', bg: '#0d1b2a', label: 'Midnight' },
  { key: 'emerald',  bg: '#0f1f13', label: 'Emerald' },
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
    currentChapter,
    bookmarks,
    highlights,
    handleToggleBookmark,
    openVerseCard,
  } = useReading();

  const [theme, setTheme] = useState<FsrTheme>(() => {
    return (localStorage.getItem('fsr_theme') as FsrTheme) || 'dark';
  });
  const [fontSize, setFontSize] = useState<number>(() => {
    return Number(localStorage.getItem('fsr_fontsize')) || 22;
  });
  const [slideDir, setSlideDir] = useState<'next' | 'prev' | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRotated, setIsRotated] = useState(false);

  // Touch gesture tracking
  const touchStartX = useRef<number | null>(null);

  const verse = fullscreenVerseList[fullscreenVerseIndex];
  const total = fullscreenVerseList.length;
  const progress = total > 0 ? ((fullscreenVerseIndex + 1) / total) * 100 : 0;

  const isBookmarked = verse
    ? bookmarks.some(
        (b) =>
          b.book_id === verse.book_id &&
          b.chapter === verse.chapter &&
          b.verse === verse.verse
      )
    : false;

  // Stop speaking on unmount or verse change
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    };
  }, [fullscreenVerseIndex, isFullscreenReaderOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isFullscreenReaderOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFullscreenReader();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFullscreenReaderOpen, fullscreenVerseIndex, total]);

  // Lock body scroll when open
  useEffect(() => {
    if (isFullscreenReaderOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreenReaderOpen]);

  const goNext = useCallback(() => {
    if (fullscreenVerseIndex < total - 1) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      setSlideDir('next');
      setFullscreenVerseIndex(fullscreenVerseIndex + 1);
      setTimeout(() => setSlideDir(null), 320);
    }
  }, [fullscreenVerseIndex, total, setFullscreenVerseIndex]);

  const goPrev = useCallback(() => {
    if (fullscreenVerseIndex > 0) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      setSlideDir('prev');
      setFullscreenVerseIndex(fullscreenVerseIndex - 1);
      setTimeout(() => setSlideDir(null), 320);
    }
  }, [fullscreenVerseIndex, setFullscreenVerseIndex]);

  const handleTheme = (t: FsrTheme) => {
    setTheme(t);
    localStorage.setItem('fsr_theme', t);
  };

  const handleFontSize = (delta: number) => {
    const next = Math.min(40, Math.max(14, fontSize + delta));
    setFontSize(next);
    localStorage.setItem('fsr_fontsize', String(next));
  };

  const handleSpeech = () => {
    if (!verse) return;
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      return;
    }
    const text = language === 'en' ? verse.text_en : verse.text_ta;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'en' ? 'en-US' : 'ta-IN';
    utterance.rate = 0.88;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleCopy = async () => {
    if (!verse) return;
    const text = language === 'en' ? verse.text_en : verse.text_ta;
    const ref = `${currentBook.name_ta || currentBook.name_en} ${verse.chapter}:${verse.verse}`;
    await navigator.clipboard.writeText(`"${text}" — ${ref}`);
  };

  const handleShare = async () => {
    if (!verse) return;
    const text = language === 'en' ? verse.text_en : verse.text_ta;
    const ref = `${currentBook.name_ta || currentBook.name_en} ${verse.chapter}:${verse.verse}`;
    const shareText = `"${text}" — ${ref}`;
    if (navigator.share) {
      await navigator.share({ title: ref, text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
    }
  };

  const handleRotate = () => {
    setIsRotated((prev) => !prev);
    // Try Screen Orientation API if available
    if (!isRotated && screen.orientation && (screen.orientation as any).lock) {
      (screen.orientation as any).lock('landscape').catch(() => {});
    } else {
      if (screen.orientation && (screen.orientation as any).unlock) {
        (screen.orientation as any).unlock();
      }
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

  const verseTextTa = verse.text_ta;
  const verseTextEn = verse.text_en;
  const bookName = language === 'en' ? currentBook.name_en : currentBook.name_ta;
  const refLabel = `${bookName} ${verse.chapter}:${verse.verse}`;

  const slideClass =
    slideDir === 'next' ? 'slide-next' :
    slideDir === 'prev' ? 'slide-prev' :
    '';

  return (
    <div
      className={`fsr-backdrop fsr-theme-${theme}`}
      role="dialog"
      aria-modal="true"
      aria-label={language === 'ta' ? 'முழுத்திரை வசன வாசிப்பு' : 'Fullscreen Verse Reader'}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="fsr-header">
        <span className="fsr-reference">{refLabel}</span>

        <div className="fsr-header-controls">
          {/* Theme dots */}
          <div className="fsr-theme-row">
            {THEME_DOTS.map((t) => (
              <button
                key={t.key}
                className={`fsr-theme-dot ${theme === t.key ? 'active' : ''}`}
                style={{ backgroundColor: t.bg }}
                onClick={() => handleTheme(t.key)}
                title={t.label}
                aria-label={`Theme: ${t.label}`}
              />
            ))}
          </div>

          {/* Font size controls */}
          <div className="fsr-font-controls">
            <button className="fsr-font-btn" onClick={() => handleFontSize(-2)} title="Smaller Text">A−</button>
            <button className="fsr-font-btn" onClick={() => handleFontSize(2)} title="Larger Text">A+</button>
          </div>

          {/* Rotation toggle */}
          <button
            className={`fsr-header-btn ${isRotated ? 'active' : ''}`}
            onClick={handleRotate}
            title={isRotated ? 'Portrait Mode' : 'Landscape Mode'}
            aria-label="Toggle Screen Rotation"
          >
            <RotateCcw size={15} />
          </button>

          {/* Close */}
          <button
            className="fsr-header-btn"
            onClick={closeFullscreenReader}
            title="Close"
            aria-label="Close Fullscreen Reader"
          >
            <X size={17} />
          </button>
        </div>
      </header>

      {/* ── Progress Bar ────────────────────────────────────────────── */}
      <div className="fsr-progress-bar">
        <div className="fsr-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* ── Verse Content Area ──────────────────────────────────────── */}
      <main
        className="fsr-content"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Left nav arrow */}
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
          {/* Verse number badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <span className="fsr-verse-num">{verse.verse}</span>
          </div>

          {/* Tamil text */}
          {language !== 'en' && (
            <p
              className="fsr-verse-text lang-ta"
              style={{ fontSize: `${fontSize}px` }}
            >
              {verseTextTa}
            </p>
          )}

          {/* Divider when both languages shown */}
          {language === 'parallel' && (
            <div className="fsr-verse-text-divider" />
          )}

          {/* English text */}
          {language !== 'ta' && (
            <p
              className="fsr-verse-text lang-en"
              style={{ fontSize: `${Math.max(16, fontSize - 2)}px` }}
            >
              {verseTextEn}
            </p>
          )}

          {/* Counter */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <span className="fsr-counter">
              {fullscreenVerseIndex + 1} / {total}
            </span>
          </div>
        </div>

        {/* Right nav arrow */}
        <button
          className="fsr-nav-btn next"
          onClick={goNext}
          disabled={fullscreenVerseIndex === total - 1}
          aria-label="Next Verse"
        >
          <ChevronRight size={22} />
        </button>
      </main>

      {/* ── Footer Action Bar ─────────────────────────────────────────── */}
      <footer className="fsr-footer">
        {/* Audio / Speech */}
        <button
          className={`fsr-footer-btn ${isSpeaking ? 'speaking active' : ''}`}
          onClick={handleSpeech}
          title={isSpeaking ? (language === 'ta' ? 'நிறுத்து' : 'Stop') : (language === 'ta' ? 'ஒலி வாசிப்பு' : 'Read Aloud')}
        >
          {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
          <span>{isSpeaking ? (language === 'ta' ? 'நிறுத்து' : 'Stop') : (language === 'ta' ? 'ஒலி' : 'Read')}</span>
        </button>

        {/* Bookmark */}
        <button
          className={`fsr-footer-btn ${isBookmarked ? 'active' : ''}`}
          onClick={() => handleToggleBookmark(verse)}
          title={language === 'ta' ? 'சேமி' : 'Bookmark'}
        >
          <BookmarkIcon size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
          <span>{isBookmarked ? (language === 'ta' ? 'சேமிக்கப்பட்டது' : 'Saved') : (language === 'ta' ? 'சேமி' : 'Save')}</span>
        </button>

        {/* Copy */}
        <button
          className="fsr-footer-btn"
          onClick={handleCopy}
          title={language === 'ta' ? 'நகலெடு' : 'Copy'}
        >
          <Copy size={14} />
          <span>{language === 'ta' ? 'நகல்' : 'Copy'}</span>
        </button>

        {/* Share */}
        <button
          className="fsr-footer-btn"
          onClick={handleShare}
          title={language === 'ta' ? 'பகிர்' : 'Share'}
        >
          <Share2 size={14} />
          <span>{language === 'ta' ? 'பகிர்' : 'Share'}</span>
        </button>

        {/* Create Verse Image Card */}
        <button
          className="fsr-footer-btn"
          onClick={() => openVerseCard(verse, currentBook, currentChapter)}
          title={language === 'ta' ? 'கார்டு உருவாக்க' : 'Create Card'}
        >
          <ImageIcon size={14} />
          <span>{language === 'ta' ? 'கார்டு' : 'Card'}</span>
        </button>
      </footer>
    </div>
  );
};
