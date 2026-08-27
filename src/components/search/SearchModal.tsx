import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, BookOpen, ArrowRight, SlidersHorizontal, ArrowUpLeft, Globe, ChevronDown, Check, Layers, Clock } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { useAuth } from '../../context/AuthContext';
import { SearchResult, Testament, BibleVerse, Language } from '../../types/bible';
import { searchBibleVerses, getBibleWordSuggestions, TANGLISH_MAP } from '../../services/searchService';
import { trackActivity } from '../../services/activityService';
import {
  fetchCloudSearchData,
  saveCloudSearchHistory,
  saveCloudOpenedVerses
} from '../../services/userDataService';
import { LoadingState } from '../common/LoadingState';

const SEARCH_HISTORY_KEY = 'bible_app_search_history';
const OPENED_VERSES_KEY = 'bible_app_opened_verses_history';
const MAX_SEARCH_HISTORY = 10;
const MAX_OPENED_VERSES = 15;
const INITIAL_DISPLAY_LIMIT = 40;

// Helper to highlight match substring inside verse text (pure function)
const renderHighlightedText = (text: string, searchTerm: string) => {
  if (!searchTerm || !searchTerm.trim()) return text;

  const trimmed = searchTerm.normalize('NFC').trim();
  const lowerSearch = trimmed.toLowerCase();
  const rawTokens = lowerSearch.split(/\s+/).filter((t) => t.length >= 1);

  const termsToMatch = Array.from(new Set([trimmed, ...rawTokens])).filter((t) => t.length > 0);
  if (termsToMatch.length === 0) return text;

  const escapedTerms = termsToMatch
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');

  if (!escapedTerms) return text;

  const regex = new RegExp(`(${escapedTerms})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) => {
    const isMatch = termsToMatch.some((term) => part.toLowerCase() === term.toLowerCase());
    return isMatch ? (
      <mark key={i} className="search-match-mark">
        {part}
      </mark>
    ) : (
      part
    );
  });
};

// Premium Custom Floating Book Range Selector Dropdown Component with Tanglish & Alignment Support
interface CustomBookSelectProps {
  value?: number;
  placeholder: string;
  books: { id: number; name_ta: string; name_en: string }[];
  language: Language;
  alignRight?: boolean;
  onChange: (bookId?: number) => void;
}

const CustomBookSelect: React.FC<CustomBookSelectProps> = ({
  value,
  placeholder,
  books,
  language,
  alignRight = false,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedBook = books.find((b) => b.id === value);
  const displayText = selectedBook ? (language === 'ta' ? selectedBook.name_ta : selectedBook.name_en) : placeholder;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Multi-tier Tanglish & Phonetic Matching for Dropdown Search (utha, yutha, jude, aathi, aadhi, aa, etc.)
  const filteredBooks = filterText.trim()
    ? books.filter((b) => {
        const norm = filterText.toLowerCase().trim();
        const taName = b.name_ta.toLowerCase();
        const enName = b.name_en.toLowerCase();

        // Direct Tamil or English match
        if (taName.includes(norm) || enName.includes(norm)) return true;

        // Tanglish map exact match
        const mappedTa = TANGLISH_MAP[norm];
        if (mappedTa && (taName.includes(mappedTa) || mappedTa.includes(taName))) return true;

        // Tanglish map prefix match (e.g., "utha", "yutha", "aathi", "aadhi", "gen")
        for (const [key, val] of Object.entries(TANGLISH_MAP)) {
          const mappedVal = val as string;
          if (key.startsWith(norm) && (mappedVal === b.name_ta || taName.includes(mappedVal))) {
            return true;
          }
        }
        return false;
      })
    : books;

  return (
    <div ref={dropdownRef} style={{ position: 'relative', flex: 1, minWidth: '120px' }}>
      <button
        type="button"
        className={`book-dropdown-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => {
          setIsOpen(!isOpen);
          setFilterText('');
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: value ? 600 : 400 }}>
          {displayText}
        </span>
        <ChevronDown
          size={14}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: value ? 'var(--accent-color)' : 'var(--text-muted)',
            flexShrink: 0
          }}
        />
      </button>

      {isOpen && (
        <div className={`book-dropdown-popover ${alignRight ? 'align-right' : ''}`}>
          {/* Quick Search Filter Input inside Dropdown */}
          <div style={{ padding: '0.375rem', borderBottom: '1px solid var(--border-color)' }}>
            <input
              type="text"
              placeholder={language === 'ta' ? 'தேடு...' : 'Search...'}
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                padding: '0.3125rem 0.5rem',
                fontSize: '0.75rem',
                borderRadius: '0.375rem',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ maxHeight: '210px', overflowY: 'auto', padding: '0.25rem' }}>
            <div
              className="book-dropdown-item"
              onClick={() => {
                onChange(undefined);
                setIsOpen(false);
              }}
              style={{ color: 'var(--text-muted)', fontWeight: 500 }}
            >
              <span>{placeholder}</span>
            </div>

            {filteredBooks.map((b) => {
              const isSelected = b.id === value;
              return (
                <div
                  key={b.id}
                  className={`book-dropdown-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(b.id);
                    setIsOpen(false);
                  }}
                >
                  <span>{language === 'ta' ? b.name_ta : b.name_en}</span>
                  {isSelected && <Check size={13} style={{ color: 'var(--accent-color)' }} />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Memoized Suggestion Row Sub-Component with Smooth Auto-Scroll
interface SuggestionRowProps {
  sug: string;
  isHighlighted: boolean;
  onSelect: (word: string) => void;
}

const SuggestionRow = React.memo<SuggestionRowProps>(({ sug, isHighlighted, onSelect }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHighlighted && rowRef.current) {
      rowRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [isHighlighted]);

  return (
    <div
      ref={rowRef}
      className={`search-suggestion-row ${isHighlighted ? 'active' : ''}`}
      onClick={() => onSelect(sug)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Search size={15} style={{ color: 'var(--text-muted)' }} />
        <span style={{ fontWeight: 500 }}>{sug}</span>
      </div>
      <ArrowUpLeft size={14} style={{ color: 'var(--text-muted)' }} />
    </div>
  );
});

// Memoized Search History Row Sub-Component with Individual Remove (X) Button (No Clock Icon)
interface HistoryRowProps {
  item: string;
  isHighlighted: boolean;
  onSelect: (word: string) => void;
  onDelete: (word: string) => void;
  language: Language;
}

const HistoryRow = React.memo<HistoryRowProps>(({ item, isHighlighted, onSelect, onDelete, language }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHighlighted && rowRef.current) {
      rowRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [isHighlighted]);

  return (
    <div
      ref={rowRef}
      className={`search-suggestion-row ${isHighlighted ? 'active' : ''}`}
      onClick={() => onSelect(item)}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
    >
      <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{item}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
        <button
          className="btn-icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item);
          }}
          title={language === 'ta' ? 'அழி' : 'Remove'}
          style={{ width: '1.625rem', height: '1.625rem', padding: 0 }}
        >
          <X size={13} style={{ color: 'var(--text-muted)' }} />
        </button>
        <ArrowUpLeft size={14} style={{ color: 'var(--text-muted)' }} />
      </div>
    </div>
  );
});

// Memoized Search Result Card Component with Smooth Auto-Scroll
interface SearchResultCardProps {
  res: SearchResult | BibleVerse;
  isHighlighted: boolean;
  query: string;
  language: Language;
  defaultBookName?: string;
  onSelect: (res: SearchResult | BibleVerse) => void;
  onDelete?: (res: SearchResult | BibleVerse) => void;
}

const SearchResultCard = React.memo<SearchResultCardProps>(
  ({ res, isHighlighted, query, language, defaultBookName, onSelect, onDelete }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (isHighlighted && cardRef.current) {
        cardRef.current.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }, [isHighlighted]);

    const bookName =
      'book_name_en' in res
        ? language === 'ta'
          ? res.book_name_ta
          : res.book_name_en
        : defaultBookName || '';
    const text = language === 'ta' ? res.text_ta : res.text_en;

    return (
      <div
        ref={cardRef}
        onClick={() => onSelect(res)}
        className={`search-result-card ${isHighlighted ? 'active' : ''}`}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--accent-color)' }}>
            {bookName} {res.chapter}:{res.verse}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            {onDelete && (
              <button
                className="btn-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(res);
                }}
                title={language === 'ta' ? 'அழி' : 'Delete'}
                style={{ width: '1.625rem', height: '1.625rem', padding: 0 }}
              >
                <X size={13} style={{ color: 'var(--text-muted)' }} />
              </button>
            )}
            <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>
        <div
          style={{
            fontSize: '0.9375rem',
            color: 'var(--text-primary)',
            fontFamily: language === 'ta' ? 'var(--font-tamil)' : 'var(--font-serif)',
            lineHeight: 1.6
          }}
        >
          {renderHighlightedText(text, query)}
        </div>
      </div>
    );
  }
);

export const SearchModal: React.FC = () => {
  const {
    books,
    currentBook,
    language,
    setLanguage,
    isSearchOpen,
    setIsSearchOpen,
    setBookAndChapter
  } = useReading();

  const { user } = useAuth();
  const userId = user?.id || null;

  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [openedVerses, setOpenedVerses] = useState<SearchResult[]>([]);
  const [displayLimit, setDisplayLimit] = useState<number>(INITIAL_DISPLAY_LIMIT);
  const [isClosing, setIsClosing] = useState<boolean>(false);

  // Filter States
  const [testamentFilter, setTestamentFilter] = useState<Testament | undefined>(undefined);
  const [showBookRange, setShowBookRange] = useState<boolean>(false);
  const [fromBookId, setFromBookId] = useState<number | undefined>(undefined);
  const [toBookId, setToBookId] = useState<number | undefined>(undefined);

  const [loading, setLoading] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const [suggestionHighlightIndex, setSuggestionHighlightIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchBoxRef = useRef<HTMLDivElement | null>(null);
  const resultContainerRef = useRef<HTMLDivElement | null>(null);

  // Load search history & opened verses history (Local + Supabase Cloud)
  useEffect(() => {
    try {
      const rawHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (rawHistory) {
        setSearchHistory(JSON.parse(rawHistory));
      }
      const rawOpened = localStorage.getItem(OPENED_VERSES_KEY);
      if (rawOpened) {
        setOpenedVerses(JSON.parse(rawOpened));
      }
    } catch (err) {
      console.error('Error loading search history / opened verses:', err);
    }

    if (userId) {
      fetchCloudSearchData(userId).then(({ searchHistory: cloudHist, openedVerses: cloudOpened }) => {
        if (cloudHist && cloudHist.length > 0) {
          setSearchHistory(cloudHist);
          try {
            localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(cloudHist));
          } catch {
            // ignore
          }
        }
        if (cloudOpened && cloudOpened.length > 0) {
          setOpenedVerses(cloudOpened);
          try {
            localStorage.setItem(OPENED_VERSES_KEY, JSON.stringify(cloudOpened));
          } catch {
            // ignore
          }
        }
      });
    }
  }, [userId]);

  // When search modal opens: reset closing state & hide suggestions popup initially
  useEffect(() => {
    if (isSearchOpen) {
      setIsClosing(false);
      setShowSuggestions(false);
    }
  }, [isSearchOpen]);

  const saveToHistory = (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed || trimmed.length < 2) return;

    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_SEARCH_HISTORY);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving search history:', err);
      }
      if (userId) {
        saveCloudSearchHistory(userId, updated);
      }
      return updated;
    });
  };

  const removeFromHistory = (itemToRemove: string) => {
    setSearchHistory((prev) => {
      const updated = prev.filter((item) => item !== itemToRemove);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Error removing search history item:', err);
      }
      if (userId) {
        saveCloudSearchHistory(userId, updated);
      }
      return updated;
    });
  };

  // Save opened verse to Permanently Saved Recently Opened Verses history (Non-deletable)
  const saveToOpenedVerses = (res: SearchResult | BibleVerse) => {
    const targetBook = books.find((b) => b.id === res.book_id);
    const itemToSave: SearchResult = {
      id: res.id,
      book_id: res.book_id,
      book_name_en: 'book_name_en' in res ? res.book_name_en : targetBook?.name_en || '',
      book_name_ta: 'book_name_ta' in res ? res.book_name_ta : targetBook?.name_ta || '',
      chapter: res.chapter,
      verse: res.verse,
      text_en: res.text_en,
      text_ta: res.text_ta
    };

    setOpenedVerses((prev) => {
      const filtered = prev.filter(
        (v) => !(v.book_id === itemToSave.book_id && v.chapter === itemToSave.chapter && v.verse === itemToSave.verse)
      );
      const updated = [itemToSave, ...filtered].slice(0, MAX_OPENED_VERSES);
      try {
        localStorage.setItem(OPENED_VERSES_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving opened verse history:', err);
      }
      if (userId) {
        saveCloudOpenedVerses(userId, updated);
      }
      return updated;
    });
  };

  // Click outside search header box: closes floating suggestions AND unfocuses input box
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // Fast 0ms Auto-Complete Suggestions Effect (Runs while typing)
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      if (isSubmitted) {
        setShowSuggestions(false);
      }
      setSuggestionHighlightIndex(-1);
      return;
    }

    const wordSuggestions = getBibleWordSuggestions(trimmed, 20);
    setSuggestions(wordSuggestions);

    if (!isSubmitted && wordSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [query, isSubmitted]);

  // Expand display limit automatically when arrow navigating towards bottom of loaded results
  useEffect(() => {
    if (highlightedIndex >= displayLimit - 5 && displayLimit < results.length) {
      setDisplayLimit((prev) => Math.min(prev + 40, results.length));
    }
  }, [highlightedIndex, displayLimit, results.length]);

  // Smooth animated closing handler
  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsSearchOpen(false);
      setIsClosing(false);
      setShowSuggestions(false);
    }, 230);
  }, [isClosing, setIsSearchOpen]);

  // Execute full verse search ONLY when user submits or selects a search filter/suggestion
  const executeVerseSearch = useCallback(
    (searchQuery: string) => {
      const trimmed = searchQuery.trim();
      if (!trimmed || trimmed.length < 1) return;

      setShowSuggestions(false);
      setIsSubmitted(true);
      setLoading(true);

      setTimeout(() => {
        searchBibleVerses(trimmed, language, testamentFilter, fromBookId, toBookId).then((res) => {
          setResults(res);
          setDisplayLimit(INITIAL_DISPLAY_LIMIT);
          setLoading(false);
          setHighlightedIndex(0);
          if (userId) {
            trackActivity(userId, 'SEARCH_PERFORMED', undefined, undefined, undefined, { query: trimmed, count: res.length });
          }
        });
      }, 10);
    },
    [language, testamentFilter, fromBookId, toBookId, userId]
  );

  // Re-run search if user changes filter options (OT/NT/Book Range) or language while results are shown
  useEffect(() => {
    if (isSubmitted && query.trim()) {
      executeVerseSearch(query);
    }
  }, [testamentFilter, fromBookId, toBookId, language]);

  if (!isSearchOpen && !isClosing) return null;

  const handleSelectResult = (res: SearchResult | BibleVerse) => {
    saveToHistory(query || currentBook.code);
    saveToOpenedVerses(res);
    const targetBook = books.find((b) => b.id === res.book_id);
    if (targetBook) {
      setBookAndChapter(targetBook, res.chapter, res.verse);
      handleClose();
    }
  };

  const handleSelectSuggestion = (word: string) => {
    setQuery(word);
    saveToHistory(word);
    executeVerseSearch(word);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Navigate floating suggestions with keyboard
    if (showSuggestions && (suggestions.length > 0 || searchHistory.length > 0)) {
      const currentListLength = query.trim() ? suggestions.length : searchHistory.length;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSuggestionHighlightIndex((prev) => (prev < currentListLength - 1 ? prev + 1 : prev));
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSuggestionHighlightIndex((prev) => (prev > 0 ? prev - 1 : -1));
        return;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (!query.trim() && searchHistory.length > 0 && suggestionHighlightIndex >= 0) {
          handleSelectSuggestion(searchHistory[suggestionHighlightIndex]);
        } else if (suggestionHighlightIndex >= 0 && suggestions[suggestionHighlightIndex]) {
          handleSelectSuggestion(suggestions[suggestionHighlightIndex]);
        } else {
          saveToHistory(query);
          executeVerseSearch(query);
          inputRef.current?.blur();
        }
        return;
      }
    }

    // Results navigation
    if (results.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[highlightedIndex]) {
          handleSelectResult(results[highlightedIndex]);
        }
      }
    } else if (e.key === 'Enter' && query.trim()) {
      e.preventDefault();
      saveToHistory(query);
      executeVerseSearch(query);
      inputRef.current?.blur();
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 200) {
      if (displayLimit < results.length) {
        setDisplayLimit((prev) => Math.min(prev + 40, results.length));
      }
    }
  };

  const visibleResults = results.slice(0, displayLimit);

  // Cycle language ('ta' -> 'en' -> 'parallel' -> 'ta')
  const cycleLanguage = () => {
    const nextLang: Language = language === 'ta' ? 'en' : language === 'en' ? 'parallel' : 'ta';
    setLanguage(nextLang);
  };

  return (
    <div
      className={`search-modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleClose}
    >
      <div
        className={`search-modal-content ${isClosing ? 'closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header Search Input with FULL-WIDTH Suggestions Popover Dropdown */}
        <div ref={searchBoxRef} className="modal-header" style={{ padding: '0.75rem 0.75rem', position: 'relative', zIndex: 150 }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '0.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '0.625rem',
                padding: '0.625rem 0.875rem',
                border: '1px solid var(--border-color)',
                flex: 1
              }}
            >
              <Search size={20} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                placeholder={
                  language === 'ta'
                    ? 'தேடுங்கள்... பெரிய, அன்பு, anbu, யோவான் 3:16, 1 சாமுவேல் 7:1'
                    : 'Search... love, anbu, John 3:16, 1 Sam 7:1'
                }
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsSubmitted(false);
                  setShowSuggestions(true);
                }}
                onClick={() => setShowSuggestions(true)}
                style={{ width: '100%', fontSize: '1rem', color: 'var(--text-primary)', background: 'transparent' }}
              />
              {query && (
                <button
                  className="btn-icon"
                  onClick={() => {
                    setQuery('');
                    setIsSubmitted(false);
                    setShowSuggestions(false);
                    setResults([]);
                  }}
                  title="Clear Search"
                  style={{ width: '1.75rem', height: '1.75rem' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button className="btn-icon" onClick={handleClose} style={{ marginLeft: '0.25rem' }}>
              <X size={20} />
            </button>
          </div>

          {/* FULL WIDTH FLOATING Popover Dropdown */}
          {showSuggestions && (
            <div className="search-suggestions-dropdown">
              {!query.trim() ? (
                /* When search box is clicked with no text, show Search History list directly */
                searchHistory.length > 0 ? (
                  <div>
                    {searchHistory.map((item, idx) => (
                      <HistoryRow
                        key={item}
                        item={item}
                        isHighlighted={idx === suggestionHighlightIndex}
                        onSelect={handleSelectSuggestion}
                        onDelete={removeFromHistory}
                        language={language}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '0.875rem', fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    {language === 'ta' ? 'வேதாகமத்தில் தேட தட்டச்சு செய்க...' : 'Type to search Scripture...'}
                  </div>
                )
              ) : suggestions.length > 0 ? (
                /* When typing, show Bible Word Suggestions inside Floating Box */
                <div>
                  {suggestions.map((sug, idx) => (
                    <SuggestionRow
                      key={sug}
                      sug={sug}
                      isHighlighted={idx === suggestionHighlightIndex}
                      onSelect={handleSelectSuggestion}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Filter Section Container */}
        <div className="search-filter-section-container">
          {/* Desktop & Laptop Filter Bar (> 640px) */}
          <div className="desktop-segmented-filter-bar">
            <button
              className={`segmented-filter-tab ${!testamentFilter && !fromBookId && !toBookId ? 'active' : ''}`}
              onClick={() => {
                setTestamentFilter(undefined);
                setFromBookId(undefined);
                setToBookId(undefined);
                setShowBookRange(false);
              }}
            >
              <Layers size={14} />
              <span>{language === 'ta' ? 'அனைத்தும்' : 'All'}</span>
            </button>

            <button
              className={`segmented-filter-tab ${testamentFilter === 'OT' && !fromBookId ? 'active' : ''}`}
              onClick={() => {
                setTestamentFilter('OT');
                setFromBookId(undefined);
                setToBookId(undefined);
                setShowBookRange(false);
              }}
            >
              <BookOpen size={14} />
              <span>{language === 'ta' ? 'பழைய ஏற்பாடு' : 'Old Testament'}</span>
            </button>

            <button
              className={`segmented-filter-tab ${testamentFilter === 'NT' && !fromBookId ? 'active' : ''}`}
              onClick={() => {
                setTestamentFilter('NT');
                setFromBookId(undefined);
                setToBookId(undefined);
                setShowBookRange(false);
              }}
            >
              <BookOpen size={14} />
              <span>{language === 'ta' ? 'புதிய ஏற்பாடு' : 'New Testament'}</span>
            </button>

            <button
              className={`segmented-filter-tab ${showBookRange || (fromBookId && toBookId) ? 'active' : ''}`}
              onClick={() => setShowBookRange(!showBookRange)}
            >
              <SlidersHorizontal size={14} />
              <span>{language === 'ta' ? 'புத்தகத் தெரிவு' : 'Book Range'}</span>
            </button>

            <button
              className="segmented-filter-tab language-tab"
              onClick={cycleLanguage}
              title="Switch Language"
            >
              <Globe size={14} />
              <span>
                {language === 'ta' ? 'தமிழ்' : language === 'en' ? 'English' : 'இணை (Parallel)'}
              </span>
            </button>
          </div>

          {/* Mobile Phone Filter Layout (<= 640px: 2 Rows, Zero Scroll) */}
          <div className="mobile-responsive-filter-grid">
            {/* Row 1: 3-Segment Testament Control */}
            <div className="mobile-segmented-row">
              <button
                className={`mobile-seg-btn ${!testamentFilter && !fromBookId && !toBookId ? 'active' : ''}`}
                onClick={() => {
                  setTestamentFilter(undefined);
                  setFromBookId(undefined);
                  setToBookId(undefined);
                  setShowBookRange(false);
                }}
              >
                <span>{language === 'ta' ? 'அனைத்தும்' : 'All'}</span>
              </button>
              <button
                className={`mobile-seg-btn ${testamentFilter === 'OT' && !fromBookId ? 'active' : ''}`}
                onClick={() => {
                  setTestamentFilter('OT');
                  setFromBookId(undefined);
                  setToBookId(undefined);
                  setShowBookRange(false);
                }}
              >
                <span>{language === 'ta' ? 'பழைய' : 'OT'}</span>
              </button>
              <button
                className={`mobile-seg-btn ${testamentFilter === 'NT' && !fromBookId ? 'active' : ''}`}
                onClick={() => {
                  setTestamentFilter('NT');
                  setFromBookId(undefined);
                  setToBookId(undefined);
                  setShowBookRange(false);
                }}
              >
                <span>{language === 'ta' ? 'புதிய' : 'NT'}</span>
              </button>
            </div>

            {/* Row 2: Book Range & Language Switcher */}
            <div className="mobile-actions-row">
              <button
                className={`mobile-action-btn ${showBookRange || (fromBookId && toBookId) ? 'active' : ''}`}
                onClick={() => setShowBookRange(!showBookRange)}
              >
                <SlidersHorizontal size={14} />
                <span>{language === 'ta' ? 'புத்தகத் தெரிவு' : 'Books'}</span>
              </button>

              <button
                className="mobile-action-btn language-action"
                onClick={cycleLanguage}
              >
                <Globe size={14} />
                <span>{language === 'ta' ? 'தமிழ்' : 'English'}</span>
              </button>
            </div>
          </div>

          {/* Smooth Animated Book Range Selective Filter (Row 2 Card) */}
          {showBookRange && (
            <div className="book-range-filter-container">
              <CustomBookSelect
                value={fromBookId}
                placeholder={language === 'ta' ? 'முதல் புத்தகம்...' : 'From Book...'}
                books={books}
                language={language}
                alignRight={false}
                onChange={(id) => setFromBookId(id)}
              />

              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500, flexShrink: 0 }}>
                {language === 'ta' ? 'முதல்' : 'to'}
              </span>

              <CustomBookSelect
                value={toBookId}
                placeholder={language === 'ta' ? 'வரை...' : 'To Book...'}
                books={books}
                language={language}
                alignRight={true}
                onChange={(id) => setToBookId(id)}
              />

              {(fromBookId || toBookId) && (
                <button
                  className="btn-icon"
                  onClick={() => {
                    setFromBookId(undefined);
                    setToBookId(undefined);
                  }}
                  title="Reset Book Filter"
                  style={{ width: '1.75rem', height: '1.75rem', flexShrink: 0 }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Body: Active/Preserved Results / Non-Deletable Opened Verses History */}
        <div
          className="modal-body"
          ref={resultContainerRef}
          onScroll={handleScroll}
          style={{ flex: 1, overflowY: 'auto' }}
        >
          {loading ? (
            <LoadingState message={language === 'ta' ? 'தேடுகிறது...' : 'Searching...'} />
          ) : isSubmitted && results.length === 0 ? (
            /* No Results State */
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
              <BookOpen size={36} style={{ margin: '0 auto 0.75rem', color: 'var(--text-muted)' }} />
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                {language === 'ta' ? 'தேடல் முடிவுகள் இல்லை' : 'No results found'}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {language === 'ta'
                  ? 'வேறு வார்த்தை அல்லது வசன குறிப்பை முயற்சிக்கவும் (எ.கா: அன்பு, anbu, யோவான் 3:16).'
                  : 'Try searching another word or reference (e.g. love, anbu, John 3:16).'}
              </p>
            </div>
          ) : results.length > 0 ? (
            /* Active / Preserved Search Verse Results List */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.625rem 0.375rem' }}>
              <div
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  marginBottom: '0.25rem',
                  padding: '0 0.25rem'
                }}
              >
                <span>
                  {results.length} {language === 'ta' ? 'முடிவுகள்' : 'results'}
                </span>
              </div>

              {visibleResults.map((res, index) => (
                <SearchResultCard
                  key={`${res.book_id}_${res.chapter}_${res.verse}`}
                  res={res}
                  isHighlighted={index === highlightedIndex}
                  query={query}
                  language={language}
                  onSelect={handleSelectResult}
                />
              ))}
            </div>
          ) : openedVerses.length > 0 ? (
            /* Permanent Non-Deletable Recently Opened Verses History (Full Title on Desktop, Compact on Mobile) */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.625rem 0.375rem' }}>
              <div
                style={{
                  marginBottom: '0.25rem',
                  padding: '0 0.25rem 0.375rem',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)'
                }}
              >
                <span>{language === 'ta' ? 'இறுதியாகத் திறக்கப்பட்ட வசனங்கள்' : 'Recently Opened Verses'}</span>
              </div>

              {openedVerses.map((res) => (
                <SearchResultCard
                  key={`opened_${res.book_id}_${res.chapter}_${res.verse}`}
                  res={res}
                  isHighlighted={false}
                  query=""
                  language={language}
                  onSelect={handleSelectResult}
                />
              ))}
            </div>
          ) : (
            /* Clean Initial Search State (Before any search or opened verses) */
            <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-secondary)' }}>
              <Search size={40} style={{ margin: '0 auto 1rem', color: 'var(--accent-color)', opacity: 0.8 }} />
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                {language === 'ta' ? 'வேதாகமத் தேடல்' : 'Scripture Search'}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto' }}>
                {language === 'ta'
                  ? 'வசனங்கள், வார்த்தைகள் அல்லது யோவான் 3:16 போன்ற வசனக் குறிப்புகளைத் தேட மேலே உள்ள பெட்டியில் தட்டச்சு செய்க.'
                  : 'Type words, themes, or references like John 3:16 in the box above to search.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
