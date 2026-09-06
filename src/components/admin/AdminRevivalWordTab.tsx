import React, { useState, useEffect } from 'react';
import {
  Flame,
  Calendar,
  BookOpen,
  Sparkles,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Eye,
  Clock,
  RotateCcw
} from 'lucide-react';
import { AdminRevivalWord } from '../../types/adminTypes';
import { BOOK_METADATA_LIST, getVerseByLocation, loadBibleDatasets } from '../../services/csvBibleService';
import { BibleVerse } from '../../types/bible';

interface AdminRevivalWordTabProps {
  revivalWords: AdminRevivalWord[];
  onSaveWord: (word: Omit<AdminRevivalWord, 'id' | 'created_at'> & { id?: string }) => void;
  onDeleteWord: (id: string) => void;
  isEn?: boolean;
}

const CATEGORIES = [
  'faith',
  'love',
  'peace',
  'encouragement',
  'hope',
  'wisdom',
  'prayer',
  'courage',
  'salvation',
  'protection',
  'grace',
  'spiritual growth'
];

export const AdminRevivalWordTab: React.FC<AdminRevivalWordTabProps> = ({
  revivalWords,
  onSaveWord,
  onDeleteWord,
  isEn = true
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState<string>(todayStr);
  const [bookId, setBookId] = useState<number>(43); // John
  const [chapter, setChapter] = useState<number>(14);
  const [verse, setVerse] = useState<number>(6);
  const [category, setCategory] = useState<string>('faith');
  const [promptTa, setPromptTa] = useState<string>('');
  const [promptEn, setPromptEn] = useState<string>('');
  const [specialTheme, setSpecialTheme] = useState<string>('இன்றைய எழுப்புதல் வாக்கு / Daily Revival Word');
  const [status, setStatus] = useState<'active' | 'scheduled' | 'archived'>('active');

  const [previewVerse, setPreviewVerse] = useState<BibleVerse | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load verse preview whenever location changes
  useEffect(() => {
    let isMounted = true;
    const updatePreview = async () => {
      await loadBibleDatasets();
      const v = getVerseByLocation(bookId, chapter, verse);
      if (isMounted) {
        setPreviewVerse(v);
      }
    };
    updatePreview();
    return () => {
      isMounted = false;
    };
  }, [bookId, chapter, verse]);

  const selectedBookMeta = BOOK_METADATA_LIST.find((b) => b.id === bookId);

  const handleEdit = (w: AdminRevivalWord) => {
    setEditingId(w.id);
    setDate(w.date);
    setBookId(w.book_id);
    setChapter(w.chapter);
    setVerse(w.verse);
    setCategory(w.category);
    setPromptTa(w.prompt_ta);
    setPromptEn(w.prompt_en);
    setSpecialTheme(w.special_theme || '');
    setStatus(w.status);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetForm = () => {
    setEditingId(null);
    setDate(todayStr);
    setBookId(43);
    setChapter(14);
    setVerse(6);
    setCategory('faith');
    setPromptTa('');
    setPromptEn('');
    setSpecialTheme('இன்றைய எழுப்புதல் வாக்கு / Daily Revival Word');
    setStatus('active');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptTa.trim() && previewVerse) {
      setPromptTa(`இன்று ${selectedBookMeta?.name_ta || ''} ${chapter}:${verse} வாக்குத்தத்தத்தை முழு இருதயத்தோடு தியானியுங்கள்.`);
    }

    onSaveWord({
      id: editingId || undefined,
      date,
      book_id: bookId,
      chapter,
      verse,
      category,
      prompt_ta: promptTa.trim() || `இன்று தேவனுடைய ஒப்பற்ற கிருபையை தியானியுங்கள்.`,
      prompt_en: promptEn.trim() || `Meditate on God's unchanging faithfulness today.`,
      special_theme: specialTheme,
      status
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    handleResetForm();
  };

  return (
    <div>
      {/* ── Editor Card ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">
              <Flame size={20} style={{ color: '#ea580c' }} />
              <span>
                {editingId
                  ? isEn
                    ? 'Edit Revival Word Schedule'
                    : 'எழுப்புதல் வாக்கை திருத்து'
                  : isEn
                  ? 'Set & Schedule Daily Revival Word'
                  : 'தினசரி எழுப்புதல் வார்த்தை அமைப்பாளர்'}
              </span>
            </h2>
            <p className="admin-card-subtitle">
              {isEn
                ? 'Select any scripture verse, write the devotional prompt, and designate it as today’s or an upcoming revival word.'
                : 'வேதாகமத்தில் உள்ள எந்த ஒரு வசனத்தையும் தெரிவு செய்து, அதற்கான எழுப்புதல் சிந்தனையோடு குறிப்பிட்ட தேதியில் வெளியிடலாம்.'}
            </p>
          </div>
          {editingId && (
            <button className="admin-btn admin-btn-sm admin-btn-outline" onClick={handleResetForm}>
              <RotateCcw size={14} />
              <span>{isEn ? 'Cancel Edit' : 'புதியதாக உருவாக்கு'}</span>
            </button>
          )}
        </div>

        {saveSuccess && (
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
            <span>
              {isEn
                ? 'Revival Word published successfully!'
                : 'எழுப்புதல் வார்த்தை வெற்றிகரமாக வெளியிடப்பட்டது!'}
            </span>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">
                <Calendar size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />
                {isEn ? 'Publish Date (YYYY-MM-DD)' : 'வெளியிடப்படும் தேதி'}
              </label>
              <input
                type="date"
                className="admin-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                <BookOpen size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />
                {isEn ? 'Bible Book' : 'வேதாகம புத்தகம்'}
              </label>
              <select
                className="admin-select"
                value={bookId}
                onChange={(e) => setBookId(Number(e.target.value))}
              >
                {BOOK_METADATA_LIST.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id}. {isEn ? b.name_en : b.name_ta} ({b.name_en})
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">{isEn ? 'Chapter' : 'அதிகாரம்'}</label>
              <input
                type="number"
                min="1"
                max="150"
                className="admin-input"
                value={chapter}
                onChange={(e) => setChapter(Math.max(1, Number(e.target.value)))}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">{isEn ? 'Verse' : 'வசனம்'}</label>
              <input
                type="number"
                min="1"
                max="176"
                className="admin-input"
                value={verse}
                onChange={(e) => setVerse(Math.max(1, Number(e.target.value)))}
                required
              />
            </div>
          </div>

          {/* Dynamic Bible Verse Live Preview */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '1rem 1.25rem',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Eye size={16} style={{ color: '#2563eb' }} />
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                {isEn ? 'Live Scripture Verse Preview:' : 'தெரிவு செய்யப்பட்ட வசன முன்னோட்டம்:'}
              </span>
              <span style={{ fontWeight: 700, color: '#2563eb', fontSize: '0.9rem' }}>
                {selectedBookMeta?.name_ta} ({selectedBookMeta?.name_en}) {chapter}:{verse}
              </span>
            </div>

            {previewVerse ? (
              <div>
                <div style={{ fontStyle: 'italic', marginBottom: '0.4rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  "{previewVerse.text_ta}"
                </div>
                <div style={{ fontStyle: 'italic', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  "{previewVerse.text_en}"
                </div>
              </div>
            ) : (
              <div style={{ color: '#dc2626', fontSize: '0.85rem' }}>
                {isEn ? 'Verse location not found in CSV datasets.' : 'இந்த வசனம் காணப்படவில்லை. அதிகாரத்தையும் வசன எண்ணையும் சரிபார்க்கவும்.'}
              </div>
            )}
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">{isEn ? 'Devotional Theme / Category' : 'தியான வகை (Category)'}</label>
              <select
                className="admin-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">{isEn ? 'Special Header / Theme' : 'விசேஷ தலைப்பு'}</label>
              <input
                type="text"
                className="admin-input"
                placeholder="எ.கா. இன்றைய ஆவிக்குரிய எழுப்புதல் வாக்கு"
                value={specialTheme}
                onChange={(e) => setSpecialTheme(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">{isEn ? 'Status' : 'நிலை'}</label>
              <select
                className="admin-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="active">{isEn ? 'Active (Live)' : 'செயலில் (Live)'}</option>
                <option value="scheduled">{isEn ? 'Scheduled' : 'திட்டமிடப்பட்டது'}</option>
                <option value="archived">{isEn ? 'Archived' : 'பழையவை'}</option>
              </select>
            </div>
          </div>

          {/* Devotional Prompts */}
          <div className="admin-form-group">
            <label className="admin-form-label">
              {isEn ? 'Tamil Devotional Guidance / Meditation Prompt' : 'தமிழ் எழுப்புதல் தியான சிந்தனை (Prompt TA)'}
            </label>
            <textarea
              className="admin-textarea"
              rows={2}
              placeholder="இன்று தேவனுடைய அன்பை உங்கள் இருதயத்தில் தியானியுங்கள்..."
              value={promptTa}
              onChange={(e) => setPromptTa(e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              {isEn ? 'English Devotional Guidance (Prompt EN)' : 'ஆங்கில தியான சிந்தனை (Prompt EN)'}
            </label>
            <textarea
              className="admin-textarea"
              rows={2}
              placeholder="Meditate on the Lord's guidance and unfailing mercy today..."
              value={promptEn}
              onChange={(e) => setPromptEn(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="admin-btn admin-btn-outline" onClick={handleResetForm}>
              {isEn ? 'Reset' : 'அழிக்க'}
            </button>
            <button type="submit" className="admin-btn admin-btn-primary">
              <Flame size={16} />
              <span>{editingId ? (isEn ? 'Update Revival Word' : 'மாற்றத்தை சேமி') : (isEn ? 'Publish Revival Word' : 'வெளியிடு')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── Scheduled Revival Words Table ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            <Clock size={18} style={{ color: '#2563eb' }} />
            <span>{isEn ? 'Scheduled & Active Revival Words' : 'அட்டவணைப்படுத்தப்பட்ட எழுப்புதல் வாக்குகள்'}</span>
          </h3>
          <span className="admin-kpi-badge" style={{ backgroundColor: 'rgba(234, 88, 12, 0.15)', color: '#ea580c' }}>
            {revivalWords.length} {isEn ? 'records' : 'பதிவுகள்'}
          </span>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{isEn ? 'Date' : 'தேதி'}</th>
                <th>{isEn ? 'Scripture Ref' : 'வேத வசனம்'}</th>
                <th>{isEn ? 'Category' : 'வகை'}</th>
                <th>{isEn ? 'Devotional Message' : 'தியான சிந்தனை'}</th>
                <th>{isEn ? 'Status' : 'நிலை'}</th>
                <th style={{ textAlign: 'right' }}>{isEn ? 'Actions' : 'செயல்கள்'}</th>
              </tr>
            </thead>
            <tbody>
              {revivalWords.map((rw) => {
                const bMeta = BOOK_METADATA_LIST.find((b) => b.id === rw.book_id);
                const isToday = rw.date === todayStr;
                return (
                  <tr key={rw.id} style={{ backgroundColor: isToday ? 'rgba(37, 99, 235, 0.04)' : undefined }}>
                    <td>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>{rw.date}</span>
                        {isToday && (
                          <span
                            className="role-badge"
                            style={{ backgroundColor: 'rgba(37, 99, 235, 0.15)', color: '#2563eb', fontSize: '0.65rem' }}
                          >
                            {isEn ? 'TODAY' : 'இன்று'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#2563eb' }}>
                        {bMeta?.name_ta || 'Book'} {rw.chapter}:{rw.verse}
                      </span>
                    </td>
                    <td>
                      <span className="role-badge" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                        {rw.category}
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {rw.prompt_ta}
                      </div>
                    </td>
                    <td>
                      <span
                        className="role-badge"
                        style={{
                          backgroundColor:
                            rw.status === 'active'
                              ? 'rgba(34, 197, 94, 0.15)'
                              : rw.status === 'scheduled'
                              ? 'rgba(234, 179, 8, 0.15)'
                              : 'rgba(100, 116, 139, 0.15)',
                          color:
                            rw.status === 'active'
                              ? '#16a34a'
                              : rw.status === 'scheduled'
                              ? '#ca8a04'
                              : '#64748b'
                        }}
                      >
                        {rw.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          className="admin-btn admin-btn-sm admin-btn-outline"
                          onClick={() => handleEdit(rw)}
                          title={isEn ? 'Edit Word' : 'திருத்து'}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="admin-btn admin-btn-sm admin-btn-danger"
                          onClick={() => onDeleteWord(rw.id)}
                          title={isEn ? 'Delete' : 'நீக்கு'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
