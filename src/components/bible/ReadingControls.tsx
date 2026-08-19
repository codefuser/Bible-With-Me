import React from 'react';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';

export const ReadingControls: React.FC = () => {
  const {
    books,
    currentBook,
    currentChapter,
    language,
    setBookAndChapter,
    setChapter,
    setIsBookSelectorOpen
  } = useReading();

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
        <button className="nav-btn" onClick={handlePrev} disabled={isFirstChapter} title="Previous Chapter">
          <ChevronLeft size={18} />
          <span className="nav-btn-label">{language === 'ta' ? 'முந்தைய' : 'Previous'}</span>
        </button>

        <button className="btn-pill header-book-btn" onClick={() => setIsBookSelectorOpen(true)} title="Select Chapter">
          <BookOpen size={15} />
          <span>{language === 'ta' ? currentBook.name_ta : currentBook.name_en} {currentChapter}</span>
        </button>

        <button className="nav-btn" onClick={handleNext} disabled={isLastChapter} title="Next Chapter">
          <span className="nav-btn-label">{language === 'ta' ? 'அடுத்த' : 'Next'}</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
