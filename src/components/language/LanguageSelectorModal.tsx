import React, { useEffect, useState } from 'react';
import { Globe, Check, X, BookOpen, Smartphone } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { AppLanguage, BibleLanguage } from '../../types/bible';

export const LanguageSelectorModal: React.FC = () => {
  const {
    appLanguage,
    setAppLanguage,
    bibleLanguage,
    setBibleLanguage,
    isLanguageModalOpen,
    setIsLanguageModalOpen
  } = useReading();

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

  const isTaUI = appLanguage === 'ta';

  const bibleOptions: {
    id: BibleLanguage;
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
                  lineHeight: 1.2
                }}
              >
                {isTaUI ? 'மொழி அமைப்புகள்' : 'Language Settings'}
              </h3>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
                  margin: '0.15rem 0 0 0'
                }}
              >
                {isTaUI ? 'செயலி மற்றும் வேதாகம மொழியைத் தனித்தனியே தேர்ந்தெடுக்கவும்' : 'Set App UI & Bible scripture language independently'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLanguageModalOpen(false)}
            aria-label="Close"
            style={{
              padding: '0.5rem',
              borderRadius: '0.5rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div
          style={{
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            overflowY: 'auto'
          }}
        >
          {/* SECTION A: APP UI LANGUAGE */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginBottom: '0.6rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--accent-color)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              <Smartphone size={14} />
              <span>{isTaUI ? 'பயன்பாட்டு இடைமுக மொழி (App UI Language)' : 'App Interface Language'}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={() => setAppLanguage('ta')}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: `2px solid ${appLanguage === 'ta' ? 'var(--accent-color)' : 'var(--border-color)'}`,
                  backgroundColor: appLanguage === 'ta' ? 'var(--accent-soft)' : 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>🇮🇳 தமிழ்</span>
                {appLanguage === 'ta' && <Check size={16} color="var(--accent-color)" />}
              </button>

              <button
                type="button"
                onClick={() => setAppLanguage('en')}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.75rem',
                  border: `2px solid ${appLanguage === 'en' ? 'var(--accent-color)' : 'var(--border-color)'}`,
                  backgroundColor: appLanguage === 'en' ? 'var(--accent-soft)' : 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>🇬🇧 English</span>
                {appLanguage === 'en' && <Check size={16} color="var(--accent-color)" />}
              </button>
            </div>
          </div>

          {/* SECTION B: BIBLE SCRIPTURE TRANSLATION */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginBottom: '0.6rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#16a34a',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              <BookOpen size={14} />
              <span>{isTaUI ? 'வேதாகம வாசிப்பு பதிப்பு (Bible Translation)' : 'Bible Scripture Translation'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {bibleOptions.map((opt) => {
                const isSelected = bibleLanguage === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setBibleLanguage(opt.id)}
                    style={{
                      padding: '0.875rem 1rem',
                      borderRadius: '0.85rem',
                      border: `1.5px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                      backgroundColor: isSelected ? 'var(--accent-soft)' : 'var(--bg-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.4rem' }}>{opt.flag}</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)' }}>
                            {opt.title}
                          </span>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              padding: '0.1rem 0.4rem',
                              borderRadius: '9999px',
                              backgroundColor: 'var(--bg-secondary)',
                              color: 'var(--text-muted)',
                              border: '1px solid var(--border-color)'
                            }}
                          >
                            {opt.badge}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                          {opt.versionName}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div
                        style={{
                          width: '1.5rem',
                          height: '1.5rem',
                          borderRadius: '9999px',
                          backgroundColor: 'var(--accent-color)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Check size={14} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '0.875rem 1.25rem',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button
            type="button"
            onClick={() => setIsLanguageModalOpen(false)}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '0.625rem',
              backgroundColor: 'var(--accent-color)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            {isTaUI ? 'முடிந்தது' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
