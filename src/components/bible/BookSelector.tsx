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
    isBookSelectorOpen,
    setIsBookSelectorOpen,
    setBookAndChapter
  } = useReading();

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
              <button className="btn-icon" onClick={() => setSelectedBookForChapters(null)} title="Back to Book List">
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="modal-title">
                  {language === 'ta' ? selectedBookForChapters.name_ta : selectedBookForChapters.name_en}
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {selectedBookForChapters.total_chapters} {language === 'ta' ? 'அதிகாரங்கள்' : 'Chapters'}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} style={{ color: 'var(--accent-color)' }} />
              <h2 className="modal-title">
                {language === 'ta' ? 'வேதாகம புத்தகங்கள்' : 'Select Bible Book'}
              </h2>
            </div>
          )}
          <button className="btn-icon" onClick={handleClose} title="Close Modal">
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
                  {language === 'ta' ? 'பழைய ஏற்பாடு (39)' : 'Old Testament (39)'}
                </button>
                <button
                  className={`tab-btn ${activeTestament === 'NT' ? 'active' : ''}`}
                  onClick={() => setActiveTestament('NT')}
                >
                  {language === 'ta' ? 'புதிய ஏற்பாடு (27)' : 'New Testament (27)'}
                </button>
              </div>

              {/* Book Grid */}
              <div className="book-grid">
                {filteredBooks.map((book) => {
                  const isSelected = currentBook.id === book.id;
                  const name = language === 'ta' ? book.name_ta : book.name_en;
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
                        {book.total_chapters} {language === 'ta' ? 'அதிகாரங்கள்' : 'ch'}
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
                  {language === 'ta' ? 'அதிகாரத்தைத் தேர்ந்தெடுக்கவும்:' : 'Select a Chapter:'}
                </p>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {language === 'ta' ? 'தற்போதைய அதிகாரம்:' : 'Current:'} <strong>{currentChapter}</strong>
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
