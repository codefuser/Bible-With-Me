import React from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Home } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';

export const ReadingControls: React.FC = () => {
  const {
    books,
    currentBook,
    currentChapter,
    language,
    appLanguage,
    setBookAndChapter,
    setChapter,
    setIsBookSelectorOpen,
    isPreferencesOpen,
    setIsPreferencesOpen
  } = useReading();

  if (isPreferencesOpen) {
    return null;
  }

  const isEnUI = (appLanguage || 'ta') === 'en';
  const isFirstChapter = currentBook.book_number === 1 && currentChapter === 1;
  const isLastChapter = currentBook.book_number === 66 && currentChapter === currentBook.total_chapters;

  const handlePrev = () => {
    if (currentChapter > 1) {
      setChapter(currentChapter - 1);
    } else if (currentBook.book_number > 1) {
      const prevBook = books.find((b) => b.book_number === currentBook.book_number - 1);
      if (prevBook) {
        setBookAndChapter(prevBook, prevBook.total_chapters);
      }
    }
  };

  const handleNext = () => {
    if (currentChapter < currentBook.total_chapters) {
      setChapter(currentChapter + 1);
    } else if (currentBook.book_number < 66) {
      const nextBook = books.find((b) => b.book_number === currentBook.book_number + 1);
      if (nextBook) {
        setBookAndChapter(nextBook, 1);
      }
    }
  };

  return (
    <div className="reading-controls-wrapper">
      <div className="reading-controls">
        <button
          className="nav-btn"
          onClick={handlePrev}
          disabled={isFirstChapter}
          title={isEnUI ? 'Previous Chapter' : 'முந்தைய அதிகாரம்'}
        >
          <ChevronLeft size={18} />
          <span className="nav-btn-label">{isEnUI ? 'Previous' : 'முந்தைய'}</span>
        </button>

        <button
          className="btn-pill header-book-btn"
          onClick={() => setIsBookSelectorOpen(true)}
          title={isEnUI ? 'Select Chapter' : 'அதிகாரத்தைத் தேர்ந்தெடுக்கவும்'}
        >
          <BookOpen size={15} />
          <span>{language === 'en' ? currentBook.name_en : currentBook.name_ta} {currentChapter}</span>
        </button>

        <button
          className="nav-btn"
          onClick={handleNext}
          disabled={isLastChapter}
          title={isEnUI ? 'Next Chapter' : 'அடுத்த அதிகாரம்'}
        >
          <span className="nav-btn-label">{isEnUI ? 'Next' : 'அடுத்த'}</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
