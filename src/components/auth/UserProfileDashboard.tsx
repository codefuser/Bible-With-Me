import React, { useState } from 'react';
import {
  User,
  LogOut,
  Cloud,
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
  Camera,
  Upload,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useReading } from '../../context/ReadingContext';
import { updateUserProfile } from '../../services/authService';

interface UserProfileDashboardProps {
  onClose: () => void;
}

const PRESET_AVATARS = ['✝️', '🕊️', '📖', '🔥', '👑', '⭐️'];

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxDim = 160;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
};

export const UserProfileDashboard: React.FC<UserProfileDashboardProps> = ({ onClose }) => {
  const { user, profile, logout, updateProfileState } = useAuth();
  const { bookmarks, highlights, historyList, language } = useReading();

  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || user?.email?.split('@')[0] || '');
  const [savingName, setSavingName] = useState(false);
  
  // Avatar Selection & Image Upload
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    profile?.avatar_url || localStorage.getItem('bible_app_user_avatar') || ''
  );

  // Sync avatar state when cloud profile updates
  React.useEffect(() => {
    if (profile?.avatar_url) {
      setSelectedAvatar(profile.avatar_url);
    }
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  }, [profile?.avatar_url, profile?.display_name]);

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
      updateProfileState({ display_name: displayName.trim() });
      setIsEditingName(false);
    }
  };

  const handleSelectPresetAvatar = async (emoji: string) => {
    setSelectedAvatar(emoji);
    localStorage.setItem('bible_app_user_avatar', emoji);
    updateProfileState({ avatar_url: emoji });
    if (user) {
      await updateUserProfile(user.id, { avatar_url: emoji });
    }
    setShowAvatarPicker(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(isEn ? 'Image size must be under 5MB.' : 'படம் 5MB அளவுக்குள் இருக்க வேண்டும்.');
      return;
    }

    try {
      // Compress avatar to 160x160 JPEG (~8KB) for instant cloud sync
      const compressedDataUrl = await compressImage(file);
      if (!compressedDataUrl) return;

      setSelectedAvatar(compressedDataUrl);
      localStorage.setItem('bible_app_user_avatar', compressedDataUrl);
      updateProfileState({ avatar_url: compressedDataUrl });

      if (user) {
        const res = await updateUserProfile(user.id, { avatar_url: compressedDataUrl });
        if (!res.success) {
          console.warn('[Avatar Upload Warning]:', res.error);
        }
      }
    } catch (err) {
      console.error('Error compressing image:', err);
    }
    setShowAvatarPicker(false);
  };

  const userInitial = (displayName || user?.email || 'U')[0].toUpperCase();

  return (
    <div className="user-profile-modal-content">
      {/* Top Bar with Title & Close */}
      <div className="profile-top-bar">
        <div className="profile-title-chip">
          <Sparkles size={13} />
          <span>{isEn ? 'User Profile' : 'பயனர் விவரம்'}</span>
        </div>
        <button className="profile-close-btn" onClick={onClose} title={isEn ? 'Close' : 'மூடுக'}>
          <X size={16} />
        </button>
      </div>

      {/* Hero Header Area */}
      <div className="profile-hero-area">
        {/* Avatar Container */}
        <div className="profile-avatar-wrapper">
          <div className="profile-avatar-ring">
            {selectedAvatar ? (
              selectedAvatar.startsWith('data:image') || selectedAvatar.startsWith('http') ? (
                <img src={selectedAvatar} alt="Profile" className="profile-avatar-img" />
              ) : (
                <span className="profile-avatar-emoji">{selectedAvatar}</span>
              )
            ) : (
              <span className="profile-avatar-initial">{userInitial}</span>
            )}
          </div>
          <button
            className="profile-avatar-edit-trigger"
            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
            title={isEn ? 'Change Avatar / Photo' : 'லோகோ / படம் மாற்றுக'}
          >
            <Camera size={13} />
          </button>
        </div>

        {/* User Identity */}
        <div className="profile-identity-group">
          {isEditingName ? (
            <div className="profile-name-edit-inline">
              <input
                type="text"
                className="profile-name-input-modern"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={isEn ? 'Enter name...' : 'உங்கள் பெயர்...'}
                autoFocus
              />
              <button className="btn-icon-save" onClick={handleSaveName} disabled={savingName}>
                <Check size={15} />
              </button>
              <button className="btn-icon-cancel" onClick={() => setIsEditingName(false)}>
                <X size={15} />
              </button>
            </div>
          ) : (
            <div className="profile-name-headline">
              <h2>{displayName}</h2>
              <button className="btn-edit-pencil" onClick={() => setIsEditingName(true)} title="Edit Name">
                <Pencil size={13} />
              </button>
              {profile?.role === 'admin' && (
                <span className="profile-admin-badge">
                  <Shield size={10} /> Admin
                </span>
              )}
            </div>
          )}
          <p className="profile-email-subtitle">{user?.email}</p>

          <div className="profile-meta-pills">
            <span className="meta-pill sync-active">
              <Cloud size={12} />
              <span>{isEn ? '⚡ Auto-Synced' : '⚡ தானியங்கு ஒத்திசைவு'}</span>
            </span>
            {joinedDate && (
              <span className="meta-pill joined">
                <Calendar size={11} />
                <span>{joinedDate}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Selector Dropdown Popover */}
      {showAvatarPicker && (
        <div className="profile-avatar-popover">
          <div className="popover-header">
            <span>{isEn ? 'Choose Avatar Logo or Upload Photo' : 'லோகோ தேர்வு செய்ய அல்லது படம் பதிவேற்ற'}</span>
            <button className="btn-icon-sm" onClick={() => setShowAvatarPicker(false)}>
              <X size={13} />
            </button>
          </div>
          <div className="avatar-presets-grid">
            {PRESET_AVATARS.map((emoji) => (
              <button
                key={emoji}
                className={`avatar-preset-item ${selectedAvatar === emoji ? 'active' : ''}`}
                onClick={() => handleSelectPresetAvatar(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
          <label className="avatar-upload-dropzone">
            <Upload size={14} />
            <span>{isEn ? 'Upload Photo from Device' : 'சாதனத்திலிருந்து படம் பதிவேற்ற'}</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
          </label>
        </div>
      )}

      {/* 2x2 Analytics Grid (Zero Text Clipping!) */}
      <div className="profile-analytics-grid">
        <div className="analytics-card history">
          <div className="analytics-icon history">
            <BookOpen size={16} />
          </div>
          <div className="analytics-text-group">
            <span className="analytics-val">{totalHistory}</span>
            <span className="analytics-lbl">{isEn ? 'Chapters Read' : 'வாசித்த அதிகாரங்கள்'}</span>
          </div>
        </div>

        <div className="analytics-card bookmark">
          <div className="analytics-icon bookmark">
            <BookmarkIcon size={16} />
          </div>
          <div className="analytics-text-group">
            <span className="analytics-val">{totalBookmarks}</span>
            <span className="analytics-lbl">{isEn ? 'Bookmarks' : 'சேமித்த வசனங்கள்'}</span>
          </div>
        </div>

        <div className="analytics-card highlight">
          <div className="analytics-icon highlight">
            <Highlighter size={16} />
          </div>
          <div className="analytics-text-group">
            <span className="analytics-val">{totalHighlights}</span>
            <span className="analytics-lbl">{isEn ? 'Highlights' : 'வண்ணமிட்டவை'}</span>
          </div>
        </div>

        <div className="analytics-card cloud">
          <div className="analytics-icon cloud">
            <Flame size={16} />
          </div>
          <div className="analytics-text-group">
            <span className="analytics-val">{isEn ? 'Active' : 'இயக்கத்தில்'}</span>
            <span className="analytics-lbl">{isEn ? 'Cloud Sync' : 'மேகக்கணி இணைப்பு'}</span>
          </div>
        </div>
      </div>

      {/* Language / Preference Footer Strip */}
      <div className="profile-pref-footer-strip">
        <div className="pref-footer-chip">
          <Globe size={13} />
          <span>{isEn ? 'Language: English' : 'மொழி: தமிழ்'}</span>
        </div>
      </div>

      {/* Sign Out Action Button */}
      <div className="profile-logout-footer">
        <button
          className="btn-profile-logout"
          onClick={() => {
            logout();
            onClose();
          }}
        >
          <LogOut size={15} />
          <span>{isEn ? 'Sign Out of Account' : 'கணக்கிலிருந்து வெளியேறுக'}</span>
        </button>
      </div>
    </div>
  );
};
