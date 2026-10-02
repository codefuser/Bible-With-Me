import React, { useState } from 'react';
import { X, ArrowLeft, BookOpen } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { Testament, BibleBook } from '../../types/bible';

export const BookSelectorModal: React.FC = () => {
  const {
    books,
    currentBook,
    currentChapter,
    language,
    appLanguage,
    isBookSelectorOpen,
    setIsBookSelectorOpen,
    setBookAndChapter
  } = useReading();

  const isEnUI = (appLanguage || 'ta') === 'en';
  const [activeTestament, setActiveTestament] = useState<Testament>(currentBook.testament || 'OT');
  const [selectedBookForChapters, setSelectedBookForChapters] = useState<BibleBook | null>(null);

  if (!isBookSelectorOpen) return null;

  const filteredBooks = books.filter((b) => b.testament === activeTestament);

  const handleClose = () => {
    setSelectedBookForChapters(null);
    setIsBookSelectorOpen(false);
  };

  const handleSelectBook = (book: BibleBook) => {
    if (book.total_chapters === 1) {
      setBookAndChapter(book, 1);
      handleClose();
    } else {
      setSelectedBookForChapters(book);
    }
  };

  const handleSelectChapter = (ch: number) => {
    if (selectedBookForChapters) {
      setBookAndChapter(selectedBookForChapters, ch);
      handleClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        <div className="modal-header">
          {selectedBookForChapters ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <button
                className="btn-icon"
                onClick={() => setSelectedBookForChapters(null)}
                title={isEnUI ? 'Back to Book List' : 'புத்தகப் பட்டியலுக்குத் திரும்பு'}
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="modal-title">
                  {language === 'en' ? selectedBookForChapters.name_en : selectedBookForChapters.name_ta}
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {selectedBookForChapters.total_chapters} {isEnUI ? 'Chapters' : 'அதிகாரங்கள்'}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} style={{ color: 'var(--accent-color)' }} />
              <h2 className="modal-title">
                {isEnUI ? 'Select Bible Book' : 'வேதாகம புத்தகங்கள்'}
              </h2>
            </div>
          )}
          <button
            className="btn-icon"
            onClick={handleClose}
            title={isEnUI ? 'Close' : 'மூடு'}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {!selectedBookForChapters ? (
            <>
              {/* Testament Tabs */}
              <div className="book-tabs">
                <button
                  className={`tab-btn ${activeTestament === 'OT' ? 'active' : ''}`}
                  onClick={() => setActiveTestament('OT')}
                >
                  {isEnUI ? 'Old Testament (39)' : 'பழைய ஏற்பாடு (39)'}
                </button>
                <button
                  className={`tab-btn ${activeTestament === 'NT' ? 'active' : ''}`}
                  onClick={() => setActiveTestament('NT')}
                >
                  {isEnUI ? 'New Testament (27)' : 'புதிய ஏற்பாடு (27)'}
                </button>
              </div>

              {/* Book Grid */}
              <div className="book-grid">
                {filteredBooks.map((book) => {
                  const isSelected = currentBook.id === book.id;
                  const name = language === 'en' ? book.name_en : book.name_ta;
                  return (
                    <button
                      key={book.id}
                      className={`book-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectBook(book)}
                    >
                      <div className="book-card-name" title={name}>
                        {name}
                      </div>
                      <div className="book-card-sub">
                        {book.total_chapters} {isEnUI ? 'ch' : 'அதி'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* Chapter Selector Grid */
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  {isEnUI ? 'Select a Chapter:' : 'அதிகாரத்தைத் தேர்ந்தெடுக்கவும்:'}
                </p>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {isEnUI ? 'Current:' : 'தற்போதைய அதிகாரம்:'} <strong>{currentChapter}</strong>
                </span>
              </div>

              <div className="chapter-grid">
                {Array.from({ length: selectedBookForChapters.total_chapters }, (_, i) => i + 1).map((ch) => {
                  const isSelected = currentBook.id === selectedBookForChapters.id && currentChapter === ch;
                  return (
                    <button
                      key={ch}
                      className={`chapter-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectChapter(ch)}
                    >
                      {ch}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
