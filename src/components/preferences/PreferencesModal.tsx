import React from 'react';
import { ArrowLeft, Sun, Moon, BookOpen, Check, Type, MoreVertical, Sliders, Globe, Layout, User } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { FontSizeOption, LineHeightOption, MaxWidthOption, TamilFontOption, EnglishFontOption } from '../../types/bible';
import { AccountPanel } from '../auth/AccountPanel';

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
  const currentTaFont = preferences.fontFamilyTa || 'noto';
  const currentEnFont = preferences.fontFamilyEn || 'lora';

  const handleReturnHome = () => {
    setIsPreferencesOpen(false);
  };

  const tamilFonts: { id: TamilFontOption; label: string; preview: string; fontVar: string }[] = [
    { id: 'noto', label: 'Noto Sans', preview: 'நவீன தமிழ்', fontVar: 'var(--font-ta-noto)' },
    { id: 'mukta', label: 'Mukta Malar', preview: 'மரபுத் தமிழ்', fontVar: 'var(--font-ta-mukta)' },
    { id: 'catamaran', label: 'Catamaran', preview: 'நேர்த்தியான தமிழ்', fontVar: 'var(--font-ta-catamaran)' },
    { id: 'arima', label: 'Arima', preview: 'அலங்காரத் தமிழ்', fontVar: 'var(--font-ta-arima)' },
    { id: 'hind', label: 'Hind Madurai', preview: 'எளிய தமிழ்', fontVar: 'var(--font-ta-hind)' }
  ];

  const englishFonts: { id: EnglishFontOption; label: string; preview: string; fontVar: string }[] = [
    { id: 'lora', label: 'Lora', preview: 'Classic Serif', fontVar: 'var(--font-en-lora)' },
    { id: 'inter', label: 'Inter', preview: 'Modern Sans', fontVar: 'var(--font-en-inter)' },
    { id: 'merriweather', label: 'Merriweather', preview: 'Editorial Serif', fontVar: 'var(--font-en-merriweather)' },
    { id: 'outfit', label: 'Outfit', preview: 'Clean Sans', fontVar: 'var(--font-en-outfit)' },
    { id: 'playfair', label: 'Playfair', preview: 'Heritage Serif', fontVar: 'var(--font-en-playfair)' }
  ];

  const fontSizeLabels: Record<FontSizeOption, string> = {
    sm: isEn ? 'Small' : 'சிறியது',
    md: isEn ? 'Medium' : 'நடுத்தரம்',
    lg: isEn ? 'Large' : 'பெரியது',
    xl: isEn ? 'Extra Large' : 'மிகப்பெரியது'
  };

  const fontSizeBtnLabels: Record<FontSizeOption, string> = {
    sm: isEn ? 'SM' : 'சிறிய',
    md: isEn ? 'MD' : 'நடுத்தர',
    lg: isEn ? 'LG' : 'பெரிய',
    xl: isEn ? 'XL' : 'மிகப்பெரிய'
  };

  const lineHeightLabels: Record<LineHeightOption, string> = {
    normal: isEn ? 'Normal' : 'சாதாரண',
    relaxed: isEn ? 'Relaxed' : 'சீராக',
    loose: isEn ? 'Loose' : 'அகலமாக'
  };

  const lineHeightBtnLabels: Record<LineHeightOption, string> = {
    normal: isEn ? 'Normal' : 'சாதாரண',
    relaxed: isEn ? 'Relaxed' : 'சீராக',
    loose: isEn ? 'Loose' : 'அகலமாக'
  };

  const maxWidthLabels: Record<MaxWidthOption, string> = {
    compact: isEn ? 'Compact' : 'செறிவான',
    standard: isEn ? 'Standard' : 'சாதாரண',
    wide: isEn ? 'Wide' : 'அகலமான'
  };

  const maxWidthBtnLabels: Record<MaxWidthOption, string> = {
    compact: isEn ? 'Compact' : 'செறிவான',
    standard: isEn ? 'Standard' : 'சாதாரண',
    wide: isEn ? 'Wide' : 'அகலமான'
  };

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

        {/* Group 2: Typography & Fonts */}
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

          {/* Tamil Fonts Selection */}
          {!isEn && (
            <div style={{ marginBottom: '1.125rem' }}>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                {isEn ? 'Tamil Font Style' : 'தமிழ் எழுத்து பாணி'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '0.5rem' }}>
                {tamilFonts.map((font) => {
                  const isSelected = currentTaFont === font.id;
                  return (
                    <button
                      key={font.id}
                      onClick={() => updatePreferences({ fontFamilyTa: font.id })}
                      aria-pressed={isSelected}
                      style={{
                        padding: '0.5rem 0.625rem',
                        borderRadius: '0.5rem',
                        border: isSelected ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? 'var(--accent-soft)' : 'var(--bg-surface)',
                        color: isSelected ? 'var(--accent-color)' : 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.8125rem', fontWeight: isSelected ? 700 : 500, display: 'block' }}>{font.label}</span>
                        <span style={{ fontFamily: font.fontVar, fontSize: '0.84375rem', opacity: 0.85 }}>{font.preview}</span>
                      </div>
                      {isSelected && <Check size={14} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* English Fonts Selection */}
          {!isTa && (
            <div style={{ marginBottom: '1.125rem' }}>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                {isEn ? 'English Font Style' : 'ஆங்கில எழுத்து பாணி'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '0.5rem' }}>
                {englishFonts.map((font) => {
                  const isSelected = currentEnFont === font.id;
                  return (
                    <button
                      key={font.id}
                      onClick={() => updatePreferences({ fontFamilyEn: font.id })}
                      aria-pressed={isSelected}
                      style={{
                        padding: '0.5rem 0.625rem',
                        borderRadius: '0.5rem',
                        border: isSelected ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? 'var(--accent-soft)' : 'var(--bg-surface)',
                        color: isSelected ? 'var(--accent-color)' : 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textAlign: 'left'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.8125rem', fontWeight: isSelected ? 700 : 500, display: 'block' }}>{font.label}</span>
                        <span style={{ fontFamily: font.fontVar, fontSize: '0.84375rem', opacity: 0.85 }}>{font.preview}</span>
                      </div>
                      {isSelected && <Check size={14} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Font Size Selector */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              <span>{isEn ? 'Font Size' : 'எழுத்து அளவு'}</span>
              <span style={{ fontWeight: 600 }}>{fontSizeLabels[preferences.fontSize]}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {(['sm', 'md', 'lg', 'xl'] as FontSizeOption[]).map((size) => {
                const isSelected = preferences.fontSize === size;
                return (
                  <button
                    key={size}
                    className={`btn-pill ${isSelected ? 'active' : ''}`}
                    onClick={() => updatePreferences({ fontSize: size })}
                    aria-pressed={isSelected}
                    style={{
                      justifyContent: 'center',
                      fontSize: '0.8125rem',
                      padding: '0.4375rem 0.25rem',
                      gap: '0.25rem',
                      border: isSelected ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                      fontWeight: isSelected ? 700 : 500
                    }}
                  >
                    {isSelected && <Check size={13} />}
                    <span>{fontSizeBtnLabels[size]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Line Height Selector */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              <span>{isEn ? 'Line Spacing' : 'வரி இடைவெளி'}</span>
              <span style={{ fontWeight: 600 }}>{lineHeightLabels[preferences.lineHeight]}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {(['normal', 'relaxed', 'loose'] as LineHeightOption[]).map((line) => {
                const isSelected = preferences.lineHeight === line;
                return (
                  <button
                    key={line}
                    className={`btn-pill ${isSelected ? 'active' : ''}`}
                    onClick={() => updatePreferences({ lineHeight: line })}
                    aria-pressed={isSelected}
                    style={{
                      justifyContent: 'center',
                      fontSize: '0.8125rem',
                      border: isSelected ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                      fontWeight: isSelected ? 700 : 500
                    }}
                  >
                    {isSelected && <Check size={13} />}
                    <span>{lineHeightBtnLabels[line]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reading Container Width */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
              <span>{isEn ? 'Page Width' : 'பக்க அகலம்'}</span>
              <span style={{ fontWeight: 600 }}>{maxWidthLabels[preferences.maxWidth]}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {(['compact', 'standard', 'wide'] as MaxWidthOption[]).map((width) => {
                const isSelected = preferences.maxWidth === width;
                return (
                  <button
                    key={width}
                    className={`btn-pill ${isSelected ? 'active' : ''}`}
                    onClick={() => updatePreferences({ maxWidth: width })}
                    aria-pressed={isSelected}
                    style={{
                      justifyContent: 'center',
                      fontSize: '0.8125rem',
                      border: isSelected ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                      fontWeight: isSelected ? 700 : 500
                    }}
                  >
                    {isSelected && <Check size={13} />}
                    <span>{maxWidthBtnLabels[width]}</span>
                  </button>
                );
              })}
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
