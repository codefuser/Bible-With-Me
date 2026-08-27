import React from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  avatarUrl?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarUrl,
  name,
  size = 28,
  className = '',
  style = {},
  onClick
}) => {
  const effectiveAvatar = avatarUrl || localStorage.getItem('bible_app_user_avatar');

  if (effectiveAvatar && effectiveAvatar.trim()) {
    const trimmed = effectiveAvatar.trim();
    if (trimmed.startsWith('data:image') || trimmed.startsWith('http')) {
      return (
        <img
          src={trimmed}
          alt="User Profile Avatar"
          className={className}
          onClick={onClick}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            minWidth: `${size}px`,
            minHeight: `${size}px`,
            borderRadius: '50%',
            objectFit: 'cover',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
            display: 'inline-block',
            flexShrink: 0,
            cursor: onClick ? 'pointer' : undefined,
            ...style
          }}
        />
      );
    }
    // Preset Emoji Avatar (e.g. ✝️, 🕊️, 📖, 🔥, 👑, ⭐️)
    return (
      <span
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          borderRadius: '50%',
          backgroundColor: 'var(--accent-soft)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${size * 0.55}px`,
          lineHeight: 1,
          flexShrink: 0,
          ...style
        }}
      >
        {trimmed}
      </span>
    );
  }

  // Fallback to first letter in styled avatar badge if name exists, else User icon
  if (name && name.trim()) {
    const initial = name.trim()[0].toUpperCase();
    return (
      <div
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          borderRadius: '50%',
          backgroundColor: 'var(--accent-color)',
          color: '#ffffff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: `${size * 0.45}px`,
          flexShrink: 0,
          ...style
        }}
      >
        {initial}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        borderRadius: '50%',
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-muted)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style
      }}
    >
      <User size={size * 0.55} />
    </div>
  );
};
