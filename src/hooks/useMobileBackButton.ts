import { useEffect, useRef, useState, useCallback } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useReading } from '../context/ReadingContext';
import { useAuth } from '../context/AuthContext';

export function useMobileBackButton() {
  const {
    isSideNavOpen,
    setIsSideNavOpen,
    isLanguageModalOpen,
    setIsLanguageModalOpen,
    isSearchOpen,
    setIsSearchOpen,
    isBookSelectorOpen,
    setIsBookSelectorOpen,
    isPreferencesOpen,
    setIsPreferencesOpen,
    isBookmarksOpen,
    setIsBookmarksOpen,
    isDailyHistoryOpen,
    setIsDailyHistoryOpen,
    isReadingHistoryOpen,
    setIsReadingHistoryOpen,
    isVerseCardOpen,
    closeVerseCard,
    isFullscreenReaderOpen,
    closeFullscreenReader,
    isStreakModalOpen,
    setIsStreakModalOpen,
    activeStudyType,
    closeStudy
  } = useReading();

  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    isSyncModalOpen,
    setIsSyncModalOpen
  } = useAuth();

  const [isExitModalOpen, setIsExitModalOpen] = useState<boolean>(false);

  // Keep latest modal state in ref for capacitor event listener
  const modalStateRef = useRef({
    exitModal: isExitModalOpen,
    fullscreenReader: isFullscreenReaderOpen,
    streakModal: isStreakModalOpen,
    sideNav: isSideNavOpen,
    languageModal: isLanguageModalOpen,
    search: isSearchOpen,
    bookSelector: isBookSelectorOpen,
    preferences: isPreferencesOpen,
    bookmarks: isBookmarksOpen,
    dailyHistory: isDailyHistoryOpen,
    readingHistory: isReadingHistoryOpen,
    verseCard: isVerseCardOpen,
    study: activeStudyType !== 'none',
    auth: isAuthModalOpen,
    sync: isSyncModalOpen
  });

  useEffect(() => {
    modalStateRef.current = {
      exitModal: isExitModalOpen,
      fullscreenReader: isFullscreenReaderOpen,
      streakModal: isStreakModalOpen,
      sideNav: isSideNavOpen,
      languageModal: isLanguageModalOpen,
      search: isSearchOpen,
      bookSelector: isBookSelectorOpen,
      preferences: isPreferencesOpen,
      bookmarks: isBookmarksOpen,
      dailyHistory: isDailyHistoryOpen,
      readingHistory: isReadingHistoryOpen,
      verseCard: isVerseCardOpen,
      study: activeStudyType !== 'none',
      auth: isAuthModalOpen,
      sync: isSyncModalOpen
    };
  }, [
    isExitModalOpen,
    isFullscreenReaderOpen,
    isStreakModalOpen,
    isSideNavOpen,
    isLanguageModalOpen,
    isSearchOpen,
    isBookSelectorOpen,
    isPreferencesOpen,
    isBookmarksOpen,
    isDailyHistoryOpen,
    isReadingHistoryOpen,
    isVerseCardOpen,
    activeStudyType,
    isAuthModalOpen,
    isSyncModalOpen
  ]);

  const isHandlingPopState = useRef<boolean>(false);
  const ignoreNextPopState = useRef<boolean>(false);

  const prevModalState = useRef(modalStateRef.current);

  const isAnyModalOpen =
    isExitModalOpen ||
    isFullscreenReaderOpen ||
    isStreakModalOpen ||
    isSideNavOpen ||
    isLanguageModalOpen ||
    isSearchOpen ||
    isBookSelectorOpen ||
    isPreferencesOpen ||
    isBookmarksOpen ||
    isDailyHistoryOpen ||
    isReadingHistoryOpen ||
    isVerseCardOpen ||
    activeStudyType !== 'none' ||
    isAuthModalOpen ||
    isSyncModalOpen;

  // Initialize history base guard entries on mount for web browsers
  useEffect(() => {
    try {
      if (!window.history.state || !window.history.state.bibleAppGuard) {
        window.history.replaceState({ bibleAppGuard: 'base' }, '');
        window.history.pushState({ bibleAppGuard: 'home' }, '');
      }
    } catch (err) {
      console.warn('Error setting history state:', err);
    }
  }, []);

  // Centralized close highest priority modal function
  const handleBackAction = useCallback((): boolean => {
    const s = modalStateRef.current;

    if (s.exitModal) {
      setIsExitModalOpen(false);
      return true;
    }
    if (s.fullscreenReader) {
      closeFullscreenReader();
      return true;
    }
    if (s.streakModal) {
      setIsStreakModalOpen(false);
      return true;
    }
    if (s.languageModal) {
      setIsLanguageModalOpen(false);
      return true;
    }
    if (s.verseCard) {
      closeVerseCard();
      return true;
    }
    if (s.auth) {
      setIsAuthModalOpen(false);
      return true;
    }
    if (s.sync) {
      setIsSyncModalOpen(false);
      return true;
    }
    if (s.dailyHistory) {
      setIsDailyHistoryOpen(false);
      return true;
    }
    if (s.readingHistory) {
      setIsReadingHistoryOpen(false);
      return true;
    }
    if (s.bookmarks) {
      setIsBookmarksOpen(false);
      return true;
    }
    if (s.preferences) {
      setIsPreferencesOpen(false);
      return true;
    }
    if (s.search) {
      setIsSearchOpen(false);
      return true;
    }
    if (s.bookSelector) {
      setIsBookSelectorOpen(false);
      return true;
    }
    if (s.sideNav) {
      setIsSideNavOpen(false);
      return true;
    }
    if (s.study) {
      closeStudy();
      return true;
    }

    // No modal open -> Show exit confirmation
    setIsExitModalOpen(true);
    return false;
  }, [
    closeFullscreenReader,
    setIsStreakModalOpen,
    setIsLanguageModalOpen,
    closeVerseCard,
    setIsAuthModalOpen,
    setIsSyncModalOpen,
    setIsDailyHistoryOpen,
    setIsReadingHistoryOpen,
    setIsBookmarksOpen,
    setIsPreferencesOpen,
    setIsSearchOpen,
    setIsBookSelectorOpen,
    setIsSideNavOpen,
    closeStudy
  ]);

  // 1. Capacitor Native Android Hardware Back Button Listener
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let subHandle: any = null;
    CapApp.addListener('backButton', () => {
      handleBackAction();
    }).then((sub) => {
      subHandle = sub;
    });

    return () => {
      if (subHandle) subHandle.remove();
    };
  }, [handleBackAction]);

  // 2. Synchronize modal state transitions with window.history (Web/PWA)
  useEffect(() => {
    const current = modalStateRef.current;
    const prev = prevModalState.current;

    const modalJustOpened = Object.keys(current).some(
      (key) => key !== 'exitModal' && (current as any)[key] && !(prev as any)[key]
    );

    const modalJustClosed = Object.keys(current).some(
      (key) => key !== 'exitModal' && !(current as any)[key] && (prev as any)[key]
    );

    if (modalJustOpened) {
      if (!isHandlingPopState.current) {
        try {
          window.history.pushState({ bibleAppGuard: 'modal' }, '');
        } catch {
          // ignore
        }
      }
    } else if (modalJustClosed) {
      if (!isHandlingPopState.current) {
        try {
          if (window.history.state && window.history.state.bibleAppGuard === 'modal') {
            ignoreNextPopState.current = true;
            window.history.back();
          }
        } catch {
          // ignore
        }
      }
    }

    prevModalState.current = current;
  }, [
    isSideNavOpen,
    isLanguageModalOpen,
    isSearchOpen,
    isBookSelectorOpen,
    isPreferencesOpen,
    isBookmarksOpen,
    isDailyHistoryOpen,
    isReadingHistoryOpen,
    isVerseCardOpen,
    isFullscreenReaderOpen,
    isStreakModalOpen,
    activeStudyType,
    isAuthModalOpen,
    isSyncModalOpen
  ]);

  // 3. Web Popstate Listener (Mobile Browser / PWA)
  useEffect(() => {
    const handlePopState = () => {
      if (ignoreNextPopState.current) {
        ignoreNextPopState.current = false;
        return;
      }

      isHandlingPopState.current = true;
      const handled = handleBackAction();

      if (!handled) {
        try {
          window.history.pushState({ bibleAppGuard: 'home' }, '');
        } catch {
          // ignore
        }
      }

      setTimeout(() => {
        isHandlingPopState.current = false;
      }, 100);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handleBackAction]);

  const handleConfirmExit = useCallback(() => {
    setIsExitModalOpen(false);
    if (Capacitor.isNativePlatform()) {
      CapApp.exitApp();
    } else {
      try {
        window.history.go(-2);
      } catch {
        window.history.back();
      }
    }
  }, []);

  const handleCancelExit = useCallback(() => {
    setIsExitModalOpen(false);
  }, []);

  return {
    isExitModalOpen,
    handleConfirmExit,
    handleCancelExit,
    isAnyModalOpen
  };
}
