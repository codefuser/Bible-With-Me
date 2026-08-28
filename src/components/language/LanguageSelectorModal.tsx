import React, { useEffect } from 'react';
import { Globe, Check, X, BookOpen } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { Language } from '../../types/bible';

export const LanguageSelectorModal: React.FC = () => {
  const { language, setLanguage, isLanguageModalOpen, setIsLanguageModalOpen } = useReading();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLanguageModalOpen && e.key === 'Escape') {
        setIsLanguageModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLanguageModalOpen, setIsLanguageModalOpen]);

  if (!isLanguageModalOpen) return null;

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setIsLanguageModalOpen(false);
  };

  const isTa = language === 'ta';

  const languageOptions: {
    id: Language;
    flag: string;
    title: string;
    versionName: string;
    description: string;
    badge: string;
  }[] = [
    {
      id: 'ta',
      flag: '🇮🇳',
      title: 'தமிழ்',
      versionName: 'BSI பரிசுத்த வேதாகமம்',
      description: 'பாரம்பரிய தமிழ் வேதாகம மொழிபெயர்ப்பு (Standard BSI Tamil Bible)',
      badge: 'BSI Tamil'
    },
    {
      id: 'en',
      flag: '🇬🇧',
      title: 'English',
      versionName: 'King James Version (KJV)',
      description: 'Classic KJV Holy Bible translation',
      badge: 'KJV English'
    },
    {
      id: 'parallel',
      flag: '📖',
      title: 'தமிழ் + English',
      versionName: 'இணை வேதாகமம் (Parallel View)',
      description: 'தமிழ் மற்றும் ஆங்கில வசனங்களை ஒப்பிட்டு வாசிக்கலாம்',
      badge: 'Parallel Dual'
    }
  ];

  return (
    <div
      className="modal-overlay"
      onClick={() => setIsLanguageModalOpen(false)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 9990,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        animation: 'fadeIn 200ms ease'
      }}
    >
      <div
        className="modal-container language-selector-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '1.25rem',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          animation: 'scaleUp 200ms cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            backgroundColor: 'var(--bg-elevated)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '0.75rem',
                backgroundColor: 'var(--accent-soft)',
                color: 'var(--accent-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Globe size={20} />
            </div>
            <div>
              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                  fontFamily: isTa ? 'var(--font-tamil)' : 'inherit',
                  lineHeight: 1.2
                }}
              >
                {isTa ? 'மொழி & வேதாகம பதிப்பு' : 'Language & Version'}
              </h3>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
                  margin: '0.25rem 0 0 0',
                  fontFamily: isTa ? 'var(--font-tamil)' : 'inherit'
                }}
              >
                {isTa ? 'வாசிக்க விரும்பும் பதிப்பைத் தேர்ந்தெடுக்கவும்' : 'Choose your Bible translation'}
              </p>
            </div>
          </div>

          <button
            className="btn-icon"
            onClick={() => setIsLanguageModalOpen(false)}
            title="Close"
            style={{ width: '2rem', height: '2rem' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Language Options Cards */}
        <div
          style={{
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem',
            overflowY: 'auto'
          }}
        >
          {languageOptions.map((opt) => {
            const isSelected = language === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                style={{
                  padding: '1rem 1.125rem',
                  borderRadius: '0.875rem',
                  border: isSelected
                    ? '2px solid var(--accent-color)'
                    : '1px solid var(--border-color)',
                  backgroundColor: isSelected ? 'var(--accent-soft)' : 'var(--bg-secondary)',
                  cursor: 'pointer',
                  transition: 'all 180ms ease',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  boxShadow: isSelected ? '0 4px 14px rgba(59, 130, 246, 0.15)' : 'none'
                }}
              >
                <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.5rem', lineHeight: 1, marginTop: '2px' }}>
                    {opt.flag}
                  </span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: isSelected ? 'var(--accent-color)' : 'var(--text-primary)',
                          fontFamily: isTa ? 'var(--font-tamil)' : 'inherit'
                        }}
                      >
                        {opt.title}
                      </span>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          padding: '0.125rem 0.5rem',
                          borderRadius: '9999px',
                          backgroundColor: isSelected ? 'var(--accent-color)' : 'var(--border-color)',
                          color: isSelected ? '#ffffff' : 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}
                      >
                        {opt.badge}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        marginTop: '0.25rem',
                        fontFamily: isTa ? 'var(--font-tamil)' : 'inherit'
                      }}
                    >
                      {opt.versionName}
                    </div>

                    <div
                      style={{
                        fontSize: '0.78125rem',
                        color: 'var(--text-muted)',
                        marginTop: '0.25rem',
                        lineHeight: 1.4,
                        fontFamily: isTa ? 'var(--font-tamil)' : 'inherit'
                      }}
                    >
                      {opt.description}
                    </div>
                  </div>
                </div>

                {/* Selection Checkmark */}
                <div
                  style={{
                    width: '1.375rem',
                    height: '1.375rem',
                    borderRadius: '50%',
                    border: isSelected ? 'none' : '2px solid var(--border-color)',
                    backgroundColor: isSelected ? 'var(--accent-color)' : 'transparent',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                    transition: 'all 180ms ease'
                  }}
                >
                  {isSelected && <Check size={13} strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
