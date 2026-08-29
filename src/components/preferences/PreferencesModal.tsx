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
          <span style={{ fontSize: '0.90625rem', fontWeight: 700, color: 'var(--accent-color)', flexShrink: 0 }}>
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
            maxHeight: '280px',
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

/* Butter-Smooth Pixel-Perfect Custom Slider Component */
interface SliderStep<T> {
  value: T;
  label: string;
  sublabel: string;
}

interface CustomSliderProps<T> {
  title: string;
  steps: SliderStep<T>[];
  currentValue: T;
  onChange: (val: T) => void;
}

function CustomSlider<T>({ title, steps, currentValue, onChange }: CustomSliderProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const currentIndex = Math.max(0, steps.findIndex((s) => s.value === currentValue));
  const totalSteps = steps.length;
  const activeStep = steps[currentIndex] || steps[0];

  const getPercentForIndex = (idx: number) => {
    if (totalSteps <= 1) return 0;
    return (idx / (totalSteps - 1)) * 100;
  };

  const handlePointerAction = (e: React.PointerEvent<HTMLDivElement> | PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const relativeX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const ratio = rect.width > 0 ? relativeX / rect.width : 0;
    const closestIdx = Math.round(ratio * (totalSteps - 1));
    const clampedIdx = Math.max(0, Math.min(closestIdx, totalSteps - 1));
    if (steps[clampedIdx] && steps[clampedIdx].value !== currentValue) {
      onChange(steps[clampedIdx].value);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    handlePointerAction(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      handlePointerAction(e);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const activePercent = getPercentForIndex(currentIndex);

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* Title Header with Active Value Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', marginBottom: '0.625rem' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{title}</span>
        <span style={{ fontWeight: 700, color: 'var(--accent-color)', backgroundColor: 'var(--accent-soft)', padding: '0.1875rem 0.625rem', borderRadius: '9999px', fontSize: '0.78125rem' }}>
          {activeStep.label} ({activeStep.sublabel})
        </span>
      </div>

      {/* Interactive Slider Track Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'relative',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
          touchAction: 'none',
          padding: '0 10px',
          margin: '0 -10px'
        }}
      >
        {/* Track Background Line */}
        <div
          style={{
            position: 'absolute',
            left: '10px',
            right: '10px',
            height: '6px',
            backgroundColor: 'var(--border-color)',
            borderRadius: '9999px'
          }}
        />

        {/* Active Filled Line */}
        <div
          style={{
            position: 'absolute',
            left: '10px',
            width: `calc(${activePercent}% * (100% - 20px) / 100)`,
            height: '6px',
            backgroundColor: 'var(--accent-color)',
            borderRadius: '9999px',
            transition: isDragging ? 'none' : 'width 180ms cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />

        {/* Snap Tick Dots at exact percentage locations */}
        {steps.map((step, idx) => {
          const pct = getPercentForIndex(idx);
          const isPassed = idx <= currentIndex;
          return (
            <div
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                onChange(step.value);
              }}
              style={{
                position: 'absolute',
                left: `calc(10px + ${pct}% * (100% - 20px) / 100)`,
                transform: 'translateX(-50%)',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: isPassed ? 'var(--accent-color)' : 'var(--bg-surface)',
                border: isPassed ? '2px solid var(--accent-color)' : '2px solid var(--border-color)',
                zIndex: 10,
                transition: 'all 150ms ease'
              }}
            />
          );
        })}

        {/* Floating Draggable Thumb Circle */}
        <div
          style={{
            position: 'absolute',
            left: `calc(10px + ${activePercent}% * (100% - 20px) / 100)`,
            transform: 'translateX(-50%)',
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-color)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
            border: '2px solid #ffffff',
            zIndex: 20,
            transition: isDragging ? 'none' : 'left 180ms cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </div>

      {/* Sublabel Text Indicators Perfectly Centered below each Snap Point */}
      <div style={{ position: 'relative', height: '28px', marginTop: '0.25rem' }}>
        {steps.map((step, idx) => {
          const pct = getPercentForIndex(idx);
          const isSelected = idx === currentIndex;
          return (
            <div
              key={idx}
              onClick={() => onChange(step.value)}
              style={{
                position: 'absolute',
                left: `${pct}%`,
                transform: idx === 0 ? 'translateX(0%)' : idx === totalSteps - 1 ? 'translateX(-100%)' : 'translateX(-50%)',
                textAlign: idx === 0 ? 'left' : idx === totalSteps - 1 ? 'right' : 'center',
                fontSize: '0.71875rem',
                color: isSelected ? 'var(--accent-color)' : 'var(--text-muted)',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'color 150ms ease'
              }}
            >
              <div>{step.label}</div>
              <div style={{ opacity: 0.85, fontSize: '0.65625rem' }}>{step.sublabel}</div>
            </div>
          );
        })}
      </div>
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

  // Expanded Tamil Fonts Library (12 Fonts)
  const tamilFonts: FontItem<TamilFontOption>[] = [
    { id: 'noto', label: 'Noto Sans Tamil', preview: 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்', fontVar: 'var(--font-ta-noto)' },
    { id: 'mukta', label: 'Mukta Malar', preview: 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்', fontVar: 'var(--font-ta-mukta)' },
    { id: 'catamaran', label: 'Catamaran', preview: 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்', fontVar: 'var(--font-ta-catamaran)' },
    { id: 'arima', label: 'Arima Display', preview: 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்', fontVar: 'var(--font-ta-arima)' },
    { id: 'hind', label: 'Hind Madurai', preview: 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்', fontVar: 'var(--font-ta-hind)' },
    { id: 'anek', label: 'Anek Tamil', preview: 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்', fontVar: 'var(--font-ta-anek)' },
    { id: 'serif', label: 'Noto Serif Tamil', preview: 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்', fontVar: 'var(--font-ta-serif)' },
    { id: 'kavi', label: 'Kavivanar Script', preview: 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்', fontVar: 'var(--font-ta-kavi)' },
    { id: 'baloo', label: 'Baloo Thambi 2', preview: 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்', fontVar: 'var(--font-ta-baloo)' },
    { id: 'coiny', label: 'Coiny Display', preview: 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்', fontVar: 'var(--font-ta-coiny)' },
    { id: 'pavanam', label: 'Pavanam Clean', preview: 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்', fontVar: 'var(--font-ta-pavanam)' },
    { id: 'system', label: 'Latha / System Tamil', preview: 'கர்த்தர் என் மேய்ப்பராயிருக்கிறார்', fontVar: 'var(--font-ta-system)' }
  ];

  // Expanded English Fonts Library (12 Fonts)
  const englishFonts: FontItem<EnglishFontOption>[] = [
    { id: 'lora', label: 'Lora Classic Serif', preview: 'The Lord is my shepherd; I shall not want.', fontVar: 'var(--font-en-lora)' },
    { id: 'inter', label: 'Inter Modern Sans', preview: 'The Lord is my shepherd; I shall not want.', fontVar: 'var(--font-en-inter)' },
    { id: 'merriweather', label: 'Merriweather Serif', preview: 'The Lord is my shepherd; I shall not want.', fontVar: 'var(--font-en-merriweather)' },
    { id: 'outfit', label: 'Outfit Clean Sans', preview: 'The Lord is my shepherd; I shall not want.', fontVar: 'var(--font-en-outfit)' },
    { id: 'playfair', label: 'Playfair Display Serif', preview: 'The Lord is my shepherd; I shall not want.', fontVar: 'var(--font-en-playfair)' },
    { id: 'roboto', label: 'Roboto Sans', preview: 'The Lord is my shepherd; I shall not want.', fontVar: 'var(--font-en-roboto)' },
    { id: 'georgia', label: 'Georgia Book Serif', preview: 'The Lord is my shepherd; I shall not want.', fontVar: 'var(--font-en-georgia)' },
    { id: 'cinzel', label: 'Cinzel Classic Capital', preview: 'THE LORD IS MY SHEPHERD; I SHALL NOT WANT.', fontVar: 'var(--font-en-cinzel)' },
    { id: 'opensans', label: 'Open Sans Clean', preview: 'The Lord is my shepherd; I shall not want.', fontVar: 'var(--font-en-opensans)' },
    { id: 'montserrat', label: 'Montserrat Modern', preview: 'The Lord is my shepherd; I shall not want.', fontVar: 'var(--font-en-montserrat)' },
    { id: 'poppins', label: 'Poppins Rounded', preview: 'The Lord is my shepherd; I shall not want.', fontVar: 'var(--font-en-poppins)' },
    { id: 'baskerville', label: 'Libre Baskerville', preview: 'The Lord is my shepherd; I shall not want.', fontVar: 'var(--font-en-baskerville)' }
  ];

  // Font Size Steps for CustomSlider
  const fontSizeSteps: SliderStep<FontSizeOption>[] = [
    { value: 'sm', label: isEn ? 'Small' : 'சிறிய', sublabel: '15px' },
    { value: 'md', label: isEn ? 'Medium' : 'நடுத்தர', sublabel: '18px' },
    { value: 'lg', label: isEn ? 'Large' : 'பெரிய', sublabel: '21px' },
    { value: 'xl', label: isEn ? 'Extra' : 'மிகப்பெரிய', sublabel: '24px' }
  ];

  // Line Height Steps for CustomSlider
  const lineHeightSteps: SliderStep<LineHeightOption>[] = [
    { value: 'normal', label: isEn ? 'Normal' : 'சாதாரண', sublabel: '1.6x' },
    { value: 'relaxed', label: isEn ? 'Relaxed' : 'சீராக', sublabel: '1.8x' },
    { value: 'loose', label: isEn ? 'Loose' : 'அகலமாக', sublabel: '2.1x' }
  ];

  // Page Width Steps for CustomSlider
  const maxWidthSteps: SliderStep<MaxWidthOption>[] = [
    { value: 'compact', label: isEn ? 'Compact' : 'செறிவான', sublabel: '720px' },
    { value: 'standard', label: isEn ? 'Standard' : 'சாதாரண', sublabel: '840px' },
    { value: 'wide', label: isEn ? 'Wide' : 'அகலமான', sublabel: '1000px' }
  ];

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
        {/* Group 1: Appearance & Theme (Minimal Apple/Linear Segmented Control) */}
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

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.25rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '0.75rem',
              padding: '0.25rem',
              border: '1px solid var(--border-color)'
            }}
          >
            <button
              type="button"
              onClick={() => updatePreferences({ theme: 'light' })}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                padding: '0.5625rem 0.5rem',
                borderRadius: '0.5625rem',
                border: preferences.theme === 'light' ? '1px solid var(--accent-color)' : '1px solid transparent',
                backgroundColor: preferences.theme === 'light' ? 'var(--bg-surface)' : 'transparent',
                color: preferences.theme === 'light' ? 'var(--accent-color)' : 'var(--text-secondary)',
                fontWeight: preferences.theme === 'light' ? 700 : 500,
                fontSize: '0.84375rem',
                cursor: 'pointer',
                boxShadow: preferences.theme === 'light' ? '0 2px 8px rgba(0, 0, 0, 0.05)' : 'none',
                transition: 'all 180ms ease'
              }}
            >
              <Sun size={15} />
              <span>{isEn ? 'Light' : 'வெளிச்சம்'}</span>
            </button>

            <button
              type="button"
              onClick={() => updatePreferences({ theme: 'sepia' })}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                padding: '0.5625rem 0.5rem',
                borderRadius: '0.5625rem',
                border: preferences.theme === 'sepia' ? '1px solid var(--accent-color)' : '1px solid transparent',
                backgroundColor: preferences.theme === 'sepia' ? 'var(--bg-surface)' : 'transparent',
                color: preferences.theme === 'sepia' ? 'var(--accent-color)' : 'var(--text-secondary)',
                fontWeight: preferences.theme === 'sepia' ? 700 : 500,
                fontSize: '0.84375rem',
                cursor: 'pointer',
                boxShadow: preferences.theme === 'sepia' ? '0 2px 8px rgba(0, 0, 0, 0.05)' : 'none',
                transition: 'all 180ms ease'
              }}
            >
              <BookOpen size={15} />
              <span>{isEn ? 'Sepia' : 'செபியா'}</span>
            </button>

            <button
              type="button"
              onClick={() => updatePreferences({ theme: 'dark' })}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                padding: '0.5625rem 0.5rem',
                borderRadius: '0.5625rem',
                border: preferences.theme === 'dark' ? '1px solid var(--accent-color)' : '1px solid transparent',
                backgroundColor: preferences.theme === 'dark' ? 'var(--bg-surface)' : 'transparent',
                color: preferences.theme === 'dark' ? 'var(--accent-color)' : 'var(--text-secondary)',
                fontWeight: preferences.theme === 'dark' ? 700 : 500,
                fontSize: '0.84375rem',
                cursor: 'pointer',
                boxShadow: preferences.theme === 'dark' ? '0 2px 8px rgba(0, 0, 0, 0.05)' : 'none',
                transition: 'all 180ms ease'
              }}
            >
              <Moon size={15} />
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

          {/* Tamil Font Dropdown (ALWAYS VISIBLE) */}
          <CustomFontSelect
            selectedId={preferences.fontFamilyTa || 'noto'}
            options={tamilFonts}
            label={isEn ? 'Tamil Font Style (Dropdown)' : 'தமிழ் எழுத்து பாணி (Tamil Font Dropdown)'}
            onChange={(id) => updatePreferences({ fontFamilyTa: id })}
          />

          {/* English Font Dropdown (ALWAYS VISIBLE) */}
          <CustomFontSelect
            selectedId={preferences.fontFamilyEn || 'lora'}
            options={englishFonts}
            label={isEn ? 'English Font Style (Dropdown)' : 'ஆங்கில எழுத்து பாணி (English Font Dropdown)'}
            onChange={(id) => updatePreferences({ fontFamilyEn: id })}
          />

          {/* Pixel-Perfect Butter-Smooth Font Size Slider */}
          <CustomSlider
            title={isEn ? 'Font Size' : 'எழுத்து அளவு'}
            steps={fontSizeSteps}
            currentValue={preferences.fontSize || 'md'}
            onChange={(val) => updatePreferences({ fontSize: val })}
          />

          {/* Pixel-Perfect Butter-Smooth Line Height Slider */}
          <CustomSlider
            title={isEn ? 'Line Spacing' : 'வரி இடைவெளி'}
            steps={lineHeightSteps}
            currentValue={preferences.lineHeight || 'normal'}
            onChange={(val) => updatePreferences({ lineHeight: val })}
          />

          {/* Pixel-Perfect Butter-Smooth Page Width Slider */}
          <CustomSlider
            title={isEn ? 'Page Width' : 'பக்க அகலம்'}
            steps={maxWidthSteps}
            currentValue={preferences.maxWidth || 'standard'}
            onChange={(val) => updatePreferences({ maxWidth: val })}
          />
        </div>

        {/* Group 3: Primary Language (Minimal Professional Segmented Control) */}
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

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.25rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '0.75rem',
              padding: '0.25rem',
              border: '1px solid var(--border-color)'
            }}
          >
            <button
              type="button"
              onClick={() => setLanguage('ta')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '38px',
                padding: '0 0.5rem',
                borderRadius: '0.5625rem',
                border: '1.5px solid',
                borderColor: language === 'ta' ? 'var(--accent-color)' : 'transparent',
                backgroundColor: language === 'ta' ? 'var(--bg-surface)' : 'transparent',
                color: language === 'ta' ? 'var(--accent-color)' : 'var(--text-secondary)',
                fontWeight: language === 'ta' ? 700 : 500,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                boxShadow: language === 'ta' ? '0 2px 6px rgba(0, 0, 0, 0.06)' : 'none',
                transition: 'all 150ms ease',
                whiteSpace: 'nowrap',
                boxSizing: 'border-box'
              }}
            >
              <span>தமிழ்</span>
            </button>

            <button
              type="button"
              onClick={() => setLanguage('en')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '38px',
                padding: '0 0.5rem',
                borderRadius: '0.5625rem',
                border: '1.5px solid',
                borderColor: language === 'en' ? 'var(--accent-color)' : 'transparent',
                backgroundColor: language === 'en' ? 'var(--bg-surface)' : 'transparent',
                color: language === 'en' ? 'var(--accent-color)' : 'var(--text-secondary)',
                fontWeight: language === 'en' ? 700 : 500,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                boxShadow: language === 'en' ? '0 2px 6px rgba(0, 0, 0, 0.06)' : 'none',
                transition: 'all 150ms ease',
                whiteSpace: 'nowrap',
                boxSizing: 'border-box'
              }}
            >
              <span>English</span>
            </button>

            <button
              type="button"
              onClick={() => setLanguage('parallel')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '38px',
                padding: '0 0.5rem',
                borderRadius: '0.5625rem',
                border: '1.5px solid',
                borderColor: language === 'parallel' ? 'var(--accent-color)' : 'transparent',
                backgroundColor: language === 'parallel' ? 'var(--bg-surface)' : 'transparent',
                color: language === 'parallel' ? 'var(--accent-color)' : 'var(--text-secondary)',
                fontWeight: language === 'parallel' ? 700 : 500,
                fontSize: '0.8125rem',
                cursor: 'pointer',
                boxShadow: language === 'parallel' ? '0 2px 6px rgba(0, 0, 0, 0.06)' : 'none',
                transition: 'all 150ms ease',
                whiteSpace: 'nowrap',
                boxSizing: 'border-box'
              }}
            >
              <span>தமிழ் + English</span>
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
