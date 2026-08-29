import React, { useEffect, useMemo } from 'react';
import {
  X,
  Flame,
  Calendar,
  Award,
  BookOpen,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Target,
  Trophy
} from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { getTodayVerseRef, formatDateKey } from '../../services/dailyVerseService';
import '../../styles/streaks.css';

/* ── Badge Definitions ──────────────────────────────────────────── */
interface BadgeDefinition {
  id: string;
  icon: string;
  nameTa: string;
  nameEn: string;
  descTa: string;
  descEn: string;
  isUnlocked: (streak: number, best: number, total: number) => boolean;
}

const BADGES: BadgeDefinition[] = [
  {
    id: 'first_step',
    icon: '🌱',
    nameTa: 'முதல் அடி',
    nameEn: 'First Step',
    descTa: '1 அதிகாரம்',
    descEn: '1 chapter',
    isUnlocked: (_, __, total) => total >= 1,
  },
  {
    id: 'streak_3',
    icon: '🔥',
    nameTa: '3-நாள் தொடர்',
    nameEn: '3-Day Streak',
    descTa: '3 நாட்கள்',
    descEn: '3 days',
    isUnlocked: (s, b) => Math.max(s, b) >= 3,
  },
  {
    id: 'streak_7',
    icon: '⭐',
    nameTa: '7-நாள் முன்னோடி',
    nameEn: '7-Day Pioneer',
    descTa: '7 நாட்கள்',
    descEn: '7 days',
    isUnlocked: (s, b) => Math.max(s, b) >= 7,
  },
  {
    id: 'streak_30',
    icon: '🏆',
    nameTa: 'மாத நாயகன்',
    nameEn: 'Monthly Master',
    descTa: '30 நாட்கள்',
    descEn: '30 days',
    isUnlocked: (s, b) => Math.max(s, b) >= 30,
  },
  {
    id: 'chapters_10',
    icon: '📖',
    nameTa: '10 அதிகாரங்கள்',
    nameEn: '10 Chapters',
    descTa: '10 அதிகாரங்கள்',
    descEn: '10 chapters',
    isUnlocked: (_, __, total) => total >= 10,
  },
  {
    id: 'chapters_50',
    icon: '👑',
    nameTa: 'வேத விரும்பி',
    nameEn: 'Bible Devotee',
    descTa: '50 அதிகாரங்கள்',
    descEn: '50 chapters',
    isUnlocked: (_, __, total) => total >= 50,
  },
];

/* ── Constants ──────────────────────────────────────────────────── */
const WEEKDAYS_TA = ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச'];
const WEEKDAYS_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const TOTAL_BIBLE_CHAPTERS = 1189;

const getMotivMsg = (streak: number, isTa: boolean): string => {
  if (streak === 0) return isTa ? 'இன்று தொடங்குங்கள்!' : 'Start your journey today!';
  if (streak <= 2) return isTa ? `${streak} நாட்கள் — நல்ல ஆரம்பம்!` : `${streak} days — great start!`;
  if (streak <= 6) return isTa ? `${streak} நாட்கள் — பழக்கம் உருவாகுகிறது!` : `${streak} days — habit forming!`;
  if (streak <= 13) return isTa ? `${streak} நாட்கள் — மிகவும் அருமை!` : `${streak} days — amazing!`;
  if (streak <= 29) return isTa ? `${streak} நாட்கள் — நீங்கள் இலக்கில் இருக்கிறீர்கள்!` : `${streak} days — you're on a mission!`;
  return isTa ? `${streak} நாட்கள் — அசாத்தியம்!` : `${streak} days — incredible!`;
};

/* ── Component ──────────────────────────────────────────────────── */
export const StreakStatsModal: React.FC = () => {
  const {
    isStreakModalOpen,
    setIsStreakModalOpen,
    streakData,
    handleUpdateDailyGoal,
    language,
    currentBook,
    currentChapter,
    setBookAndChapter,
    recordChapterRead,
    books
  } = useReading();

  // Lock background scroll
  useEffect(() => {
    if (isStreakModalOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isStreakModalOpen]);

  const isTa = language === 'ta';
  const todayRef = getTodayVerseRef();
  const dailyRevivalBook = todayRef ? books.find((b) => b.id === todayRef.book_id) : null;

  const todayCount = Math.min(streakData?.dailyGoal ?? 1, streakData?.todayCount ?? 0);
  const goalMet = todayCount >= (streakData?.dailyGoal ?? 1);
  const progressPct = streakData
    ? Math.min(100, Math.round((todayCount / streakData.dailyGoal) * 100))
    : 0;
  const lifetimePct = Math.min(100, Math.round(((streakData?.totalChapters ?? 0) / TOTAL_BIBLE_CHAPTERS) * 100));

  // This week's 7 dots (Sun–Sat)
  const weekDots = useMemo(() => {
    if (!streakData) return [];
    const today = new Date();
    const todayDay = today.getDay();
    return (isTa ? WEEKDAYS_TA : WEEKDAYS_EN).map((label, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - todayDay + i);
      const key = formatDateKey(d);
      return {
        label,
        active: (streakData.calendarMap?.[key] ?? 0) > 0,
        isToday: i === todayDay,
      };
    });
  }, [streakData, isTa]);

  // 28-day calendar cells
  const daysArray = useMemo(() => {
    if (!streakData) return [];
    const today = new Date();
    return Array.from({ length: 28 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (27 - i));
      const dateStr = formatDateKey(d);
      return { dateStr, dayNum: d.getDate(), count: streakData.calendarMap?.[dateStr] ?? 0 };
    });
  }, [streakData]);

  if (!isStreakModalOpen || !streakData) return null;

  const weekHeaders = isTa ? WEEKDAYS_TA : WEEKDAYS_EN;
  const motivMsg = getMotivMsg(streakData.streak, isTa);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 600,
        backgroundColor: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={() => setIsStreakModalOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          maxHeight: '88vh',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '0.875rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.875rem 1.125rem',
            borderBottom: '1px solid var(--border-color)',
            flexShrink: 0,
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '7px',
              backgroundColor: 'var(--accent-soft)', color: 'var(--accent-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Target size={16} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {isTa ? 'தினசரி வாசிப்புத் திட்டம்' : 'Daily Reading Plan'}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {isTa ? 'வாசிப்பு இலக்கு & பழக்க கண்காணிப்பு' : 'Goal & Habit Tracker'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsStreakModalOpen(false)}
            style={{
              width: '28px', height: '28px', borderRadius: '50%',
              border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
            }}
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable Body — overflow-x hidden prevents side scroll */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '0.875rem 1.125rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>

          {/* ── 1. Stat Cards ──────────────────────────────────── */}
          <div className="streak-stats-grid">
            <div className="streak-stat-card">
              <div className="streak-stat-val" style={{ color: 'var(--accent-color)' }}>🔥 {streakData.streak}</div>
              <div className="streak-stat-lbl">{isTa ? 'தொடர் நாட்கள்' : 'Streak'}</div>
            </div>
            <div className="streak-stat-card">
              <div className="streak-stat-val">🏆 {streakData.bestStreak}</div>
              <div className="streak-stat-lbl">{isTa ? 'சிறந்த தொடர்' : 'Best'}</div>
            </div>
            <div className="streak-stat-card">
              <div className="streak-stat-val">📖 {streakData.totalChapters ?? 0}</div>
              <div className="streak-stat-lbl">{isTa ? 'மொத்த அதிகாரங்கள்' : 'Total Ch.'}</div>
            </div>
          </div>

          {/* ── 2. Today's Routine Block ────────────────────────── */}
          <div className="today-tasks-container">
            {/* Header */}
            <div className="today-tasks-header">
              <span className="today-tasks-title">{isTa ? 'இன்றைய வாசிப்புப் பணி' : "Today's Routine"}</span>
              <span className="today-tasks-counter">
                {todayCount}&nbsp;/&nbsp;{streakData.dailyGoal}&nbsp;{isTa ? 'அதி.' : 'Ch'}
              </span>
            </div>

            {/* Thin progress bar */}
            <div className="streak-progress-bar-track">
              <div className="streak-progress-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>

            {/* Weekly dots */}
            <div className="week-dots-row">
              {weekDots.map((dot, i) => (
                <div key={i} className="week-dot-item">
                  <span className="week-dot-label">{dot.label}</span>
                  <div className={`week-dot${dot.active ? ' active' : ''}${dot.isToday ? ' today' : ''}`} />
                </div>
              ))}
            </div>

            {/* Motivational message */}
            <p className="streak-motive-msg">{motivMsg}</p>

            {/* Task 1: Current Chapter */}
            <div className="task-item-card">
              <div className="task-item-info">
                <span className="task-item-badge">{isTa ? 'தற்போதைய அதிகாரம்' : 'Current Chapter'}</span>
                <span className="task-item-title">{isTa ? currentBook.name_ta : currentBook.name_en} {currentChapter}</span>
              </div>
              <div className="task-item-actions">
                <button
                  className="btn-pill"
                  onClick={() => setIsStreakModalOpen(false)}
                  style={{ height: '1.75rem', padding: '0 0.5rem', fontSize: '0.6875rem', gap: '0.1875rem' }}
                >
                  <span>{isTa ? 'வாசிக்க' : 'Read'}</span>
                  <ArrowRight size={11} />
                </button>
                <button
                  className={`task-complete-btn${goalMet ? ' completed' : ''}`}
                  onClick={() => recordChapterRead(currentBook, currentChapter, 1)}
                >
                  <CheckCircle2 size={12} />
                  <span>{goalMet ? (isTa ? 'முடித்தீர்கள்' : 'Done!') : (isTa ? 'முடித்தேன்' : 'Mark Done')}</span>
                </button>
              </div>
            </div>

            {/* Task 2: Daily Revival Verse */}
            {dailyRevivalBook && todayRef && (
              <div className="task-item-card">
                <div className="task-item-info">
                  <span className="task-item-badge revival">
                    <Sparkles size={9} />
                    {isTa ? 'இன்றைய எழுப்புதல் வசனம்' : "Today's Revival Word"}
                  </span>
                  <span className="task-item-title">
                    {isTa ? dailyRevivalBook.name_ta : dailyRevivalBook.name_en} {todayRef.chapter}:{todayRef.verse}
                  </span>
                </div>
                <div className="task-item-actions">
                  <button
                    className="btn-pill"
                    onClick={() => {
                      setBookAndChapter(dailyRevivalBook, todayRef.chapter, todayRef.verse);
                      setIsStreakModalOpen(false);
                    }}
                    style={{ height: '1.75rem', padding: '0 0.5rem', fontSize: '0.6875rem', gap: '0.1875rem' }}
                  >
                    <span>{isTa ? 'தியானிக்க' : 'Meditate'}</span>
                    <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── 3. Goal Selector ────────────────────────────────── */}
          <div className="streak-goal-selector">
            <div className="streak-goal-selector-label">
              <div className="streak-goal-selector-title">{isTa ? 'தினசரி வாசிப்பு இலக்கு' : 'Daily Reading Target'}</div>
              <div className="streak-goal-selector-sub">{isTa ? 'ஒரு நாளைக்கு எத்தனை அதிகாரங்கள்?' : 'Chapters per day'}</div>
            </div>
            <div className="streak-goal-btn-group">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={`streak-goal-num-btn${streakData.dailyGoal === n ? ' active' : ''}`}
                  onClick={() => handleUpdateDailyGoal(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* ── 4. 28-Day Heatmap ───────────────────────────────── */}
          <div className="calendar-section">
            <div className="section-title">
              <Calendar size={13} />
              {isTa ? '28 நாட்கள் வாசிப்பு வரைபடம்' : '28-Day Activity'}
            </div>
            {/* Weekday row */}
            <div className="calendar-heatmap-grid" style={{ marginBottom: '0.1875rem' }}>
              {weekHeaders.map((w, i) => (
                <div key={i} className="calendar-weekday-header">{w}</div>
              ))}
            </div>
            {/* Days grid */}
            <div className="calendar-heatmap-grid">
              {daysArray.map((day) => (
                <div
                  key={day.dateStr}
                  className={`calendar-day-cell${day.count >= 2 ? ' active-2' : day.count === 1 ? ' active-1' : ''}`}
                  title={`${day.dateStr}: ${day.count}`}
                >
                  {day.dayNum}
                </div>
              ))}
            </div>
          </div>

          {/* ── 5. Achievement Badges ────────────────────────────── */}
          <div>
            <div className="section-title">
              <Award size={13} />
              {isTa ? 'சாதனை இலக்குகள்' : 'Reading Milestones'}
            </div>
            <div className="badges-grid">
              {BADGES.map((b) => {
                const unlocked = b.isUnlocked(streakData.streak, streakData.bestStreak, streakData.totalChapters ?? 0);
                return (
                  <div key={b.id} className={`badge-item${unlocked ? ' unlocked' : ''}`}>
                    <span className="badge-icon">{b.icon}</span>
                    <span className="badge-name">{isTa ? b.nameTa : b.nameEn}</span>
                    <span className="badge-desc">{isTa ? b.descTa : b.descEn}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 6. Lifetime Bible Progress ───────────────────────── */}
          <div className="lifetime-progress-row">
            <div className="lifetime-progress-bar-wrap">
              <div className="lifetime-progress-label">
                {isTa ? 'வாழ்நாள் வேதாகம முன்னேற்றம்' : 'Lifetime Bible Progress'}
              </div>
              <div className="lifetime-progress-track">
                <div className="lifetime-progress-fill" style={{ width: `${lifetimePct}%` }} />
              </div>
            </div>
            <div className="lifetime-progress-pct">{lifetimePct}%</div>
          </div>

        </div>
      </div>
    </div>
  );
};
