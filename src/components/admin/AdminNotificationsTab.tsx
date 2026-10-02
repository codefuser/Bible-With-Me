import React, { useState, useEffect } from 'react';
import { Bell, Send, Clock, Plus, Trash2, CheckCircle2, AlertCircle, Sparkles, BookOpen, Layers } from 'lucide-react';
import { AdminScheduledNotification } from '../../types/adminTypes';
import {
  getAdminNotifications,
  saveAdminNotification,
  deleteAdminNotification,
  broadcastAdminNotificationNow
} from '../../services/adminService';
import { ALL_BIBLE_BOOKS } from '../../services/bibleService';
import { getVerseByLocation, getBookMetaById } from '../../services/csvBibleService';

interface AdminNotificationsTabProps {
  isEn?: boolean;
}

export const AdminNotificationsTab: React.FC<AdminNotificationsTabProps> = ({ isEn = true }) => {
  const [notifications, setNotifications] = useState<AdminScheduledNotification[]>(getAdminNotifications);
  const [isCreating, setIsCreating] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('இன்றைய தேவ வாக்குத்தத்தம் · Daily Promise Word');
  const [selectedBookId, setSelectedBookId] = useState<number>(43); // John
  const [chapter, setChapter] = useState<number>(3);
  const [verse, setVerse] = useState<number>(16);
  const [verseTextTa, setVerseTextTa] = useState('');
  const [verseTextEn, setVerseTextEn] = useState('');
  const [scheduledTime, setScheduledTime] = useState('06:00');
  const [frequency, setFrequency] = useState<'daily' | 'once'>('daily');

  // Auto-populate verse text when book/chapter/verse changes
  useEffect(() => {
    const loaded = getVerseByLocation(selectedBookId, chapter, verse);
    if (loaded) {
      setVerseTextTa(loaded.text_ta || '');
      setVerseTextEn(loaded.text_en || '');
    }
  }, [selectedBookId, chapter, verse]);

  // Selected book metadata
  const selectedBook = ALL_BIBLE_BOOKS.find((b) => b.id === selectedBookId) || ALL_BIBLE_BOOKS[0];
  const maxChapters = selectedBook.total_chapters || 1;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || (!verseTextTa.trim() && !verseTextEn.trim())) {
      alert(isEn ? 'Please fill title and verse text' : 'தலைப்பு மற்றும் வசன உரையை நிரப்பவும்');
      return;
    }

    const newNotification: AdminScheduledNotification = {
      id: `notif-${Date.now()}`,
      title: title.trim(),
      book_id: selectedBookId,
      chapter,
      verse,
      verse_text_ta: verseTextTa.trim(),
      verse_text_en: verseTextEn.trim(),
      scheduled_time: scheduledTime,
      frequency,
      status: 'active',
      created_at: new Date().toISOString()
    };

    const updated = saveAdminNotification(newNotification);
    setNotifications(updated);
    setIsCreating(false);
    setBroadcastStatus(isEn ? 'Notification scheduled successfully!' : 'அறிவிப்பு வெற்றிகரமாக அட்டவணை செய்யப்பட்டது!');
    setTimeout(() => setBroadcastStatus(null), 3500);
  };

  const handleDelete = (id: string) => {
    if (confirm(isEn ? 'Are you sure you want to delete this notification?' : 'இந்த அறிவிப்பை நீக்க விரும்புகிறீர்களா?')) {
      const updated = deleteAdminNotification(id);
      setNotifications(updated);
    }
  };

  const handleSendNow = async (notif: AdminScheduledNotification) => {
    await broadcastAdminNotificationNow(notif);
    setBroadcastStatus(isEn ? `Broadcast sent: ${notif.title}` : `அறிவிப்பு அனுப்பப்பட்டது: ${notif.title}`);
    setTimeout(() => setBroadcastStatus(null), 3500);
  };

  return (
    <div className="admin-tab-pane">
      {/* Header Row */}
      <div className="admin-pane-header">
        <div>
          <h2 className="admin-pane-title">
            <Bell size={22} className="admin-header-icon" />
            {isEn ? 'Push & Scheduled Notifications' : 'புஷ் & அட்டவணை அறிவிப்புகள்'}
          </h2>
          <p className="admin-pane-desc">
            {isEn
              ? 'Schedule scripture verses, timings, and broadcast notifications with book reference and logo to all users.'
              : 'வசனங்கள், நேரங்கள் மற்றும் ஆப் லோகோவுடன் கூடிய அறிவிப்புகளை அனைத்து பயனர்களுக்கும் அட்டவணை செய்து அனுப்பலாம்.'}
          </p>
        </div>

        <button
          type="button"
          className="admin-btn admin-btn-primary"
          onClick={() => setIsCreating(!isCreating)}
        >
          {isCreating ? (
            isEn ? 'Close Form' : 'படிவத்தை மூடு'
          ) : (
            <>
              <Plus size={16} />
              <span>{isEn ? 'Schedule New Notification' : 'புதிய அறிவிப்பு அட்டவணை செய்'}</span>
            </>
          )}
        </button>
      </div>

      {broadcastStatus && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #10b981',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: '1rem 0',
            fontWeight: 600
          }}
        >
          <CheckCircle2 size={18} />
          <span>{broadcastStatus}</span>
        </div>
      )}

      {/* CREATE / SCHEDULE FORM */}
      {isCreating && (
        <form onSubmit={handleSave} className="admin-card" style={{ marginTop: '1rem', padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--accent-color)" />
            {isEn ? 'Create Scripture Notification' : 'வேத வசன அறிவிப்பை உருவாக்கு'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {/* Title */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                {isEn ? 'Notification Title / Theme' : 'அறிவிப்பு தலைப்பு / கருப்பொருள்'}
              </label>
              <input
                type="text"
                className="admin-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. இன்றைய வாக்குத்தத்தம் · Daily Promise"
                required
              />
            </div>

            {/* Time */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                {isEn ? 'Scheduled Dispatch Time (24h)' : 'அனுப்ப வேண்டிய நேரம் (24 மணி)'}
              </label>
              <input
                type="time"
                className="admin-input"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                required
              />
            </div>

            {/* Frequency */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                {isEn ? 'Schedule Frequency' : 'அட்டவணை சுழற்சி'}
              </label>
              <select
                className="admin-input"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
              >
                <option value="daily">{isEn ? 'Daily Recurring (ஒவ்வொரு நாளும்)' : 'ஒவ்வொரு நாளும் (Daily)'}</option>
                <option value="once">{isEn ? 'Send Once (ஒரு முறை)' : 'ஒரு முறை (Once)'}</option>
              </select>
            </div>
          </div>

          {/* SCRIPTURE SELECTOR */}
          <div style={{ marginTop: '1rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={16} />
              {isEn ? 'Scripture Reference (எருப்பிடம்)' : 'வேதாகம வசன இடம் (Reference)'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
              {/* Book */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  {isEn ? 'Book' : 'புத்தகம்'}
                </label>
                <select
                  className="admin-input"
                  value={selectedBookId}
                  onChange={(e) => {
                    const bId = Number(e.target.value);
                    setSelectedBookId(bId);
                    setChapter(1);
                    setVerse(1);
                  }}
                >
                  {ALL_BIBLE_BOOKS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name_ta} ({b.name_en})
                    </option>
                  ))}
                </select>
              </div>

              {/* Chapter */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  {isEn ? 'Chapter' : 'அதிகாரம்'} (1..{maxChapters})
                </label>
                <input
                  type="number"
                  min="1"
                  max={maxChapters}
                  className="admin-input"
                  value={chapter}
                  onChange={(e) => setChapter(Number(e.target.value))}
                />
              </div>

              {/* Verse */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  {isEn ? 'Verse' : 'வசனம்'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="176"
                  className="admin-input"
                  value={verse}
                  onChange={(e) => setVerse(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Verse Texts */}
            <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  {isEn ? 'Verse Text (Tamil)' : 'வசன உரை (தமிழ்)'}
                </label>
                <textarea
                  className="admin-input"
                  rows={3}
                  value={verseTextTa}
                  onChange={(e) => setVerseTextTa(e.target.value)}
                  placeholder="தமிழ் வசனம்..."
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  {isEn ? 'Verse Text (English)' : 'வசன உரை (English)'}
                </label>
                <textarea
                  className="admin-input"
                  rows={3}
                  value={verseTextEn}
                  onChange={(e) => setVerseTextEn(e.target.value)}
                  placeholder="English verse..."
                />
              </div>
            </div>
          </div>

          {/* LIVE PREVIEW OF THE NOTIFICATION */}
          <div style={{ marginTop: '1rem', padding: '0.85rem', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              {isEn ? 'Live Notification Preview (Mobile & Desktop)' : 'நேரலை அறிவிப்பு மாதிரி தோற்றம் (Preview)'}
            </div>

            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start', background: 'rgba(0, 0, 0, 0.05)', padding: '0.85rem', borderRadius: '10px' }}>
              {/* App Logo */}
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#1e293b' }}>
                <img src="/icon-192.png" alt="Bible Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9375rem', fontWeight: 700 }}>
                    📖 {selectedBook.name_ta} {chapter}:{verse} · {title}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} /> {scheduledTime}
                  </span>
                </div>
                <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {verseTextTa || verseTextEn || 'வசனம் இங்கே தோன்றும்...'}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => setIsCreating(false)}
            >
              {isEn ? 'Cancel' : 'ரத்து செய்'}
            </button>
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
            >
              <Send size={15} />
              <span>{isEn ? 'Save & Schedule Notification' : 'அறிவிப்பை அட்டவணைப்படுத்து'}</span>
            </button>
          </div>
        </form>
      )}

      {/* SCHEDULED NOTIFICATIONS LIST */}
      <div style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.85rem 0' }}>
          {isEn ? `Active Scheduled Notifications (${notifications.length})` : `செயலில் உள்ள அறிவிப்புகள் (${notifications.length})`}
        </h3>

        {notifications.length === 0 ? (
          <div className="admin-empty-state">
            <Bell size={36} color="var(--text-muted)" />
            <p>{isEn ? 'No scheduled notifications found. Create one above.' : 'அட்டவணைப்படுத்தப்பட்ட அறிவிப்புகள் இல்லை.'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.map((notif) => {
              const bookMeta = getBookMetaById(notif.book_id);
              const bName = bookMeta ? `${bookMeta.name_ta} (${bookMeta.name_en})` : `Book ${notif.book_id}`;

              return (
                <div
                  key={notif.id}
                  className="admin-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        background: '#0f172a',
                        flexShrink: 0
                      }}
                    >
                      <img src="/icon-192.png" alt="App Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{notif.title}</span>
                        <span
                          style={{
                            background: notif.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: notif.status === 'active' ? '#10b981' : '#ef4444',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.7rem',
                            fontWeight: 700
                          }}
                        >
                          {notif.status.toUpperCase()}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        <strong style={{ color: 'var(--accent-color)' }}>
                          📖 {bName} {notif.chapter}:{notif.verse}
                        </strong>{' '}
                        · ⏰ {notif.scheduled_time} ({notif.frequency})
                      </div>

                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {notif.verse_text_ta || notif.verse_text_en}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      onClick={() => handleSendNow(notif)}
                      title={isEn ? 'Trigger notification to devices now' : 'உடனடியாக சாதனங்களுக்கு அனுப்பு'}
                    >
                      <Send size={14} />
                      <span className="desktop-only-inline">{isEn ? 'Send Now' : 'இப்போதே அனுப்பு'}</span>
                    </button>

                    <button
                      type="button"
                      className="admin-btn-icon"
                      onClick={() => handleDelete(notif.id)}
                      title={isEn ? 'Delete Notification' : 'அறிவிப்பை நீக்கு'}
                      style={{ color: '#ef4444' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
