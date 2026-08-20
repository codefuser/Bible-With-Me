import React, { useEffect, useState } from 'react';
import { X, Calendar, Compass, ArrowRight } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { getDailyVerseHistory } from '../../services/dailyVerseService';
import { DailyVerseHistoryItem } from '../../types/studyTypes';

export const DailyHistoryModal: React.FC = () => {
  const { isDailyHistoryOpen, setIsDailyHistoryOpen, language, openVerseStudy, books, setBookAndChapter } = useReading();
  const [historyItems, setHistoryItems] = useState<DailyVerseHistoryItem[]>([]);

  useEffect(() => {
    if (isDailyHistoryOpen) {
      setHistoryItems(getDailyVerseHistory());
    }
  }, [isDailyHistoryOpen]);

  if (!isDailyHistoryOpen) return null;

  const handleStudyVerse = (item: DailyVerseHistoryItem) => {
    setIsDailyHistoryOpen(false);
    openVerseStudy(item.book_id, item.chapter, item.verse);
  };

  const handleReadChapter = (item: DailyVerseHistoryItem) => {
    setIsDailyHistoryOpen(false);
    const book = books.find((b) => b.id === item.book_id);
    if (book) {
      setBookAndChapter(book, item.chapter, item.verse);
    }
  };

  return (
    <div className="study-overlay" onClick={() => setIsDailyHistoryOpen(false)}>
      <div className="study-container" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="study-header">
          <div className="study-title-group">
            <span className="study-badge">
              <Calendar size={14} />
              <span>{language === 'ta' ? 'தினசரி வரலாற்றுப் பதிவுகள்' : 'Daily Verse History'}</span>
            </span>
            <h2 className="study-main-title">
              {language === 'ta' ? 'முந்தைய தினசரி வசனங்கள்' : 'Past Daily Verses'}
            </h2>
          </div>
          <button className="btn-icon" onClick={() => setIsDailyHistoryOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="study-body">
          {historyItems.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
              {language === 'ta' ? 'கடந்த நாட்களின் வசனங்கள் இங்கு சேமிக்கப்படும்.' : 'Past daily verses will appear here.'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {historyItems.map((item) => {
                const refText = language === 'ta' ? `${item.book_name_ta} ${item.chapter}:${item.verse}` : `${item.book_name_en} ${item.chapter}:${item.verse}`;
                const text = language === 'ta' ? item.text_ta : item.text_en;

                return (
                  <div
                    key={item.date}
                    style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: '0.75rem',
                      padding: '1rem',
                      backgroundColor: 'var(--bg-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {item.date}
                      </span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-color)' }}>
                        {refText}
                      </span>
                    </div>

                    <p
                      style={{
                        fontFamily: language === 'ta' ? 'var(--font-tamil)' : 'var(--font-serif)',
                        fontSize: '0.9375rem',
                        lineHeight: 1.6,
                        color: 'var(--text-primary)',
                        margin: 0
                      }}
                    >
                      "{text}"
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '0.5rem',
                        paddingTop: '0.375rem'
                      }}
                    >
                      <button
                        className="btn-pill"
                        onClick={() => handleStudyVerse(item)}
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', gap: '0.25rem' }}
                      >
                        <Compass size={13} />
                        <span>{language === 'ta' ? 'ஆழமாக அறிய' : 'Study'}</span>
                      </button>

                      <button
                        className="btn-pill"
                        onClick={() => handleReadChapter(item)}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.3rem 0.6rem',
                          gap: '0.25rem',
                          backgroundColor: 'var(--accent-color)',
                          color: '#ffffff'
                        }}
                      >
                        <span>{language === 'ta' ? 'வாசிக்க' : 'Read'}</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
