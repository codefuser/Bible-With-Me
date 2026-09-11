import React, { useEffect } from 'react';
import { LogOut, X, AlertCircle } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';

interface ExitConfirmationModalProps {
  isOpen: boolean;
  onConfirmExit: () => void;
  onCancelExit: () => void;
}

export const ExitConfirmationModal: React.FC<ExitConfirmationModalProps> = ({
  isOpen,
  onConfirmExit,
  onCancelExit
}) => {
  const { language, preferences } = useReading();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        onCancelExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancelExit]);

  if (!isOpen) return null;

  const isTa = language === 'ta';

  const today = new Date().toISOString().split('T')[0];
  const goalMin = preferences.dailyGoalMinutes || 5;
  const savedSec = parseInt(localStorage.getItem(`bible_reading_sec_${today}`) || '0', 10);
  const totalGoalSec = goalMin * 60;
  const isGoalMet = savedSec >= totalGoalSec;
  const remainingMin = Math.ceil(Math.max(0, totalGoalSec - savedSec) / 60);

  return (
    <div
      className="modal-overlay"
      onClick={onCancelExit}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        animation: 'fadeIn 200ms ease'
      }}
    >
      <div
        className="modal-container exit-confirmation-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '1rem',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          animation: 'scaleUp 200ms cubic-bezier(0.16, 1, 0.3, 1)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1.15rem'
        }}
      >
        {/* Top Icon Pill */}
        <div
          style={{
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '50%',
            backgroundColor: isGoalMet ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            color: isGoalMet ? '#10b981' : '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isGoalMet
              ? '0 4px 12px rgba(16, 185, 129, 0.15)'
              : '0 4px 12px rgba(239, 68, 68, 0.15)'
          }}
        >
          <LogOut size={28} />
        </div>

        {/* Content Section */}
        <div>
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 0.5rem 0',
              fontFamily: isTa ? 'var(--font-tamil)' : 'inherit'
            }}
          >
            {isTa ? 'ஆப்பில் இருந்து வெளியேற வேண்டுமா?' : 'Exit Bible App?'}
          </h3>

          {!isGoalMet ? (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '10px',
                padding: '0.65rem 0.85rem',
                margin: '0.5rem 0 0.75rem 0',
                textAlign: 'left',
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center'
              }}
            >
              <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.8125rem', color: '#dc2626', fontWeight: 600 }}>
                {isTa
                  ? `இன்றைய ${goalMin} நிமிட வாசிப்பு இலக்கை முடிக்க இன்னும் ${remainingMin} நிமிடம் உள்ளது. அர்ப்பணிப்பை முடித்துவிட்டு வெளியேறலாமா?`
                  : `You still have ${remainingMin} min left to finish today's ${goalMin}-min reading goal. Complete your daily time before leaving?`}
              </div>
            </div>
          ) : (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '10px',
                padding: '0.5rem 0.85rem',
                margin: '0.5rem 0 0.75rem 0',
                textAlign: 'center',
                fontSize: '0.8125rem',
                color: '#059669',
                fontWeight: 600
              }}
            >
              {isTa ? '✅ இன்றைய வேத வாசிப்பு இலக்கு நிறைவு பெற்றது!' : '✅ Today\'s scripture reading goal is completed!'}
            </div>
          )}

          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              margin: 0,
              fontFamily: isTa ? 'var(--font-tamil)' : 'inherit'
            }}
          >
            {isTa
              ? 'நீங்கள் பயன்பாட்டை விட்டு வெளியேற விரும்புகிறீர்களா?'
              : 'Are you sure you want to exit the Bible application?'}
          </p>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            width: '100%',
            marginTop: '0.25rem'
          }}
        >
          {/* Cancel / Stay Button */}
          <button
            onClick={onCancelExit}
            className="btn-pill"
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              fontSize: '0.9375rem',
              fontWeight: 600,
              borderRadius: '0.625rem',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              justifyContent: 'center'
            }}
          >
            {isTa ? 'இல்லை (தொடரவும்)' : 'No (Stay)'}
          </button>

          {/* Confirm Exit Button */}
          <button
            onClick={onConfirmExit}
            className="btn-pill"
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              fontSize: '0.9375rem',
              fontWeight: 600,
              borderRadius: '0.625rem',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
            }}
          >
            {isTa ? 'ஆம் (வெளியேறு)' : 'Yes (Exit)'}
          </button>
        </div>
      </div>
    </div>
  );
};
