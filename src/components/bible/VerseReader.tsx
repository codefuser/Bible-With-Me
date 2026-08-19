import React, { useEffect, useState, useRef } from 'react';
import { Bookmark as BookmarkIcon, Copy, Share2, Check } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { BibleVerse } from '../../types/bible';
import { fetchChapterVerses } from '../../services/bibleService';
import { isVerseBookmarked } from '../../services/bookmarkService';
import { updateHashRoute } from '../../services/routerService';
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
    handleToggleBookmark
  } = useReading();

  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [activeVerseNum, setActiveVerseNum] = useState<number | null>(selectedVerse);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const bookName = language === 'ta' ? currentBook.name_ta : currentBook.name_en;

  const handleCopyVerse = (v: BibleVerse) => {
    const text = language === 'ta' ? v.text_ta : v.text_en;
    const formatted = `${bookName} ${currentChapter}:${v.verse}\n"${text}"`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(formatted);
      showToast(language === 'ta' ? 'வசனம் நகலெடுக்கப்பட்டது!' : 'Verse copied to clipboard!');
    }
  };

  const handleShareVerse = (v: BibleVerse) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#${currentBook.code}/${currentChapter}/${v.verse}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      showToast(language === 'ta' ? 'இணைப்பு நகலெடுக்கப்பட்டது!' : 'Link copied to clipboard!');
    }
  };

  if (loading) {
    return <LoadingState message={language === 'ta' ? 'வேதாகம வசனங்கள் ஏற்றப்படுகின்றன...' : 'Loading Scripture verses...'} />;
  }

  if (error) {
    return (
      <ErrorState
        title={language === 'ta' ? 'வசனங்களை ஏற்றுவதில் பிழை' : 'Error Loading Verses'}
        message={language === 'ta' ? 'தரவுத்தளத்திலிருந்து வசனங்களை எடுக்க முடியவில்லை.' : 'Could not fetch verses.'}
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
      >
        {/* Chapter Title Header */}
        <div className="chapter-header">
          <div>
            <h1 className={`chapter-title ${language === 'ta' ? 'lang-ta' : ''}`}>
              {bookName} {currentChapter}
            </h1>
          </div>
          <span className="chapter-subhead">
            {verses.length} {language === 'ta' ? 'வசனங்கள்' : 'Verses'}
          </span>
        </div>

        {/* Verses Container */}
        <div className="verse-list">
          {verses.map((verseObj) => {
            const text = language === 'ta' ? verseObj.text_ta : verseObj.text_en;
            const isBookmarked = isVerseBookmarked(bookmarks, currentBook.id, currentChapter, verseObj.verse);
            const isSelected = activeVerseNum === verseObj.verse;

            return (
              <div
                key={verseObj.id || verseObj.verse}
                ref={(el) => (verseRefs.current[verseObj.verse] = el)}
                className={`verse-item ${isSelected ? 'selected' : ''} ${isBookmarked ? 'bookmarked' : ''}`}
                onClick={() => setActiveVerseNum(isSelected ? null : verseObj.verse)}
              >
                <span className="verse-number">{verseObj.verse}</span>
                <p className={`verse-text ${language === 'ta' ? 'lang-ta' : 'lang-en'}`}>
                  {text}
                </p>

                {/* Contextual Action Toolbar */}
                <div className={`verse-actions ${isSelected ? 'visible' : ''}`}>
                  <button
                    className={`btn-bookmark ${isBookmarked ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleBookmark(verseObj);
                    }}
                    title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Verse'}
                  >
                    <BookmarkIcon size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
                  </button>

                  <button
                    className="btn-bookmark"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyVerse(verseObj);
                    }}
                    title="Copy Verse Text"
                  >
                    <Copy size={16} />
                  </button>

                  <button
                    className="btn-bookmark"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareVerse(verseObj);
                    }}
                    title="Share Verse Deep-Link"
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Toast message={toastMessage} />
    </>
  );
};
