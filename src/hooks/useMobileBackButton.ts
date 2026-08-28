import { useEffect, useRef, useState, useCallback } from 'react';
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

  // Flag set to true when popstate (hardware back button) is handling a modal close
  const isHandlingPopState = useRef<boolean>(false);

  // Flag set to true when we programmatically call history.back() after a UI modal close, so popstate listener ignores it
  const ignoreNextPopState = useRef<boolean>(false);

  // Track modal states to detect opening vs closing transitions
  const prevModalState = useRef({
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

  const isAnyModalOpen =
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

  // Initialize history base guard entries on mount
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

  // Synchronize modal state transitions with window.history
  useEffect(() => {
    const current = {
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

    const prev = prevModalState.current;

    // Check if any modal just OPENED
    const modalJustOpened = Object.keys(current).some(
      (key) => current[key as keyof typeof current] && !prev[key as keyof typeof prev]
    );

    // Check if any modal just CLOSED
    const modalJustClosed = Object.keys(current).some(
      (key) => !current[key as keyof typeof current] && prev[key as keyof typeof prev]
    );

    if (modalJustOpened) {
      // Push history entry only if opened via UI click (not popstate)
      if (!isHandlingPopState.current) {
        try {
          window.history.pushState({ bibleAppGuard: 'modal' }, '');
        } catch {
          // ignore
        }
      }
    } else if (modalJustClosed) {
      // If modal was closed via UI click (e.g. 'X' button, backdrop tap, or selection action),
      // we must pop the history state we pushed, BUT set ignoreNextPopState so popstate handler doesn't open Exit Confirmation!
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
    activeStudyType,
    isAuthModalOpen,
    isSyncModalOpen
  ]);

  // Global popstate event handler (intercepts mobile hardware Back button press)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // If popstate was triggered by our own programmatic history.back() call, ignore it completely
      if (ignoreNextPopState.current) {
        ignoreNextPopState.current = false;
        return;
      }

      isHandlingPopState.current = true;

      // Close open modals in top-to-bottom priority order
      if (isExitModalOpen) {
        setIsExitModalOpen(false);
      } else if (isLanguageModalOpen) {
        setIsLanguageModalOpen(false);
      } else if (isVerseCardOpen) {
        closeVerseCard();
      } else if (isAuthModalOpen) {
        setIsAuthModalOpen(false);
      } else if (isSyncModalOpen) {
        setIsSyncModalOpen(false);
      } else if (isDailyHistoryOpen) {
        setIsDailyHistoryOpen(false);
      } else if (isReadingHistoryOpen) {
        setIsReadingHistoryOpen(false);
      } else if (isBookmarksOpen) {
        setIsBookmarksOpen(false);
      } else if (isPreferencesOpen) {
        setIsPreferencesOpen(false);
      } else if (isSearchOpen) {
        setIsSearchOpen(false);
      } else if (isBookSelectorOpen) {
        setIsBookSelectorOpen(false);
      } else if (isSideNavOpen) {
        setIsSideNavOpen(false);
      } else if (activeStudyType !== 'none') {
        closeStudy();
      } else {
        // No modals open: User pressed hardware Back button on root/home screen -> Show Exit Confirmation Popup
        setIsExitModalOpen(true);
        try {
          // Re-push home guard state so user remains guarded if they decline exit
          window.history.pushState({ bibleAppGuard: 'home' }, '');
        } catch {
          // ignore
        }
      }

      // Reset popstate handling flag after state update cycle completes
      setTimeout(() => {
        isHandlingPopState.current = false;
      }, 100);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    isExitModalOpen,
    isVerseCardOpen,
    closeVerseCard,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isSyncModalOpen,
    setIsSyncModalOpen,
    isDailyHistoryOpen,
    setIsDailyHistoryOpen,
    isReadingHistoryOpen,
    setIsReadingHistoryOpen,
    isBookmarksOpen,
    setIsBookmarksOpen,
    isPreferencesOpen,
    setIsPreferencesOpen,
    isSearchOpen,
    setIsSearchOpen,
    isBookSelectorOpen,
    setIsBookSelectorOpen,
    isSideNavOpen,
    setIsSideNavOpen,
    activeStudyType,
    closeStudy
  ]);

  const handleConfirmExit = useCallback(() => {
    setIsExitModalOpen(false);
    try {
      window.history.go(-2);
    } catch {
      window.history.back();
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
