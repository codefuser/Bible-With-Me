import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Volume2,
  Database,
  Trash2,
  RotateCcw,
  CheckCircle,
  Download,
  AlertTriangle
} from 'lucide-react';
import { AdminGlobalConfig, AnnouncementConfig } from '../../types/adminTypes';

interface AdminSettingsTabProps {
  config: AdminGlobalConfig;
  onUpdateConfig: (partial: Partial<AdminGlobalConfig>) => void;
  isEn?: boolean;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  config,
  onUpdateConfig,
  isEn = true
}) => {
  const [announcement, setAnnouncement] = useState<AnnouncementConfig>(
    config.announcementBanner || {
      enabled: false,
      text_ta: '',
      text_en: '',
      level: 'info',
      dismissible: true
    }
  );

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [cacheClearSuccess, setCacheClearSuccess] = useState(false);

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      announcementBanner: announcement
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleClearStudyCaches = () => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('bible_verse_study_cache_') || key.startsWith('bible_chapter_study_cache_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      setCacheClearSuccess(true);
      setTimeout(() => setCacheClearSuccess(false), 3000);
    } catch (e) {
      console.error('Error clearing caches:', e);
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      config,
      exportTimestamp: new Date().toISOString(),
      localStorageDump: {
        revivalWords: localStorage.getItem('bible_admin_revival_words_v1'),
        customMeditations: localStorage.getItem('bible_admin_custom_meditations_v1'),
        auditLogs: localStorage.getItem('bible_admin_audit_logs_v1')
      }
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bible_app_admin_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* ── Global Announcement Banner Card ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">
              <Bell size={20} style={{ color: '#2563eb' }} />
              <span>{isEn ? 'Global Announcement Banner' : 'முக்கிய அறிவிப்பு பட்டை (Announcement Banner)'}</span>
            </h2>
            <p className="admin-card-subtitle">
              {isEn
                ? 'Display a top notification banner across all screens for special messages, Sunday services, or devotions.'
                : 'அனைத்து வாசகர்களுக்கும் திரையின் மேற்பகுதியில் தோன்றும் ஆவிக்குரிய அறிவிப்பு அல்லது செய்தி.'}
            </p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={announcement.enabled}
              onChange={(e) => {
                const next = { ...announcement, enabled: e.target.checked };
                setAnnouncement(next);
                onUpdateConfig({ announcementBanner: next });
              }}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {savedSuccess && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              color: '#16a34a',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              fontSize: '0.875rem'
            }}
          >
            <CheckCircle size={18} />
            <span>{isEn ? 'Announcement updated!' : 'அறிவிப்பு வெற்றிகரமாக புதுப்பிக்கப்பட்டது!'}</span>
          </div>
        )}

        <form onSubmit={handleSaveAnnouncement}>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">{isEn ? 'Banner Style Theme' : 'அறிவிப்பு வகை'}</label>
              <select
                className="admin-select"
                value={announcement.level}
                onChange={(e) => setAnnouncement({ ...announcement, level: e.target.value as any })}
              >
                <option value="info">{isEn ? 'Info (Blue)' : 'தகவல் (நீலம் / Info)'}</option>
                <option value="warning">{isEn ? 'Notice / Alert (Amber)' : 'கவனம் (மஞ்சள் / Warning)'}</option>
                <option value="success">{isEn ? 'Celebration / Joy (Green)' : 'மகிழ்ச்சி (பச்சை / Success)'}</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">{isEn ? 'Allow Users to Dismiss' : 'பயனர் மூட அனுமதித்தல்'}</label>
              <select
                className="admin-select"
                value={announcement.dismissible ? 'yes' : 'no'}
                onChange={(e) => setAnnouncement({ ...announcement, dismissible: e.target.value === 'yes' })}
              >
                <option value="yes">{isEn ? 'Yes (Can close banner)' : 'ஆம் (மூடலாம்)'}</option>
                <option value="no">{isEn ? 'No (Persistent banner)' : 'இல்லை (எப்போதும் தெரியும்)'}</option>
              </select>
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">{isEn ? 'Tamil Announcement Text' : 'தமிழ் அறிவிப்பு உரை'}</label>
            <textarea
              className="admin-textarea"
              rows={2}
              placeholder="வேத தியானம் மற்றும் ஆவிக்குரிய வார்த்தைகள் உங்கள் ஆத்துமாவைத் திடப்படுத்தட்டும்!"
              value={announcement.text_ta}
              onChange={(e) => setAnnouncement({ ...announcement, text_ta: e.target.value })}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">{isEn ? 'English Announcement Text' : 'ஆங்கில அறிவிப்பு உரை'}</label>
            <textarea
              className="admin-textarea"
              rows={2}
              placeholder="Deep verse meditation and daily revival promises are now active!"
              value={announcement.text_en}
              onChange={(e) => setAnnouncement({ ...announcement, text_en: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button type="submit" className="admin-btn admin-btn-primary">
              <CheckCircle size={16} />
              <span>{isEn ? 'Save Announcement' : 'அறிவிப்பை சேமிக்க'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── System Features & Additional Toggles ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            <Settings size={18} style={{ color: '#2563eb' }} />
            <span>{isEn ? 'Secondary Feature Controls' : 'கூடுதல் அமைப்புகள்'}</span>
          </h3>
        </div>

        <div className="admin-switch-list">
          <div className="admin-switch-item">
            <div className="admin-switch-info">
              <div className="admin-switch-title">
                <Volume2 size={18} style={{ color: '#2563eb' }} />
                <span>{isEn ? 'Audio Scripture Narration' : 'வேத வசன ஒலி வாசிப்பு (Audio Narration)'}</span>
              </div>
              <div className="admin-switch-desc">
                {isEn
                  ? 'Permits background audio recitation playback for selected chapters.'
                  : 'அதிகாரங்களுக்கான ஆடியோ வாசிப்பு வசதியை அனுமதித்தல்.'}
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={config.audioNarrationEnabled}
                onChange={(e) => onUpdateConfig({ audioNarrationEnabled: e.target.checked })}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* ── Maintenance & Cache Controls ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            <Database size={18} style={{ color: '#ca8a04' }} />
            <span>{isEn ? 'Storage, Cache & Backup' : 'நினைவக மேலாண்மை & காப்புநகல்'}</span>
          </h3>
        </div>

        {cacheClearSuccess && (
          <div
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              color: '#16a34a',
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.85rem'
            }}
          >
            {isEn ? 'All study caches cleared successfully!' : 'அனைத்து தியான இடைநினைவகமும் அழிக்கப்பட்டது!'}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={handleClearStudyCaches}
          >
            <Trash2 size={16} />
            <span>{isEn ? 'Purge Study Caches' : 'தியான கேச் (Cache) அழிக்க'}</span>
          </button>

          <button
            type="button"
            className="admin-btn admin-btn-outline"
            onClick={handleExportBackup}
          >
            <Download size={16} />
            <span>{isEn ? 'Export Admin Config JSON' : 'அமைப்புகளை காப்புநகல் எடுக்க (Export)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
