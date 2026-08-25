import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, ArrowRight, Clock, Trash2, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { useAuth } from '../../context/AuthContext';
import { SearchResult, Testament } from '../../types/bible';
import { searchBibleVerses, getBibleWordSuggestions } from '../../services/searchService';
import { trackActivity } from '../../services/activityService';
import { LoadingState } from '../common/LoadingState';

const SEARCH_HISTORY_KEY = 'bible_app_search_history';
const MAX_SEARCH_HISTORY = 8;

export const SearchModal: React.FC = () => {
  const {
    books,
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
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Filter States
  const [testamentFilter, setTestamentFilter] = useState<Testament | undefined>(undefined);
  const [showBookRange, setShowBookRange] = useState<boolean>(false);
  const [fromBookId, setFromBookId] = useState<number | undefined>(undefined);
  const [toBookId, setToBookId] = useState<number | undefined>(undefined);

  const [loading, setLoading] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const resultContainerRef = useRef<HTMLDivElement | null>(null);

  // Load search history from localStorage
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

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // Live Auto-complete & Search Execution Effect
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setSuggestions([]);
      setLoading(false);
      setHighlightedIndex(0);
      return;
    }

    // 1. Fetch live Bible word suggestions for prefix
    const wordSuggestions = getBibleWordSuggestions(trimmed, 6);
    setSuggestions(wordSuggestions.filter((w) => w.toLowerCase() !== trimmed.toLowerCase()));

    // 2. Perform main search with instant response (50ms debounce)
    setLoading(true);
    const timer = setTimeout(() => {
      searchBibleVerses(query, language, testamentFilter, fromBookId, toBookId).then((res) => {
        setResults(res);
        setLoading(false);
        setHighlightedIndex(0);
        if (userId) {
          trackActivity(userId, 'SEARCH_PERFORMED', undefined, undefined, undefined, { query, count: res.length });
        }
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [query, language, testamentFilter, fromBookId, toBookId, userId]);

  if (!isSearchOpen) return null;

  const handleClose = () => {
    setIsSearchOpen(false);
    setQuery('');
    setResults([]);
    setSuggestions([]);
  };

  const handleSelectResult = (res: SearchResult) => {
    saveToHistory(query);
    const targetBook = books.find((b) => b.id === res.book_id);
    if (targetBook) {
      setBookAndChapter(targetBook, res.chapter, res.verse);
      handleClose();
    }
  };

  const handleSelectSuggestion = (word: string) => {
    setQuery(word);
    saveToHistory(word);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;

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
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px' }}
        onKeyDown={handleKeyDown}
      >
        {/* Header Search Input */}
        <div className="modal-header" style={{ padding: '0.75rem 1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flex: 1,
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '0.5rem',
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--border-color)'
            }}
          >
            <Search size={18} style={{ color: 'var(--accent-color)' }} />
            <input
              ref={inputRef}
              type="text"
              placeholder={
                language === 'ta'
                  ? 'தேடுங்கள்... அன்பு, anbu, யோவான் 3:16, 1 சாமுவேல் 7:1'
                  : 'Search... love, anbu, John 3:16, 1 Sam 7:1'
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: '100%', fontSize: '0.9375rem', color: 'var(--text-primary)', background: 'transparent' }}
            />
            {query && (
              <button className="btn-icon" onClick={() => setQuery('')} style={{ width: '1.75rem', height: '1.75rem' }}>
                <X size={14} />
              </button>
            )}
          </div>
          <button className="btn-icon" onClick={handleClose} style={{ marginLeft: '0.5rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Live Auto-Complete Suggestions Bar */}
        {suggestions.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-color)',
              overflowX: 'auto'
            }}
          >
            <Sparkles size={13} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0 }}>
              {language === 'ta' ? 'பரிந்துரைகள்:' : 'Suggestions:'}
            </span>
            {suggestions.map((sug) => (
              <button
                key={sug}
                onClick={() => handleSelectSuggestion(sug)}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '0.25rem',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--accent-color)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        {/* Filter Pills with High Contrast Active Highlighting */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            padding: '0.625rem 1rem',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-surface)',
            flexWrap: 'wrap'
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
              padding: '0.625rem 1rem',
              backgroundColor: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-color)',
              flexWrap: 'wrap'
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

        {/* Modal Body */}
        <div className="modal-body" ref={resultContainerRef}>
          {loading ? (
            <LoadingState message={language === 'ta' ? 'தேடுகிறது...' : 'Searching...'} />
          ) : query.trim() && results.length === 0 ? (
            /* No Results State */
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
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
          ) : !query.trim() ? (
            /* Empty State: Shows Search History */
            <div style={{ padding: '1.25rem 1rem' }}>
              {searchHistory.length > 0 ? (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-color)' }}>
                      <Clock size={15} />
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
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {searchHistory.map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          setQuery(item);
                          saveToHistory(item);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '9999px',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.8125rem',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <BookOpen size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {language === 'ta' ? 'தேட விரும்புவதைத் தட்டச்சு செய்க' : 'Type to search Scripture'}
                  </p>
                  <p style={{ fontSize: '0.8125rem' }}>
                    {language === 'ta'
                      ? 'தமிழ், ஆங்கிலம், Tanglish அல்லது வசனக் குறிப்புகள் (John 3:16)'
                      : 'Search in Tamil, English, Tanglish, or reference (e.g. John 3:16)'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Results List */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
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
          )}
        </div>
      </div>
    </div>
  );
};
