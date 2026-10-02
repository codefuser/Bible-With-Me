import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Sparkles,
  Flame,
  X,
  Award,
  ChevronLeft,
  Play,
  Pause,
  Power
} from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { useAuth } from '../../context/AuthContext';
import { recordChapterCompletion } from '../../services/streakService';
import { logCloudReadingSession } from '../../services/userDataService';
import '../../styles/reading-tracker.css';

type TimerUiState = 'handle' | 'circle' | 'details';

export const ReadingGoalTracker: React.FC = () => {
  const { preferences, updatePreferences, currentBook, currentChapter, language } = useReading();
  const { user } = useAuth();
  const userId = user?.id || null;

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

  const [uiState, setUiState] = useState<TimerUiState>('handle');
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

  const autoCollapseTimerRef = useRef<any>(null);

  const startAutoCollapse = () => {
    if (autoCollapseTimerRef.current) {
      clearTimeout(autoCollapseTimerRef.current);
    }
    autoCollapseTimerRef.current = setTimeout(() => {
      setUiState('handle');
    }, 4000);
  };

  const clearAutoCollapse = () => {
    if (autoCollapseTimerRef.current) {
      clearTimeout(autoCollapseTimerRef.current);
      autoCollapseTimerRef.current = null;
    }
  };

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

  // Clean up auto-collapse timer on unmount
  useEffect(() => {
    return () => {
      clearAutoCollapse();
    };
  }, []);

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

  // Circular progress ring dimensions: radius 18 -> circumference ~113.097
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const handleGoalChange = (newGoalMin: number) => {
    updatePreferences({ dailyGoalMinutes: newGoalMin });
  };

  // Close details popover when clicking outside
  useEffect(() => {
    if (uiState !== 'details') return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.reading-tracker-popover') && !target.closest('.reading-tracker-circle')) {
        setUiState('handle');
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [uiState]);

  return (
    <>
      {/* 1. COLLAPSED STATE: Tiny side handle attached to right screen edge */}
      {uiState === 'handle' && (
        <button
          type="button"
          className={`reading-tracker-handle ${!isTimingEnabled ? 'disabled' : ''}`}
          onClick={() => {
            setUiState('circle');
            startAutoCollapse();
          }}
          title={
            isTimingEnabled
              ? `${language === 'en' ? 'Reading Goal' : 'வாசிப்பு இலக்கு'}: ${percent}% (${formatMinSec(secondsRead)} / ${formatMinSec(totalGoalSeconds)})`
              : `${language === 'en' ? 'Timer Paused (Click to view)' : 'டைமர் நிறுத்தி வைக்கப்பட்டுள்ளது (பார்க்க தட்டவும்)'}`
          }
          aria-label="Toggle Reading Goal Indicator"
        >
          {isTimingEnabled ? (
            <ChevronLeft size={15} className="reading-tracker-handle-arrow" />
          ) : (
            <Clock size={13} className="reading-tracker-handle-paused" />
          )}
        </button>
      )}

      {/* 2. CIRCULAR PROGRESS INDICATOR (Auto-collapses back to handle) */}
      {uiState === 'circle' && (
        <div
          className={`reading-tracker-circle ${isGoalMet ? 'completed' : ''}`}
          onClick={() => {
            clearAutoCollapse();
            setUiState('details');
          }}
          onMouseEnter={clearAutoCollapse}
          onMouseLeave={startAutoCollapse}
          title={language === 'en' ? 'Click for goal settings' : 'இலக்கு அமைப்புகளுக்கு தட்டவும்'}
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

      {/* 3. EXPANDED DETAILS CARD POPOVER */}
      {uiState === 'details' && (
        <div className="reading-tracker-popover" role="dialog" aria-modal="true">
          <div className="reading-tracker-popover-header">
            <h4 className="reading-tracker-popover-title">
              <Sparkles size={16} color="#2563eb" />
              {language === 'en' ? "Today's Reading Goal" : 'இன்றைய வாசிப்பு இலக்கு'}
            </h4>
            <button
              type="button"
              className="reading-tracker-close-btn"
              onClick={() => {
                setUiState('handle');
              }}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div>
            <div className="reading-tracker-stats-row">
              <span className="reading-tracker-time-text">
                {formatMinSec(secondsRead)}
              </span>
              <span className="reading-tracker-target-text">
                {language === 'en' ? 'Goal' : 'இலக்கு'}: {goalMinutes} {language === 'en' ? 'min' : 'நிமி'} ({percent}%)
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
                language === 'en'
                  ? '⏸ Timer tracking is currently paused.'
                  : '⏸ வாசிப்பு நேரம் தற்போது நிறுத்தி வைக்கப்பட்டுள்ளது.'
              ) : isGoalMet ? (
                language === 'en'
                  ? '🎉 Congratulations! You have completed today\'s goal!'
                  : '🎉 இன்றைய இலக்கை வெற்றிகரமாக முடித்துவிட்டீர்கள்!'
              ) : (
                language === 'en'
                  ? `${formatMinSec(remainingSeconds)} remaining to reach goal.`
                  : `இலக்கை நிறைவு செய்ய இன்னும் ${formatMinSec(remainingSeconds)} தேவை.`
              )}
            </p>
          </div>

          {/* Timing ON / OFF Toggle Row */}
          <div className="reading-tracker-toggle-row">
            <span className="reading-tracker-toggle-label">
              <Power size={14} />
              {language === 'en' ? 'Track Reading Time' : 'வாசிப்பு நேரத்தை பதிவு செய்'}
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
                  <span>{language === 'en' ? 'ON' : 'இயக்கம்'}</span>
                </>
              ) : (
                <>
                  <Play size={12} />
                  <span>{language === 'en' ? 'OFF' : 'நிறுத்தம்'}</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Goal Selector */}
          <div>
            <div className="reading-tracker-goal-label">
              {language === 'en' ? 'Change Goal:' : 'இலக்கை மாற்றவும்:'}
            </div>
            <div className="reading-tracker-goal-selector">
              <button
                type="button"
                className={`reading-tracker-goal-btn ${goalMinutes === 5 ? 'active' : ''}`}
                onClick={() => handleGoalChange(5)}
              >
                5 {language === 'en' ? 'min' : 'நிமி'}
              </button>
              <button
                type="button"
                className={`reading-tracker-goal-btn ${goalMinutes === 15 ? 'active' : ''}`}
                onClick={() => handleGoalChange(15)}
              >
                15 {language === 'en' ? 'min' : 'நிமி'}
              </button>
              <button
                type="button"
                className={`reading-tracker-goal-btn ${goalMinutes === 30 ? 'active' : ''}`}
                onClick={() => handleGoalChange(30)}
              >
                30 {language === 'en' ? 'min' : 'நிமி'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. GOAL REACHED CELEBRATION MODAL */}
      {showCelebration && (
        <div className="celebration-backdrop" role="dialog" aria-modal="true">
          <div className="celebration-card">
            <div className="celebration-icon-box">
              <Award size={36} />
            </div>

            <div>
              <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.35rem', fontWeight: 800 }}>
                {language === 'en' ? '🎉 Congratulations! Goal Achieved!' : '🎉 வாழ்த்துகள்! இன்றைய இலக்கு நிறைவு!'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {language === 'en'
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
              {language === 'en' ? 'Continue Reading' : 'தொடர்ந்து வாசிக்கிறேன் · Continue Reading'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
