import React from 'react';
import {
  Users,
  Bookmark,
  Highlighter,
  BookOpen,
  Sparkles,
  Flame,
  Activity,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { AdminDashboardStats, AdminGlobalConfig } from '../../types/adminTypes';

interface AdminDashboardTabProps {
  stats: AdminDashboardStats;
  config: AdminGlobalConfig;
  onUpdateConfig: (partial: Partial<AdminGlobalConfig>) => void;
  onNavigateTab: (tabId: string) => void;
  isEn?: boolean;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({
  stats,
  config,
  onUpdateConfig,
  onNavigateTab,
  isEn = false
}) => {
  return (
    <div>
      {/* ── KPI Grid ── */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}>
            <Users size={24} />
          </div>
          <div className="admin-kpi-info">
            <div className="admin-kpi-value">{stats.totalUsers}</div>
            <div className="admin-kpi-label">{isEn ? 'Total Members' : 'மொத்த பயனர்கள்'}</div>
            <span className="admin-kpi-badge" style={{ backgroundColor: 'rgba(34, 197, 94, 0.12)', color: '#16a34a' }}>
              {stats.activeUsersToday} {isEn ? 'active today' : 'இன்று செயலில்'}
            </span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ backgroundColor: 'rgba(168, 85, 247, 0.12)', color: '#9333ea' }}>
            <BookOpen size={24} />
          </div>
          <div className="admin-kpi-info">
            <div className="admin-kpi-value">{stats.totalStudiesConducted}</div>
            <div className="admin-kpi-label">{isEn ? 'Meditations Conducted' : 'நடத்தப்பட்ட தியானங்கள்'}</div>
            <span className="admin-kpi-badge" style={{ backgroundColor: 'rgba(168, 85, 247, 0.12)', color: '#9333ea' }}>
              {config.verseStudyEnabled ? (isEn ? 'Study Mode Active' : 'தியானம் இயங்குகிறது') : (isEn ? 'Disabled' : 'முடக்கப்பட்டது')}
            </span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ backgroundColor: 'rgba(234, 179, 8, 0.12)', color: '#ca8a04' }}>
            <Bookmark size={24} />
          </div>
          <div className="admin-kpi-info">
            <div className="admin-kpi-value">{stats.totalBookmarks}</div>
            <div className="admin-kpi-label">{isEn ? 'Saved Bookmarks' : 'புக்மார்க்குகள்'}</div>
            <span className="admin-kpi-badge" style={{ backgroundColor: 'rgba(234, 179, 8, 0.12)', color: '#ca8a04' }}>
              {stats.totalHighlights} {isEn ? 'highlights' : 'ஹைலைட்டுகள்'}
            </span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon" style={{ backgroundColor: 'rgba(244, 63, 94, 0.12)', color: '#e11d48' }}>
            <Sparkles size={24} />
          </div>
          <div className="admin-kpi-info">
            <div className="admin-kpi-value">{stats.customMeditationsCount}</div>
            <div className="admin-kpi-label">{isEn ? 'Custom Meditations' : 'மாற்றியமைக்கப்பட்ட தியானங்கள்'}</div>
            <span className="admin-kpi-badge" style={{ backgroundColor: 'rgba(244, 63, 94, 0.12)', color: '#e11d48' }}>
              {stats.scheduledRevivalWordsCount} {isEn ? 'revival words' : 'எழுப்புதல் வாக்குகள்'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Controls & Quick Toggles ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">
              <ShieldCheck size={20} style={{ color: '#2563eb' }} />
              <span>{isEn ? 'Master Feature Controls' : 'முக்கிய அம்சங்கள் கட்டுப்பாடு (Feature Switches)'}</span>
            </h2>
            <p className="admin-card-subtitle">
              {isEn
                ? 'Toggle features instantly across the entire Bible web application.'
                : 'இங்கே மாற்றுவதன் மூலம் வேதாகம வாசகரில் உள்ள அம்சங்களை உடனடியாக ஆன்/ஆஃப் செய்யலாம்.'}
            </p>
          </div>
        </div>

        <div className="admin-switch-list">
          {/* Verse Study Toggle */}
          <div className="admin-switch-item">
            <div className="admin-switch-info">
              <div className="admin-switch-title">
                <BookOpen size={18} style={{ color: '#2563eb' }} />
                <span>{isEn ? 'Verse Meditation & Deep Study' : 'வசன தியானம் & ஆழமான ஆய்வு (Verse Study)'}</span>
                {config.verseStudyEnabled ? (
                  <span className="role-badge" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#16a34a' }}>
                    {isEn ? 'ON' : 'செயலில்'}
                  </span>
                ) : (
                  <span className="role-badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#dc2626' }}>
                    {isEn ? 'OFF' : 'முடக்கம்'}
                  </span>
                )}
              </div>
              <div className="admin-switch-desc">
                {isEn
                  ? 'Enables the 9-point comprehensive meditation modal when users click or select any verse in the reader or daily card.'
                  : 'முன்னர் கமென்ட் செய்யப்பட்டிருந்த விரிவான வசன தியான வசதியை வாசகருக்குக் கொண்டுவருகிறது.'}
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={config.verseStudyEnabled}
                onChange={(e) => onUpdateConfig({ verseStudyEnabled: e.target.checked })}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Chapter Study Toggle */}
          <div className="admin-switch-item">
            <div className="admin-switch-info">
              <div className="admin-switch-title">
                <BookOpen size={18} style={{ color: '#9333ea' }} />
                <span>{isEn ? 'Chapter Study & Section Breakdown' : 'முழு அதிகார ஆய்வு (Chapter Study)'}</span>
                {config.chapterStudyEnabled ? (
                  <span className="role-badge" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#16a34a' }}>
                    {isEn ? 'ON' : 'செயலில்'}
                  </span>
                ) : (
                  <span className="role-badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#dc2626' }}>
                    {isEn ? 'OFF' : 'முடக்கம்'}
                  </span>
                )}
              </div>
              <div className="admin-switch-desc">
                {isEn
                  ? 'Enables full chapter sectioning, context breakdown, characters, and structural overview for any chapter.'
                  : 'அதிகாரத்தின் பிரிவுகள், கதாபாத்திரங்கள் மற்றும் வரலாற்று சூழல்களை விளக்கும் அதிகாரம் ஆய்வு வசதி.'}
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={config.chapterStudyEnabled}
                onChange={(e) => onUpdateConfig({ chapterStudyEnabled: e.target.checked })}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Daily Revival Word Toggle */}
          <div className="admin-switch-item">
            <div className="admin-switch-info">
              <div className="admin-switch-title">
                <Flame size={18} style={{ color: '#ea580c' }} />
                <span>{isEn ? 'Daily Revival Word & Devotional' : 'தினசரி எழுப்புதல் வாக்கு (Daily Revival Word)'}</span>
                {config.dailyRevivalWordEnabled ? (
                  <span className="role-badge" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#16a34a' }}>
                    {isEn ? 'ON' : 'செயலில்'}
                  </span>
                ) : (
                  <span className="role-badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#dc2626' }}>
                    {isEn ? 'OFF' : 'முடக்கம்'}
                  </span>
                )}
              </div>
              <div className="admin-switch-desc">
                {isEn
                  ? 'Displays the curated or admin-scheduled daily revival verse card and meditation guidance for users.'
                  : 'தினமும் ஆவிக்குரிய எழுப்புதலைக் கொடுக்கும் வாக்குத்தத்த வசன அட்டை மற்றும் சிந்தனைகளை வாசகருக்குக் காட்டுகிறது.'}
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={config.dailyRevivalWordEnabled}
                onChange={(e) => onUpdateConfig({ dailyRevivalWordEnabled: e.target.checked })}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* User Notes Toggle */}
          <div className="admin-switch-item">
            <div className="admin-switch-info">
              <div className="admin-switch-title">
                <Activity size={18} style={{ color: '#059669' }} />
                <span>{isEn ? 'User Personal Notes' : 'பயனர் குறிப்புகள் எழுதும் வசதி (User Notes)'}</span>
              </div>
              <div className="admin-switch-desc">
                {isEn
                  ? 'Allow users to save private reflection notes linked to individual verses.'
                  : 'பயனர்கள் வசனங்களுக்கு தங்களது சொந்த ஆன்மீக குறிப்புகளை எழுத அனுமதித்தல்.'}
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={config.allowUserCustomNotes}
                onChange={(e) => onUpdateConfig({ allowUserCustomNotes: e.target.checked })}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* ── Quick Jumps & Recent Activity Stream ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Quick Management Shortcuts */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <Sparkles size={18} style={{ color: '#2563eb' }} />
              <span>{isEn ? 'Quick Management Actions' : 'விரைவு நிர்வாக செயல்கள்'}</span>
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              className="admin-btn admin-btn-outline"
              onClick={() => onNavigateTab('revival')}
              style={{ justifyContent: 'space-between', padding: '0.85rem 1rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Flame size={18} style={{ color: '#ea580c' }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600 }}>{isEn ? 'Set Today’s Revival Word' : 'இன்றைய எழுப்புதல் வார்த்தை அமை'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {isEn ? 'Schedule book, chapter, verse & prayer prompt' : 'வசனம், தேவ செய்தி & ஜெப குறிப்புகளை நிர்ணயிக்க'}
                  </div>
                </div>
              </div>
              <ArrowRight size={16} />
            </button>

            <button
              className="admin-btn admin-btn-outline"
              onClick={() => onNavigateTab('study-mgr')}
              style={{ justifyContent: 'space-between', padding: '0.85rem 1rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <BookOpen size={18} style={{ color: '#2563eb' }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600 }}>{isEn ? 'Edit Verse Meditation' : 'வசன தியானத்தை மாற்றி எழுது'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {isEn ? 'Customize 9-point meditation content for any verse' : 'எந்த ஒரு வசனத்திற்கும் விசேஷ தியானத்தை உருவாக்க'}
                  </div>
                </div>
              </div>
              <ArrowRight size={16} />
            </button>

            <button
              className="admin-btn admin-btn-outline"
              onClick={() => onNavigateTab('users')}
              style={{ justifyContent: 'space-between', padding: '0.85rem 1rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Users size={18} style={{ color: '#16a34a' }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600 }}>{isEn ? 'Manage Users & Roles' : 'பயனர் பட்டியல் & அனுமதிகள்'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {isEn ? 'View all user details, roles, and activities' : 'எல்லா பயனர்களின் விபரம், ரோல் மற்றும் செயல்கள்'}
                  </div>
                </div>
              </div>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Live Audit Log Preview */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <Activity size={18} style={{ color: '#059669' }} />
              <span>{isEn ? 'Recent Administrative Activity' : 'சமீபத்திய நிர்வாக செயல்கள்'}</span>
            </h3>
            <button
              className="admin-btn admin-btn-sm admin-btn-outline"
              onClick={() => onNavigateTab('logs')}
            >
              {isEn ? 'View All' : 'முழுதும் பார்'}
            </button>
          </div>

          <div>
            {stats.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.slice(0, 4).map((log) => (
                <div key={log.id} className="admin-log-item">
                  <div className="admin-log-time">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="admin-log-desc">{log.action}</div>
                    <div className="admin-log-details">{log.details}</div>
                  </div>
                  <span
                    className="admin-log-badge"
                    style={{
                      backgroundColor:
                        log.category === 'security'
                          ? 'rgba(239, 68, 68, 0.15)'
                          : log.category === 'content'
                          ? 'rgba(37, 99, 235, 0.15)'
                          : 'rgba(34, 197, 94, 0.15)',
                      color:
                        log.category === 'security'
                          ? '#dc2626'
                          : log.category === 'content'
                          ? '#2563eb'
                          : '#16a34a'
                    }}
                  >
                    {log.category}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                {isEn ? 'No recent logs yet.' : 'பதிவுகள் எதுவும் இல்லை.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
