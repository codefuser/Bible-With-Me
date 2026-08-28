import React from 'react';
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
import { getTodayVerseRef } from '../../services/dailyVerseService';
import '../../styles/streaks.css';

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
    descTa: '1 அதிகாரம் முடித்தார்',
    descEn: 'Read 1st chapter',
    isUnlocked: (_, __, total) => total >= 1,
  },
  {
    id: 'streak_3',
    icon: '🔥',
    nameTa: '3-நாள் தொடர்',
    nameEn: '3-Day Streak',
    descTa: '3 நாட்கள் தொடர் வாசிப்பு',
    descEn: 'Read 3 days in a row',
    isUnlocked: (s, b) => Math.max(s, b) >= 3,
  },
  {
    id: 'streak_7',
    icon: '🥉',
    nameTa: '7-நாள் முன்னோடி',
    nameEn: '7-Day Pioneer',
    descTa: '7 நாட்கள் தொடர் வாசிப்பு',
    descEn: 'Read 7 days in a row',
    isUnlocked: (s, b) => Math.max(s, b) >= 7,
  },
  {
    id: 'streak_30',
    icon: '🥇',
    nameTa: 'மாத நாயகன்',
    nameEn: 'Monthly Master',
    descTa: '30 நாட்கள் தொடர் வாசிப்பு',
    descEn: 'Read 30 days in a row',
    isUnlocked: (s, b) => Math.max(s, b) >= 30,
  },
  {
    id: 'chapters_10',
    icon: '📖',
    nameTa: '10 அதிகாரங்கள்',
    nameEn: '10 Chapters',
    descTa: '10 அதிகாரங்கள் முடித்தார்',
    descEn: 'Read 10 total chapters',
    isUnlocked: (_, __, total) => total >= 10,
  },
  {
    id: 'chapters_50',
    icon: '👑',
    nameTa: 'வேதாகம விரும்பி',
    nameEn: 'Bible Devotee',
    descTa: '50 அதிகாரங்கள் முடித்தார்',
    descEn: 'Read 50 total chapters',
    isUnlocked: (_, __, total) => total >= 50,
  },
];

const WEEKDAYS_TA = ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச'];
const WEEKDAYS_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

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

  if (!isStreakModalOpen || !streakData) return null;

  const isTa = language === 'ta';
  const todayRef = getTodayVerseRef();

  // Find daily revival book if available
  const dailyRevivalBook = todayRef ? books.find((b) => b.id === todayRef.book_id) : null;
  const isTodayGoalComplete = streakData.todayCount >= streakData.dailyGoal;
  const progressPercent = Math.min(100, Math.round((streakData.todayCount / streakData.dailyGoal) * 100));

  // Build 28-day calendar array (last 4 weeks ending today)
  const todayDate = new Date();
  const daysArray: { dateStr: string; dayNum: number; count: number }[] = [];

  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(todayDate.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    daysArray.push({
      dateStr,
      dayNum: d.getDate(),
      count: streakData.calendarMap?.[dateStr] || 0,
    });
  }

  const weekHeaders = isTa ? WEEKDAYS_TA : WEEKDAYS_EN;

  const handleMarkChapterCompleted = () => {
    recordChapterRead(currentBook, currentChapter, 1);
  };

  const handleJumpToDailyRevival = () => {
    if (dailyRevivalBook && todayRef) {
      setBookAndChapter(dailyRevivalBook, todayRef.chapter, todayRef.verse);
      setIsStreakModalOpen(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsStreakModalOpen(false)}>
      <div
        className="modal-content"
        style={{ maxWidth: '520px', width: '92%' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={isTa ? 'தினசரி வாசிப்புத் திட்டம்' : 'Daily Reading Plan'}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-color)'
              }}
            >
              <Target size={18} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1rem', margin: 0 }}>
                {isTa ? 'தினசரி வேதாகம வாசிப்புத் திட்டம்' : 'Daily Bible Reading Plan'}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                {isTa ? 'இன்றைய வாசிப்பு இலக்கு & பழக்க கண்காணிப்பு' : 'Today’s Reading Routine & Habit Tracker'}
              </p>
            </div>
          </div>
          <button
            className="modal-close-btn"
            onClick={() => setIsStreakModalOpen(false)}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '1.125rem 1.25rem 1.5rem' }}>
          {/* Top 3 Stat Cards */}
          <div className="streak-stats-grid">
            <div className="streak-stat-card">
              <div className="streak-stat-val" style={{ color: 'var(--accent-color)' }}>
                🔥 {streakData.streak}
              </div>
              <div className="streak-stat-lbl">{isTa ? 'தொடர் நாட்கள்' : 'Current Streak'}</div>
            </div>

            <div className="streak-stat-card">
              <div className="streak-stat-val" style={{ color: 'var(--text-color)' }}>
                🏆 {streakData.bestStreak}
              </div>
              <div className="streak-stat-lbl">{isTa ? 'சிறந்த தொடர்' : 'Best Streak'}</div>
            </div>

            <div className="streak-stat-card">
              <div className="streak-stat-val" style={{ color: 'var(--text-color)' }}>
                📖 {streakData.totalChapters || 0}
              </div>
              <div className="streak-stat-lbl">{isTa ? 'மொத்த அதிகாரங்கள்' : 'Total Chapters'}</div>
            </div>
          </div>

          {/* ── Interactive "Today's Reading Routine" Action Tasks ───────────────── */}
          <div className="today-tasks-container">
            <div className="today-tasks-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <BookOpen size={15} color="var(--accent-color)" />
                <span className="today-tasks-title">
                  {isTa ? 'இன்றைய வாசிப்புப் பணி' : "Today's Reading Routine"}
                </span>
              </div>
              <span className="today-tasks-counter">
                {streakData.todayCount} / {streakData.dailyGoal} {isTa ? 'அதிகாரங்கள்' : 'Chapters'}
              </span>
            </div>

            {/* Task 1: Current Chapter */}
            <div className="task-item-card">
              <div className="task-item-info">
                <span className="task-item-badge">{isTa ? 'தற்போதைய அதிகாரம்' : 'Current Chapter'}</span>
                <h4 className="task-item-title">
                  {isTa ? currentBook.name_ta : currentBook.name_en} {currentChapter}
                </h4>
              </div>

              <div className="task-item-actions">
                <button
                  className="btn-pill"
                  onClick={() => setIsStreakModalOpen(false)}
                  style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem', gap: '0.25rem' }}
                >
                  <span>{isTa ? 'வாசிக்க' : 'Read'}</span>
                  <ArrowRight size={13} />
                </button>

                <button
                  className={`task-complete-btn ${isTodayGoalComplete ? 'completed' : ''}`}
                  onClick={handleMarkChapterCompleted}
                  title={isTa ? 'அதிகாரம் முடித்ததாகக் குறிக்கவும்' : 'Mark chapter completed'}
                >
                  <CheckCircle2 size={14} />
                  <span>{isTa ? 'முடித்தேன்' : 'Mark Done'}</span>
                </button>
              </div>
            </div>

            {/* Task 2: Daily Revival Verse */}
            {dailyRevivalBook && todayRef && (
              <div className="task-item-card">
                <div className="task-item-info">
                  <span className="task-item-badge revival">
                    <Sparkles size={11} />
                    <span>{isTa ? 'இன்றைய எழுப்புதல் வசனம்' : 'Today’s Revival Word'}</span>
                  </span>
                  <h4 className="task-item-title">
                    {isTa ? dailyRevivalBook.name_ta : dailyRevivalBook.name_en} {todayRef.chapter}:{todayRef.verse}
                  </h4>
                </div>

                <div className="task-item-actions">
                  <button
                    className="btn-pill"
                    onClick={handleJumpToDailyRevival}
                    style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem', gap: '0.25rem' }}
                  >
                    <span>{isTa ? 'தியானிக்க' : 'Meditate'}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Goal Target Selector */}
          <div className="streak-goal-selector">
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-color)' }}>
                {isTa ? 'தினசரி வாசிப்பு இலக்கு' : 'Daily Reading Target'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {isTa ? 'ஒரு நாளைக்கு எத்தனை அதிகாரங்கள்?' : 'Chapters to read per day'}
              </div>
            </div>

            <div className="streak-goal-btn-group">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  className={`streak-goal-num-btn ${streakData.dailyGoal === num ? 'active' : ''}`}
                  onClick={() => handleUpdateDailyGoal(num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Heatmap Grid */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div className="calendar-heatmap-title">
              <Calendar size={14} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: '-2px' }} />
              {isTa ? 'கடைசி 28 நாட்கள் வாசிப்பு வரைபடம்' : 'Last 28 Days Activity Grid'}
            </div>

            {/* Weekday headers */}
            <div className="calendar-heatmap-grid" style={{ marginBottom: '0.25rem' }}>
              {weekHeaders.map((w, idx) => (
                <div key={idx} style={{ textAlign: 'center', fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  {w}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="calendar-heatmap-grid">
              {daysArray.map((day) => {
                const intensityClass =
                  day.count >= 2 ? 'active-2' : day.count === 1 ? 'active-1' : '';

                return (
                  <div
                    key={day.dateStr}
                    className={`calendar-day-cell ${intensityClass}`}
                    title={`${day.dateStr}: ${day.count} ${isTa ? 'அதிகாரங்கள்' : 'chapters'}`}
                  >
                    {day.dayNum}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Achievement Badges */}
          <div>
            <div className="badges-title">
              <Award size={14} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: '-2px' }} />
              {isTa ? 'சாதனை இலக்குகள்' : 'Reading Milestones'}
            </div>

            <div className="badges-grid">
              {BADGES.map((b) => {
                const unlocked = b.isUnlocked(
                  streakData.streak,
                  streakData.bestStreak,
                  streakData.totalChapters || 0
                );

                return (
                  <div key={b.id} className={`badge-item ${unlocked ? 'unlocked' : ''}`}>
                    <span className="badge-icon">{b.icon}</span>
                    <span className="badge-name">{isTa ? b.nameTa : b.nameEn}</span>
                    <span className="badge-desc">{isTa ? b.descTa : b.descEn}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
