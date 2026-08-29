import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Sun, Moon, BookOpen, Check, Type, MoreVertical, Sliders, Globe, Layout, User, ChevronDown } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { FontSizeOption, LineHeightOption, MaxWidthOption, TamilFontOption, EnglishFontOption } from '../../types/bible';
import { AccountPanel } from '../auth/AccountPanel';

interface FontItem<T> {
  id: T;
  label: string;
  preview: string;
  fontVar: string;
}

interface CustomFontSelectProps<T> {
  selectedId: T;
  options: FontItem<T>[];
  label: string;
  onChange: (id: T) => void;
}

function CustomFontSelect<T extends string>({ selectedId, options, label, onChange }: CustomFontSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedFont = options.find((o) => o.id === selectedId) || options[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%', marginBottom: '1rem' }}>
      <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.4375rem' }}>
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.625rem 0.875rem',
          borderRadius: '0.625rem',
          border: '1.5px solid var(--accent-color)',
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          transition: 'all 150ms ease',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
          <span style={{ fontSize: '0.90625rem', fontWeight: 700, color: 'var(--accent-color)' }}>
            {selectedFont.label}
          </span>
          <span
            style={{
              fontFamily: selectedFont.fontVar,
              fontSize: '0.9375rem',
              color: 'var(--text-primary)',
              opacity: 0.9,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            — {selectedFont.preview}
          </span>
        </div>
        <ChevronDown size={18} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease', color: 'var(--accent-color)', flexShrink: 0 }} />
      </button>

      {/* MS Word / PowerPoint Style Font Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.375rem)',
            left: 0,
            right: 0,
            zIndex: 300,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '0.75rem',
            padding: '0.375rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            maxHeight: '260px',
            overflowY: 'auto'
          }}
        >
          {options.map((font) => {
            const isSelected = font.id === selectedId;
            return (
              <button
                key={font.id}
                type="button"
                onClick={() => {
                  onChange(font.id);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  backgroundColor: isSelected ? 'var(--accent-soft)' : 'transparent',
                  color: isSelected ? 'var(--accent-color)' : 'var(--text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 120ms ease',
                  marginBottom: '0.125rem'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: isSelected ? 'var(--accent-color)' : 'var(--text-muted)' }}>
                    {font.label}
                  </span>
                  {/* Real Font Face Preview inside Dropdown List */}
                  <span
                    style={{
                      fontFamily: font.fontVar,
                      fontSize: '1rem',
                      color: 'var(--text-primary)',
                      lineHeight: 1.3
                    }}
                  >
                    {font.preview}
                  </span>
                </div>
                {isSelected && <Check size={16} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const PreferencesModal: React.FC = () => {
  const {
    preferences,
    updatePreferences,
    language,
    setLanguage,
    isPreferencesOpen,
    setIsPreferencesOpen,
    currentBook,
    currentChapter
  } = useReading();

  if (!isPreferencesOpen) return null;

  const isEn = language === 'en';
  const isTa = language === 'ta';

  const handleReturnHome = () => {
    setIsPreferencesOpen(false);
  };

  // Expanded Tamil Fonts Library
  const tamilFonts: FontItem<TamilFontOption>[] = [
    { id: 'noto', label: 'Noto Sans Tamil', preview: 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்', fontVar: 'var(--font-ta-noto)' },
    { id: 'mukta', label: 'Mukta Malar', preview: 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்', fontVar: 'var(--font-ta-mukta)' },
    { id: 'catamaran', label: 'Catamaran', preview: 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்', fontVar: 'var(--font-ta-catamaran)' },
    { id: 'arima', label: 'Arima Display', preview: 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்', fontVar: 'var(--font-ta-arima)' },
    { id: 'hind', label: 'Hind Madurai', preview: 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்', fontVar: 'var(--font-ta-hind)' },
    { id: 'anek', label: 'Anek Tamil', preview: 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்', fontVar: 'var(--font-ta-anek)' },
    { id: 'serif', label: 'Noto Serif Tamil', preview: 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்', fontVar: 'var(--font-ta-serif)' },
    { id: 'kavi', label: 'Kavivanar Script', preview: 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்', fontVar: 'var(--font-ta-kavi)' },
    { id: 'baloo', label: 'Baloo Thambi Bold', preview: 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்', fontVar: 'var(--font-ta-baloo)' }
  ];

  // Expanded English Fonts Library
  const englishFonts: FontItem<EnglishFontOption>[] = [
    { id: 'lora', label: 'Lora Classic Serif', preview: 'The Lord is my shepherd; I shall not want.', fontVar: 'var(--font-en-lora)' },
    { id: 'inter', label: 'Inter Modern Sans', preview: 'The Lord is my shepherd; I shall not want.', fontVar: 'var(--font-en-inter)' },
    { id: 'merriweather', label: 'Merriweather Serif', preview: 'The Lord is my shepherd; I shall not want.', fontVar: 'var(--font-en-merriweather)' },
    { id: 'outfit', label: 'Outfit Clean Sans', preview: 'The Lord is my shepherd; I shall not want.', fontVar: 'var(--font-en-outfit)' },
    { id: 'playfair', label: 'Playfair Display Serif', preview: 'The Lord is my shepherd; I shall not want.', fontVar: 'var(--font-en-playfair)' },
    { id: 'roboto', label: 'Roboto Sans', preview: 'The Lord is my shepherd; I shall not want.', fontVar: 'var(--font-en-roboto)' }
  ];

  // Font Size Slider Array
  const fontSizeOptions: FontSizeOption[] = ['sm', 'md', 'lg', 'xl'];
  const fontSizeLabels: Record<FontSizeOption, { label: string; px: string }> = {
    sm: { label: isEn ? 'Small' : 'சிறியது', px: '15px' },
    md: { label: isEn ? 'Medium' : 'நடுத்தரம்', px: '18px' },
    lg: { label: isEn ? 'Large' : 'பெரியது', px: '21px' },
    xl: { label: isEn ? 'Extra Large' : 'மிகப்பெரியது', px: '24px' }
  };
  const currentFontSizeIndex = fontSizeOptions.indexOf(preferences.fontSize || 'md');

  // Line Height Slider Array
  const lineHeightOptions: LineHeightOption[] = ['normal', 'relaxed', 'loose'];
  const lineHeightLabels: Record<LineHeightOption, { label: string; mult: string }> = {
    normal: { label: isEn ? 'Normal' : 'சாதாரண', mult: '1.6x' },
    relaxed: { label: isEn ? 'Relaxed' : 'சீராக', mult: '1.8x' },
    loose: { label: isEn ? 'Loose' : 'அகலமாக', mult: '2.1x' }
  };
  const currentLineHeightIndex = lineHeightOptions.indexOf(preferences.lineHeight || 'normal');

  // Page Width Slider Array
  const maxWidthOptions: MaxWidthOption[] = ['compact', 'standard', 'wide'];
  const maxWidthLabels: Record<MaxWidthOption, { label: string; width: string }> = {
    compact: { label: isEn ? 'Compact' : 'செறிவான', width: '720px' },
    standard: { label: isEn ? 'Standard' : 'சாதாரண', width: '840px' },
    wide: { label: isEn ? 'Wide' : 'அகலமான', width: '1000px' }
  };
  const currentMaxWidthIndex = maxWidthOptions.indexOf(preferences.maxWidth || 'standard');

  const bookName = isEn ? currentBook.name_en : currentBook.name_ta;

  return (
    <div
      className="preferences-page-section"
      style={{
        maxWidth:
          preferences.maxWidth === 'compact'
            ? 'var(--width-compact)'
            : preferences.maxWidth === 'wide'
            ? 'var(--width-wide)'
            : 'var(--width-standard)',
        margin: '0 auto',
        width: '100%',
        padding: '0.25rem 0 3rem'
      }}
    >
      {/* Top Header Navigation Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.875rem',
          padding: '0.25rem 0.125rem'
        }}
      >
        <button
          onClick={handleReturnHome}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4375rem',
            padding: '0.4375rem 0.875rem',
            borderRadius: '9999px',
            backgroundColor: 'var(--accent-soft)',
            color: 'var(--accent-color)',
            border: '1px solid var(--accent-color)',
            fontWeight: 600,
            fontSize: '0.84375rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 180ms ease'
          }}
          title={isEn ? 'Return to Bible Reader' : 'வேதாகம வாசிப்பிற்குத் திரும்புக'}
        >
          <ArrowLeft size={16} />
          <span>{isEn ? 'Home' : 'முகப்பு'}</span>
        </button>
      </div>

      {/* Large Page Hero Header */}
      <div
        style={{
          marginBottom: '1.25rem',
          padding: '0 0.125rem'
        }}
      >
        <h1
          style={{
            fontSize: '1.3125rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            margin: '0 0 0.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            letterSpacing: '-0.01em'
          }}
        >
          <Sliders size={22} style={{ color: 'var(--accent-color)' }} />
          <span>{isEn ? 'Reading Preferences' : 'வாசிப்பு விருப்பத்தேர்வுகள்'}</span>
        </h1>
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            margin: 0
          }}
        >
          {isEn
            ? 'Customize theme, font styles, sizes, and verse action layouts'
            : 'வேதாகமத் தோற்றம், எழுத்து பாணி, அளவு மற்றும் வசன அமைப்புகளை மாற்றியமைக்கவும்'}
        </p>
      </div>

      {/* Main Settings Grouped Cards Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Group 1: Appearance & Theme */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '1rem',
            padding: '1.125rem 1.25rem',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
          }}
        >
          <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
            <Sun size={15} style={{ color: 'var(--accent-color)' }} />
            <span>{isEn ? 'Appearance & Theme' : 'தோற்றம் & தீம்'}</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button
              className={`btn-card ${preferences.theme === 'light' ? 'selected' : ''}`}
              onClick={() => updatePreferences({ theme: 'light' })}
              aria-pressed={preferences.theme === 'light'}
              style={{
                padding: '0.625rem 0.5rem',
                borderRadius: '0.625rem',
                border: preferences.theme === 'light' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                backgroundColor: preferences.theme === 'light' ? 'var(--accent-soft)' : '#ffffff',
                color: '#1c1d1f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: preferences.theme === 'light' ? 700 : 500
              }}
            >
              {preferences.theme === 'light' ? <Check size={16} style={{ color: 'var(--accent-color)' }} /> : <Sun size={16} />}
              <span>{isEn ? 'Light' : 'வெளிச்சம்'}</span>
            </button>

            <button
              className={`btn-card ${preferences.theme === 'sepia' ? 'selected' : ''}`}
              onClick={() => updatePreferences({ theme: 'sepia' })}
              aria-pressed={preferences.theme === 'sepia'}
              style={{
                padding: '0.625rem 0.5rem',
                borderRadius: '0.625rem',
                border: preferences.theme === 'sepia' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                backgroundColor: '#fbf5e8',
                color: '#3b3226',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: preferences.theme === 'sepia' ? 700 : 500
              }}
            >
              {preferences.theme === 'sepia' ? <Check size={16} style={{ color: 'var(--accent-color)' }} /> : <BookOpen size={16} />}
              <span>{isEn ? 'Sepia' : 'செபியா'}</span>
            </button>

            <button
              className={`btn-card ${preferences.theme === 'dark' ? 'selected' : ''}`}
              onClick={() => updatePreferences({ theme: 'dark' })}
              aria-pressed={preferences.theme === 'dark'}
              style={{
                padding: '0.625rem 0.5rem',
                borderRadius: '0.625rem',
                border: preferences.theme === 'dark' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                backgroundColor: '#1e2027',
                color: '#e6e8ec',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: preferences.theme === 'dark' ? 700 : 500
              }}
            >
              {preferences.theme === 'dark' ? <Check size={16} style={{ color: 'var(--accent-color)' }} /> : <Moon size={16} />}
              <span>{isEn ? 'Dark' : 'இருள்'}</span>
            </button>
          </div>
        </div>

        {/* Group 2: Typography & Font Family Dropdowns */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '1rem',
            padding: '1.125rem 1.25rem',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
          }}
        >
          <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.875rem' }}>
            <Type size={15} style={{ color: 'var(--accent-color)' }} />
            <span>{isEn ? 'Typography & Fonts' : 'எழுத்து பாணி & எழுத்துக்கள்'}</span>
          </label>

          {/* Tamil Font Dropdown */}
          {!isEn && (
            <CustomFontSelect
              selectedId={preferences.fontFamilyTa || 'noto'}
              options={tamilFonts}
              label={isEn ? 'Tamil Font Style' : 'தமிழ் எழுத்து பாணி (Font Dropdown)'}
              onChange={(id) => updatePreferences({ fontFamilyTa: id })}
            />
          )}

          {/* English Font Dropdown */}
          {!isTa && (
            <CustomFontSelect
              selectedId={preferences.fontFamilyEn || 'lora'}
              options={englishFonts}
              label={isEn ? 'English Font Style' : 'ஆங்கில எழுத்து பாணி (Font Dropdown)'}
              onChange={(id) => updatePreferences({ fontFamilyEn: id })}
            />
          )}

          {/* Font Size Slider Control */}
          <div style={{ marginTop: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                {isEn ? 'Font Size' : 'எழுத்து அளவு'}
              </span>
              <span style={{ fontWeight: 700, color: 'var(--accent-color)' }}>
                {fontSizeLabels[fontSizeOptions[currentFontSizeIndex]]?.label} ({fontSizeLabels[fontSizeOptions[currentFontSizeIndex]]?.px})
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={3}
              step={1}
              value={currentFontSizeIndex >= 0 ? currentFontSizeIndex : 1}
              onChange={(e) => {
                const idx = Number(e.target.value);
                updatePreferences({ fontSize: fontSizeOptions[idx] });
              }}
              style={{
                width: '100%',
                accentColor: 'var(--accent-color)',
                cursor: 'pointer',
                height: '6px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.71875rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
              <span>{isEn ? 'Small (15px)' : 'சிறிய (15px)'}</span>
              <span>{isEn ? 'Medium (18px)' : 'நடுத்தர (18px)'}</span>
              <span>{isEn ? 'Large (21px)' : 'பெரிய (21px)'}</span>
              <span>{isEn ? 'Extra (24px)' : 'மிகப்பெரிய (24px)'}</span>
            </div>
          </div>

          {/* Line Height Slider Control */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                {isEn ? 'Line Spacing' : 'வரி இடைவெளி'}
              </span>
              <span style={{ fontWeight: 700, color: 'var(--accent-color)' }}>
                {lineHeightLabels[lineHeightOptions[currentLineHeightIndex]]?.label} ({lineHeightLabels[lineHeightOptions[currentLineHeightIndex]]?.mult})
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={2}
              step={1}
              value={currentLineHeightIndex >= 0 ? currentLineHeightIndex : 0}
              onChange={(e) => {
                const idx = Number(e.target.value);
                updatePreferences({ lineHeight: lineHeightOptions[idx] });
              }}
              style={{
                width: '100%',
                accentColor: 'var(--accent-color)',
                cursor: 'pointer',
                height: '6px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.71875rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
              <span>{isEn ? 'Normal (1.6x)' : 'சாதாரண (1.6x)'}</span>
              <span>{isEn ? 'Relaxed (1.8x)' : 'சீராக (1.8x)'}</span>
              <span>{isEn ? 'Loose (2.1x)' : 'அகலமாக (2.1x)'}</span>
            </div>
          </div>

          {/* Page Width Slider Control */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                {isEn ? 'Page Width' : 'பக்க அகலம்'}
              </span>
              <span style={{ fontWeight: 700, color: 'var(--accent-color)' }}>
                {maxWidthLabels[maxWidthOptions[currentMaxWidthIndex]]?.label} ({maxWidthLabels[maxWidthOptions[currentMaxWidthIndex]]?.width})
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={2}
              step={1}
              value={currentMaxWidthIndex >= 0 ? currentMaxWidthIndex : 1}
              onChange={(e) => {
                const idx = Number(e.target.value);
                updatePreferences({ maxWidth: maxWidthOptions[idx] });
              }}
              style={{
                width: '100%',
                accentColor: 'var(--accent-color)',
                cursor: 'pointer',
                height: '6px'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.71875rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
              <span>{isEn ? 'Compact (720px)' : 'செறிவான (720px)'}</span>
              <span>{isEn ? 'Standard (840px)' : 'சாதாரண (840px)'}</span>
              <span>{isEn ? 'Wide (1000px)' : 'அகலமான (1000px)'}</span>
            </div>
          </div>
        </div>

        {/* Group 3: Primary Language */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '1rem',
            padding: '1.125rem 1.25rem',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
          }}
        >
          <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
            <Globe size={15} style={{ color: 'var(--accent-color)' }} />
            <span>{isEn ? 'Primary Language' : 'முதன்மை மொழி'}</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button
              className={`btn-pill ${language === 'ta' ? 'active' : ''}`}
              onClick={() => setLanguage('ta')}
              aria-pressed={language === 'ta'}
              style={{
                justifyContent: 'center',
                fontSize: '0.8125rem',
                padding: '0.5rem 0.25rem',
                border: language === 'ta' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                fontWeight: language === 'ta' ? 700 : 500
              }}
            >
              {language === 'ta' && <Check size={13} />}
              <span>தமிழ்</span>
            </button>

            <button
              className={`btn-pill ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
              aria-pressed={language === 'en'}
              style={{
                justifyContent: 'center',
                fontSize: '0.8125rem',
                padding: '0.5rem 0.25rem',
                border: language === 'en' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                fontWeight: language === 'en' ? 700 : 500
              }}
            >
              {language === 'en' && <Check size={13} />}
              <span>English</span>
            </button>

            <button
              className={`btn-pill ${language === 'parallel' ? 'active' : ''}`}
              onClick={() => setLanguage('parallel')}
              aria-pressed={language === 'parallel'}
              style={{
                justifyContent: 'center',
                fontSize: '0.8125rem',
                padding: '0.5rem 0.25rem',
                border: language === 'parallel' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                fontWeight: language === 'parallel' ? 700 : 500
              }}
            >
              {language === 'parallel' && <Check size={13} />}
              <span>{isEn ? 'Tamil + EN' : 'தமிழ் + ஆங்கிலம்'}</span>
            </button>
          </div>
        </div>

        {/* Group 4: Verse Options Display Style */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '1rem',
            padding: '1.125rem 1.25rem',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
          }}
        >
          <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
            <Layout size={15} style={{ color: 'var(--accent-color)' }} />
            <span>{isEn ? 'Verse Actions Display Style' : 'வசன விருப்பங்கள் காட்டும் முறை'}</span>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <button
              className={`btn-card ${(preferences.verseOptionsStyle || 'dropdown') === 'dropdown' ? 'selected' : ''}`}
              onClick={() => updatePreferences({ verseOptionsStyle: 'dropdown' })}
              aria-pressed={(preferences.verseOptionsStyle || 'dropdown') === 'dropdown'}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.625rem',
                border: (preferences.verseOptionsStyle || 'dropdown') === 'dropdown' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                backgroundColor: (preferences.verseOptionsStyle || 'dropdown') === 'dropdown' ? 'var(--accent-soft)' : 'var(--bg-surface)',
                color: (preferences.verseOptionsStyle || 'dropdown') === 'dropdown' ? 'var(--accent-color)' : 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <MoreVertical size={18} style={{ flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.875rem', fontWeight: (preferences.verseOptionsStyle || 'dropdown') === 'dropdown' ? 700 : 500, display: 'block' }}>
                    {isEn ? 'Dropdown Menu (3-Dots)' : 'Dropdown மெனு (3-Dots)'}
                  </span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.75, display: 'block', marginTop: '0.125rem' }}>
                    {isEn ? 'Click top-right 3-dots to display options popup' : 'மேல் வலது 3-Dots கிளிக் செய்தால் பட்டியல் தோன்றும்'}
                  </span>
                </div>
              </div>
              {(preferences.verseOptionsStyle || 'dropdown') === 'dropdown' && <Check size={16} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />}
            </button>

            <button
              className={`btn-card ${preferences.verseOptionsStyle === 'buttons' ? 'selected' : ''}`}
              onClick={() => updatePreferences({ verseOptionsStyle: 'buttons' })}
              aria-pressed={preferences.verseOptionsStyle === 'buttons'}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.625rem',
                border: preferences.verseOptionsStyle === 'buttons' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                backgroundColor: preferences.verseOptionsStyle === 'buttons' ? 'var(--accent-soft)' : 'var(--bg-surface)',
                color: preferences.verseOptionsStyle === 'buttons' ? 'var(--accent-color)' : 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Sliders size={18} style={{ flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.875rem', fontWeight: preferences.verseOptionsStyle === 'buttons' ? 700 : 500, display: 'block' }}>
                    {isEn ? 'Bottom Action Buttons' : 'வசனத்தின் அடியில் பட்டன்கள்'}
                  </span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.75, display: 'block', marginTop: '0.125rem' }}>
                    {isEn ? 'Click verse text to expand bottom action buttons' : 'வசனத்தைக் கிளிக் செய்தால் அதற்குக் கீழே பட்டன்கள் விரியும்'}
                  </span>
                </div>
              </div>
              {preferences.verseOptionsStyle === 'buttons' && <Check size={16} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />}
            </button>
          </div>
        </div>

        {/* Group 5: Account & Cloud Sync */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '1rem',
            padding: '1.125rem 1.25rem',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
          }}
        >
          <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
            <User size={15} style={{ color: 'var(--accent-color)' }} />
            <span>{isEn ? 'Account & Cloud Sync' : 'கணக்கு & மேகக்கணி ஒத்திசைவு'}</span>
          </label>
          <AccountPanel />
        </div>
      </div>
    </div>
  );
};
