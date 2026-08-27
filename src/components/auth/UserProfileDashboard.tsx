import React, { useState } from 'react';
import {
  User,
  LogOut,
  Cloud,
  RefreshCw,
  Bookmark as BookmarkIcon,
  Highlighter,
  BookOpen,
  Pencil,
  Check,
  X,
  Shield,
  Globe,
  Calendar,
  Flame,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useReading } from '../../context/ReadingContext';
import { updateUserProfile } from '../../services/authService';

interface UserProfileDashboardProps {
  onClose: () => void;
}

export const UserProfileDashboard: React.FC<UserProfileDashboardProps> = ({ onClose }) => {
  const { user, profile, syncStatus, logout, triggerSync } = useAuth();
  const { bookmarks, highlights, historyList, language } = useReading();

  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || user?.email?.split('@')[0] || '');
  const [savingName, setSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const isEn = language === 'en';

  const totalBookmarks = bookmarks ? bookmarks.length : 0;
  const totalHighlights = highlights ? Object.keys(highlights).length : 0;
  const totalHistory = historyList ? historyList.length : 0;

  // Joined date formatting
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(isEn ? 'en-US' : 'ta-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : null;

  const handleSaveName = async () => {
    if (!user || !displayName.trim()) return;
    setSavingName(true);
    const res = await updateUserProfile(user.id, { display_name: displayName.trim() });
    setSavingName(false);
    if (res.success) {
      setNameSuccess(true);
      setIsEditingName(false);
      setTimeout(() => setNameSuccess(false), 2000);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await triggerSync();
    setTimeout(() => setIsSyncing(false), 1000);
  };

  const getSyncBadge = () => {
    if (syncStatus === 'syncing' || isSyncing) {
      return (
        <span className="profile-sync-badge syncing">
          <RefreshCw size={12} className="spin" />
          <span>{isEn ? 'Syncing...' : 'ஒத்திசைக்கப்படுகிறது...'}</span>
        </span>
      );
    }
    if (syncStatus === 'error') {
      return (
        <span className="profile-sync-badge error">
          <AlertTriangle size={12} />
          <span>{isEn ? 'Sync Error' : 'ஒத்திசைவு பிழை'}</span>
        </span>
      );
    }
    return (
      <span className="profile-sync-badge active">
        <Cloud size={12} />
        <span>{isEn ? 'Cloud Active' : 'மேகக்கணி இணைப்பில்'}</span>
      </span>
    );
  };

  const userInitial = (displayName || user?.email || 'U')[0].toUpperCase();

  return (
    <div className="user-profile-modal-content">
      {/* 1. Header Banner */}
      <div className="profile-header-banner">
        <button className="profile-close-btn" onClick={onClose} title={isEn ? 'Close' : 'மூடுக'}>
          <X size={18} />
        </button>

        <div className="profile-user-avatar-container">
          <div className="profile-avatar-circle">
            <span>{userInitial}</span>
          </div>
          <div className="profile-avatar-status-dot" title="Account Active" />
        </div>
      </div>

      {/* 2. User Main Info Card */}
      <div className="profile-user-info-section">
        <div className="profile-name-row">
          {isEditingName ? (
            <div className="profile-edit-name-group">
              <input
                type="text"
                className="profile-name-input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={isEn ? 'Enter your name...' : 'உங்கள் பெயரை உள்ளிடுக...'}
                autoFocus
              />
              <button
                className="btn-icon save-name-btn"
                onClick={handleSaveName}
                disabled={savingName}
                title="Save Name"
              >
                <Check size={16} />
              </button>
              <button
                className="btn-icon cancel-name-btn"
                onClick={() => setIsEditingName(false)}
                title="Cancel"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="profile-name-display">
              <h2 className="profile-display-name">{displayName}</h2>
              <button
                className="profile-edit-trigger"
                onClick={() => setIsEditingName(true)}
                title={isEn ? 'Edit Name' : 'பெயரைத் திருத்துக'}
              >
                <Pencil size={13} />
              </button>
            </div>
          )}

          {profile?.role === 'admin' && (
            <span className="profile-role-tag admin">
              <Shield size={11} /> Admin
            </span>
          )}
        </div>

        <p className="profile-email-text">{user?.email}</p>

        <div className="profile-badges-row">
          {getSyncBadge()}
          {joinedDate && (
            <span className="profile-joined-badge">
              <Calendar size={11} />
              <span>{isEn ? `Member since ${joinedDate}` : `இணைந்த நாள்: ${joinedDate}`}</span>
            </span>
          )}
        </div>
      </div>

      {/* 3. Analytics & Progress Statistics Grid */}
      <div className="profile-stats-grid">
        {/* Stat 1: History / Chapters Opened */}
        <div className="profile-stat-card">
          <div className="stat-icon-wrapper history">
            <BookOpen size={18} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{totalHistory}</span>
            <span className="stat-label">{isEn ? 'Chapters Read' : 'வாசித்த அதிகாரங்கள்'}</span>
          </div>
        </div>

        {/* Stat 2: Bookmarks Saved */}
        <div className="profile-stat-card">
          <div className="stat-icon-wrapper bookmark">
            <BookmarkIcon size={18} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{totalBookmarks}</span>
            <span className="stat-label">{isEn ? 'Bookmarks' : 'சேமித்த வசனங்கள்'}</span>
          </div>
        </div>

        {/* Stat 3: Highlighted Verses */}
        <div className="profile-stat-card">
          <div className="stat-icon-wrapper highlight">
            <Highlighter size={18} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{totalHighlights}</span>
            <span className="stat-label">{isEn ? 'Highlights' : 'வண்ணமிட்டவை'}</span>
          </div>
        </div>

        {/* Stat 4: Reading Streak / Language */}
        <div className="profile-stat-card">
          <div className="stat-icon-wrapper streak">
            <Flame size={18} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{isEn ? 'Active' : 'இயக்கத்தில்'}</span>
            <span className="stat-label">{isEn ? 'Cloud Backup' : 'மேகக்கணி காப்புப் பிரதி'}</span>
          </div>
        </div>
      </div>

      {/* 4. Preference Summary & Cloud Sync Trigger Bar */}
      <div className="profile-actions-bar">
        <div className="profile-pref-chip">
          <Globe size={14} />
          <span>{isEn ? 'Language: English' : 'மொழி: தமிழ்'}</span>
        </div>

        <button
          className="profile-sync-trigger-btn"
          onClick={handleManualSync}
          disabled={isSyncing}
        >
          <RefreshCw size={14} className={isSyncing ? 'spin' : ''} />
          <span>{isEn ? 'Sync Cloud Data' : 'தரவை ஒத்திசைக்குக'}</span>
        </button>
      </div>

      {/* 5. Footer Sign Out Section */}
      <div className="profile-footer-section">
        <button
          className="profile-logout-btn"
          onClick={() => {
            logout();
            onClose();
          }}
        >
          <LogOut size={16} />
          <span>{isEn ? 'Sign Out of Account' : 'கணக்கிலிருந்து வெளியேறுக'}</span>
        </button>
      </div>
    </div>
  );
};
