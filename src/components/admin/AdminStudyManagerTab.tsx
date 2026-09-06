import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Save,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  MessageSquare,
  Compass
} from 'lucide-react';
import { AdminGlobalConfig, CustomVerseMeditation } from '../../types/adminTypes';
import { BOOK_METADATA_LIST, getVerseByLocation, loadBibleDatasets } from '../../services/csvBibleService';
import { BibleVerse } from '../../types/bible';

interface AdminStudyManagerTabProps {
  config: AdminGlobalConfig;
  customMeditations: CustomVerseMeditation[];
  onUpdateConfig: (partial: Partial<AdminGlobalConfig>) => void;
  onSaveMeditation: (meditation: CustomVerseMeditation) => void;
  onDeleteMeditation: (bookId: number, chapter: number, verse: number) => void;
  isEn?: boolean;
}

export const AdminStudyManagerTab: React.FC<AdminStudyManagerTabProps> = ({
  config,
  customMeditations,
  onUpdateConfig,
  onSaveMeditation,
  onDeleteMeditation,
  isEn = true
}) => {
  const [bookId, setBookId] = useState<number>(43); // John
  const [chapter, setChapter] = useState<number>(3);
  const [verse, setVerse] = useState<number>(16);

  // Form fields
  const [simpleTa, setSimpleTa] = useState('');
  const [simpleEn, setSimpleEn] = useState('');
  const [deepTa, setDeepTa] = useState('');
  const [deepEn, setDeepEn] = useState('');
  const [practicalTa, setPracticalTa] = useState('');
  const [practicalEn, setPracticalEn] = useState('');
  const [prayerTa, setPrayerTa] = useState('');
  const [prayerEn, setPrayerEn] = useState('');
  const [pastoralNote, setPastoralNote] = useState('');
  const [reflectionQuestionTa, setReflectionQuestionTa] = useState('');

  const [previewVerse, setPreviewVerse] = useState<BibleVerse | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load verse text preview
  useEffect(() => {
    let isMounted = true;
    const fetchPreview = async () => {
      await loadBibleDatasets();
      const v = getVerseByLocation(bookId, chapter, verse);
      if (isMounted) {
        setPreviewVerse(v);
      }
    };
    fetchPreview();
    return () => {
      isMounted = false;
    };
  }, [bookId, chapter, verse]);

  // If a custom meditation already exists for this verse, pre-populate form
  useEffect(() => {
    const existing = customMeditations.find(
      (m) => m.book_id === bookId && m.chapter === chapter && m.verse === verse
    );
    if (existing) {
      setSimpleTa(existing.simple_explanation_ta || '');
      setSimpleEn(existing.simple_explanation_en || '');
      setDeepTa(existing.deep_meaning_ta || '');
      setDeepEn(existing.deep_meaning_en || '');
      setPracticalTa(existing.practical_application_ta || '');
      setPracticalEn(existing.practical_application_en || '');
      setPrayerTa(existing.prayer_ta || '');
      setPrayerEn(existing.prayer_en || '');
      setPastoralNote(existing.pastoral_note || '');
      setReflectionQuestionTa(existing.reflection_question_ta || '');
    } else {
      setSimpleTa('');
      setSimpleEn('');
      setDeepTa('');
      setDeepEn('');
      setPracticalTa('');
      setPracticalEn('');
      setPrayerTa('');
      setPrayerEn('');
      setPastoralNote('');
      setReflectionQuestionTa('');
    }
  }, [bookId, chapter, verse, customMeditations]);

  const selectedBookMeta = BOOK_METADATA_LIST.find((b) => b.id === bookId);

  const handleSelectMeditation = (m: CustomVerseMeditation) => {
    setBookId(m.book_id);
    setChapter(m.chapter);
    setVerse(m.verse);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveMeditation({
      book_id: bookId,
      chapter,
      verse,
      simple_explanation_ta: simpleTa,
      simple_explanation_en: simpleEn,
      deep_meaning_ta: deepTa,
      deep_meaning_en: deepEn,
      practical_application_ta: practicalTa,
      practical_application_en: practicalEn,
      prayer_ta: prayerTa,
      prayer_en: prayerEn,
      pastoral_note: pastoralNote,
      reflection_question_ta: reflectionQuestionTa,
      updated_at: new Date().toISOString(),
      updated_by: 'Admin'
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleClearForm = () => {
    setSimpleTa('');
    setSimpleEn('');
    setDeepTa('');
    setDeepEn('');
    setPracticalTa('');
    setPracticalEn('');
    setPrayerTa('');
    setPrayerEn('');
    setPastoralNote('');
    setReflectionQuestionTa('');
  };

  return (
    <div>
      {/* ── Master Toggles Card ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">
              <BookOpen size={20} style={{ color: '#2563eb' }} />
              <span>{isEn ? 'Study Modes Activation & Controls' : 'வேத தியான ஆய்வுகள் மேலாளர் (Study Controls)'}</span>
            </h2>
            <p className="admin-card-subtitle">
              {isEn
                ? 'Turn the 9-point verse study and chapter study features ON or OFF for all readers.'
                : 'வாசகரில் வசனத்தை கிளிக் செய்யும்போது விரிவான தியானம் தோன்றுவதை ஆன் அல்லது ஆஃப் செய்யவும்.'}
            </p>
          </div>
        </div>

        <div className="admin-switch-list">
          <div className="admin-switch-item">
            <div className="admin-switch-info">
              <div className="admin-switch-title">
                <Sparkles size={18} style={{ color: '#2563eb' }} />
                <span>{isEn ? 'Verse Meditation (Verse Study)' : 'வசன தியான ஆய்வு வசதி (Verse Study)'}</span>
                {config.verseStudyEnabled ? (
                  <span className="role-badge" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#16a34a' }}>
                    {isEn ? 'ACTIVE / ON' : 'இயங்குகிறது'}
                  </span>
                ) : (
                  <span className="role-badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#dc2626' }}>
                    {isEn ? 'MUTED / OFF' : 'முடக்கப்பட்டது'}
                  </span>
                )}
              </div>
              <div className="admin-switch-desc">
                {isEn
                  ? 'When ON, readers see "Study / தியானம்" button on every verse to open the 9-point deep devotional meditation modal.'
                  : 'இயக்கத்தில் இருக்கும்போது, வாசகர் ஒவ்வொரு வசனத்திற்கும் தியான பொத்தானைக் கண்டு 9 அம்ச தியானத்தைப் பெற முடியும்.'}
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

          <div className="admin-switch-item">
            <div className="admin-switch-info">
              <div className="admin-switch-title">
                <Compass size={18} style={{ color: '#9333ea' }} />
                <span>{isEn ? 'Chapter Study (Chapter Breakdown)' : 'முழு அதிகார ஆய்வு (Chapter Study)'}</span>
                {config.chapterStudyEnabled ? (
                  <span className="role-badge" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#16a34a' }}>
                    {isEn ? 'ACTIVE / ON' : 'இயங்குகிறது'}
                  </span>
                ) : (
                  <span className="role-badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#dc2626' }}>
                    {isEn ? 'MUTED / OFF' : 'முடக்கப்பட்டது'}
                  </span>
                )}
              </div>
              <div className="admin-switch-desc">
                {isEn
                  ? 'When ON, readers can view the chapter structural breakdown, characters, and context.'
                  : 'முழு அதிகாரத்தையும் பிரித்து விளக்கும் ஆய்வு வசதியை வாசகருக்குக் காட்டுகிறது.'}
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
        </div>
      </div>

      {/* ── Custom Meditation Editor ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">
              <Edit size={20} style={{ color: '#2563eb' }} />
              <span>{isEn ? 'Edit / Customize Meditation for Any Verse' : 'வசன தியானத்தை மாற்றி அமைக்கும் தளம்'}</span>
            </h2>
            <p className="admin-card-subtitle">
              {isEn
                ? 'Override the auto-generated commentary with your own pastoral insights, explanations, and prayers.'
                : 'எந்த ஒரு வேத வசனத்திற்கும் உங்கள் சொந்த ஆவிக்குரிய விளக்கங்கள், ஜெபங்கள் மற்றும் போதகரின் குறிப்புகளை இணைக்கலாம்.'}
            </p>
          </div>
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
                ? 'Custom meditation saved & active in user study modal!'
                : 'வசன தியானம் வெற்றிகரமாக சேமிக்கப்பட்டது! வாசகர்கள் இப்போது இந்த புதிய தியானத்தைக் காண்பார்கள்.'}
            </span>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">{isEn ? 'Book' : 'புத்தகம்'}</label>
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

          {/* Verse Text Display */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <Eye size={15} style={{ color: '#2563eb' }} />
              <span style={{ fontWeight: 700, color: '#2563eb' }}>
                {selectedBookMeta?.name_ta} ({selectedBookMeta?.name_en}) {chapter}:{verse}
              </span>
            </div>
            {previewVerse ? (
              <div>
                <p style={{ margin: '0 0 0.35rem 0', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                  "{previewVerse.text_ta}"
                </p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  "{previewVerse.text_en}"
                </p>
              </div>
            ) : (
              <div style={{ color: '#dc2626', fontSize: '0.85rem' }}>
                {isEn ? 'Verse not found' : 'வசனம் காணப்படவில்லை'}
              </div>
            )}
          </div>

          {/* Section 2: Simple Explanation Override */}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">
                {isEn ? '2. Simple Explanation (Tamil)' : '2. எளிய விளக்கம் (தமிழ்)'}
              </label>
              <textarea
                className="admin-textarea"
                placeholder="இந்த வசனம் எளிமையாக நமக்கு விளக்குவது..."
                value={simpleTa}
                onChange={(e) => setSimpleTa(e.target.value)}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">
                {isEn ? '2. Simple Explanation (English)' : '2. Simple Explanation (English)'}
              </label>
              <textarea
                className="admin-textarea"
                placeholder="Simple explanation of this verse in plain terms..."
                value={simpleEn}
                onChange={(e) => setSimpleEn(e.target.value)}
              />
            </div>
          </div>

          {/* Section 3: Deep Meaning Override */}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">
                {isEn ? '3. Deep Theological Meaning (Tamil)' : '3. ஆழமான அர்த்தம் & வேதாகம சத்தியம் (தமிழ்)'}
              </label>
              <textarea
                className="admin-textarea"
                placeholder="மூல பாஷை வார்த்தைகளின் ஆழம் மற்றும் ஆவிக்குரிய சத்தியம்..."
                value={deepTa}
                onChange={(e) => setDeepTa(e.target.value)}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">
                {isEn ? '3. Deep Meaning (English)' : '3. Deep Meaning (English)'}
              </label>
              <textarea
                className="admin-textarea"
                placeholder="Theological depth and key truths..."
                value={deepEn}
                onChange={(e) => setDeepEn(e.target.value)}
              />
            </div>
          </div>

          {/* Section 5: Practical Application & Reflection */}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">
                {isEn ? '5. Practical Application (Tamil)' : '5. இன்றைய நடைமுறை பிரயோகம் (தமிழ்)'}
              </label>
              <textarea
                className="admin-textarea"
                placeholder="இன்று நாம் இந்த வசனத்தின்படி செய்ய வேண்டிய நடைமுறை செயல்..."
                value={practicalTa}
                onChange={(e) => setPracticalTa(e.target.value)}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">
                {isEn ? '8. Personal Reflection Question (Tamil)' : '8. சுய பரிசோதனை கேள்வி'}
              </label>
              <textarea
                className="admin-textarea"
                placeholder="வாசகர் தங்களை சோதித்துப் பார்க்க ஒரு சிந்தனைக் கேள்வி..."
                value={reflectionQuestionTa}
                onChange={(e) => setReflectionQuestionTa(e.target.value)}
              />
            </div>
          </div>

          {/* Section 9: Pastoral Note & Custom Prayer */}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">
                <MessageSquare size={13} style={{ display: 'inline', marginRight: '0.3rem' }} />
                {isEn ? 'Pastoral Guidance Note' : 'போதகரின் விசேஷ தியானக் குறிப்பு (Pastoral Guidance)'}
              </label>
              <textarea
                className="admin-textarea"
                placeholder="விசேஷ மேய்ப்பரின் ஆலோசனைக் குறிப்பு..."
                value={pastoralNote}
                onChange={(e) => setPastoralNote(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                {isEn ? '9. Custom Concluding Prayer (Tamil)' : '9. நிறைவு ஜெபம் (தமிழ்)'}
              </label>
              <textarea
                className="admin-textarea"
                placeholder="அன்பின் பரலோகப் பிதாவே, இந்த வசனத்தின்படி என் வாழ்க்கையை..."
                value={prayerTa}
                onChange={(e) => setPrayerTa(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="admin-btn admin-btn-outline" onClick={handleClearForm}>
              {isEn ? 'Clear Fields' : 'அழிக்க'}
            </button>
            <button type="submit" className="admin-btn admin-btn-primary">
              <Save size={16} />
              <span>{isEn ? 'Save Verse Meditation' : 'தியானத்தை சேமித்து செயல்படுத்து'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ── Customized Verses List ── */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            <Sparkles size={18} style={{ color: '#2563eb' }} />
            <span>{isEn ? 'Active Custom Verse Meditations' : 'மாற்றியமைக்கப்பட்ட வசன தியானங்கள்'}</span>
          </h3>
          <span className="admin-kpi-badge" style={{ backgroundColor: 'rgba(37, 99, 235, 0.15)', color: '#2563eb' }}>
            {customMeditations.length} {isEn ? 'customized' : 'வசனங்கள்'}
          </span>
        </div>

        {customMeditations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <p>
              {isEn
                ? 'No custom verse meditations currently overridden. All verses use standard theological study generators.'
                : 'தனிப்பயனாக்கப்பட்ட தியானங்கள் எதுவும் இல்லை. மேலே உள்ள படிவத்தைப் பயன்படுத்தி எந்த வசனத்திற்கும் தியானத்தை உருவாக்கலாம்.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {customMeditations.map((m) => {
              const bMeta = BOOK_METADATA_LIST.find((b) => b.id === m.book_id);
              return (
                <div key={`${m.book_id}-${m.chapter}-${m.verse}`} className="meditation-card-item">
                  <div className="meditation-card-header">
                    <span className="meditation-verse-ref">
                      {bMeta?.name_ta || 'Book'} {m.chapter}:{m.verse}
                    </span>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        className="admin-btn admin-btn-sm admin-btn-outline"
                        onClick={() => handleSelectMeditation(m)}
                        title={isEn ? 'Edit' : 'திருத்து'}
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        className="admin-btn admin-btn-sm admin-btn-danger"
                        onClick={() => onDeleteMeditation(m.book_id, m.chapter, m.verse)}
                        title={isEn ? 'Reset to Default' : 'இயல்புநிலைக்கு மாற்று'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {m.pastoral_note && (
                    <div style={{ fontSize: '0.8rem', color: '#2563eb', fontStyle: 'italic' }}>
                      <strong>போதகர் குறிப்பு:</strong> {m.pastoral_note}
                    </div>
                  )}

                  {m.simple_explanation_ta && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <strong>விளக்கம்:</strong> {m.simple_explanation_ta}
                    </div>
                  )}

                  {m.prayer_ta && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <strong>ஜெபம்:</strong> {m.prayer_ta}
                    </div>
                  )}

                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                    {isEn ? 'Updated: ' : 'மாற்றப்பட்டது: '} {new Date(m.updated_at).toLocaleDateString()}
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
