import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  CheckCircle2,
  Sparkles,
  Flame,
  X,
  Award,
  ChevronUp,
  Volume2
} from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { useAuth } from '../../context/AuthContext';
import { recordChapterCompletion } from '../../services/streakService';
import { logCloudReadingSession } from '../../services/userDataService';
import '../../styles/reading-tracker.css';

export const ReadingGoalTracker: React.FC = () => {
  const { preferences, updatePreferences, currentBook, currentChapter } = useReading();
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

  const [secondsRead, setSecondsRead] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(getTodayKey());
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
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

  // Active reading timer
  useEffect(() => {
    const interval = setInterval(() => {
      // Only count active reading when browser tab is visible and focused
      if (document.visibilityState === 'visible') {
        setSecondsRead((prev) => {
          const next = prev + 1;
          // Periodically sync to local storage
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

  // SVG Progress Ring calculations
  const radius = 11;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const handleGoalChange = (newGoalMin: number) => {
    updatePreferences({ dailyGoalMinutes: newGoalMin });
  };

  return (
    <>
      {/* Floating Pill Badge */}
      <div
        className={`reading-tracker-pill ${isGoalMet ? 'completed' : ''}`}
        onClick={() => setIsExpanded((prev) => !prev)}
        title="இன்றைய வேத வாசிப்பு இலக்கு (Daily Reading Goal)"
      >
        <div className="reading-tracker-ring-box">
          <svg className="reading-tracker-ring-svg" viewBox="0 0 28 28">
            <circle
              className="reading-tracker-ring-bg"
              cx="14"
              cy="14"
              r={radius}
            />
            <circle
              className="reading-tracker-ring-val"
              cx="14"
              cy="14"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div style={{ position: 'absolute' }}>
            {isGoalMet ? (
              <CheckCircle2 size={12} color="#10b981" />
            ) : (
              <Clock size={11} color="var(--text-muted)" />
            )}
          </div>
        </div>

        <div className="reading-tracker-text">
          <div className="reading-tracker-time">
            {formatMinSec(secondsRead)} / {formatMinSec(totalGoalSeconds)}
          </div>
          <div className="reading-tracker-sub">
            {isGoalMet ? 'இலக்கு முடிந்தது (100%)' : `${percent}% முடிந்தது`}
          </div>
        </div>
      </div>

      {/* Popover Expanded Card */}
      {isExpanded && (
        <div className="reading-tracker-popover">
          <div className="reading-tracker-popover-header">
            <h4 className="reading-tracker-popover-title">
              <Sparkles size={16} color="#2563eb" /> இன்றைய வாசிப்பு இலக்கு
            </h4>
            <button
              type="button"
              className="reading-tracker-close-btn"
              onClick={() => setIsExpanded(false)}
            >
              <X size={16} />
            </button>
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '0.35rem'
              }}
            >
              <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                {formatMinSec(secondsRead)}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                இலக்கு: {goalMinutes} நிமி ({percent}%)
              </span>
            </div>

            <div className="reading-tracker-progress-bar-bg">
              <div
                className={`reading-tracker-progress-bar-val ${isGoalMet ? 'completed' : ''}`}
                style={{ width: `${percent}%` }}
              />
            </div>

            <p style={{ margin: '0.45rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {isGoalMet
                ? '🎉 இன்றைய இலக்கை வெற்றிகரமாக முடித்துவிட்டீர்கள்!'
                : `இலக்கை நிறைவு செய்ய இன்னும் ${formatMinSec(remainingSeconds)} தேவை.`}
            </p>
          </div>

          {/* Quick Goal Change */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              இலக்கை மாற்றவும் (Change Goal):
            </div>
            <div className="reading-tracker-goal-selector">
              <button
                type="button"
                className={`reading-tracker-goal-btn ${goalMinutes === 5 ? 'active' : ''}`}
                onClick={() => handleGoalChange(5)}
              >
                5 நிமி
              </button>
              <button
                type="button"
                className={`reading-tracker-goal-btn ${goalMinutes === 15 ? 'active' : ''}`}
                onClick={() => handleGoalChange(15)}
              >
                15 நிமி
              </button>
              <button
                type="button"
                className={`reading-tracker-goal-btn ${goalMinutes === 30 ? 'active' : ''}`}
                onClick={() => handleGoalChange(30)}
              >
                30 நிமி
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Reached Celebration Modal */}
      {showCelebration && (
        <div className="celebration-backdrop" role="dialog">
          <div className="celebration-card">
            <div className="celebration-icon-box">
              <Award size={36} />
            </div>

            <div>
              <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.35rem', fontWeight: 800 }}>
                🎉 வாழ்த்துகள்! இன்றைய இலக்கு நிறைவு!
              </h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                இன்றைய <strong>{goalMinutes} நிமிட</strong> வேத வாசிப்பை வெற்றிகரமாக முடித்துவிட்டீர்கள். உங்கள் ஆன்மீகத் தொடர் (Streak) உறுதி செய்யப்பட்டது!
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
              தொடர்ந்து வாசிக்கிறேன் · Continue Reading
            </button>
          </div>
        </div>
      )}
    </>
  );
};
