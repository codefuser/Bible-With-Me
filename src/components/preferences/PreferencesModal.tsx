import React from 'react';
import { X, Sun, Moon, BookOpen, Check } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { FontSizeOption, LineHeightOption, MaxWidthOption, ThemeOption } from '../../types/bible';

export const PreferencesModal: React.FC = () => {
  const {
    preferences,
    updatePreferences,
    language,
    setLanguage,
    isPreferencesOpen,
    setIsPreferencesOpen
  } = useReading();

  if (!isPreferencesOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsPreferencesOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h2 className="modal-title">
            {language === 'ta' ? 'வாசிப்பு விருப்பத்தேர்வுகள்' : 'Reading Preferences'}
          </h2>
          <button className="btn-icon" onClick={() => setIsPreferencesOpen(false)} title="Close Preferences">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Group 1: Appearance & Theme */}
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.625rem' }}>
              {language === 'ta' ? 'தோற்றம் (Appearance)' : 'Appearance & Theme'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <button
                className={`btn-card ${preferences.theme === 'light' ? 'selected' : ''}`}
                onClick={() => updatePreferences({ theme: 'light' })}
                style={{
                  padding: '0.625rem',
                  borderRadius: '0.5rem',
                  border: preferences.theme === 'light' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                  backgroundColor: '#ffffff',
                  color: '#1c1d1f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                <Sun size={16} />
                <span>Light</span>
              </button>

              <button
                className={`btn-card ${preferences.theme === 'sepia' ? 'selected' : ''}`}
                onClick={() => updatePreferences({ theme: 'sepia' })}
                style={{
                  padding: '0.625rem',
                  borderRadius: '0.5rem',
                  border: preferences.theme === 'sepia' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                  backgroundColor: '#fbf5e8',
                  color: '#3b3226',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                <BookOpen size={16} />
                <span>Sepia</span>
              </button>

              <button
                className={`btn-card ${preferences.theme === 'dark' ? 'selected' : ''}`}
                onClick={() => updatePreferences({ theme: 'dark' })}
                style={{
                  padding: '0.625rem',
                  borderRadius: '0.5rem',
                  border: preferences.theme === 'dark' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                  backgroundColor: '#1e2027',
                  color: '#e6e8ec',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                <Moon size={16} />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Group 2: Typography & Layout */}
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.625rem' }}>
              {language === 'ta' ? 'எழுத்து & அமைப்பகம்' : 'Reading Typography'}
            </label>

            {/* Font Size Selector */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                <span>{language === 'ta' ? 'எழுத்து அளவு' : 'Font Size'}</span>
                <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>{preferences.fontSize}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {(['sm', 'md', 'lg', 'xl'] as FontSizeOption[]).map((size) => (
                  <button
                    key={size}
                    className={`btn-pill ${preferences.fontSize === size ? 'active' : ''}`}
                    onClick={() => updatePreferences({ fontSize: size })}
                    style={{ justifyContent: 'center', textTransform: 'uppercase', fontSize: '0.8125rem' }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Line Height Selector */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                <span>{language === 'ta' ? 'வரி இடைவெளி' : 'Line Spacing'}</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{preferences.lineHeight}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {(['normal', 'relaxed', 'loose'] as LineHeightOption[]).map((line) => (
                  <button
                    key={line}
                    className={`btn-pill ${preferences.lineHeight === line ? 'active' : ''}`}
                    onClick={() => updatePreferences({ lineHeight: line })}
                    style={{ justifyContent: 'center', textTransform: 'capitalize', fontSize: '0.8125rem' }}
                  >
                    {line}
                  </button>
                ))}
              </div>
            </div>

            {/* Reading Container Width */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                <span>{language === 'ta' ? 'பக்க அகலம்' : 'Page Width'}</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{preferences.maxWidth}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {(['compact', 'standard', 'wide'] as MaxWidthOption[]).map((width) => (
                  <button
                    key={width}
                    className={`btn-pill ${preferences.maxWidth === width ? 'active' : ''}`}
                    onClick={() => updatePreferences({ maxWidth: width })}
                    style={{ justifyContent: 'center', textTransform: 'capitalize', fontSize: '0.8125rem' }}
                  >
                    {width}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Group 3: Language Preference */}
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.625rem' }}>
              {language === 'ta' ? 'முதன்மை மொழி' : 'Primary Language'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
              <button
                className={`btn-pill ${language === 'en' ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
                style={{ justifyContent: 'center', fontSize: '0.875rem' }}
              >
                {language === 'en' && <Check size={14} />}
                <span>English</span>
              </button>
              <button
                className={`btn-pill ${language === 'ta' ? 'active' : ''}`}
                onClick={() => setLanguage('ta')}
                style={{ justifyContent: 'center', fontSize: '0.875rem' }}
              >
                {language === 'ta' && <Check size={14} />}
                <span>தமிழ் (Tamil)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
