import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Check, ChevronDown } from 'lucide-react';
import { fetchBibleBooks, fetchChapterVerses } from '../../../services/bibleService';
import { BibleBook, BibleVerse } from '../../../types/bible';
import { StudioProject } from '../types';

interface BiblePickerPanelProps {
  project: StudioProject;
  onSelectVerse: (verseTa: string, verseEn: string, reference: string) => void;
  onAddLayer?: any;
  isTa?: boolean;
}

const POPULAR_VERSES = [
  { ref: 'Psalms 23:1', refTa: 'சங்கீதம் 23:1', bookId: 19, ch: 23, v: 1 },
  { ref: 'John 3:16', refTa: 'யோவான் 3:16', bookId: 43, ch: 3, v: 16 },
  { ref: 'Philippians 4:13', refTa: 'பிலிப்பியர் 4:13', bookId: 50, ch: 4, v: 13 },
  { ref: 'Isaiah 40:31', refTa: 'ஏசாயா 40:31', bookId: 23, ch: 40, v: 31 },
  { ref: 'Jeremiah 29:11', refTa: 'எரேமியா 29:11', bookId: 24, ch: 29, v: 11 },
  { ref: 'Proverbs 3:5', refTa: 'நீதிமொழிகள் 3:5', bookId: 20, ch: 3, v: 5 }
];

export const BiblePickerPanel: React.FC<BiblePickerPanelProps> = ({
  project,
  onSelectVerse,
  isTa
}) => {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<number>(19); // Psalms
  const [selectedChapter, setSelectedChapter] = useState<number>(23);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [selectedVerseNum, setSelectedVerseNum] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [appliedFeedback, setAppliedFeedback] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const loaded = await fetchBibleBooks();
        if (mounted && loaded.length > 0) {
          setBooks(loaded);
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const vList = await fetchChapterVerses(selectedBookId, selectedChapter);
        if (mounted) {
          setVerses(vList);
          if (vList.length > 0 && selectedVerseNum > vList.length) {
            setSelectedVerseNum(1);
          }
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [selectedBookId, selectedChapter]);

  const activeBook = books.find(b => b.id === selectedBookId) || books[0];
  const activeVerse = verses.find(v => v.verse === selectedVerseNum) || verses[0];

  const handleApply = () => {
    if (!activeBook || !activeVerse) return;
    const ref = `${isTa ? activeBook.name_ta : activeBook.name_en} ${selectedChapter}:${activeVerse.verse}`;
    onSelectVerse(activeVerse.text_ta, activeVerse.text_en, ref);
    setAppliedFeedback(true);
    setTimeout(() => setAppliedFeedback(false), 2200);
  };

  const handleSelectPopular = async (pop: typeof POPULAR_VERSES[0]) => {
    setSelectedBookId(pop.bookId);
    setSelectedChapter(pop.ch);
    setSelectedVerseNum(pop.v);
  };

  return (
    <div className="studio-panel-content">
      <div className="studio-panel-header">
        <h3 className="studio-panel-title">
          <BookOpen size={16} className="text-amber-400" />
          <span>{isTa ? 'வேதாகம வசனம்' : 'Scripture Picker'}</span>
        </h3>
      </div>

      {/* Book, Chapter, Verse Dropdown Selectors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <div>
          <label className="studio-section-label">{isTa ? 'புத்தகம் (Book)' : 'Book'}</label>
          <select
            value={selectedBookId}
            onChange={(e) => {
              setSelectedBookId(Number(e.target.value));
              setSelectedChapter(1);
              setSelectedVerseNum(1);
            }}
          >
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {isTa ? b.name_ta : b.name_en} ({b.name_en})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div>
            <label className="studio-section-label">{isTa ? 'அதிகாரம் (Chapter)' : 'Chapter'}</label>
            <select
              value={selectedChapter}
              onChange={(e) => {
                setSelectedChapter(Number(e.target.value));
                setSelectedVerseNum(1);
              }}
            >
              {Array.from({ length: activeBook?.total_chapters || 1 }, (_, i) => i + 1).map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="studio-section-label">{isTa ? 'வசனம் (Verse)' : 'Verse'}</label>
            <select
              value={selectedVerseNum}
              onChange={(e) => setSelectedVerseNum(Number(e.target.value))}
            >
              {verses.map((v) => (
                <option key={v.verse} value={v.verse}>
                  {v.verse}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Selected Scripture Preview & Insert Button */}
      {activeVerse ? (
        <div
          style={{
            padding: '0.85rem',
            borderRadius: '12px',
            backgroundColor: '#111827',
            border: '1.5px solid rgba(245, 158, 11, 0.35)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fbbf24' }}>
              {isTa ? activeBook?.name_ta : activeBook?.name_en} {selectedChapter}:{activeVerse.verse}
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#fde68a',
                border: '1px solid rgba(245, 158, 11, 0.3)'
              }}
            >
              Selected
            </span>
          </div>

          <p
            style={{
              fontSize: '0.78rem',
              color: '#f8fafc',
              lineHeight: 1.6,
              margin: '0.2rem 0',
              fontFamily: `'Noto Serif Tamil', Georgia, serif`
            }}
          >
            {activeVerse.text_ta}
          </p>
          <p
            style={{
              fontSize: '0.72rem',
              color: '#94a3b8',
              fontStyle: 'italic',
              lineHeight: 1.5,
              margin: '0 0 0.5rem 0'
            }}
          >
            "{activeVerse.text_en}"
          </p>

          <button
            onClick={handleApply}
            className="studio-btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              padding: '0.65rem',
              fontSize: '0.82rem'
            }}
          >
            {appliedFeedback ? <Check size={16} /> : <Sparkles size={16} />}
            <span>
              {appliedFeedback
                ? (isTa ? 'சேர்க்கப்பட்டது!' : 'Applied to Canvas!')
                : (isTa ? 'வடிவமைப்பில் சேர்க்க' : 'Apply to Canvas')}
            </span>
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '1rem', color: '#64748b', fontSize: '0.75rem' }}>
          {loading ? (isTa ? 'ஏற்றுகிறது...' : 'Loading verses...') : (isTa ? 'வசனம் தேர்ந்தெடுக்கவும்' : 'Select a verse')}
        </div>
      )}

      {/* Popular Scripture Quick Chips */}
      <div className="studio-section">
        <label className="studio-section-label">
          {isTa ? 'பிரபலமான வசனங்கள் (Popular)' : 'Quick Scripture'}
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.45rem' }}>
          {POPULAR_VERSES.map((pop, i) => (
            <button
              key={i}
              onClick={() => handleSelectPopular(pop)}
              className="studio-btn-card"
              style={{
                padding: '0.5rem 0.6rem',
                textAlign: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              {isTa ? pop.refTa : pop.ref}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
