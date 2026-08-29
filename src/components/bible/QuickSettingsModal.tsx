import React, { useState, useEffect, useRef } from 'react';
import { X, SlidersHorizontal, Type, Sun, BookOpen, Moon, Check, ChevronDown, RotateCcw } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { ContinuousSnapSlider, MagnetPoint } from '../common/ContinuousSnapSlider';
import { TamilFontOption, EnglishFontOption } from '../../types/bible';

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
          padding: '0.5625rem 0.75rem',
          borderRadius: '0.625rem',
          border: '1.5px solid var(--accent-color)',
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          transition: 'all 150ms ease',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', overflow: 'hidden' }}>
          <span style={{ fontSize: '0.84375rem', fontWeight: 700, color: 'var(--accent-color)', flexShrink: 0 }}>
            {selectedFont.label}
          </span>
          <span
            style={{
              fontFamily: selectedFont.fontVar,
              fontSize: '0.875rem',
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
        <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease', color: 'var(--accent-color)', flexShrink: 0 }} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.375rem)',
            left: 0,
            right: 0,
            zIndex: 650,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '0.75rem',
            padding: '0.375rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            maxHeight: '220px',
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
                  padding: '0.5rem 0.625rem',
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
                  <span style={{ fontSize: '0.78125rem', fontWeight: 600, color: isSelected ? 'var(--accent-color)' : 'var(--text-muted)' }}>
                    {font.label}
                  </span>
                  <span
                    style={{
                      fontFamily: font.fontVar,
                      fontSize: '0.9375rem',
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

interface QuickSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickSettingsModal: React.FC<QuickSettingsModalProps> = ({ isOpen, onClose }) => {
  const { preferences, updatePreferences, resetPreferences, language } = useReading();
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [activeDragValue, setActiveDragValue] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isEn = language === 'en';

  // Expanded Tamil Fonts
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

  // Expanded English Fonts
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

  // Benchmark Magnet Snap Points
  const fontSizeMagnets: MagnetPoint[] = [
    { value: 15, label: isEn ? 'Small' : 'சிறிய', sublabel: '15px' },
    { value: 18, label: isEn ? 'Medium' : 'நடுத்தர', sublabel: '18px' },
    { value: 21, label: isEn ? 'Large' : 'பெரிய', sublabel: '21px' },
    { value: 24, label: isEn ? 'Extra' : 'மிகப்பெரிய', sublabel: '24px' }
  ];

  const lineHeightMagnets: MagnetPoint[] = [
    { value: 1.6, label: isEn ? 'Normal' : 'சாதாரண', sublabel: '1.6x' },
    { value: 1.8, label: isEn ? 'Relaxed' : 'சீராக', sublabel: '1.8x' },
    { value: 2.1, label: isEn ? 'Loose' : 'அகலமாக', sublabel: '2.1x' }
  ];

  const maxWidthMagnets: MagnetPoint[] = [
    { value: 720, label: isEn ? 'Compact' : 'செறிவான', sublabel: '720px' },
    { value: 840, label: isEn ? 'Standard' : 'சாதாரண', sublabel: '840px' },
    { value: 1000, label: isEn ? 'Wide' : 'அகலமான', sublabel: '1000px' }
  ];

  // Font Map to Numeric Initial Defaults
  const currentFontPx = preferences.customFontSizePx || (preferences.fontSize === 'sm' ? 15 : preferences.fontSize === 'lg' ? 21 : preferences.fontSize === 'xl' ? 24 : 18);
  const currentLineVal = preferences.customLineHeightVal || (preferences.lineHeight === 'relaxed' ? 1.8 : preferences.lineHeight === 'loose' ? 2.1 : 1.6);
  const currentWidthPx = preferences.customMaxWidthPx || (preferences.maxWidth === 'compact' ? 720 : preferences.maxWidth === 'wide' ? 1000 : 840);

  const handleDragStateChange = (dragging: boolean, val: number) => {
    setIsDraggingSlider(dragging);
    setActiveDragValue(`${val}`);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        backgroundColor: isDraggingSlider ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0.35)',
        backdropFilter: isDraggingSlider ? 'none' : 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        transition: 'all 200ms ease',
        pointerEvents: isDraggingSlider ? 'none' : 'auto'
      }}
    >
      {/* Floating Drag Indicator Pill when Dragging */}
      {isDraggingSlider && (
        <div
          style={{
            position: 'fixed',
            top: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 600,
            padding: '0.5rem 1.25rem',
            borderRadius: '9999px',
            backgroundColor: 'var(--accent-color)',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            animation: 'pulse 1s infinite alternate'
          }}
        >
          {activeDragValue}
        </div>
      )}

      {/* Main Minimal Quick Settings Card Container */}
      <div
        ref={modalRef}
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '1.25rem',
          padding: '1.25rem 1.5rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          opacity: isDraggingSlider ? 0.08 : 1,
          transform: isDraggingSlider ? 'scale(0.96)' : 'scale(1)',
          transition: 'opacity 200ms ease, transform 200ms ease, box-shadow 200ms ease',
          pointerEvents: 'auto',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Premium Redesigned Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.125rem', paddingBottom: '0.875rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5625rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent-soft)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--accent-color)', flexShrink: 0 }}>
              <SlidersHorizontal size={16} />
            </div>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              {isEn ? 'Quick Controls' : 'விரைவு அமைப்புகள்'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4375rem' }}>
            {/* Minimal Reset Pill Button */}
            <button
              type="button"
              onClick={resetPreferences}
              title={isEn ? 'Reset to Defaults' : 'இயல்பு நிலைக்கு திருப்பு'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.375rem 0.6875rem',
                borderRadius: '9999px',
                backgroundColor: 'var(--accent-soft)',
                color: 'var(--accent-color)',
                border: '1px solid var(--accent-color)',
                fontSize: '0.78125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
            >
              <RotateCcw size={13} />
              <span>{isEn ? 'Reset' : 'மீட்டமை'}</span>
            </button>

            {/* Premium Minimal Round Close Button */}
            <button
              type="button"
              onClick={onClose}
              title={isEn ? 'Close' : 'மூடுக'}
              aria-label="Close"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.borderColor = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Tamil Font Selector */}
        <CustomFontSelect
          selectedId={preferences.fontFamilyTa || 'noto'}
          options={tamilFonts}
          label={isEn ? 'Tamil Font Style' : 'தமிழ் எழுத்து பாணி'}
          onChange={(id) => updatePreferences({ fontFamilyTa: id })}
        />

        {/* English Font Selector */}
        <CustomFontSelect
          selectedId={preferences.fontFamilyEn || 'lora'}
          options={englishFonts}
          label={isEn ? 'English Font Style' : 'ஆங்கில எழுத்து பாணி'}
          onChange={(id) => updatePreferences({ fontFamilyEn: id })}
        />

        {/* Verses Size Continuous + Magnet Slider */}
        <ContinuousSnapSlider
          title={isEn ? 'Verse Text Size' : 'வசன எழுத்து அளவு'}
          min={13}
          max={28}
          step={0.5}
          value={currentFontPx}
          magnetPoints={fontSizeMagnets}
          unit="px"
          cssProperty="--custom-font-size"
          onChange={(val) => {
            updatePreferences({ customFontSizePx: val });
          }}
          onDragStateChange={handleDragStateChange}
        />

        {/* Line Spacing Continuous + Magnet Slider */}
        <ContinuousSnapSlider
          title={isEn ? 'Line Spacing' : 'வரி இடைவெளி'}
          min={1.4}
          max={2.4}
          step={0.05}
          value={currentLineVal}
          magnetPoints={lineHeightMagnets}
          unit="x"
          cssProperty="--custom-line-height"
          onChange={(val) => {
            updatePreferences({ customLineHeightVal: val });
          }}
          onDragStateChange={handleDragStateChange}
        />

        {/* Page Width Continuous + Magnet Slider */}
        <ContinuousSnapSlider
          title={isEn ? 'Page Width' : 'பக்க அகலம்'}
          min={600}
          max={1100}
          step={10}
          value={currentWidthPx}
          magnetPoints={maxWidthMagnets}
          unit="px"
          cssProperty="--custom-max-width"
          onChange={(val) => {
            updatePreferences({ customMaxWidthPx: val });
          }}
          onDragStateChange={handleDragStateChange}
        />
      </div>
    </div>
  );
};
