import React, { useEffect, useState } from 'react';
import {
  X,
  ArrowLeft,
  BookOpen,
  Compass,
  FileText,
  Users,
  Layers,
  HeartHandshake,
  Eye,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Info,
  ChevronDown,
  BookMarked
} from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { getChapterStudy } from '../../services/studyService';
import { ChapterStudy } from '../../types/studyTypes';

export const ChapterStudyModal: React.FC = () => {
  const {
    activeStudyType,
    studyLocation,
    closeStudy,
    openVerseStudy,
    books,
    setBookAndChapter,
    language,
    setLanguage
  } = useReading();
  const [studyData, setStudyData] = useState<ChapterStudy | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Collapsible section state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    overview: true,
    story: true,
    sections: true,
    mainIdeas: true,
    characters: true,
    keyWords: true,
    lifeApp: true,
    perspectives: true,
    takeaways: true,
    reflection: true,
    prayer: true
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (activeStudyType === 'chapter' && studyLocation) {
      setLoading(true);
      getChapterStudy(studyLocation.bookId, studyLocation.chapter).then((res) => {
        setStudyData(res);
        setLoading(false);
      });
    }
  }, [activeStudyType, studyLocation]);

  if (activeStudyType !== 'chapter' || !studyLocation) return null;

  const isTa = language === 'ta';

  const handleOpenReader = () => {
    if (studyLocation) {
      const book = books.find((b) => b.id === studyLocation.bookId);
      if (book) {
        setBookAndChapter(book, studyLocation.chapter, 1);
        closeStudy();
      }
    }
  };

  const handleOpenVerseStudy = () => {
    if (studyLocation) {
      const targetVerse = studyLocation.verse || 1;
      openVerseStudy(studyLocation.bookId, studyLocation.chapter, targetVerse);
    }
  };

  return (
    <div className="study-overlay" onClick={closeStudy}>
      <div className="study-container" onClick={(e) => e.stopPropagation()}>
        {/* Header Bar */}
        <div className="study-header">
          <div className="study-title-group">
            <span className="study-badge">
              <BookOpen size={14} />
              <span>{isTa ? 'அதிகாரத்தின் முழுமையான விளக்கம்' : 'Full Chapter Study'}</span>
            </span>
            <h2 className="study-main-title">
              {studyData
                ? isTa
                  ? `${studyData.book_name_ta} ${studyData.chapter}`
                  : `${studyData.book_name_en} ${studyData.chapter}`
                : isTa
                ? 'ஏற்றுகிறது...'
                : 'Loading...'}
              {studyData && (
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                  ({studyData.total_verses} {isTa ? 'வசனங்கள்' : 'verses'})
                </span>
              )}
            </h2>
          </div>

          <div className="study-actions-bar">
            <button
              className="btn-pill"
              onClick={() => setLanguage(isTa ? 'en' : 'ta')}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
            >
              {isTa ? 'English' : 'தமிழ்'}
            </button>
            <button className="btn-icon" onClick={closeStudy} title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="study-body">
          {loading || !studyData ? (
            <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              {isTa ? 'அதிகாரத்தின் விரிவான தியானம் தயாரிக்கப்படுகிறது...' : 'Loading full chapter story study...'}
            </div>
          ) : (
            <>
              {/* Disclaimer Notice */}
              <div className="study-disclaimer">
                <Info size={18} style={{ flexShrink: 0, color: 'var(--accent-color)', marginTop: '2px' }} />
                <div>
                  <strong>{isTa ? 'அதிகாரப் பின்னணி:' : 'Chapter Context:'}</strong>{' '}
                  {isTa
                    ? `வேதாகம CSV தரவிலிருந்து பெறப்பட்ட ${studyData.book_name_ta} ${studyData.chapter}-ஆம் அதிகாரத்தின் ${studyData.total_verses} வசனங்களின் கதைப்போக்கு மற்றும் தியான விளக்கம்.`
                    : `Comprehensive narrative breakdown and study of ${studyData.total_verses} verses in ${studyData.book_name_en} ${studyData.chapter}.`}
                </div>
              </div>

              {/* 1. ஒரு பார்வையில் (Chapter In One Look) */}
              <div className="study-section">
                <button className="study-section-header" onClick={() => toggleSection('overview')}>
                  <div className="study-section-title-wrapper">
                    <span className="study-section-icon">
                      <Compass size={18} />
                    </span>
                    <span>{isTa ? '1. ஒரு பார்வையில் (Chapter Overview)' : '1. Chapter In One Look'}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    style={{ transform: openSections.overview ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}
                  />
                </button>
                {openSections.overview && (
                  <div className="study-section-content">
                    <p>{isTa ? studyData.overview_ta : studyData.overview_en}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                      <div className="scenario-card">
                        <span className="scenario-title">{isTa ? 'முக்கியமான சம்பவம்:' : 'Key Event:'}</span>
                        <span className="scenario-desc">{isTa ? studyData.key_event_ta : studyData.key_event_en}</span>
                      </div>
                      <div className="scenario-card">
                        <span className="scenario-title">{isTa ? 'மையக் கருத்து:' : 'Central Theme:'}</span>
                        <span className="scenario-desc">{isTa ? studyData.central_theme_ta : studyData.central_theme_en}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. முழு கதையின் விளக்கம் (Full Story Explanation - Pastor Style) */}
              <div className="study-section">
                <button className="study-section-header" onClick={() => toggleSection('story')}>
                  <div className="study-section-title-wrapper">
                    <span className="study-section-icon">
                      <FileText size={18} />
                    </span>
                    <span>{isTa ? '2. முழு கதையின் விளக்கம் (Story Walkthrough)' : '2. Full Story Narrative'}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    style={{ transform: openSections.story ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}
                  />
                </button>
                {openSections.story && (
                  <div className="study-section-content">
                    <div
                      style={{
                        padding: '1.125rem 1.25rem',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '0.75rem',
                        borderLeft: '4px solid var(--accent-color)',
                        fontFamily: isTa ? 'var(--font-tamil)' : 'var(--font-serif)',
                        fontSize: '1rem',
                        lineHeight: 1.75,
                        whiteSpace: 'pre-line',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {isTa ? studyData.full_story_ta : studyData.full_story_en}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. பகுதி பகுதியாக விளக்கம் (Section-by-Section Explanation) */}
              <div className="study-section">
                <button className="study-section-header" onClick={() => toggleSection('sections')}>
                  <div className="study-section-title-wrapper">
                    <span className="study-section-icon">
                      <Layers size={18} />
                    </span>
                    <span>{isTa ? '3. பகுதி பகுதியாக விளக்கம்' : '3. Section-by-Section Breakdown'}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    style={{ transform: openSections.sections ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}
                  />
                </button>
                {openSections.sections && (
                  <div className="study-section-content">
                    {studyData.sections.map((sec, idx) => (
                      <div
                        key={idx}
                        style={{
                          border: '1px solid var(--border-color)',
                          borderRadius: '0.625rem',
                          padding: '1rem',
                          backgroundColor: 'var(--bg-secondary)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.625rem'
                        }}
                      >
                        <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--accent-color)', margin: 0 }}>
                          {isTa ? sec.title_ta : sec.title_en}
                        </h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                          {isTa ? sec.summary_ta : sec.summary_en}
                        </p>

                        {/* Sample Verse Quotes from CSV */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '0.25rem' }}>
                          {sec.verses.map((v) => (
                            <div
                              key={v.verse}
                              style={{
                                fontSize: '0.875rem',
                                padding: '0.375rem 0.625rem',
                                background: 'var(--bg-surface)',
                                borderRadius: '0.375rem',
                                borderLeft: '2px solid var(--border-color)'
                              }}
                            >
                              <strong>v{v.verse}:</strong> "{isTa ? v.text_ta : v.text_en}"
                            </div>
                          ))}
                        </div>

                        <div style={{ fontSize: '0.875rem', paddingTop: '0.375rem' }}>
                          <strong>{isTa ? 'பாடங்கள்:' : 'Key Lesson:'}</strong> {isTa ? sec.lesson_ta : sec.lesson_en}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. முக்கிய கருத்துக்கள் (Main Ideas) */}
              <div className="study-section">
                <button className="study-section-header" onClick={() => toggleSection('mainIdeas')}>
                  <div className="study-section-title-wrapper">
                    <span className="study-section-icon">
                      <BookMarked size={18} />
                    </span>
                    <span>{isTa ? '4. அதிகாரத்தின் முக்கிய கருத்துக்கள்' : '4. Chapter Main Ideas'}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    style={{ transform: openSections.mainIdeas ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}
                  />
                </button>
                {openSections.mainIdeas && (
                  <div className="study-section-content">
                    {(isTa ? studyData.main_ideas_ta : studyData.main_ideas_en).map((mi, i) => (
                      <div key={i} className="scenario-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="scenario-title">{mi.idea}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-color)' }}>
                            {mi.verse_ref}
                          </span>
                        </div>
                        <div className="scenario-desc">{mi.why_it_matters}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. முக்கிய நபர்கள் (Characters) */}
              <div className="study-section">
                <button className="study-section-header" onClick={() => toggleSection('characters')}>
                  <div className="study-section-title-wrapper">
                    <span className="study-section-icon">
                      <Users size={18} />
                    </span>
                    <span>{isTa ? '5. முக்கிய நபர்கள் (Characters)' : '5. Key Characters'}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    style={{ transform: openSections.characters ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}
                  />
                </button>
                {openSections.characters && (
                  <div className="study-section-content">
                    {studyData.characters.map((c, i) => (
                      <div key={i} className="scenario-card">
                        <span className="scenario-title">{isTa ? c.name_ta : c.name_en}</span>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          <strong>{isTa ? 'பங்கு:' : 'Role:'}</strong> {isTa ? c.role_ta : c.role_en}
                        </div>
                        <div style={{ fontSize: '0.875rem' }}>{isTa ? c.actions_ta : c.actions_en}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--accent-color)', fontWeight: 600 }}>
                          {isTa ? 'நாம் கற்றுக்கொள்வது:' : 'Takeaway:'} {isTa ? c.lesson_ta : c.lesson_en}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 6. முக்கிய வார்த்தைகள் (Key Words / Concepts) */}
              <div className="study-section">
                <button className="study-section-header" onClick={() => toggleSection('keyWords')}>
                  <div className="study-section-title-wrapper">
                    <span className="study-section-icon">
                      <FileText size={18} />
                    </span>
                    <span>{isTa ? '6. முக்கிய வார்த்தைகள் & கருத்துக்கள்' : '6. Key Words & Concepts'}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    style={{ transform: openSections.keyWords ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}
                  />
                </button>
                {openSections.keyWords && (
                  <div className="study-section-content">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                      {(isTa ? studyData.key_words_ta : studyData.key_words_en).map((kw, i) => (
                        <div key={i} className="scenario-card">
                          <span className="scenario-title">{kw.word}</span>
                          <span className="scenario-desc">{kw.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 7. ரியல் லைஃப் அப்ளிகேஷன் (Real-life Applications) */}
              <div className="study-section">
                <button className="study-section-header" onClick={() => toggleSection('lifeApp')}>
                  <div className="study-section-title-wrapper">
                    <span className="study-section-icon">
                      <HeartHandshake size={18} />
                    </span>
                    <span>{isTa ? '7. நம் வாழ்க்கையில் எப்படி பொருந்துகிறது?' : '7. Real-Life Applications'}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    style={{ transform: openSections.lifeApp ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}
                  />
                </button>
                {openSections.lifeApp && (
                  <div className="study-section-content">
                    {(isTa ? studyData.life_applications_ta : studyData.life_applications_en).map((la, i) => (
                      <div key={i} className="scenario-card">
                        <span className="scenario-title">{la.context}</span>
                        <span className="scenario-desc">{la.application}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 8. பல்வேறு பார்வைகள் (Multiple Perspectives) */}
              <div className="study-section">
                <button className="study-section-header" onClick={() => toggleSection('perspectives')}>
                  <div className="study-section-title-wrapper">
                    <span className="study-section-icon">
                      <Eye size={18} />
                    </span>
                    <span>{isTa ? '8. அதிகாரத்தைப் பார்க்கும் பல்வேறு பார்வைகள்' : '8. Multiple Perspectives'}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    style={{ transform: openSections.perspectives ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}
                  />
                </button>
                {openSections.perspectives && (
                  <div className="study-section-content">
                    <div className="perspective-grid">
                      {studyData.perspectives.map((p) => {
                        const isWarning = p.id === 'misunderstanding';
                        return (
                          <div key={p.id} className="perspective-card">
                            <span className={`perspective-tag ${isWarning ? 'warning' : ''}`}>
                              {isTa ? p.title_ta : p.title_en}
                            </span>
                            <p className="perspective-desc">{isTa ? p.description_ta : p.description_en}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 9. நான் எடுத்துக்கொள்ள வேண்டியவை (Takeaways) */}
              <div className="study-section">
                <button className="study-section-header" onClick={() => toggleSection('takeaways')}>
                  <div className="study-section-title-wrapper">
                    <span className="study-section-icon">
                      <CheckCircle2 size={18} />
                    </span>
                    <span>{isTa ? '9. நான் எடுத்துக்கொள்ள வேண்டியவை' : '9. Chapter Takeaways'}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    style={{ transform: openSections.takeaways ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}
                  />
                </button>
                {openSections.takeaways && (
                  <div className="study-section-content">
                    <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {(isTa ? studyData.takeaways_ta : studyData.takeaways_en).map((t, i) => (
                        <li key={i} style={{ fontSize: '0.9375rem' }}>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* 10. சிந்தனை கேள்விகள் (Reflection Questions) */}
              <div className="study-section">
                <button className="study-section-header" onClick={() => toggleSection('reflection')}>
                  <div className="study-section-title-wrapper">
                    <span className="study-section-icon">
                      <HelpCircle size={18} />
                    </span>
                    <span>{isTa ? '10. சிந்தனை கேள்விகள்' : '10. Reflection Questions'}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    style={{ transform: openSections.reflection ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}
                  />
                </button>
                {openSections.reflection && (
                  <div className="study-section-content">
                    <ol style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {(isTa ? studyData.reflection_questions_ta : studyData.reflection_questions_en).map((q, i) => (
                        <li key={i} style={{ fontSize: '0.9375rem' }}>
                          {q}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>

              {/* 11. தியானம் & ஜெபம் (Prayer & Meditation) */}
              <div className="study-section">
                <button className="study-section-header" onClick={() => toggleSection('prayer')}>
                  <div className="study-section-title-wrapper">
                    <span className="study-section-icon">
                      <Sparkles size={18} />
                    </span>
                    <span>{isTa ? '11. தியானம் & ஜெபம்' : '11. Meditation & Prayer'}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    style={{ transform: openSections.prayer ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}
                  />
                </button>
                {openSections.prayer && (
                  <div className="study-section-content">
                    <div style={{ padding: '0.875rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem', fontStyle: 'italic', fontSize: '0.9375rem' }}>
                      <strong>{isTa ? 'தியானம்:' : 'Meditation:'}</strong> {isTa ? studyData.meditation_ta : studyData.meditation_en}
                    </div>

                    <div style={{ padding: '0.875rem', backgroundColor: 'rgba(var(--accent-rgb, 99, 102, 241), 0.08)', borderRadius: '0.5rem', fontSize: '0.9375rem', borderLeft: '3px solid var(--accent-color)' }}>
                      <strong>{isTa ? 'ஜெபம்:' : 'Prayer:'}</strong> "{isTa ? studyData.prayer_ta : studyData.prayer_en}"
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Navigation Controls inside Modal */}
              <div className="study-footer-nav">
                <button className="btn-pill" onClick={closeStudy} style={{ gap: '0.375rem' }}>
                  <ArrowLeft size={15} />
                  <span>{isTa ? '← மீண்டும்' : '← Back'}</span>
                </button>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button className="btn-pill" onClick={handleOpenVerseStudy} style={{ gap: '0.375rem' }}>
                    <Compass size={15} />
                    <span>{isTa ? 'வசனத்தை ஆழமாக அறிய' : 'Study Verse'}</span>
                  </button>

                  <button
                    className="btn-pill"
                    onClick={handleOpenReader}
                    style={{ gap: '0.375rem', backgroundColor: 'var(--accent-color)', color: '#ffffff', fontWeight: 600 }}
                  >
                    <BookOpen size={15} />
                    <span>{isTa ? 'அதிகாரத்தை வாசிக்க' : 'Read Chapter'}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
