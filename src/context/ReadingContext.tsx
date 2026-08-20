import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  BibleBook,
  BibleVerse,
  Language,
  ReadingPreferences,
  Bookmark,
  ReadingHistoryItem
} from '../types/bible';
import { fetchBibleBooks, ALL_BIBLE_BOOKS } from '../services/bibleService';
import { getStoredPreferences, savePreferences } from '../services/preferencesService';
import { getStoredBookmarks, toggleBookmark } from '../services/bookmarkService';
import { getStoredHistory, updateReadingHistory } from '../services/historyService';
import { parseHashRoute } from '../services/routerService';

interface ReadingContextType {
  books: BibleBook[];
  currentBook: BibleBook;
  currentChapter: number;
  selectedVerse: number | null;
  language: Language;
  preferences: ReadingPreferences;
  bookmarks: Bookmark[];
  historyItem: ReadingHistoryItem | null;
  isSearchOpen: boolean;
  isPreferencesOpen: boolean;
  isBookSelectorOpen: boolean;
  isBookmarksOpen: boolean;
  isSideNavOpen: boolean;
  isDailyHistoryOpen: boolean;
  activeStudyType: 'none' | 'verse' | 'chapter';
  studyLocation: { bookId: number; chapter: number; verse?: number } | null;
  setBookAndChapter: (book: BibleBook, chapter: number, verse?: number) => void;
  setChapter: (chapter: number) => void;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  updatePreferences: (newPrefs: Partial<ReadingPreferences>) => void;
  handleToggleBookmark: (verseObj: BibleVerse) => void;
  setIsSearchOpen: (open: boolean) => void;
  setIsPreferencesOpen: (open: boolean) => void;
  setIsBookSelectorOpen: (open: boolean) => void;
  setIsBookmarksOpen: (open: boolean) => void;
  setIsSideNavOpen: (open: boolean) => void;
  setIsDailyHistoryOpen: (open: boolean) => void;
  openVerseStudy: (bookId: number, chapter: number, verse: number) => void;
  openChapterStudy: (bookId: number, chapter: number) => void;
  closeStudy: () => void;
}

const ReadingContext = createContext<ReadingContextType | undefined>(undefined);

export const ReadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<BibleBook[]>(ALL_BIBLE_BOOKS);
  const [currentBook, setCurrentBook] = useState<BibleBook>(ALL_BIBLE_BOOKS[0]);
  const [currentChapter, setCurrentChapter] = useState<number>(1);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);

  const [preferences, setPreferencesState] = useState<ReadingPreferences>(getStoredPreferences);
  const [language, setLanguageState] = useState<Language>(preferences.language || 'en');
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(getStoredBookmarks);
  const [historyItem, setHistoryItem] = useState<ReadingHistoryItem | null>(getStoredHistory);

  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState<boolean>(false);
  const [isBookSelectorOpen, setIsBookSelectorOpen] = useState<boolean>(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState<boolean>(false);
  const [isSideNavOpen, setIsSideNavOpen] = useState<boolean>(false);
  const [isDailyHistoryOpen, setIsDailyHistoryOpen] = useState<boolean>(false);

  const [activeStudyType, setActiveStudyType] = useState<'none' | 'verse' | 'chapter'>('none');
  const [studyLocation, setStudyLocation] = useState<{ bookId: number; chapter: number; verse?: number } | null>(null);

  // Initialize Books, Hash Deep-Links & Saved History on mount
  useEffect(() => {
    fetchBibleBooks().then((data) => {
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
            return;
          }
        }

        // 2. Fallback to Stored History
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
    });
  }, []);

  // Update HTML data-theme attribute whenever theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', preferences.theme);
  }, [preferences.theme]);

  const setBookAndChapter = (book: BibleBook, chapter: number, verse: number = 1) => {
    setCurrentBook(book);
    setCurrentChapter(chapter);
    setSelectedVerse(verse);
    setIsBookSelectorOpen(false);

    updateReadingHistory(book, chapter, verse, language).then((item) => {
      setHistoryItem(item);
    });
  };

  const setChapter = (chapter: number) => {
    if (chapter >= 1 && chapter <= currentBook.total_chapters) {
      setBookAndChapter(currentBook, chapter, 1);
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    updatePreferences({ language: lang });
    updateReadingHistory(currentBook, currentChapter, selectedVerse || 1, lang);
  };

  const toggleLanguage = () => {
    const nextLang: Language = language === 'ta' ? 'en' : language === 'en' ? 'parallel' : 'ta';
    setLanguage(nextLang);
  };

  const updatePreferences = (newPrefs: Partial<ReadingPreferences>) => {
    setPreferencesState((prev) => {
      const updated = { ...prev, ...newPrefs };
      savePreferences(updated);
      return updated;
    });
  };

  const handleToggleBookmark = (verseObj: BibleVerse) => {
    toggleBookmark(bookmarks, currentBook, verseObj, language).then((updated) => {
      setBookmarks(updated);
    });
  };

  const openVerseStudy = (bookId: number, chapter: number, verse: number) => {
    setStudyLocation({ bookId, chapter, verse });
    setActiveStudyType('verse');
  };

  const openChapterStudy = (bookId: number, chapter: number) => {
    setStudyLocation({ bookId, chapter });
    setActiveStudyType('chapter');
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
        historyItem,
        isSearchOpen,
        isPreferencesOpen,
        isBookSelectorOpen,
        isBookmarksOpen,
        isSideNavOpen,
        isDailyHistoryOpen,
        activeStudyType,
        studyLocation,
        setBookAndChapter,
        setChapter,
        setLanguage,
        toggleLanguage,
        updatePreferences,
        handleToggleBookmark,
        setIsSearchOpen,
        setIsPreferencesOpen,
        setIsBookSelectorOpen,
        setIsBookmarksOpen,
        setIsSideNavOpen,
        setIsDailyHistoryOpen,
        openVerseStudy,
        openChapterStudy,
        closeStudy
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
