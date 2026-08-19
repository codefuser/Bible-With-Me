import React, { useEffect } from 'react';
import { useReading } from '../../context/ReadingContext';

export const KeyboardShortcuts: React.FC = () => {
  const {
    books,
    currentBook,
    currentChapter,
    setBookAndChapter,
    setChapter,
    isSearchOpen,
    isPreferencesOpen,
    isBookSelectorOpen,
    isBookmarksOpen,
    setIsSearchOpen,
    setIsPreferencesOpen,
    setIsBookSelectorOpen,
    setIsBookmarksOpen
  } = useReading();

  const isAnyModalOpen = isSearchOpen || isPreferencesOpen || isBookSelectorOpen || isBookmarksOpen;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut keys if user is typing in an input or textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toUpperCase();
      const isInputActive = targetTag === 'INPUT' || targetTag === 'TEXTAREA';

      // 1. Esc key closes any open modal
      if (e.key === 'Escape') {
        if (isSearchOpen) setIsSearchOpen(false);
        if (isPreferencesOpen) setIsPreferencesOpen(false);
        if (isBookSelectorOpen) setIsBookSelectorOpen(false);
        if (isBookmarksOpen) setIsBookmarksOpen(false);
        return;
      }

      // 2. Ctrl + K or '/' key opens search modal
      if ((e.ctrlKey && e.key.toLowerCase() === 'k') || (!isInputActive && e.key === '/')) {
        e.preventDefault();
        setIsSearchOpen(true);
        return;
      }

      // If typing in input or if a modal is open, ignore navigation shortcuts
      if (isInputActive || isAnyModalOpen) return;

      // 3. ArrowLeft -> Previous Chapter
      if (e.key === 'ArrowLeft') {
        if (currentChapter > 1) {
          setChapter(currentChapter - 1);
        } else if (currentBook.book_number > 1) {
          const prevBook = books.find((b) => b.book_number === currentBook.book_number - 1);
          if (prevBook) {
            setBookAndChapter(prevBook, prevBook.total_chapters);
          }
        }
      }

      // 4. ArrowRight -> Next Chapter
      if (e.key === 'ArrowRight') {
        if (currentChapter < currentBook.total_chapters) {
          setChapter(currentChapter + 1);
        } else if (currentBook.book_number < 66) {
          const nextBook = books.find((b) => b.book_number === currentBook.book_number + 1);
          if (nextBook) {
            setBookAndChapter(nextBook, 1);
          }
        }
      }

      // 5. 'b' / 'B' -> Open Bookmarks Modal
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsBookmarksOpen(true);
      }

      // 6. 's' / 'S' -> Open Preferences Modal
      if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsPreferencesOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    books,
    currentBook,
    currentChapter,
    isAnyModalOpen,
    isSearchOpen,
    isPreferencesOpen,
    isBookSelectorOpen,
    isBookmarksOpen
  ]);

  return null;
};
