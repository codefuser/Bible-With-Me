import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Check, ChevronDown, Search } from 'lucide-react';
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

      {/* Quick Scripture Selection Dropdowns */}
      <div className="space-y-2">
        <div>
          <span className="studio-section-label">{isTa ? 'புத்தகம்' : 'Book'}</span>
          <select
            value={selectedBookId}
            onChange={(e) => {
              setSelectedBookId(Number(e.target.value));
              setSelectedChapter(1);
              setSelectedVerseNum(1);
            }}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {isTa ? b.name_ta : b.name_en} ({b.name_en})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="studio-section-label">{isTa ? 'அதிகாரம்' : 'Chapter'}</span>
            <select
              value={selectedChapter}
              onChange={(e) => {
                setSelectedChapter(Number(e.target.value));
                setSelectedVerseNum(1);
              }}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {Array.from({ length: activeBook?.total_chapters || 1 }, (_, i) => i + 1).map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="studio-section-label">{isTa ? 'வசனம்' : 'Verse'}</span>
            <select
              value={selectedVerseNum}
              onChange={(e) => setSelectedVerseNum(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
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
      {activeVerse && (
        <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-amber-300">
              {isTa ? activeBook?.name_ta : activeBook?.name_en} {selectedChapter}:{activeVerse.verse}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200">
              Selected
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-serif line-clamp-3 mb-1">
            {activeVerse.text_ta}
          </p>
          <p className="text-[11px] text-slate-400 italic line-clamp-2 mb-3">
            {activeVerse.text_en}
          </p>

          <button
            onClick={handleApply}
            className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/40 transition-all active:scale-95"
          >
            <Sparkles size={14} />
            <span>{isTa ? 'வடிவமைப்பில் சேர்க்க' : 'Apply to Canvas'}</span>
          </button>
        </div>
      )}

      {/* Popular Scripture Quick Chips */}
      <div className="studio-section">
        <span className="studio-section-label">{isTa ? 'பிரபலமான வசனங்கள்' : 'Quick Scripture'}</span>
        <div className="grid grid-cols-2 gap-1.5">
          {POPULAR_VERSES.map((pop, i) => (
            <button
              key={i}
              onClick={() => handleSelectPopular(pop)}
              className="py-1.5 px-2 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/50 text-[11px] text-slate-200 text-center transition-all truncate"
            >
              {isTa ? pop.refTa : pop.ref}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
