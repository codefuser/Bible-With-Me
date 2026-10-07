import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Check, ChevronRight, Sparkles, Plus, RefreshCw } from 'lucide-react';
import { fetchBibleBooks, fetchChapterVerses } from '../../../services/bibleService';
import { BibleBook, BibleVerse } from '../../../types/bible';
import { StudioProject, TextLayer } from '../types';

interface BiblePickerPanelProps {
  project: StudioProject;
  onSelectVerse: (verseTa: string, verseEn: string, reference: string) => void;
  onAddLayer: (layer: TextLayer) => void;
  isTa?: boolean;
}

export const BiblePickerPanel: React.FC<BiblePickerPanelProps> = ({
  project,
  onSelectVerse,
  onAddLayer,
  isTa
}) => {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [selectedVerseNum, setSelectedVerseNum] = useState<number>(1);
  const [testamentFilter, setTestamentFilter] = useState<'ALL' | 'OT' | 'NT'>('ALL');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const loadedBooks = await fetchBibleBooks();
        if (mounted) {
          setBooks(loadedBooks);
          if (loadedBooks.length > 0) {
            setSelectedBook(loadedBooks[0]);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load Bible books in studio:', err);
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!selectedBook) return;
    let mounted = true;
    (async () => {
      try {
        const chVerses = await fetchChapterVerses(selectedBook.id, selectedChapter);
        if (mounted) {
          setVerses(chVerses);
          if (chVerses.length > 0) {
            setSelectedVerseNum(1);
          }
        }
      } catch (err) {
        console.error('Failed to load chapter verses:', err);
      }
    })();
    return () => { mounted = false; };
  }, [selectedBook, selectedChapter]);

  const filteredBooks = books.filter(b => {
    if (testamentFilter !== 'ALL' && b.testament !== testamentFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return b.name_en.toLowerCase().includes(q) || b.name_ta.includes(q) || b.code.toLowerCase().includes(q);
  });

  const currentVerse = verses.find(v => v.verse === selectedVerseNum) || verses[0];

  const handleApplyVerse = () => {
    if (!selectedBook || !currentVerse) return;
    const ref = `${isTa ? selectedBook.name_ta : selectedBook.name_en} ${selectedChapter}:${currentVerse.verse}`;
    onSelectVerse(currentVerse.text_ta, currentVerse.text_en, ref);
  };

  return (
    <div className="studio-panel-content">
      <div className="studio-panel-header">
        <h3 className="studio-panel-title">
          <BookOpen size={18} className="text-amber-400" />
          <span>{isTa ? 'வேதாகம வசனத் தேடல்' : 'Scripture Selector'}</span>
        </h3>
        <p className="studio-panel-desc">
          {isTa
            ? 'அனைத்து 66 புத்தகங்களிலிருந்தும் வசனங்களை நேரடியாக தேர்ந்தெடுக்கவும்'
            : 'Select scripture directly from all 66 books of the Bible.'}
        </p>
      </div>

      {/* Selected Verse Preview & Action */}
      {currentVerse && selectedBook && (
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-500/15 to-slate-800/80 border border-amber-500/30 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-300">
              {isTa ? selectedBook.name_ta : selectedBook.name_en} {selectedChapter}:{currentVerse.verse}
            </span>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-200">
              {selectedBook.testament === 'OT' ? (isTa ? 'பழைய ஏற்பாடு' : 'Old Testament') : (isTa ? 'புதிய ஏற்பாடு' : 'New Testament')}
            </span>
          </div>

          <div className="text-xs text-slate-200 font-serif leading-relaxed line-clamp-3 mb-1.5">
            {currentVerse.text_ta}
          </div>
          <div className="text-[11px] text-slate-400 italic line-clamp-2 mb-3">
            {currentVerse.text_en}
          </div>

          <button
            onClick={handleApplyVerse}
            className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-900/30 transition-all active:scale-95"
          >
            <Sparkles size={14} />
            <span>{isTa ? 'இந்த வசனத்தை கார்டில் மாற்று' : 'Apply to Verse Card'}</span>
          </button>
        </div>
      )}

      {/* Testament Filter & Search */}
      <div className="space-y-2 mb-3">
        <div className="flex gap-1 p-1 bg-slate-900/80 rounded-lg border border-slate-800">
          {(['ALL', 'OT', 'NT'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTestamentFilter(t)}
              className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                testamentFilter === t
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === 'ALL' ? (isTa ? 'அனைத்தும்' : 'All') : t === 'OT' ? (isTa ? 'ப.ஏ' : 'OT') : (isTa ? 'பு.ஏ' : 'NT')}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={isTa ? 'புத்தகம் தேடுக (எ.கா. யோவான், சங்கீதம்)' : 'Search book...'}
            className="w-full bg-slate-900/90 border border-slate-700/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/70"
          />
        </div>
      </div>

      {/* Book Grid */}
      <div className="studio-section">
        <span className="studio-section-label">
          {isTa ? 'வேதாகம புத்தகம்' : 'Select Book'}
        </span>
        <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
          {loading ? (
            <div className="col-span-2 text-center py-4 text-xs text-slate-400">Loading Bible books...</div>
          ) : (
            filteredBooks.map(b => (
              <button
                key={b.id}
                onClick={() => {
                  setSelectedBook(b);
                  setSelectedChapter(1);
                }}
                className={`p-2 rounded-lg text-left text-xs transition-all border ${
                  selectedBook?.id === b.id
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-semibold'
                    : 'bg-slate-800/50 border-slate-700/40 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="truncate">{isTa ? b.name_ta : b.name_en}</div>
                <div className="text-[10px] text-slate-400 truncate">
                  {isTa ? b.name_en : b.name_ta} • {b.total_chapters} ch
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chapter & Verse Selectors */}
      {selectedBook && (
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <span className="studio-section-label">
              {isTa ? 'அதிகாரம்' : 'Chapter'}
            </span>
            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-1 bg-slate-900/60 rounded-lg border border-slate-800">
              {Array.from({ length: selectedBook.total_chapters }, (_, i) => i + 1).map(ch => (
                <button
                  key={ch}
                  onClick={() => setSelectedChapter(ch)}
                  className={`w-7 h-7 text-xs rounded font-medium transition-all ${
                    selectedChapter === ch
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="studio-section-label">
              {isTa ? 'வசனம்' : 'Verse'}
            </span>
            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-1 bg-slate-900/60 rounded-lg border border-slate-800">
              {verses.map(v => (
                <button
                  key={v.verse}
                  onClick={() => setSelectedVerseNum(v.verse)}
                  className={`w-7 h-7 text-xs rounded font-medium transition-all ${
                    selectedVerseNum === v.verse
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {v.verse}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
