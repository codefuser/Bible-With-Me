import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  BibleBook,
  BibleVerse,
  Language,
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
import { parseHashRoute } from '../services/routerService';
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
  language: Language;
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
  setBookAndChapter: (book: BibleBook, chapter: number, verse?: number) => void;
  setChapter: (chapter: number) => void;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  updatePreferences: (newPrefs: Partial<ReadingPreferences>) => void;
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

  const [preferences, setPreferencesState] = useState<ReadingPreferences>(getStoredPreferences);
  const [language, setLanguageState] = useState<Language>(preferences.language || 'en');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [notes, setNotes] = useState<VerseNote[]>([]);
  const [highlights, setHighlights] = useState<Record<string, HighlightColor>>({});
  const [historyItem, setHistoryItem] = useState<ReadingHistoryItem | null>(null);
  const [historyList, setHistoryList] = useState<ReadingHistoryItem[]>([]);

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

    // 1. Load Bookmarks from cloud directly into state
    const cloudBookmarks = await loadCloudBookmarksToLocal(uid);
    setBookmarks(cloudBookmarks);
    console.log(`[ReadingContext] Set ${cloudBookmarks.length} bookmarks from cloud.`);

    // 2. Load Settings from cloud
    const cloudPrefs = await fetchCloudSettings(uid);
    if (cloudPrefs) {
      setPreferencesState((prev) => {
        const updated = { ...prev, ...cloudPrefs };
        // Keep localStorage cache in sync
        savePreferences(updated);
        return updated;
      });
      if (cloudPrefs.language) {
        setLanguageState(cloudPrefs.language as Language);
      }
      console.log('[ReadingContext] Applied cloud settings.');
    }

    // 3. Load Highlights from cloud directly into state
    const cloudHighlights = await fetchCloudHighlights(uid);
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
    console.log(`[ReadingContext] Set ${Object.keys(newHighlights).length} highlights from cloud.`);

    // 4. Load Notes from cloud directly into state
    const cloudNotes = await fetchCloudNotes(uid);
    setNotes(cloudNotes);
    console.log(`[ReadingContext] Set ${cloudNotes.length} notes from cloud.`);

    // 5. Load Reading History from cloud (latest item for "continue reading" banner)
    const cloudHistory = await fetchCloudHistory(uid);
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
        console.log('[ReadingContext] Set reading history from cloud:', matchedBook.name_en, cloudHistory.chapter);
      }
    }

    // 6. Load full history list from cloud
    const allCloudHistory = await fetchAllCloudHistory(uid);
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
    console.log(`[ReadingContext] Set ${mappedHistoryList.length} history items from cloud.`);

    // 7. Load cloud streak & habit data
    const cloudStreak = await fetchCloudStreakData(uid);
    if (cloudStreak) {
      setStreakData(cloudStreak);
      localStorage.setItem('bible_app_streak_data', JSON.stringify(cloudStreak));
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

          // 1. Check for Hash Route Deep-Link (e.g. #JOHN/3/16)
          const routeState = parseHashRoute(data);
          if (routeState) {
            const matchedBook = data.find((b) => b.code.toUpperCase() === routeState.bookCode.toUpperCase());
            if (matchedBook) {
              setCurrentBook(matchedBook);
              setCurrentChapter(routeState.chapter);
              if (routeState.verse) setSelectedVerse(routeState.verse);
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

  // Update HTML data-theme attribute and font variables whenever preferences change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', preferences.theme);
    const fontTaVar = `var(--font-ta-${preferences.fontFamilyTa || 'noto'})`;
    const fontEnVar = `var(--font-en-${preferences.fontFamilyEn || 'lora'})`;
    document.documentElement.style.setProperty('--font-tamil', fontTaVar);
    document.documentElement.style.setProperty('--font-serif', fontEnVar);
  }, [preferences.theme, preferences.fontFamilyTa, preferences.fontFamilyEn]);

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

  const setBookAndChapter = (book: BibleBook, chapter: number, verse: number = 1) => {
    setCurrentBook(book);
    setCurrentChapter(chapter);
    setSelectedVerse(verse);
    setIsBookSelectorOpen(false);

    recordChapterRead(book, chapter, verse);
  };

  const setChapter = (chapter: number) => {
    if (chapter >= 1 && chapter <= currentBook.total_chapters) {
      setBookAndChapter(currentBook, chapter, 1);
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    updatePreferences({ language: lang });
    updateReadingHistory(currentBook, currentChapter, selectedVerse || 1, lang, userId);
    if (userId) {
      trackActivity(userId, 'LANGUAGE_CHANGED', currentBook.code, currentChapter, selectedVerse || 1, { language: lang });
    }
  };

  const toggleLanguage = () => {
    const nextLang: Language = language === 'ta' ? 'en' : language === 'en' ? 'parallel' : 'ta';
    setLanguage(nextLang);
  };

  const updatePreferences = (newPrefs: Partial<ReadingPreferences>) => {
    setPreferencesState((prev) => {
      const updated = { ...prev, ...newPrefs };
      savePreferences(updated, userId);
      return updated;
    });
    if (userId) {
      trackActivity(userId, 'SETTINGS_CHANGED', currentBook.code, currentChapter, selectedVerse || 1, newPrefs);
    }
  };

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
        toggleLanguage,
        updatePreferences,
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

