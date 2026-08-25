import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, ArrowRight, Clock, Trash2, SlidersHorizontal, ArrowUpLeft } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { useAuth } from '../../context/AuthContext';
import { SearchResult, Testament, BibleVerse } from '../../types/bible';
import { searchBibleVerses, getBibleWordSuggestions } from '../../services/searchService';
import { getChapterVerses } from '../../services/csvBibleService';
import { trackActivity } from '../../services/activityService';
import { LoadingState } from '../common/LoadingState';

const SEARCH_HISTORY_KEY = 'bible_app_search_history';
const MAX_SEARCH_HISTORY = 10;

export const SearchModal: React.FC = () => {
  const {
    books,
    currentBook,
    currentChapter,
    language,
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
  const [defaultChapterVerses, setDefaultChapterVerses] = useState<BibleVerse[]>([]);

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
  const suggestionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Load search history & current chapter default verses
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (raw) {
        setSearchHistory(JSON.parse(raw));
      }
    } catch (err) {
      console.error('Error loading search history:', err);
    }
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      const defaultVerses = getChapterVerses(currentBook.id, currentChapter);
      setDefaultChapterVerses(defaultVerses);
    }
  }, [isSearchOpen, currentBook, currentChapter]);

  // Auto-scroll highlighted suggestion row into view when navigating with keyboard (↓ / ↑)
  useEffect(() => {
    if (suggestionHighlightIndex >= 0 && suggestionRefs.current[suggestionHighlightIndex]) {
      suggestionRefs.current[suggestionHighlightIndex]?.scrollIntoView({
        block: 'nearest'
      });
    }
  }, [suggestionHighlightIndex]);

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
      return updated;
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (err) {
      console.error('Error clearing search history:', err);
    }
  };

  // Click outside listener: closes floating suggestions AND unfocuses input box
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
      setShowSuggestions(false);
      setIsSubmitted(false);
      setResults([]);
      setSuggestionHighlightIndex(-1);
      return;
    }

    // Generate up to 45 matching words from the entire Bible dataset
    const wordSuggestions = getBibleWordSuggestions(trimmed, 45);
    setSuggestions(wordSuggestions);

    if (!isSubmitted && wordSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [query, isSubmitted]);

  // Execute full verse search ONLY when user submits or selects a search filter/suggestion
  const executeVerseSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 1) return;

    setShowSuggestions(false);
    setIsSubmitted(true);
    setLoading(true);

    searchBibleVerses(trimmed, language, testamentFilter, fromBookId, toBookId).then((res) => {
      setResults(res);
      setLoading(false);
      setHighlightedIndex(0);
      if (userId) {
        trackActivity(userId, 'SEARCH_PERFORMED', undefined, undefined, undefined, { query: trimmed, count: res.length });
      }
    });
  };

  // Re-run search if user changes filter options (OT/NT/Book Range) while results are shown
  useEffect(() => {
    if (isSubmitted && query.trim()) {
      executeVerseSearch(query);
    }
  }, [testamentFilter, fromBookId, toBookId]);

  if (!isSearchOpen) return null;

  const handleClose = () => {
    setIsSearchOpen(false);
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setIsSubmitted(false);
  };

  const handleSelectResult = (res: SearchResult | BibleVerse) => {
    saveToHistory(query || currentBook.code);
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
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSuggestionHighlightIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSuggestionHighlightIndex((prev) => (prev > 0 ? prev - 1 : -1));
        return;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (suggestionHighlightIndex >= 0 && suggestions[suggestionHighlightIndex]) {
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

  // Helper to highlight match substring inside verse text
  const renderHighlightedText = (text: string, searchTerm: string) => {
    if (!searchTerm || !searchTerm.trim()) return text;

    const trimmed = searchTerm.normalize('NFC').trim();
    const lowerSearch = trimmed.toLowerCase();
    const rawTokens = lowerSearch.split(/\s+/).filter((t) => t.length >= 1);

    const termsToMatch = new Set<string>();
    termsToMatch.add(trimmed);

    rawTokens.forEach((t) => termsToMatch.add(t));

    const escapedTerms = Array.from(termsToMatch)
      .filter((t) => t.length > 0)
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');

    if (!escapedTerms) return text;

    const regex = new RegExp(`(${escapedTerms})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="search-match-mark">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="search-modal-overlay" onClick={handleClose}>
      <div
        className="search-modal-content"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header Search Input with Floating Suggestions Popover Dropdown */}
        <div className="modal-header" style={{ padding: '0.875rem 1.25rem', position: 'relative', zIndex: 150 }}>
          <div ref={searchBoxRef} style={{ position: 'relative', flex: 1 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '0.625rem',
                padding: '0.625rem 0.875rem',
                border: '1px solid var(--border-color)'
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
                onFocus={() => setShowSuggestions(true)}
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
                  style={{ width: '1.75rem', height: '1.75rem' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* FLOATING Popover Box attached directly under Search Input Box (Overlays Filters) */}
            {showSuggestions && (
              <div className="search-suggestions-dropdown">
                {!query.trim() ? (
                  /* When search box is clicked with no text, show Search History inside Floating Box! */
                  searchHistory.length > 0 ? (
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: 'var(--accent-color)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Clock size={13} />
                          <span>{language === 'ta' ? 'சமீபத்திய தேடல்கள்' : 'Recent Searches'}</span>
                        </div>
                        <button
                          onClick={clearHistory}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={12} />
                          {language === 'ta' ? 'அழி' : 'Clear'}
                        </button>
                      </div>
                      {searchHistory.map((item, idx) => (
                        <div
                          key={item}
                          ref={(el) => (suggestionRefs.current[idx] = el)}
                          className={`search-suggestion-row ${idx === suggestionHighlightIndex ? 'active' : ''}`}
                          onClick={() => handleSelectSuggestion(item)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Clock size={15} style={{ color: 'var(--text-muted)' }} />
                            <span style={{ fontWeight: 500 }}>{item}</span>
                          </div>
                          <ArrowUpLeft size={14} style={{ color: 'var(--text-muted)' }} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '0.875rem', fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                      {language === 'ta' ? 'வேதாகமத்தில் தேட தட்டச்சு செய்க...' : 'Type to search Scripture...'}
                    </div>
                  )
                ) : suggestions.length > 0 ? (
                  /* When typing, show all Bible Word Suggestions inside Floating Box! */
                  <div>
                    {suggestions.map((sug, idx) => (
                      <div
                        key={sug}
                        ref={(el) => (suggestionRefs.current[idx] = el)}
                        className={`search-suggestion-row ${idx === suggestionHighlightIndex ? 'active' : ''}`}
                        onClick={() => handleSelectSuggestion(sug)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <Search size={15} style={{ color: 'var(--text-muted)' }} />
                          <span style={{ fontWeight: 500 }}>{sug}</span>
                        </div>
                        <ArrowUpLeft size={14} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <button className="btn-icon" onClick={handleClose} style={{ marginLeft: '0.5rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Filter Pills with High Contrast Active Highlighting */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-surface)',
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: 10
          }}
        >
          <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
            <button
              className={`btn-pill ${!testamentFilter && !fromBookId && !toBookId ? 'active' : ''}`}
              onClick={() => {
                setTestamentFilter(undefined);
                setFromBookId(undefined);
                setToBookId(undefined);
                setShowBookRange(false);
              }}
            >
              {language === 'ta' ? 'அனைத்தும்' : 'All'}
            </button>
            <button
              className={`btn-pill ${testamentFilter === 'OT' && !fromBookId ? 'active' : ''}`}
              onClick={() => {
                setTestamentFilter('OT');
                setFromBookId(undefined);
                setToBookId(undefined);
                setShowBookRange(false);
              }}
            >
              {language === 'ta' ? 'பழைய ஏற்பாடு' : 'Old Testament'}
            </button>
            <button
              className={`btn-pill ${testamentFilter === 'NT' && !fromBookId ? 'active' : ''}`}
              onClick={() => {
                setTestamentFilter('NT');
                setFromBookId(undefined);
                setToBookId(undefined);
                setShowBookRange(false);
              }}
            >
              {language === 'ta' ? 'புதிய ஏற்பாடு' : 'New Testament'}
            </button>
          </div>

          <button
            className={`btn-pill ${showBookRange || (fromBookId && toBookId) ? 'active' : ''}`}
            onClick={() => setShowBookRange(!showBookRange)}
          >
            <SlidersHorizontal size={13} />
            {language === 'ta' ? 'புத்தகத் தெரிவு' : 'Book Range'}
          </button>
        </div>

        {/* Expandable Book Range Selective Filter */}
        {showBookRange && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 1.25rem',
              backgroundColor: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-color)',
              flexWrap: 'wrap',
              position: 'relative',
              zIndex: 10
            }}
          >
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {language === 'ta' ? 'புத்தகம்:' : 'Range:'}
            </span>
            <select
              className="search-filter-select"
              value={fromBookId || ''}
              onChange={(e) => setFromBookId(e.target.value ? parseInt(e.target.value, 10) : undefined)}
            >
              <option value="">{language === 'ta' ? 'முதல் புத்தகம்...' : 'From Book...'}</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {language === 'ta' ? b.name_ta : b.name_en}
                </option>
              ))}
            </select>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {language === 'ta' ? 'முதல்' : 'to'}
            </span>
            <select
              className="search-filter-select"
              value={toBookId || ''}
              onChange={(e) => setToBookId(e.target.value ? parseInt(e.target.value, 10) : undefined)}
            >
              <option value="">{language === 'ta' ? 'வரை...' : 'To Book...'}</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {language === 'ta' ? b.name_ta : b.name_en}
                </option>
              ))}
            </select>
            {(fromBookId || toBookId) && (
              <button
                className="btn-icon"
                onClick={() => {
                  setFromBookId(undefined);
                  setToBookId(undefined);
                }}
                title="Reset Book Filter"
                style={{ width: '1.75rem', height: '1.75rem' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* Modal Body: Verse Results / Default Chapter Verses */}
        <div className="modal-body" ref={resultContainerRef} style={{ flex: 1, overflowY: 'auto' }}>
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
          ) : isSubmitted && results.length > 0 ? (
            /* Search Verse Results List */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', padding: '1.25rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
                  marginBottom: '0.25rem'
                }}
              >
                <span>
                  {results.length} {language === 'ta' ? 'முடிவுகள் கண்டறியப்பட்டன' : 'results found'}
                </span>
                <span style={{ fontSize: '0.75rem' }}>
                  Use <kbd className="shortcut-kbd">↑</kbd> <kbd className="shortcut-kbd">↓</kbd> to navigate, <kbd className="shortcut-kbd">Enter</kbd> to select
                </span>
              </div>

              {results.map((res, index) => {
                const bookName = language === 'ta' ? res.book_name_ta : res.book_name_en;
                const text = language === 'ta' ? res.text_ta : res.text_en;
                const isHighlighted = index === highlightedIndex;

                return (
                  <div
                    key={`${res.book_id}_${res.chapter}_${res.verse}`}
                    onClick={() => handleSelectResult(res)}
                    className={`search-result-card ${isHighlighted ? 'active' : ''}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--accent-color)' }}>
                        {bookName} {res.chapter}:{res.verse}
                      </span>
                      <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
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
              })}
            </div>
          ) : (
            /* Default State (Before Searching): Shows Current Chapter Verses */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', padding: '1.25rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
                  marginBottom: '0.25rem',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '0.5rem'
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {language === 'ta' ? 'தற்போது வாசிக்கும் அத்தியாயம்:' : 'Current Reading Chapter:'}{' '}
                  <span style={{ color: 'var(--accent-color)' }}>
                    {language === 'ta' ? currentBook.name_ta : currentBook.name_en} {currentChapter}
                  </span>
                </span>
                <span style={{ fontSize: '0.75rem' }}>
                  {defaultChapterVerses.length} {language === 'ta' ? 'வசனங்கள்' : 'verses'}
                </span>
              </div>

              {defaultChapterVerses.map((v) => {
                const text = language === 'ta' ? v.text_ta : v.text_en;
                const bookName = language === 'ta' ? currentBook.name_ta : currentBook.name_en;

                return (
                  <div
                    key={`${v.book_id}_${v.chapter}_${v.verse}`}
                    onClick={() => handleSelectResult(v)}
                    className="search-result-card"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--accent-color)' }}>
                        {bookName} {v.chapter}:{v.verse}
                      </span>
                      <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <div
                      style={{
                        fontSize: '0.9375rem',
                        color: 'var(--text-primary)',
                        fontFamily: language === 'ta' ? 'var(--font-tamil)' : 'var(--font-serif)',
                        lineHeight: 1.6
                      }}
                    >
                      {text}
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
