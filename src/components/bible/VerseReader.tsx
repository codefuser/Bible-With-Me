import React, { useEffect, useState, useRef } from 'react';
import { Bookmark as BookmarkIcon, Copy, Share2, BookOpen, Highlighter, Check, Trash2, Sparkles, Image as ImageIcon, ChevronLeft, ChevronRight, Expand, MoreVertical } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { useAuth } from '../../context/AuthContext';
import { BibleVerse } from '../../types/bible';
import { fetchChapterVerses } from '../../services/bibleService';
import { isVerseBookmarked } from '../../services/bookmarkService';
import { updateHashRoute } from '../../services/routerService';
import { getVerseHighlightColor, HighlightColor } from '../../services/highlightService';
import { getTodayVerseRef } from '../../services/dailyVerseService';
import { trackActivity } from '../../services/activityService';
import { upsertCloudProgress } from '../../services/userDataService';
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
    highlights,
    setChapter,
    handleToggleBookmark,
    handleSetHighlight: contextHandleSetHighlight,
    openVerseStudy,
    openVerseCard,
    openFullscreenReader,
    recordChapterRead
  } = useReading();

  const { user } = useAuth();
  const userId = user?.id || null;

  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [activeVerseNum, setActiveVerseNum] = useState<number | null>(selectedVerse);
  const [clickedVerseNum, setClickedVerseNum] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showHighlightPicker, setShowHighlightPicker] = useState<boolean>(false);

  const verseRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const quickChapterBarRef = useRef<HTMLDivElement | null>(null);
  const chapterPillRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const handleScrollChapterBar = (direction: 'left' | 'right') => {
    if (quickChapterBarRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      quickChapterBarRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Close verse dropdown/actions when clicking outside
  useEffect(() => {
    if (clickedVerseNum === null) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest('.verse-item') &&
        !target.closest('.verse-parallel-item') &&
        !target.closest('.verse-top-actions') &&
        !target.closest('.verse-dropdown-menu') &&
        !target.closest('.verse-actions-bar') &&
        !target.closest('.verse-parallel-actions')
      ) {
        setClickedVerseNum(null);
        setShowHighlightPicker(false);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [clickedVerseNum]);

  // Smoothly center the active chapter pill in the quick chapter bar
  useEffect(() => {
    if (chapterPillRefs.current[currentChapter]) {
      chapterPillRefs.current[currentChapter]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentChapter, currentBook.id]);

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
          // Record history in local state + Supabase Cloud
          recordChapterRead(currentBook, currentChapter, selectedVerse || 1);
          // Track activity: Chapter read
          if (userId) {
            trackActivity(userId, 'CHAPTER_READ', currentBook.code, currentChapter);
          }
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
  }, [currentBook, currentChapter, selectedVerse, userId, recordChapterRead]);

  // Sync route hash and auto-scroll to selected verse
  useEffect(() => {
    setClickedVerseNum(null);
    setShowHighlightPicker(false);
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

  const handleScrubberSelectVerse = (verseNum: number) => {
    setActiveVerseNum(verseNum);
    updateHashRoute(currentBook.code, currentChapter, verseNum);
    const targetEl = verseRefs.current[verseNum];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // IntersectionObserver to auto-highlight active verse in scrubber as user scrolls
  useEffect(() => {
    if (loading || verses.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const vNum = Number(entry.target.getAttribute('data-verse-num'));
            if (vNum) {
              setActiveVerseNum(vNum);
            }
          }
        });
      },
      { threshold: 0.4 }
    );

    Object.values(verseRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [loading, verses]);

  // Scroll position tracking for reading progress & cloud sync
  useEffect(() => {
    if (!userId || loading) return;

    let timer: any = null;

    const handleScroll = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        const scrollPos = Math.round(window.scrollY);
        if (scrollPos > 50) {
          upsertCloudProgress(userId, currentBook.code, currentChapter, activeVerseNum || 1, scrollPos);
          trackActivity(userId, 'READING_PROGRESS_UPDATED', currentBook.code, currentChapter, activeVerseNum || 1, { scrollPos });
        }
      }, 2500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [userId, currentBook.code, currentChapter, activeVerseNum, loading]);

  const optionsStyle = preferences.verseOptionsStyle || 'dropdown';
  const isDropdownMode = optionsStyle === 'dropdown';
  const isButtonsMode = optionsStyle === 'buttons';

  const getVersePaddingRight = (isBookmarked: boolean, isDropdown: boolean) => {
    if (isDropdown) {
      return isBookmarked ? '2.75rem' : '2.25rem';
    }
    return isBookmarked ? '1.75rem' : '0.5rem';
  };

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

  const handleSetHighlight = async (v: BibleVerse, color: HighlightColor | null) => {
    await contextHandleSetHighlight(currentBook.id, currentChapter, v.verse, color);
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
        data-options-style={optionsStyle}
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
              <span>{bookName}&nbsp;{currentChapter}</span>
            </h1>
          </div>
          <span className="chapter-subhead">
            {verses.length} {language === 'en' ? 'Verses' : 'வசனங்கள்'}
          </span>
        </div>

        {/* Quick Chapter Horizontal Scroll Navigation Bar with Left/Right Arrow Controls */}
        <div className="quick-chapter-bar-container" data-no-swipe="true">
          <button
            className="quick-chapter-scroll-btn left"
            onClick={() => handleScrollChapterBar('left')}
            title={language === 'ta' ? 'இடதுபுறம் நகர்த்து' : 'Scroll Left'}
            aria-label="Scroll Left"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="quick-chapter-bar" ref={quickChapterBarRef} data-no-swipe="true">
            {Array.from({ length: currentBook.total_chapters }, (_, i) => i + 1).map((ch) => {
              const isSelected = ch === currentChapter;
              return (
                <button
                  key={ch}
                  ref={(el) => (chapterPillRefs.current[ch] = el)}
                  className={`quick-chapter-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => setChapter(ch)}
                  title={language === 'ta' ? `${ch}-ஆம் அதிகாரம்` : `Chapter ${ch}`}
                >
                  {ch}
                </button>
              );
            })}
          </div>

          <button
            className="quick-chapter-scroll-btn right"
            onClick={() => handleScrollChapterBar('right')}
            title={language === 'ta' ? 'வலதுபுறம் நகர்த்து' : 'Scroll Right'}
            aria-label="Scroll Right"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Verses Container */}
        {language === 'parallel' ? (
          /* ── Enhanced Dual-Language Parallel View ──────────────────────────── */
          <div className="verse-list parallel-view">
            {/* Parallel view column headers (Desktop only) */}
            <div
              className="verse-parallel-header-row"
              style={{ cursor: 'default', pointerEvents: 'none' }}
              aria-hidden="true"
            >
              <div className="verse-parallel-col lang-ta-col" style={{ paddingTop: '0.375rem', paddingBottom: '0.375rem' }}>
                <span className="verse-parallel-lang-badge ta-badge">🕊 தமிழ் — Tamil</span>
              </div>
              <div className="verse-parallel-col lang-en-col" style={{ paddingTop: '0.375rem', paddingBottom: '0.375rem' }}>
                <span className="verse-parallel-lang-badge en-badge">📖 English — KJV</span>
              </div>
            </div>

            {verses.map((verseObj) => {
              const isBookmarked = isVerseBookmarked(bookmarks, currentBook.id, currentChapter, verseObj.verse);
              const isSelected = clickedVerseNum === verseObj.verse;
              const highlightColor = getVerseHighlightColor(highlights, currentBook.id, currentChapter, verseObj.verse);
              const todayRef = getTodayVerseRef();
              const isTodayDailyVerse =
                todayRef &&
                todayRef.book_id === currentBook.id &&
                todayRef.chapter === currentChapter &&
                todayRef.verse === verseObj.verse;

              return (
                <div
                  key={verseObj.id || verseObj.verse}
                  ref={(el) => (verseRefs.current[verseObj.verse] = el)}
                  data-verse-num={verseObj.verse}
                  className={`verse-parallel-item ${isSelected ? 'selected' : ''} ${highlightColor ? `highlight-${highlightColor}` : ''} ${
                    isTodayDailyVerse ? 'is-today-daily-verse' : ''
                  }`}
                  style={{ '--verse-pad-right': getVersePaddingRight(isBookmarked, isDropdownMode) } as React.CSSProperties}
                  onClick={() => {
                    setClickedVerseNum(isSelected ? null : verseObj.verse);
                    setShowHighlightPicker(false);
                  }}
                >
                  {/* Today's Daily Verse Badge */}
                  {isTodayDailyVerse && (
                    <div
                      className="today-daily-verse-badge"
                      style={{ marginLeft: '0.5rem', marginBottom: '0.25rem' }}
                    >
                      <Sparkles size={11} />
                      <span>இன்றைய எழுப்புதல் வார்த்தை · Today's Revival Word</span>
                    </div>
                  )}

                  {/* Top Right Action Container */}
                  <div className="verse-top-actions">
                    {isBookmarked && (
                      <span className="verse-parallel-bookmark-badge" title="Bookmarked">
                        <BookmarkIcon size={14} fill="currentColor" style={{ color: 'var(--bookmark-active)' }} />
                      </span>
                    )}

                    {/* Render 3-Dots Dropdown Trigger when Dropdown Mode is active */}
                    {isDropdownMode && (
                      <button
                        className={`verse-menu-btn ${isSelected ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setClickedVerseNum(isSelected ? null : verseObj.verse);
                          setShowHighlightPicker(false);
                        }}
                        title="Options / விருப்பங்கள்"
                        aria-label="Verse Options"
                      >
                        <MoreVertical size={18} />
                      </button>
                    )}

                    {/* Top Right Dropdown Menu List (Dropdown Mode) */}
                    {isDropdownMode && isSelected && (
                      <div
                        className="verse-dropdown-menu"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Bookmark */}
                        <button
                          className={`verse-dropdown-item ${isBookmarked ? 'active' : ''}`}
                          onClick={() => {
                            handleToggleBookmark(verseObj);
                            showToast(
                              isBookmarked
                                ? 'Bookmark removed / சேமிப்பு நீக்கப்பட்டது'
                                : 'Verse bookmarked! / வசனம் சேமிக்கப்பட்டது!'
                            );
                          }}
                        >
                          <BookmarkIcon size={15} fill={isBookmarked ? 'currentColor' : 'none'} />
                          <span>{isBookmarked ? 'Bookmarked / சேமிக்கப்பட்டது' : 'Bookmark / சேமி'}</span>
                        </button>

                        {/* Copy */}
                        <button
                          className="verse-dropdown-item"
                          onClick={() => {
                            handleCopyVerse(verseObj);
                            setClickedVerseNum(null);
                          }}
                        >
                          <Copy size={15} />
                          <span>Copy / நகல்</span>
                        </button>

                        {/* Share */}
                        <button
                          className="verse-dropdown-item"
                          onClick={() => {
                            handleShareVerse(verseObj);
                            setClickedVerseNum(null);
                          }}
                        >
                          <Share2 size={15} />
                          <span>Share / பகிர்</span>
                        </button>

                        {/* Verse Card */}
                        <button
                          className="verse-dropdown-item"
                          onClick={() => {
                            openVerseCard(verseObj, currentBook, currentChapter);
                            setClickedVerseNum(null);
                          }}
                        >
                          <ImageIcon size={15} />
                          <span>Verse Card / கார்டு</span>
                        </button>

                        {/* Fullscreen Focus Reader */}
                        <button
                          className="verse-dropdown-item"
                          onClick={() => {
                            openFullscreenReader(verses, verseObj.verse);
                            setClickedVerseNum(null);
                          }}
                        >
                          <Expand size={15} />
                          <span>Focus Reader / மேலும்</span>
                        </button>

                        {/* Highlight */}
                        <button
                          className={`verse-dropdown-item ${highlightColor ? 'active' : ''}`}
                          onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                        >
                          <Highlighter size={15} />
                          <span>Highlight / சிறப்பிக்கு</span>
                        </button>

                        {/* Highlight Color Picker Sub-Panel */}
                        {showHighlightPicker && (
                          <div className="verse-dropdown-highlight-picker">
                            {(['yellow', 'green', 'blue', 'pink', 'orange', 'purple'] as const).map((c) => (
                              <button
                                key={c}
                                className={`highlight-color-btn ${highlightColor === c ? 'active' : ''}`}
                                title={`${c} highlight`}
                                onClick={() => {
                                  handleSetHighlight(verseObj, c);
                                  setClickedVerseNum(null);
                                }}
                                style={{ backgroundColor: c === 'yellow' ? '#eab308' : c === 'green' ? '#22c55e' : c === 'blue' ? '#3b82f6' : c === 'pink' ? '#ec4899' : c === 'orange' ? '#f97316' : '#a855f7' }}
                              >
                                {highlightColor === c && <Check size={12} color="#ffffff" />}
                              </button>
                            ))}
                            {highlightColor && (
                              <button
                                onClick={() => {
                                  handleSetHighlight(verseObj, null);
                                  setClickedVerseNum(null);
                                }}
                                className="clear-highlight-btn"
                              >
                                <Trash2 size={12} /><span>Clear</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Dual-column parallel row */}
                  <div className="verse-parallel-row">
                    {/* Tamil Column */}
                    <div className="verse-parallel-col lang-ta-col">
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                        <span className="verse-parallel-num">{verseObj.verse}</span>
                        <p
                          className="verse-text lang-ta"
                          style={{ margin: 0, flex: 1 }}
                        >
                          {verseObj.text_ta}
                        </p>
                      </div>
                    </div>

                    {/* English Column */}
                    <div className="verse-parallel-col lang-en-col">
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                        <span className="verse-parallel-num">{verseObj.verse}</span>
                        <p
                          className="verse-text lang-en"
                          style={{ margin: 0, flex: 1 }}
                        >
                          {verseObj.text_en}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Buttons Bar (Buttons Mode) */}
                  {isButtonsMode && isSelected && (
                    <div
                      className="verse-parallel-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {/* Bookmark */}
                        <button
                          className={`verse-action-btn ${isBookmarked ? 'active' : ''}`}
                          onClick={() => {
                            handleToggleBookmark(verseObj);
                            showToast(
                              isBookmarked
                                ? 'Bookmark removed / சேமிப்பு நீக்கப்பட்டது'
                                : 'Verse bookmarked! / வசனம் சேமிக்கப்பட்டது!'
                            );
                          }}
                        >
                          <BookmarkIcon size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
                          <span>{isBookmarked ? 'Bookmarked / சேமிக்கப்பட்டது' : 'Bookmark / சேமி'}</span>
                        </button>

                        {/* Copy */}
                        <button className="verse-action-btn" onClick={() => handleCopyVerse(verseObj)}>
                          <Copy size={14} />
                          <span>Copy / நகல்</span>
                        </button>

                        {/* Share */}
                        <button className="verse-action-btn" onClick={() => handleShareVerse(verseObj)}>
                          <Share2 size={14} />
                          <span>Share / பகிர்</span>
                        </button>

                        {/* Verse Card */}
                        <button
                          className="verse-action-btn"
                          onClick={() => openVerseCard(verseObj, currentBook, currentChapter)}
                        >
                          <ImageIcon size={14} />
                          <span>Card / கார்டு</span>
                        </button>

                        {/* Fullscreen Focus Reader */}
                        <button
                          className="verse-action-btn"
                          onClick={() => openFullscreenReader(verses, verseObj.verse)}
                          title="Fullscreen Reading Mode / முழுத்திரை வாசிப்பு"
                        >
                          <Expand size={14} />
                          <span>Focus / மேலும்</span>
                        </button>

                        {/* Highlight */}
                        <button
                          className={`verse-action-btn ${highlightColor ? 'active' : ''}`}
                          onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                        >
                          <Highlighter size={14} />
                          <span>Highlight / சிறப்பிக்கு</span>
                        </button>
                      </div>

                      {/* Highlight Picker inside Bottom Actions Bar */}
                      {showHighlightPicker && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.4375rem 0.75rem',
                            backgroundColor: 'var(--bg-surface)',
                            borderRadius: '0.625rem',
                            border: '1px solid var(--border-color)',
                            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                            marginTop: '0.375rem'
                          }}
                        >
                          {(['yellow', 'green', 'blue', 'pink', 'orange', 'purple'] as const).map((c) => (
                            <button
                              key={c}
                              className={`highlight-color-btn ${highlightColor === c ? 'active' : ''}`}
                              title={`${c} highlight`}
                              onClick={() => handleSetHighlight(verseObj, c)}
                              style={{ backgroundColor: c === 'yellow' ? '#eab308' : c === 'green' ? '#22c55e' : c === 'blue' ? '#3b82f6' : c === 'pink' ? '#ec4899' : c === 'orange' ? '#f97316' : '#a855f7' }}
                            >
                              {highlightColor === c && <Check size={12} color="#ffffff" />}
                            </button>
                          ))}
                          {highlightColor && (
                            <button
                              onClick={() => handleSetHighlight(verseObj, null)}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                fontSize: '0.75rem', color: '#ef4444',
                                backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                                padding: '0.25rem 0.5rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 500
                              }}
                            >
                              <Trash2 size={12} /><span>Clear</span>
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
        ) : (
          /* ── Standard Single-Language Verse List ────────────────────────────── */
          <div className="verse-list">
          {verses.map((verseObj) => {
            const isBookmarked = isVerseBookmarked(bookmarks, currentBook.id, currentChapter, verseObj.verse);
            const isSelected = clickedVerseNum === verseObj.verse;
            const highlightColor = getVerseHighlightColor(highlights, currentBook.id, currentChapter, verseObj.verse);
            const highlightClass = highlightColor ? `highlight-${highlightColor}` : '';

            const todayRef = getTodayVerseRef();
            const isTodayDailyVerse =
              todayRef &&
              todayRef.book_id === currentBook.id &&
              todayRef.chapter === currentChapter &&
              todayRef.verse === verseObj.verse;

            return (
              <div
                key={verseObj.id || verseObj.verse}
                ref={(el) => (verseRefs.current[verseObj.verse] = el)}
                data-verse-num={verseObj.verse}
                className={`verse-item ${isSelected ? 'selected' : ''} ${highlightClass} ${
                  isTodayDailyVerse ? 'is-today-daily-verse' : ''
                }`}
                onClick={() => {
                  setClickedVerseNum(isSelected ? null : verseObj.verse);
                  setShowHighlightPicker(false);
                }}
              >
                {/* Special Devotional Badge for Today's Revival Word */}
                {isTodayDailyVerse && (
                  <div className="today-daily-verse-badge">
                    <Sparkles size={11} />
                    <span>{language === 'en' ? "Today's Revival Word" : 'இன்றைய எழுப்புதல் வார்த்தை'}</span>
                  </div>
                )}

                <div className="verse-content-row" style={{ position: 'relative' }}>
                  <span className="verse-number">{verseObj.verse}</span>

                  <div className="verse-text-container" style={{ flex: 1, paddingRight: getVersePaddingRight(isBookmarked, isDropdownMode) }}>
                    {/* Tamil Verse Text */}
                    {language !== 'en' && (
                      <p className="verse-text lang-ta" style={{ margin: 0 }}>
                        {verseObj.text_ta}
                      </p>
                    )}

                    {/* English Verse Text */}
                    {language !== 'ta' && (
                      <p className="verse-text lang-en" style={{ margin: 0 }}>
                        {verseObj.text_en}
                      </p>
                    )}
                  </div>

                  {/* Top Right Action Container */}
                  <div className="verse-top-actions">
                    {isBookmarked && (
                      <span className="verse-bookmark-badge" title="Bookmarked">
                        <BookmarkIcon size={14} fill="currentColor" style={{ color: 'var(--bookmark-active)' }} />
                      </span>
                    )}

                    {/* Render 3-Dots Dropdown Trigger when Dropdown Mode is active */}
                    {isDropdownMode && (
                      <button
                        className={`verse-menu-btn ${isSelected ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setClickedVerseNum(isSelected ? null : verseObj.verse);
                          setShowHighlightPicker(false);
                        }}
                        title={language === 'en' ? 'Options' : 'விருப்பங்கள்'}
                        aria-label="Verse Options"
                      >
                        <MoreVertical size={18} />
                      </button>
                    )}

                    {/* Top Right Dropdown Menu List (Dropdown Mode) */}
                    {isDropdownMode && isSelected && (
                      <div
                        className="verse-dropdown-menu"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Bookmark */}
                        <button
                          className={`verse-dropdown-item ${isBookmarked ? 'active' : ''}`}
                          onClick={() => {
                            handleToggleBookmark(verseObj);
                            showToast(
                              isBookmarked
                                ? (language === 'en' ? 'Bookmark removed' : 'சேமிப்பு நீக்கப்பட்டது')
                                : (language === 'en' ? 'Verse bookmarked!' : 'வசனம் சேமிக்கப்பட்டது!')
                            );
                          }}
                        >
                          <BookmarkIcon size={15} fill={isBookmarked ? 'currentColor' : 'none'} />
                          <span>{isBookmarked ? (language === 'en' ? 'Bookmarked' : 'சேமிக்கப்பட்டது') : (language === 'en' ? 'Bookmark' : 'சேமி')}</span>
                        </button>

                        {/* Copy */}
                        <button
                          className="verse-dropdown-item"
                          onClick={() => {
                            handleCopyVerse(verseObj);
                            setClickedVerseNum(null);
                          }}
                        >
                          <Copy size={15} />
                          <span>{language === 'en' ? 'Copy' : 'நகலெடு'}</span>
                        </button>

                        {/* Share */}
                        <button
                          className="verse-dropdown-item"
                          onClick={() => {
                            handleShareVerse(verseObj);
                            setClickedVerseNum(null);
                          }}
                        >
                          <Share2 size={15} />
                          <span>{language === 'en' ? 'Share' : 'பகிர்'}</span>
                        </button>

                        {/* Verse Card Creator Action */}
                        <button
                          className="verse-dropdown-item"
                          onClick={() => {
                            openVerseCard(verseObj, currentBook, currentChapter);
                            setClickedVerseNum(null);
                          }}
                          title={language === 'en' ? 'Create Image Card' : 'படம் உருவாக்கு'}
                        >
                          <ImageIcon size={15} />
                          <span>{language === 'en' ? 'Verse Card' : 'வசன அட்டை / கார்டு'}</span>
                        </button>

                        {/* Fullscreen Focus Reader */}
                        <button
                          className="verse-dropdown-item"
                          onClick={() => {
                            openFullscreenReader(verses, verseObj.verse);
                            setClickedVerseNum(null);
                          }}
                          title={language === 'en' ? 'Fullscreen Reading Mode' : 'முழுத்திரை வாசிப்பு'}
                        >
                          <Expand size={15} />
                          <span>{language === 'en' ? 'Focus Mode' : 'முழுத்திரை வாசிப்பு'}</span>
                        </button>

                        {/* Highlight Color Palette Trigger */}
                        <button
                          className={`verse-dropdown-item ${highlightColor ? 'active' : ''}`}
                          onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                        >
                          <Highlighter size={15} />
                          <span>{language === 'en' ? 'Highlight' : 'சிறப்பிக்கு'}</span>
                        </button>

                        {/* Highlight Color Picker Sub-Panel */}
                        {showHighlightPicker && (
                          <div className="verse-dropdown-highlight-picker">
                            {(['yellow', 'green', 'blue', 'pink', 'orange', 'purple'] as const).map((c) => (
                              <button
                                key={c}
                                className={`highlight-color-btn ${highlightColor === c ? 'active' : ''}`}
                                title={`${c} highlight`}
                                onClick={() => {
                                  handleSetHighlight(verseObj, c);
                                  setClickedVerseNum(null);
                                }}
                                style={{ backgroundColor: c === 'yellow' ? '#eab308' : c === 'green' ? '#22c55e' : c === 'blue' ? '#3b82f6' : c === 'pink' ? '#ec4899' : c === 'orange' ? '#f97316' : '#a855f7' }}
                              >
                                {highlightColor === c && <Check size={12} color="#ffffff" />}
                              </button>
                            ))}
                            {highlightColor && (
                              <button
                                onClick={() => {
                                  handleSetHighlight(verseObj, null);
                                  setClickedVerseNum(null);
                                }}
                                className="clear-highlight-btn"
                              >
                                <Trash2 size={12} /><span>Clear</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Buttons Bar (Buttons Mode) */}
                {isButtonsMode && isSelected && (
                  <div
                    className="verse-actions-bar"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
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

                      <button className="verse-action-btn" onClick={() => handleCopyVerse(verseObj)}>
                        <Copy size={14} />
                        <span>{language === 'en' ? 'Copy' : 'நகலெடு'}</span>
                      </button>

                      <button className="verse-action-btn" onClick={() => handleShareVerse(verseObj)}>
                        <Share2 size={14} />
                        <span>{language === 'en' ? 'Share' : 'பகிர்'}</span>
                      </button>

                      <button
                        className="verse-action-btn"
                        onClick={() => openVerseCard(verseObj, currentBook, currentChapter)}
                      >
                        <ImageIcon size={14} />
                        <span>{language === 'en' ? 'Card' : 'கார்டு'}</span>
                      </button>

                      <button
                        className="verse-action-btn"
                        onClick={() => openFullscreenReader(verses, verseObj.verse)}
                      >
                        <Expand size={14} />
                        <span>{language === 'en' ? 'Focus' : 'மேலும்'}</span>
                      </button>

                      <button
                        className={`verse-action-btn ${highlightColor ? 'active' : ''}`}
                        onClick={() => setShowHighlightPicker(!showHighlightPicker)}
                      >
                        <Highlighter size={14} />
                        <span>{language === 'en' ? 'Highlight' : 'சிறப்பிக்கு'}</span>
                      </button>
                    </div>

                    {/* Highlight Color Picker inside Bottom Actions Bar */}
                    {showHighlightPicker && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.4375rem 0.75rem',
                          backgroundColor: 'var(--bg-surface)',
                          borderRadius: '0.625rem',
                          border: '1px solid var(--border-color)',
                          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        {(['yellow', 'green', 'blue', 'pink', 'orange', 'purple'] as const).map((c) => (
                          <button
                            key={c}
                            className={`highlight-color-btn ${highlightColor === c ? 'active' : ''}`}
                            title={`${c} highlight`}
                            onClick={() => handleSetHighlight(verseObj, c)}
                            style={{ backgroundColor: c === 'yellow' ? '#eab308' : c === 'green' ? '#22c55e' : c === 'blue' ? '#3b82f6' : c === 'pink' ? '#ec4899' : c === 'orange' ? '#f97316' : '#a855f7' }}
                          >
                            {highlightColor === c && <Check size={12} color="#ffffff" />}
                          </button>
                        ))}
                        {highlightColor && (
                          <button
                            onClick={() => handleSetHighlight(verseObj, null)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.75rem',
                              color: '#ef4444',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.375rem',
                              cursor: 'pointer',
                              fontWeight: 500
                            }}
                          >
                            <Trash2 size={12} />
                            <span>Remove</span>
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
        )}
      </main>

      <Toast message={toastMessage} />
    </>
  );
};
