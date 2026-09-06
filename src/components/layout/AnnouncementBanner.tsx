import React, { useState, useEffect } from 'react';
import { X, Bell, AlertTriangle, Sparkles } from 'lucide-react';
import { getAdminConfig, onAdminConfigChange } from '../../services/adminService';
import { AnnouncementConfig } from '../../types/adminTypes';
import { useReading } from '../../context/ReadingContext';

export const AnnouncementBanner: React.FC = () => {
  const { language } = useReading();
  const isEn = language === 'en';

  const [announcement, setAnnouncement] = useState<AnnouncementConfig>(() => {
    return getAdminConfig().announcementBanner;
  });
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const unsub = onAdminConfigChange((cfg) => {
      setAnnouncement(cfg.announcementBanner);
      setIsDismissed(false);
    });
    return unsub;
  }, []);

  if (!announcement || !announcement.enabled || isDismissed) {
    return null;
  }

  const text = isEn
    ? announcement.text_en || announcement.text_ta
    : announcement.text_ta || announcement.text_en;

  if (!text) return null;

  const levelClass =
    announcement.level === 'warning'
      ? 'announcement-warning'
      : announcement.level === 'success'
      ? 'announcement-success'
      : 'announcement-info';

  return (
    <div className={`global-announcement-banner ${levelClass}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', margin: '0 auto', textAlign: 'center' }}>
        {announcement.level === 'warning' ? (
          <AlertTriangle size={16} />
        ) : announcement.level === 'success' ? (
          <Sparkles size={16} />
        ) : (
          <Bell size={16} />
        )}
        <span>{text}</span>
      </div>

      {announcement.dismissible && (
        <button
          className="announcement-dismiss-btn"
          onClick={() => setIsDismissed(true)}
          title={isEn ? 'Dismiss Banner' : 'மூடு'}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
