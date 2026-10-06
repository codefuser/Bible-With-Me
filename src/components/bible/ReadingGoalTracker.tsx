import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Sparkles,
  Flame,
  X,
  Award,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Power,
  Sliders,
  RotateCcw
} from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { useAuth } from '../../context/AuthContext';
import { recordChapterCompletion } from '../../services/streakService';
import { logCloudReadingSession } from '../../services/userDataService';
import '../../styles/reading-tracker.css';

type TimerUiState = 'handle' | 'circle' | 'details';

export const ReadingGoalTracker: React.FC = () => {
  const { preferences, updatePreferences, currentBook, currentChapter, language, appLanguage } = useReading();
  const { user } = useAuth();
  const userId = user?.id || null;

  const isEnUI = (appLanguage || 'ta') === 'en';

  const goalMinutes = preferences.dailyGoalMinutes || 5;
  const totalGoalSeconds = goalMinutes * 60;

  const getTodayKey = () => {
    const today = new Date().toISOString().split('T')[0];
    return `bible_reading_sec_${today}`;
  };

  const getCelebratedKey = () => {
    const today = new Date().toISOString().split('T')[0];
    return `bible_reading_celebrated_${today}`;
  };

  // Screen width responsive check (laptop/desktop >= 1024px)
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Desktop manual minimize state
  const [isDesktopMinimized, setIsDesktopMinimized] = useState<boolean>(false);

  // Mobile state: First time on mobile starts as 'circle' (with percentage)
  // On desktop, popover state is handled when clicking the desktop pill
  const [uiState, setUiState] = useState<TimerUiState>(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      return 'handle'; // Desktop uses desktop pill by default
    }
    return 'circle'; // Mobile opens with percentage circle
  });

  const [customMinutesInput, setCustomMinutesInput] = useState<string>('');

  const [isTimingEnabled, setIsTimingEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bible_reading_timer_enabled') !== 'false';
    } catch {
      return true;
    }
  });

  const [secondsRead, setSecondsRead] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(getTodayKey());
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [isCelebratedToday, setIsCelebratedToday] = useState<boolean>(() => {
    try {
      return localStorage.getItem(getCelebratedKey()) === 'true';
    } catch {
      return false;
    }
  });

  const secondsReadRef = useRef(secondsRead);
  secondsReadRef.current = secondsRead;

  // Mobile view: Timer stays visible permanently as a circle with percentage without auto-minimizing
  // Desktop view: Desktop pill is used instead.

  // Toggle timing enabled / disabled
  const handleToggleTiming = () => {
    setIsTimingEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('bible_reading_timer_enabled', next.toString());
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  // Active reading timer (only runs when timing is ON and browser tab is visible)
  useEffect(() => {
    if (!isTimingEnabled) return;

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setSecondsRead((prev) => {
          const next = prev + 1;
          if (next % 5 === 0) {
            try {
              localStorage.setItem(getTodayKey(), next.toString());
            } catch (e) {
              // ignore
            }
          }
          return next;
        });
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      try {
        localStorage.setItem(getTodayKey(), secondsReadRef.current.toString());
      } catch (e) {
        // ignore
      }
    };
  }, [isTimingEnabled]);

  // Check goal completion
  useEffect(() => {
    if (secondsRead >= totalGoalSeconds && !isCelebratedToday) {
      setIsCelebratedToday(true);
      setShowCelebration(true);
      try {
        localStorage.setItem(getCelebratedKey(), 'true');
      } catch (e) {
        // ignore
      }

      // Record daily streak
      recordChapterCompletion(userId);

      // Log to Supabase Cloud if user is authenticated
      if (userId && currentBook) {
        logCloudReadingSession(
          userId,
          currentBook.name_en,
          currentChapter,
          secondsRead,
          goalMinutes,
          true
        );
      }
    }
  }, [secondsRead, totalGoalSeconds, isCelebratedToday, userId, currentBook, currentChapter, goalMinutes]);

  const percent = Math.min(100, Math.round((secondsRead / totalGoalSeconds) * 100));
  const isGoalMet = secondsRead >= totalGoalSeconds;

  const formatMinSec = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const remainingSeconds = Math.max(0, totalGoalSeconds - secondsRead);

  // Circular progress ring calculations: radius 18 -> circumference ~113.097
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  // Desktop ring radius 12 -> circumference ~75.398
  const desktopRadius = 12;
  const desktopCircumference = 2 * Math.PI * desktopRadius;
  const desktopDashoffset = desktopCircumference - (percent / 100) * desktopCircumference;

  const handleGoalChange = (newGoalMin: number) => {
    updatePreferences({ dailyGoalMinutes: newGoalMin });
  };

  // Custom goal submit handler
  const handleSaveCustomGoal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = parseInt(customMinutesInput.trim(), 10);
    if (!isNaN(val) && val > 0 && val <= 360) {
      handleGoalChange(val);
      setCustomMinutesInput('');
    }
  };

  // Close details popover when clicking outside
  useEffect(() => {
    if (uiState !== 'details') return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest('.reading-tracker-popover') &&
        !target.closest('.reading-tracker-circle') &&
        !target.closest('.reading-tracker-desktop-pill')
      ) {
        setUiState(isDesktop ? 'handle' : 'handle');
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [uiState, isDesktop]);

  // Reset today's timer to 0:00
  const handleResetTimer = () => {
    setSecondsRead(0);
    setIsCelebratedToday(false);
    try {
      localStorage.setItem(getTodayKey(), '0');
      localStorage.removeItem(getCelebratedKey());
    } catch (e) {
      // ignore
    }
  };

  return (
    <>
      {/* ───────────────────────────────────────────────────────────
          A. LAPTOP / DESKTOP VIEW
          Persistent widget showing timing & percentage.
          Does NOT minimize automatically. User can minimize if desired.
          ─────────────────────────────────────────────────────────── */}
      {isDesktop && !isDesktopMinimized && (
        <div
          className={`reading-tracker-desktop-pill ${isGoalMet ? 'completed' : ''}`}
          onClick={() => setUiState('details')}
          title={
            isTimingEnabled
              ? `${isEnUI ? 'Reading Goal' : 'வாசிப்பு இலக்கு'}: ${formatMinSec(secondsRead)} / ${formatMinSec(totalGoalSeconds)} (${percent}%) - ${isEnUI ? 'Click for settings' : 'அமைப்புகளுக்கு தட்டவும்'}`
              : `${isEnUI ? 'Timer Paused (Click to resume)' : 'டைமர் நிறுத்தி வைக்கப்பட்டுள்ளது (தொடங்க தட்டவும்)'}`
          }
        >
          <div className="reading-tracker-desktop-ring">
            <svg viewBox="0 0 32 32" width="32" height="32">
              <circle
                className="reading-tracker-ring-bg"
                cx="16"
                cy="16"
                r={desktopRadius}
                strokeWidth="2.5"
              />
              {isTimingEnabled && (
                <circle
                  className="reading-tracker-ring-val"
                  cx="16"
                  cy="16"
                  r={desktopRadius}
                  strokeWidth="2.5"
                  strokeDasharray={desktopCircumference}
                  strokeDashoffset={desktopDashoffset}
                  transform="rotate(-90 16 16)"
                />
              )}
            </svg>
            <div className="reading-tracker-desktop-ring-icon">
              {isTimingEnabled ? (
                <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>{percent}%</span>
              ) : (
                <Pause size={10} />
              )}
            </div>
          </div>

          <div className="reading-tracker-desktop-data">
            <div className="reading-tracker-desktop-time">
              {formatMinSec(secondsRead)} / {formatMinSec(totalGoalSeconds)}
            </div>
            <div className="reading-tracker-desktop-pct">
              {isGoalMet
                ? (isEnUI ? '100% Completed' : 'இலக்கு முடிந்தது')
                : `${percent}% ${isEnUI ? 'completed' : 'முடிந்தது'}`}
            </div>
          </div>

          {/* Minimize button (user can minimize if desired) */}
          <button
            type="button"
            className="reading-tracker-desktop-min-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsDesktopMinimized(true);
            }}
            title={isEnUI ? 'Minimize Timer' : 'டைமரை சுருக்கு'}
            aria-label="Minimize Timer"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* When minimized on desktop, show sleek side handle */}
      {isDesktop && isDesktopMinimized && (
        <button
          type="button"
          className="reading-tracker-handle"
          onClick={() => setIsDesktopMinimized(false)}
          title={`${formatMinSec(secondsRead)} (${percent}%) - ${isEnUI ? 'Expand Timer' : 'டைமரை விரிக்க'}`}
          aria-label="Expand Timer"
        >
          <ChevronLeft size={15} className="reading-tracker-handle-arrow" />
        </button>
      )}

      {/* ───────────────────────────────────────────────────────────
          B. MOBILE / PHONE VIEW
          Starts with percentage ring on first load.
          Auto-minimizes into tiny side handle within 5s or on read.
          ─────────────────────────────────────────────────────────── */}
      {!isDesktop && (
        <>
          {/* Circular percentage widget (Always visible at bottom on mobile without minimizing) */}
          {uiState !== 'details' && (
            <div
              className={`reading-tracker-circle ${isGoalMet ? 'completed' : ''}`}
              onClick={() => setUiState('details')}
              title={isEnUI ? 'Click for goal settings' : 'இலக்கு அமைப்புகளுக்கு தட்டவும்'}
              role="button"
              tabIndex={0}
            >
              <svg className="reading-tracker-svg" viewBox="0 0 44 44">
                <circle
                  className="reading-tracker-ring-bg"
                  cx="22"
                  cy="22"
                  r={radius}
                />
                {isTimingEnabled && (
                  <circle
                    className="reading-tracker-ring-val"
                    cx="22"
                    cy="22"
                    r={radius}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 22 22)"
                  />
                )}
              </svg>
              <div className="reading-tracker-percent-center">
                {isTimingEnabled ? `${percent}%` : <Pause size={14} />}
              </div>
            </div>
          )}
        </>
      )}

      {/* ───────────────────────────────────────────────────────────
          C. EXPANDED GOAL & CUSTOM TIMER DETAILS CARD (Desktop & Mobile)
          ─────────────────────────────────────────────────────────── */}
      {uiState === 'details' && (
        <div className="reading-tracker-popover" role="dialog" aria-modal="true">
          <div className="reading-tracker-popover-header">
            <h4 className="reading-tracker-popover-title">
              <Sparkles size={16} color="#2563eb" />
              {isEnUI ? "Today's Reading Goal" : 'இன்றைய வாசிப்பு இலக்கு'}
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                type="button"
                className="reading-tracker-close-btn"
                onClick={handleResetTimer}
                title={isEnUI ? "Reset today's timer (0:00)" : 'இன்றைய டைமரை மீட்டமை (0:00)'}
                aria-label="Reset Timer"
              >
                <RotateCcw size={14} />
              </button>
              <button
                type="button"
                className="reading-tracker-close-btn"
                onClick={() => {
                  setUiState(isDesktop ? 'handle' : 'circle');
                }}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div>
            <div className="reading-tracker-stats-row">
              <span className="reading-tracker-time-text">
                {formatMinSec(secondsRead)}
              </span>
              <span className="reading-tracker-target-text">
                {isEnUI ? 'Goal' : 'இலக்கு'}: {goalMinutes} {isEnUI ? 'min' : 'நிமி'} ({percent}%)
              </span>
            </div>

            <div className="reading-tracker-progress-bar-bg">
              <div
                className={`reading-tracker-progress-bar-val ${isGoalMet ? 'completed' : ''}`}
                style={{ width: `${percent}%` }}
              />
            </div>

            <p className="reading-tracker-status-text">
              {!isTimingEnabled ? (
                isEnUI
                  ? '⏸ Timer tracking is currently paused.'
                  : '⏸ வாசிப்பு நேரம் தற்போது நிறுத்தி வைக்கப்பட்டுள்ளது.'
              ) : isGoalMet ? (
                isEnUI
                  ? '🎉 Congratulations! You have completed today\'s goal!'
                  : '🎉 இன்றைய இலக்கை வெற்றிகரமாக முடித்துவிட்டீர்கள்!'
              ) : (
                isEnUI
                  ? `${formatMinSec(remainingSeconds)} remaining to reach goal.`
                  : `இலக்கை நிறைவு செய்ய இன்னும் ${formatMinSec(remainingSeconds)} தேவை.`
              )}
            </p>
          </div>

          {/* Timing ON / OFF Toggle Row */}
          <div className="reading-tracker-toggle-row">
            <span className="reading-tracker-toggle-label">
              <Power size={14} />
              {isEnUI ? 'Track Reading Time' : 'வாசிப்பு நேரத்தை பதிவு செய்'}
            </span>
            <button
              type="button"
              className={`reading-tracker-toggle-btn ${isTimingEnabled ? 'active' : ''}`}
              onClick={handleToggleTiming}
              title={isTimingEnabled ? 'Pause tracking' : 'Resume tracking'}
            >
              {isTimingEnabled ? (
                <>
                  <Pause size={12} />
                  <span>{isEnUI ? 'ON' : 'இயக்கம்'}</span>
                </>
              ) : (
                <>
                  <Play size={12} />
                  <span>{isEnUI ? 'OFF' : 'நிறுத்தம்'}</span>
                </>
              )}
            </button>
          </div>

          {/* Preset Goal Selector */}
          <div>
            <div className="reading-tracker-goal-label">
              {isEnUI ? 'Select Goal:' : 'இலக்கு தேர்வு:'}
            </div>
            <div className="reading-tracker-goal-selector">
              <button
                type="button"
                className={`reading-tracker-goal-btn ${goalMinutes === 5 ? 'active' : ''}`}
                onClick={() => handleGoalChange(5)}
              >
                5 {isEnUI ? 'min' : 'நிமி'}
              </button>
              <button
                type="button"
                className={`reading-tracker-goal-btn ${goalMinutes === 15 ? 'active' : ''}`}
                onClick={() => handleGoalChange(15)}
              >
                15 {isEnUI ? 'min' : 'நிமி'}
              </button>
              <button
                type="button"
                className={`reading-tracker-goal-btn ${goalMinutes === 30 ? 'active' : ''}`}
                onClick={() => handleGoalChange(30)}
              >
                30 {isEnUI ? 'min' : 'நிமி'}
              </button>
              {goalMinutes !== 5 && goalMinutes !== 15 && goalMinutes !== 30 && (
                <button
                  type="button"
                  className="reading-tracker-goal-btn active"
                >
                  {goalMinutes} {isEnUI ? 'min' : 'நிமி'}
                </button>
              )}
            </div>

            {/* Custom Timer Input Field */}
            <form onSubmit={handleSaveCustomGoal} className="reading-tracker-custom-box">
              <input
                type="number"
                min="1"
                max="360"
                value={customMinutesInput}
                onChange={(e) => setCustomMinutesInput(e.target.value)}
                placeholder={isEnUI ? 'Custom min (e.g. 20)' : 'தனிப்பயன் நிமி (எ.கா. 20)'}
                className="reading-tracker-custom-input"
              />
              <button
                type="submit"
                className="reading-tracker-custom-btn"
              >
                {isEnUI ? 'Set' : 'அமைக்க'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────
          D. GOAL REACHED CELEBRATION MODAL
          ─────────────────────────────────────────────────────────── */}
      {showCelebration && (
        <div className="celebration-backdrop" role="dialog" aria-modal="true">
          <div className="celebration-card">
            <div className="celebration-icon-box">
              <Award size={36} />
            </div>

            <div>
              <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.35rem', fontWeight: 800 }}>
                {isEnUI ? '🎉 Congratulations! Goal Achieved!' : '🎉 வாழ்த்துகள்! இன்றைய இலக்கு நிறைவு!'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {isEnUI
                  ? `You have successfully completed today's ${goalMinutes}-minute Scripture reading. Your daily spiritual streak is secured!`
                  : `இன்றைய ${goalMinutes} நிமிட வேத வாசிப்பை வெற்றிகரமாக முடித்துவிட்டீர்கள். உங்கள் ஆன்மீகத் தொடர் (Streak) உறுதி செய்யப்பட்டது!`}
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                color: '#059669',
                fontWeight: 700,
                fontSize: '0.875rem'
              }}
            >
              <Flame size={18} /> Daily Reading Streak Active
            </div>

            <button
              type="button"
              className="onboarding-btn onboarding-btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              onClick={() => setShowCelebration(false)}
            >
              {isEnUI ? 'Continue Reading' : 'தொடர்ந்து வாசிக்கிறேன் · Continue Reading'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
