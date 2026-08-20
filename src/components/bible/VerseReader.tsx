import React, { useEffect, useState, useRef } from 'react';
import { Bookmark as BookmarkIcon, Copy, Share2, BookOpen, Highlighter } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { BibleVerse } from '../../types/bible';
import { fetchChapterVerses } from '../../services/bibleService';
import { isVerseBookmarked } from '../../services/bookmarkService';
import { updateHashRoute } from '../../services/routerService';
import { getStoredHighlights, saveHighlight, getVerseHighlightColor, HighlightColor } from '../../services/highlightService';
import { LoadingState } from '../common/LoadingState';
import { ErrorState } from '../common/ErrorState';
import { Toast } from '../common/Toast';

export const VerseReader: React.FC = () => {
  const {
    currentBook,
    currentChapter,
    selectedVerse,
    language,
    preferences,
    bookmarks,
    handleToggleBookmark,
    openVerseStudy
  } = useReading();

  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [activeVerseNum, setActiveVerseNum] = useState<number | null>(selectedVerse);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<Record<string, HighlightColor>>(getStoredHighlights);
  const [showHighlightPicker, setShowHighlightPicker] = useState<boolean>(false);

  const verseRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);

    fetchChapterVerses(currentBook.id, currentChapter)
      .then((data) => {
        if (isMounted) {
          setVerses(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed fetching chapter verses:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentBook.id, currentChapter]);

  // Sync route hash and auto-scroll to selected verse
  useEffect(() => {
    if (selectedVerse) {
      setActiveVerseNum(selectedVerse);
      updateHashRoute(currentBook.code, currentChapter, selectedVerse);
      setTimeout(() => {
        verseRefs.current[selectedVerse]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    } else {
      updateHashRoute(currentBook.code, currentChapter);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentBook.id, currentBook.code, currentChapter, selectedVerse, loading]);

  const bookName = language === 'en' ? currentBook.name_en : currentBook.name_ta;

  const handleCopyVerse = (v: BibleVerse) => {
    let formatted = '';
    if (language === 'ta') {
      formatted = `${bookName} ${currentChapter}:${v.verse}\n\n"${v.text_ta}"`;
    } else if (language === 'en') {
      formatted = `${bookName} ${currentChapter}:${v.verse}\n\n"${v.text_en}"`;
    } else {
      formatted = `${bookName} ${currentChapter}:${v.verse}\n\n"${v.text_ta}"\n\n"${v.text_en}"`;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(formatted);
      showToast(language === 'en' ? 'Verse copied to clipboard!' : 'வசனம் நகலெடுக்கப்பட்டது!');
    }
  };

  const handleShareVerse = async (v: BibleVerse) => {
    const text = language === 'en' ? v.text_en : language === 'ta' ? v.text_ta : `${v.text_ta}\n${v.text_en}`;
    const formattedTitle = `${bookName} ${currentChapter}:${v.verse}`;
    const shareUrl = `${window.location.origin}${window.location.pathname}#${currentBook.code}/${currentChapter}/${v.verse}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: formattedTitle,
          text: `"${text}" - ${formattedTitle}`,
          url: shareUrl
        });
        return;
      } catch (err) {
        // Dismissed share
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${formattedTitle}\n"${text}"\n${shareUrl}`);
      showToast(language === 'en' ? 'Verse link copied to clipboard!' : 'வசன இணைப்பு நகலெடுக்கப்பட்டது!');
    }
  };

  const handleSetHighlight = (v: BibleVerse, color: HighlightColor | null) => {
    const updated = saveHighlight(currentBook.id, currentChapter, v.verse, color);
    setHighlights(updated);
    setShowHighlightPicker(false);
    if (color) {
      showToast(language === 'en' ? 'Verse highlighted!' : 'வசனம் சிறப்பிக்கப்பட்டது!');
    } else {
      showToast(language === 'en' ? 'Highlight removed' : 'சிறப்பிலக்கணம் நீக்கப்பட்டது');
    }
  };

  if (loading) {
    return <LoadingState message={language === 'en' ? 'Loading Scripture verses...' : 'வேதாகம வசனங்கள் ஏற்றப்படுகின்றன...'} />;
  }

  if (error) {
    return (
      <ErrorState
        title={language === 'en' ? 'Error Loading Verses' : 'வசனங்களை ஏற்றுவதில் பிழை'}
        message={language === 'en' ? 'Could not fetch verses.' : 'தரவுத்தளத்திலிருந்து வசனங்களை எடுக்க முடியவில்லை.'}
        onRetry={() => {
          setLoading(true);
          fetchChapterVerses(currentBook.id, currentChapter).then(setVerses);
        }}
      />
    );
  }

  return (
    <>
      <main
        className="reader-wrapper"
        data-width={preferences.maxWidth}
        data-size={preferences.fontSize}
        data-line={preferences.lineHeight}
        data-font-ta={preferences.fontFamilyTa || 'noto'}
        data-font-en={preferences.fontFamilyEn || 'lora'}
      >
        {/* Chapter Title Header */}
        <div className="chapter-header">
          <div>
            <h1 className={`chapter-title ${language === 'ta' ? 'lang-ta' : ''}`}>
              {bookName} {currentChapter}
            </h1>
          </div>
          <span className="chapter-subhead">
            {verses.length} {language === 'en' ? 'Verses' : 'வசனங்கள்'}
          </span>
        </div>

        {/* Verses Container */}
        <div className="verse-list">
          {verses.map((verseObj) => {
            const isBookmarked = isVerseBookmarked(bookmarks, currentBook.id, currentChapter, verseObj.verse);
            const isSelected = activeVerseNum === verseObj.verse;
            const highlightColor = getVerseHighlightColor(highlights, currentBook.id, currentChapter, verseObj.verse);

            const highlightClass = highlightColor ? `highlight-${highlightColor}` : '';

            return (
              <div
                key={verseObj.id || verseObj.verse}
                ref={(el) => (verseRefs.current[verseObj.verse] = el)}
                className={`verse-item ${isSelected ? 'selected' : ''} ${highlightClass}`}
                onClick={() => {
                  setActiveVerseNum(isSelected ? null : verseObj.verse);
                  setShowHighlightPicker(false);
                }}
              >
                <div className="verse-content-row">
                  <span className="verse-number">{verseObj.verse}</span>

                  <div className="verse-text-container" style={{ flex: 1 }}>
                    {/* Tamil Verse Text */}
                    {language !== 'en' && (
                      <p className="verse-text lang-ta" style={{ marginBottom: language === 'parallel' ? '0.375rem' : 0 }}>
                        {verseObj.text_ta}
                      </p>
                    )}

                    {/* English Verse Text */}
                    {language !== 'ta' && (
                      <p className="verse-text lang-en" style={{ opacity: language === 'parallel' ? 0.85 : 1, fontSize: language === 'parallel' ? '0.9375em' : undefined }}>
                        {verseObj.text_en}
                      </p>
                    )}
                  </div>

                  {isBookmarked && !isSelected && (
                    <span className="verse-bookmark-badge" title="Bookmarked">
                      <BookmarkIcon size={13} fill="currentColor" style={{ color: 'var(--bookmark-active)' }} />
                    </span>
                  )}
                </div>

                {/* Contextual Action Toolbar Row */}
                {isSelected && (
                  <div
                    className="verse-actions-bar"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      marginTop: '0.625rem',
                      paddingLeft: '2.125rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                      {/* Bookmark Toggle Action */}
                      <button
                        className={`verse-action-btn ${isBookmarked ? 'active' : ''}`}
                        onClick={() => {
                          handleToggleBookmark(verseObj);
                          showToast(
                            isBookmarked
                              ? (language === 'en' ? 'Bookmark removed' : 'சேமிப்பு நீக்கப்பட்டது')
                              : (language === 'en' ? 'Verse bookmarked!' : 'வசனம் சேமிக்கப்பட்டது!')
                          );
                        }}
                      >
                        <BookmarkIcon size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
                        <span>{isBookmarked ? (language === 'en' ? 'Bookmarked' : 'சேமிக்கப்பட்டது') : (language === 'en' ? 'Bookmark' : 'சேமி')}</span>
                      </button>

                      {/* Copy Action */}
                      <button className="verse-action-btn" onClick={() => handleCopyVerse(verseObj)}>
                        <Copy size={14} />
                        <span>{language === 'en' ? 'Copy' : 'நகலெடு'}</span>
                      </button>

                      {/* Share Action */}
                      <button className="verse-action-btn" onClick={() => handleShareVerse(verseObj)}>
                        <Share2 size={14} />
                        <span>{language === 'en' ? 'Share' : 'பகிர்'}</span>
                      </button>

                      {/* Verse Study Action */}
                      <button
                        className="verse-action-btn"
                        onClick={() => openVerseStudy(currentBook.id, currentChapter, verseObj.verse)}
                      >
                        <BookOpen size={14} />
                        <span>{language === 'en' ? 'Study' : 'ஆராய்க'}</span>
                      </button>

                      {/* Highlight Color Palette Trigger */}
                      <button
                        className={`verse-action-btn ${highlightColor ? 'active' : ''}`}
                        onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                      >
                        <Highlighter size={14} />
                        <span>{language === 'en' ? 'Highlight' : 'சிறப்பிக்கு'}</span>
                      </button>
                    </div>

                    {/* Highlight Color Picker Popover */}
                    {showHighlightPicker && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.375rem 0.625rem',
                          backgroundColor: 'var(--bg-surface)',
                          borderRadius: '0.5rem',
                          border: '1px solid var(--border-color)',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <button
                          className="highlight-color-btn"
                          title="Yellow Highlight"
                          onClick={() => handleSetHighlight(verseObj, 'yellow')}
                          style={{ backgroundColor: '#eab308' }}
                        />
                        <button
                          className="highlight-color-btn"
                          title="Green Highlight"
                          onClick={() => handleSetHighlight(verseObj, 'green')}
                          style={{ backgroundColor: '#22c55e' }}
                        />
                        <button
                          className="highlight-color-btn"
                          title="Blue Highlight"
                          onClick={() => handleSetHighlight(verseObj, 'blue')}
                          style={{ backgroundColor: '#3b82f6' }}
                        />
                        <button
                          className="highlight-color-btn"
                          title="Pink Highlight"
                          onClick={() => handleSetHighlight(verseObj, 'pink')}
                          style={{ backgroundColor: '#ec4899' }}
                        />
                        <button
                          className="highlight-color-btn"
                          title="Orange Highlight"
                          onClick={() => handleSetHighlight(verseObj, 'orange')}
                          style={{ backgroundColor: '#f97316' }}
                        />
                        {highlightColor && (
                          <button
                            onClick={() => handleSetHighlight(verseObj, null)}
                            style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}
                          >
                            {language === 'en' ? 'Clear' : 'நீக்குக'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <Toast message={toastMessage} />
    </>
  );
};
