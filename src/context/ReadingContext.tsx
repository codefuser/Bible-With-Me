import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  BibleBook,
  BibleVerse,
  Language,
  AppLanguage,
  BibleLanguage,
  ReadingPreferences,
  Bookmark,
  ReadingHistoryItem,
  VerseNote,
  StreakData
} from '../types/bible';
import { fetchBibleBooks, ALL_BIBLE_BOOKS } from '../services/bibleService';
import { getStoredPreferences, savePreferences } from '../services/preferencesService';
import { getStoredBookmarks, toggleBookmark } from '../services/bookmarkService';
import { getStoredHistory, getStoredHistoryList, updateReadingHistory } from '../services/historyService';
import { getStoredNotes, saveNote as saveNoteService } from '../services/noteService';
import { getStoredHighlights, saveHighlight, HighlightColor } from '../services/highlightService';
import { parseRoute, isAdminRoute } from '../services/routerService';
import { loadCloudBookmarksToLocal } from '../services/syncService';
import {
  fetchCloudSettings,
  fetchCloudHighlights,
  fetchCloudNotes,
  fetchCloudHistory,
  fetchAllCloudHistory,
  fetchCloudStreakData
} from '../services/userDataService';
import { getStoredStreakData, recordChapterCompletion, updateDailyGoal } from '../services/streakService';
import { trackActivity } from '../services/activityService';
import { useAuth } from './AuthContext';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

interface VerseCardData {
  verse: BibleVerse;
  book: BibleBook;
  chapter: number;
}

interface ReadingContextType {
  books: BibleBook[];
  currentBook: BibleBook;
  currentChapter: number;
  selectedVerse: number | null;
  targetPulseVerse: number | null;
  setTargetPulseVerse: (verse: number | null) => void;
  language: Language;
  appLanguage: AppLanguage;
  bibleLanguage: BibleLanguage;
  preferences: ReadingPreferences;
  bookmarks: Bookmark[];
  notes: VerseNote[];
  highlights: Record<string, HighlightColor>;
  historyItem: ReadingHistoryItem | null;
  historyList: ReadingHistoryItem[];
  isSearchOpen: boolean;
  isPreferencesOpen: boolean;
  isBookSelectorOpen: boolean;
  isBookmarksOpen: boolean;
  isSideNavOpen: boolean;
  isLanguageModalOpen: boolean;
  isDesktopSidebarCollapsed: boolean;
  setIsDesktopSidebarCollapsed: (collapsed: boolean) => void;
  setIsLanguageModalOpen: (open: boolean) => void;
  toggleDesktopSidebar: () => void;
  isDailyHistoryOpen: boolean;
  isReadingHistoryOpen: boolean;
  activeStudyType: 'none' | 'verse' | 'chapter';
  studyLocation: { bookId: number; chapter: number; verse?: number } | null;
  /** Verse Card Creator modal state */
  isVerseCardOpen: boolean;
  verseCardData: VerseCardData | null;
  openVerseCard: (verse: BibleVerse, book: BibleBook, chapter: number) => void;
  closeVerseCard: () => void;
  /** Fullscreen Focus Reader state */
  isFullscreenReaderOpen: boolean;
  fullscreenVerseList: BibleVerse[];
  fullscreenVerseIndex: number;
  openFullscreenReader: (verses: BibleVerse[], startVerseNum: number) => void;
  closeFullscreenReader: () => void;
  setFullscreenVerseIndex: (idx: number) => void;
  /** Streak & Daily Goal state */
  streakData: StreakData;
  isStreakModalOpen: boolean;
  setIsStreakModalOpen: (open: boolean) => void;
  handleUpdateDailyGoal: (newGoal: number) => void;
  setBookAndChapter: (book: BibleBook, chapter: number, verse?: number, shouldPulse?: boolean) => void;
  setChapter: (chapter: number) => void;
  setLanguage: (lang: Language) => void;
  setAppLanguage: (lang: AppLanguage) => void;
  setBibleLanguage: (lang: BibleLanguage) => void;
  toggleLanguage: () => void;
  updatePreferences: (newPrefs: Partial<ReadingPreferences>) => void;
  resetPreferences: () => void;
  handleToggleBookmark: (verseObj: BibleVerse) => void;
  handleSaveNote: (bookCode: string, chapter: number, verse: number, content: string) => void;
  handleSetHighlight: (bookId: number, chapter: number, verse: number, color: HighlightColor | null) => void;
  setIsSearchOpen: (open: boolean) => void;
  setIsPreferencesOpen: (open: boolean) => void;
  setIsBookSelectorOpen: (open: boolean) => void;
  setIsBookmarksOpen: (open: boolean) => void;
  setIsSideNavOpen: (open: boolean) => void;
  setIsDailyHistoryOpen: (open: boolean) => void;
  setIsReadingHistoryOpen: (open: boolean) => void;
  openVerseStudy: (bookId: number, chapter: number, verse: number) => void;
  openChapterStudy: (bookId: number, chapter: number) => void;
  closeStudy: () => void;
  /** Records a read chapter into reading history (local + cloud sync) */
  recordChapterRead: (book: BibleBook, chapter: number, verse?: number) => void;
  /** True while the Bible CSV datasets are loading for the first time */
  isBibleDataLoading: boolean;
}

const ReadingContext = createContext<ReadingContextType | undefined>(undefined);

export const ReadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, registerCloudDataRefresh } = useAuth();
  const userId = user?.id || null;

  const [books, setBooks] = useState<BibleBook[]>(ALL_BIBLE_BOOKS);
  const [currentBook, setCurrentBook] = useState<BibleBook>(ALL_BIBLE_BOOKS[0]);
  const [currentChapter, setCurrentChapter] = useState<number>(1);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [targetPulseVerse, setTargetPulseVerse] = useState<number | null>(null);

  const [preferences, setPreferencesState] = useState<ReadingPreferences>(getStoredPreferences);
  const [appLanguage, setAppLanguageState] = useState<AppLanguage>(preferences.appLanguage || 'ta');
  const [bibleLanguage, setBibleLanguageState] = useState<BibleLanguage>(preferences.bibleLanguage || (preferences.language as BibleLanguage) || 'ta');
  const [language, setLanguageState] = useState<Language>(preferences.bibleLanguage || preferences.language || 'ta');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(getStoredBookmarks);
  const [notes, setNotes] = useState<VerseNote[]>(getStoredNotes);
  const [highlights, setHighlights] = useState<Record<string, HighlightColor>>(getStoredHighlights);
  const [historyItem, setHistoryItem] = useState<ReadingHistoryItem | null>(getStoredHistory);
  const [historyList, setHistoryList] = useState<ReadingHistoryItem[]>(getStoredHistoryList);

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState<boolean>(false);
  const [isBookSelectorOpen, setIsBookSelectorOpen] = useState<boolean>(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState<boolean>(false);
  const [isSideNavOpen, setIsSideNavOpen] = useState<boolean>(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState<boolean>(
    () => localStorage.getItem('bible_desktop_sidebar_collapsed') === 'true'
  );

  const toggleDesktopSidebar = useCallback(() => {
    setIsDesktopSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('bible_desktop_sidebar_collapsed', String(next));
      return next;
    });
  }, []);
  const [isDailyHistoryOpen, setIsDailyHistoryOpen] = useState<boolean>(false);
  const [isReadingHistoryOpen, setIsReadingHistoryOpen] = useState<boolean>(false);
  const [isBibleDataLoading, setIsBibleDataLoading] = useState<boolean>(true);

  const [activeStudyType, setActiveStudyType] = useState<'none' | 'verse' | 'chapter'>('none');
  const [studyLocation, setStudyLocation] = useState<{ bookId: number; chapter: number; verse?: number } | null>(null);

  // Verse Card Creator state
  const [isVerseCardOpen, setIsVerseCardOpen] = useState<boolean>(false);
  const [verseCardData, setVerseCardData] = useState<VerseCardData | null>(null);

  const openVerseCard = (verse: BibleVerse, book: BibleBook, chapter: number) => {
    setVerseCardData({ verse, book, chapter });
    setIsVerseCardOpen(true);
  };

  const closeVerseCard = () => {
    setIsVerseCardOpen(false);
  };

  // Fullscreen Focus Reader state
  const [isFullscreenReaderOpen, setIsFullscreenReaderOpen] = useState<boolean>(false);
  const [fullscreenVerseList, setFullscreenVerseList] = useState<BibleVerse[]>([]);
  const [fullscreenVerseIndex, setFullscreenVerseIndex] = useState<number>(0);

  // Streak & Daily Goal state
  const [streakData, setStreakData] = useState<StreakData>(getStoredStreakData);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState<boolean>(false);

  const handleUpdateDailyGoal = (newGoal: number) => {
    const updated = updateDailyGoal(newGoal, userId);
    setStreakData(updated);
  };

  const openFullscreenReader = (verses: BibleVerse[], startVerseNum: number) => {
    const idx = verses.findIndex((v) => v.verse === startVerseNum);
    setFullscreenVerseList(verses);
    setFullscreenVerseIndex(idx >= 0 ? idx : 0);
    setIsFullscreenReaderOpen(true);
  };

  const closeFullscreenReader = () => {
    setIsFullscreenReaderOpen(false);
  };

  /**
   * Loads ALL cloud data for an authenticated user directly into React state.
   * This bypasses the localStorage round-trip (the old pattern that caused race conditions).
   * Called by AuthContext immediately after login/session restore.
   */
  const loadAllCloudData = useCallback(async (uid: string): Promise<void> => {
    console.log('[ReadingContext] Loading all cloud data for user:', uid);

    // If offline, ensure state is backed by local storage cache and exit immediately
    if (!navigator.onLine) {
      console.log('[ReadingContext] Offline mode: user data loaded instantly from local storage cache');
      setBookmarks(getStoredBookmarks());
      setHighlights(getStoredHighlights());
      setNotes(getStoredNotes());
      const localHist = getStoredHistory();
      if (localHist) setHistoryItem(localHist);
      setHistoryList(getStoredHistoryList());
      setStreakData(getStoredStreakData());
      return;
    }

    try {
      // 3.5s timeout promise so network degradation never freezes or stalls the UI
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Cloud sync timeout')), 3500)
      );

      // 1. Load Bookmarks from cloud
      const loadBookmarks = loadCloudBookmarksToLocal(uid).then((cloudBookmarks) => {
        if (cloudBookmarks && cloudBookmarks.length > 0) {
          setBookmarks(cloudBookmarks);
        } else {
          const local = getStoredBookmarks();
          if (local.length > 0) setBookmarks(local);
        }
      });

      // 2. Load Settings from cloud
      const loadSettings = fetchCloudSettings(uid).then((cloudPrefs) => {
        if (cloudPrefs) {
          setPreferencesState((prev) => {
            const updated = { ...prev, ...cloudPrefs };
            savePreferences(updated);
            return updated;
          });
          if (cloudPrefs.language) {
            setLanguageState(cloudPrefs.language as Language);
          }
        }
      });

      // 3. Load Highlights from cloud
      const loadHighlights = fetchCloudHighlights(uid).then((cloudHighlights) => {
        if (cloudHighlights !== null && cloudHighlights.length > 0) {
          const newHighlights: Record<string, HighlightColor> = {};
          for (const hl of cloudHighlights) {
            const matchedBook = ALL_BIBLE_BOOKS.find(
              (b) => b.code.toUpperCase() === hl.book.toUpperCase() || String(b.id) === hl.book
            );
            const bookId = matchedBook ? matchedBook.id : parseInt(hl.book, 10) || 1;
            const key = `${bookId}_${hl.chapter}_${hl.verse}`;
            newHighlights[key] = hl.color as HighlightColor;
          }
          setHighlights(newHighlights);
          try {
            localStorage.setItem('bible_app_highlights', JSON.stringify(newHighlights));
          } catch {
            // ignore
          }
        }
      });

      // 4. Load Notes from cloud
      const loadNotes = fetchCloudNotes(uid).then((cloudNotes) => {
        if (cloudNotes !== null && cloudNotes.length > 0) {
          setNotes(cloudNotes);
          try {
            localStorage.setItem('bible_app_user_notes', JSON.stringify(cloudNotes));
          } catch {
            // ignore
          }
        }
      });

      // 5. Load Reading History from cloud
      const loadHistory = fetchCloudHistory(uid).then((cloudHistory) => {
        if (cloudHistory) {
          const matchedBook = ALL_BIBLE_BOOKS.find(
            (b) => b.code.toUpperCase() === cloudHistory.book.toUpperCase() || String(b.id) === cloudHistory.book
          );
          if (matchedBook) {
            const histItem: ReadingHistoryItem = {
              book_id: matchedBook.id,
              chapter: cloudHistory.chapter,
              verse: cloudHistory.verse,
              language: 'ta',
              book_name_en: matchedBook.name_en,
              book_name_ta: matchedBook.name_ta,
              updated_at: cloudHistory.last_read_at || new Date().toISOString()
            };
            setHistoryItem(histItem);
            try {
              localStorage.setItem('bible_app_reading_history', JSON.stringify(histItem));
            } catch {
              // ignore
            }
          }
        }
      });

      // 6. Load full history list from cloud
      const loadHistoryList = fetchAllCloudHistory(uid).then((allCloudHistory) => {
        if (allCloudHistory !== null && allCloudHistory.length > 0) {
          const mappedHistoryList: ReadingHistoryItem[] = allCloudHistory
            .map((ch) => {
              const matchedBook = ALL_BIBLE_BOOKS.find(
                (b) => b.code.toUpperCase() === ch.book.toUpperCase() || String(b.id) === ch.book
              );
              if (!matchedBook) return null;
              return {
                book_id: matchedBook.id,
                chapter: ch.chapter,
                verse: ch.verse,
                language: 'ta' as Language,
                book_name_en: matchedBook.name_en,
                book_name_ta: matchedBook.name_ta,
                updated_at: ch.last_read_at || new Date().toISOString()
              } as ReadingHistoryItem;
            })
            .filter(Boolean) as ReadingHistoryItem[];
          setHistoryList(mappedHistoryList);
          try {
            localStorage.setItem('bible_app_reading_history_list', JSON.stringify(mappedHistoryList));
          } catch {
            // ignore
          }
        }
      });

      // 7. Load cloud streak & habit data
      const loadStreak = fetchCloudStreakData(uid).then((cloudStreak) => {
        if (cloudStreak) {
          setStreakData(cloudStreak);
          try {
            localStorage.setItem('bible_app_streak_data', JSON.stringify(cloudStreak));
          } catch {
            // ignore
          }
        }
      });

      await Promise.race([
        Promise.allSettled([
          loadBookmarks,
          loadSettings,
          loadHighlights,
          loadNotes,
          loadHistory,
          loadHistoryList,
          loadStreak
        ]),
        timeoutPromise
      ]);
    } catch (err) {
      console.warn('[ReadingContext] Cloud data fetch completed or timed out; preserving local cache:', err);
      setBookmarks(getStoredBookmarks());
      setHighlights(getStoredHighlights());
      setNotes(getStoredNotes());
      const localHist = getStoredHistory();
      if (localHist) setHistoryItem(localHist);
      setHistoryList(getStoredHistoryList());
      setStreakData(getStoredStreakData());
    }
  }, []);

  /**
   * Clears all user-specific React state back to empty/defaults for guest mode.
   * Called on logout (userId → null).
   */
  const resetToGuestState = useCallback(() => {
    setBookmarks(getStoredBookmarks());
    setNotes(getStoredNotes());
    setHighlights(getStoredHighlights());
    setHistoryItem(getStoredHistory());
    setHistoryList(getStoredHistoryList());
    setPreferencesState(getStoredPreferences());
    console.log('[ReadingContext] Reset to guest state (localStorage).');
  }, []);

  // Register the loadAllCloudData callback with AuthContext
  // so AuthContext can call it immediately after login/session-restore
  useEffect(() => {
    registerCloudDataRefresh(loadAllCloudData);
  }, [registerCloudDataRefresh, loadAllCloudData]);

  // React to userId changes:
  // - userId set (login/session restore): Automatically load all cloud data directly from Supabase
  // - userId unset (logout): reset state to guest defaults
  useEffect(() => {
    if (!userId) {
      resetToGuestState();
    } else {
      loadAllCloudData(userId);
    }
  }, [userId, resetToGuestState, loadAllCloudData]);

  // Initialize Books, Hash Deep-Links & Saved History on mount (runs once)
  useEffect(() => {
    setIsBibleDataLoading(true);
    fetchBibleBooks()
      .then((data) => {
        if (data && data.length > 0) {
          setBooks(data);

          // 1. Check for Route Deep-Link (e.g. /JOHN/3/16 or /GEN/1)
          const routeState = parseRoute(data);
          if (routeState) {
            const matchedBook = data.find((b) => b.code.toUpperCase() === routeState.bookCode.toUpperCase());
            if (matchedBook) {
              setCurrentBook(matchedBook);
              setCurrentChapter(routeState.chapter);
              if (routeState.verse) {
                setSelectedVerse(routeState.verse);
                setTargetPulseVerse(routeState.verse);
              }
              setIsBibleDataLoading(false);
              return;
            }
          }

          // 2. Fallback to stored history (guest or pre-login)
          const stored = getStoredHistory();
          if (stored) {
            const foundBook = data.find((b) => b.id === stored.book_id);
            if (foundBook) {
              setCurrentBook(foundBook);
              setCurrentChapter(stored.chapter);
              if (stored.verse) setSelectedVerse(stored.verse);
              if (stored.language) setLanguageState(stored.language);
            }
          }
        }
        setIsBibleDataLoading(false);
      })
      .catch(() => setIsBibleDataLoading(false));
  }, []);

  // Listen for browser forward/back buttons and app-route-change to sync reading location
  useEffect(() => {
    const handlePopState = () => {
      if (isAdminRoute()) return;
      if (books && books.length > 0) {
        const routeState = parseRoute(books);
        if (routeState) {
          const matchedBook = books.find((b) => b.code.toUpperCase() === routeState.bookCode.toUpperCase());
          if (matchedBook) {
            setCurrentBook(matchedBook);
            setCurrentChapter(routeState.chapter);
            if (routeState.verse) {
              setSelectedVerse(routeState.verse);
              setTargetPulseVerse(routeState.verse);
            }
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('app-route-change', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('app-route-change', handlePopState);
    };
  }, [books]);

  // Listen for Capacitor Native Deep Links (cold launch & warm appUrlOpen)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleDeepLinkUrl = (urlString: string) => {
      console.log('[DeepLink] Processing Capacitor deep link URL:', urlString);
      if (urlString && books && books.length > 0) {
        const routeState = parseRoute(books, urlString);
        if (routeState) {
          const matchedBook = books.find((b) => b.code.toUpperCase() === routeState.bookCode.toUpperCase());
          if (matchedBook) {
            setCurrentBook(matchedBook);
            setCurrentChapter(routeState.chapter);
            if (routeState.verse) {
              setSelectedVerse(routeState.verse);
            }
          }
        }
      }
    };

    // 1. Check if app was cold-launched via deep link
    CapApp.getLaunchUrl().then((launchData) => {
      if (launchData && launchData.url) {
        handleDeepLinkUrl(launchData.url);
      }
    });

    // 2. Listen for deep links while app is running/backgrounded
    let subHandle: any = null;
    CapApp.addListener('appUrlOpen', (event) => {
      if (event && event.url) {
        handleDeepLinkUrl(event.url);
      }
    }).then((sub) => {
      subHandle = sub;
    });

    return () => {
      if (subHandle && typeof subHandle.remove === 'function') {
        subHandle.remove();
      }
    };
  }, [books]);

  // Update HTML data-theme attribute, custom colors, and font variables whenever preferences change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', preferences.theme);

    if (preferences.theme === 'custom' && preferences.customThemeColors) {
      const c = preferences.customThemeColors;
      document.documentElement.style.setProperty('--bg-primary', c.bgPrimary);
      document.documentElement.style.setProperty('--bg-secondary', c.bgSecondary);
      document.documentElement.style.setProperty('--bg-surface', c.bgSurface);
      document.documentElement.style.setProperty('--text-primary', c.textPrimary);
      document.documentElement.style.setProperty('--text-secondary', c.textSecondary);
      document.documentElement.style.setProperty('--accent-color', c.accentColor);
      document.documentElement.style.setProperty('--border-color', c.bgSecondary);
    } else {
      document.documentElement.style.removeProperty('--bg-primary');
      document.documentElement.style.removeProperty('--bg-secondary');
      document.documentElement.style.removeProperty('--bg-surface');
      document.documentElement.style.removeProperty('--text-primary');
      document.documentElement.style.removeProperty('--text-secondary');
      document.documentElement.style.removeProperty('--accent-color');
      document.documentElement.style.removeProperty('--border-color');
    }

    const fontTaVar = `var(--font-ta-${preferences.fontFamilyTa || 'noto'})`;
    const fontEnVar = `var(--font-en-${preferences.fontFamilyEn || 'lora'})`;
    document.documentElement.style.setProperty('--font-tamil', fontTaVar);
    document.documentElement.style.setProperty('--font-serif', fontEnVar);

    if (preferences.customFontSizePx) {
      document.documentElement.style.setProperty('--custom-font-size', `${preferences.customFontSizePx}px`);
    } else {
      document.documentElement.style.removeProperty('--custom-font-size');
    }

    if (preferences.customLineHeightVal) {
      document.documentElement.style.setProperty('--custom-line-height', `${preferences.customLineHeightVal}`);
    } else {
      document.documentElement.style.removeProperty('--custom-line-height');
    }

    if (preferences.customMaxWidthPx) {
      document.documentElement.style.setProperty('--custom-max-width', `${preferences.customMaxWidthPx}px`);
    } else {
      document.documentElement.style.removeProperty('--custom-max-width');
    }
  }, [preferences.theme, preferences.fontFamilyTa, preferences.fontFamilyEn, preferences.customThemeColors, preferences.customFontSizePx, preferences.customLineHeightVal, preferences.customMaxWidthPx]);

  const recordChapterRead = useCallback(
    (book: BibleBook, chapter: number, verse: number = 1) => {
      updateReadingHistory(book, chapter, verse, language, userId).then((item) => {
        setHistoryItem(item);
        setHistoryList((prev) => {
          const filtered = prev.filter(
            (h) => !(h.book_id === item.book_id && h.chapter === item.chapter)
          );
          return [item, ...filtered];
        });
      });

        // Record chapter completion for Streak & Daily Goal tracker
        const updatedStreak = recordChapterCompletion(userId);
        setStreakData(updatedStreak);
    },
    [language, userId]
  );

  const setBookAndChapter = (book: BibleBook, chapter: number, verse: number = 1, shouldPulse: boolean = false) => {
    setCurrentBook(book);
    setCurrentChapter(chapter);
    setSelectedVerse(verse);
    if (shouldPulse && verse) {
      setTargetPulseVerse(verse);
    } else {
      setTargetPulseVerse(null);
    }
    setIsBookSelectorOpen(false);

    recordChapterRead(book, chapter, verse);
  };

  const setChapter = (chapter: number) => {
    if (chapter >= 1 && chapter <= currentBook.total_chapters) {
      setBookAndChapter(currentBook, chapter, 1, false);
    }
  };

  const setAppLanguage = (lang: AppLanguage) => {
    setAppLanguageState(lang);
    updatePreferences({ appLanguage: lang });
  };

  const setBibleLanguage = (lang: BibleLanguage) => {
    setBibleLanguageState(lang);
    setLanguageState(lang as Language);
    updatePreferences({ bibleLanguage: lang, language: lang as Language });
    updateReadingHistory(currentBook, currentChapter, selectedVerse || 1, lang as Language, userId);
    if (userId) {
      trackActivity(userId, 'LANGUAGE_CHANGED', currentBook.code, currentChapter, selectedVerse || 1, { language: lang });
    }
  };

  const setLanguage = (lang: Language) => {
    setBibleLanguage(lang as BibleLanguage);
  };

  const toggleLanguage = () => {
    const nextLang: BibleLanguage = bibleLanguage === 'ta' ? 'en' : bibleLanguage === 'en' ? 'parallel' : 'ta';
    setBibleLanguage(nextLang);
  };

  const updatePreferences = (newPrefs: Partial<ReadingPreferences>) => {
    setPreferencesState((prev) => {
      const updated = { ...prev, ...newPrefs };
      savePreferences(updated, userId);
      return updated;
    });
    if (newPrefs.appLanguage) {
      setAppLanguageState(newPrefs.appLanguage);
    }
    if (newPrefs.bibleLanguage) {
      setBibleLanguageState(newPrefs.bibleLanguage);
      setLanguageState(newPrefs.bibleLanguage as Language);
    } else if (newPrefs.language) {
      setBibleLanguageState(newPrefs.language as BibleLanguage);
      setLanguageState(newPrefs.language);
    }
    if (userId) {
      trackActivity(userId, 'SETTINGS_CHANGED', currentBook.code, currentChapter, selectedVerse || 1, newPrefs);
    }
  };

  const resetPreferences = useCallback(() => {
    const defaultPrefs: ReadingPreferences = {
      fontSize: 'md',
      lineHeight: 'normal',
      maxWidth: 'standard',
      theme: 'light',
      language: language,
      fontFamilyTa: 'noto',
      fontFamilyEn: 'lora',
      verseOptionsStyle: 'dropdown',
      customFontSizePx: undefined,
      customLineHeightVal: undefined,
      customMaxWidthPx: undefined,
      customThemeColors: undefined
    };
    setPreferencesState(defaultPrefs);
    savePreferences(defaultPrefs, userId);
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.style.removeProperty('--custom-font-size');
    document.documentElement.style.removeProperty('--custom-line-height');
    document.documentElement.style.removeProperty('--custom-max-width');
    document.documentElement.style.removeProperty('--bg-primary');
    document.documentElement.style.removeProperty('--bg-secondary');
    document.documentElement.style.removeProperty('--bg-surface');
    document.documentElement.style.removeProperty('--text-primary');
    document.documentElement.style.removeProperty('--text-secondary');
    document.documentElement.style.removeProperty('--accent-color');
    document.documentElement.style.removeProperty('--border-color');
  }, [language, userId]);

  const handleToggleBookmark = (verseObj: BibleVerse) => {
    const isExisting = bookmarks.some(
      (b) => b.book_id === currentBook.id && b.chapter === verseObj.chapter && b.verse === verseObj.verse
    );
    toggleBookmark(bookmarks, currentBook, verseObj, language, userId).then((updated) => {
      setBookmarks(updated);
      if (userId) {
        trackActivity(
          userId,
          isExisting ? 'BOOKMARK_REMOVED' : 'BOOKMARK_ADDED',
          currentBook.code,
          verseObj.chapter,
          verseObj.verse
        );
      }
    });
  };

  const handleSaveNote = async (bookCode: string, chapter: number, verse: number, content: string) => {
    const existingNote = notes.find(
      (n) => n.book.toUpperCase() === bookCode.toUpperCase() && n.chapter === chapter && n.verse === verse
    );
    const updated = await saveNoteService(bookCode, chapter, verse, content, userId);
    setNotes(updated);
    if (userId) {
      let actType: 'NOTE_CREATED' | 'NOTE_UPDATED' | 'NOTE_DELETED' = 'NOTE_CREATED';
      if (!content.trim()) actType = 'NOTE_DELETED';
      else if (existingNote) actType = 'NOTE_UPDATED';
      trackActivity(userId, actType, bookCode, chapter, verse);
    }
  };

  const handleSetHighlight = async (bookId: number, chapter: number, verse: number, color: HighlightColor | null) => {
    const updated = await saveHighlight(bookId, chapter, verse, color, userId);
    setHighlights(updated);
    if (userId) {
      trackActivity(
        userId,
        color ? 'HIGHLIGHT_ADDED' : 'HIGHLIGHT_REMOVED',
        ALL_BIBLE_BOOKS.find((b) => b.id === bookId)?.code || String(bookId),
        chapter,
        verse
      );
    }
  };

  const openVerseStudy = (bookId: number, chapter: number, verse: number) => {
    const matchedBook = books.find((b) => b.id === bookId);
    setStudyLocation({ bookId, chapter, verse });
    setActiveStudyType('verse');
    if (userId && matchedBook) {
      trackActivity(userId, 'VERSE_EXPLORATION_OPENED', matchedBook.code, chapter, verse);
    }
  };

  const openChapterStudy = (bookId: number, chapter: number) => {
    const matchedBook = books.find((b) => b.id === bookId);
    setStudyLocation({ bookId, chapter });
    setActiveStudyType('chapter');
    if (userId && matchedBook) {
      trackActivity(userId, 'CHAPTER_EXPLORATION_OPENED', matchedBook.code, chapter);
    }
  };

  const closeStudy = () => {
    setActiveStudyType('none');
    setStudyLocation(null);
  };

  return (
    <ReadingContext.Provider
      value={{
        books,
        currentBook,
        currentChapter,
        selectedVerse,
        targetPulseVerse,
        setTargetPulseVerse,
        language,
        preferences,
        bookmarks,
        notes,
        highlights,
        historyItem,
        historyList,
        isSearchOpen,
        isPreferencesOpen,
        isBookSelectorOpen,
        isBookmarksOpen,
        isSideNavOpen,
        isDailyHistoryOpen,
        isReadingHistoryOpen,
        activeStudyType,
        studyLocation,
        isVerseCardOpen,
        verseCardData,
        openVerseCard,
        closeVerseCard,
        isFullscreenReaderOpen,
        fullscreenVerseList,
        fullscreenVerseIndex,
        openFullscreenReader,
        closeFullscreenReader,
        setFullscreenVerseIndex,
        streakData,
        isStreakModalOpen,
        setIsStreakModalOpen,
        handleUpdateDailyGoal,
        setBookAndChapter,
        setChapter,
        setLanguage,
        setAppLanguage,
        setBibleLanguage,
        toggleLanguage,
        appLanguage,
        bibleLanguage,
        updatePreferences,
        resetPreferences,
        handleToggleBookmark,
        handleSaveNote,
        handleSetHighlight,
        setIsSearchOpen,
        setIsPreferencesOpen,
        setIsBookSelectorOpen,
        setIsBookmarksOpen,
        setIsSideNavOpen,
        isLanguageModalOpen,
        setIsLanguageModalOpen,
        isDesktopSidebarCollapsed,
        setIsDesktopSidebarCollapsed,
        toggleDesktopSidebar,
        setIsDailyHistoryOpen,
        setIsReadingHistoryOpen,
        openVerseStudy,
        openChapterStudy,
        closeStudy,
        recordChapterRead,
        isBibleDataLoading
      }}
    >
      {children}
    </ReadingContext.Provider>
  );
};

export const useReading = (): ReadingContextType => {
  const context = useContext(ReadingContext);
  if (!context) {
    throw new Error('useReading must be used within a ReadingProvider');
  }
  return context;
};

