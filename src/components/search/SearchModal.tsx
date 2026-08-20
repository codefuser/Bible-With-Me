import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, ArrowRight } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { SearchResult, Testament } from '../../types/bible';
import { searchBibleVerses } from '../../services/searchService';
import { LoadingState } from '../common/LoadingState';

export const SearchModal: React.FC = () => {
  const {
    books,
    language,
    isSearchOpen,
    setIsSearchOpen,
    setBookAndChapter
  } = useReading();

  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [testamentFilter, setTestamentFilter] = useState<Testament | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const resultContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      setHighlightedIndex(0);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      searchBibleVerses(query, language, testamentFilter).then((res) => {
        setResults(res);
        setLoading(false);
        setHighlightedIndex(0);
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [query, language, testamentFilter]);

  if (!isSearchOpen) return null;

  const handleClose = () => {
    setIsSearchOpen(false);
    setQuery('');
    setResults([]);
  };

  const handleSelectResult = (res: SearchResult) => {
    const targetBook = books.find((b) => b.id === res.book_id);
    if (targetBook) {
      setBookAndChapter(targetBook, res.chapter, res.verse);
      handleClose();
    }
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
    if (!searchTerm || searchTerm.length < 2) return text;

    const lowerSearch = searchTerm.toLowerCase().trim();
    const rawTokens = lowerSearch.split(/\s+/).filter((t) => t.length >= 2);
    const termsToMatch = new Set<string>();
    termsToMatch.add(searchTerm.trim());
    rawTokens.forEach((t) => termsToMatch.add(t));

    const escapedTerms = Array.from(termsToMatch)
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
        <div className="modal-header" style={{ padding: '0.75rem 1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flex: 1,
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '0.5rem',
              padding: '0.5rem 0.75rem'
            }}
          >
            <Search size={18} style={{ color: 'var(--text-muted)' }} />
            <input
              ref={inputRef}
              type="text"
              placeholder={
                language === 'ta'
                  ? 'தேடுங்கள்... அன்பு, anbu, யோவான் 3:16, John 3:16'
                  : 'Search... love, anbu, John 3:16, yovan 3:16'
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: '100%', fontSize: '0.9375rem', color: 'var(--text-primary)' }}
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

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-surface)'
          }}
        >
          <button
            className={`btn-pill ${!testamentFilter ? 'active' : ''}`}
            onClick={() => setTestamentFilter(undefined)}
            style={{ fontSize: '0.8125rem' }}
          >
            {language === 'ta' ? 'அனைத்தும்' : 'All'}
          </button>
          <button
            className={`btn-pill ${testamentFilter === 'OT' ? 'active' : ''}`}
            onClick={() => setTestamentFilter('OT')}
            style={{ fontSize: '0.8125rem' }}
          >
            {language === 'ta' ? 'பழைய ஏற்பாடு' : 'Old Testament'}
          </button>
          <button
            className={`btn-pill ${testamentFilter === 'NT' ? 'active' : ''}`}
            onClick={() => setTestamentFilter('NT')}
            style={{ fontSize: '0.8125rem' }}
          >
            {language === 'ta' ? 'புதிய ஏற்பாடு' : 'New Testament'}
          </button>
        </div>

        <div className="modal-body" ref={resultContainerRef}>
          {loading ? (
            <LoadingState message={language === 'ta' ? 'தேடுகிறது...' : 'Searching...'} />
          ) : query.trim().length >= 2 && results.length === 0 ? (
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
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
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
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
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
                    <div style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontFamily: language === 'ta' ? 'var(--font-tamil)' : 'var(--font-serif)', lineHeight: 1.6 }}>
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
