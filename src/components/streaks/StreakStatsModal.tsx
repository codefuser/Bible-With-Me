import React from 'react';
import { X, Flame, Calendar, Award, Target, Trophy, BookOpen } from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
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
    descTa: '1 அதிகாரம் வாசித்தார்',
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
  const { isStreakModalOpen, setIsStreakModalOpen, streakData, handleUpdateDailyGoal, language } = useReading();

  if (!isStreakModalOpen || !streakData) return null;

  const isTa = language === 'ta';

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

  return (
    <div className="modal-overlay" onClick={() => setIsStreakModalOpen(false)}>
      <div
        className="modal-content"
        style={{ maxWidth: '500px', width: '92%' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={isTa ? 'வாசிப்பு புள்ளிவிவரங்கள்' : 'Reading Statistics'}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Flame size={20} color="var(--accent-color)" />
            <h2 className="modal-title">
              {isTa ? 'வாசிப்புப் புள்ளிவிவரங்கள் & இலக்கு' : 'Reading Stats & Daily Goal'}
            </h2>
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
        <div className="modal-body" style={{ padding: '1rem 1.25rem 1.5rem' }}>
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

          {/* Goal Selector */}
          <div className="streak-goal-selector">
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-color)' }}>
                {isTa ? 'தினசரி வாசிப்பு இலக்கு' : 'Daily Reading Target'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {isTa ? 'ஒரு நாளைக்கு எத்தனை அதிகாரங்கள்?' : 'Chapters per day'}
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
              {isTa ? 'கடைசி 28 நாட்கள் வாசிப்பு வரைபடம்' : 'Last 28 Days Reading Activity'}
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
              {isTa ? 'சாதனை விருதுகள்' : 'Achievement Badges'}
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
