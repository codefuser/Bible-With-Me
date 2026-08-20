import React, { useEffect, useState } from 'react';
import {
  X,
  ArrowLeft,
  BookOpen,
  Compass,
  Lightbulb,
  Layers,
  HeartHandshake,
  Eye,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Info,
  ChevronDown
} from 'lucide-react';
import { useReading } from '../../context/ReadingContext';
import { getVerseStudy } from '../../services/studyService';
import { VerseStudy } from '../../types/studyTypes';

export const VerseStudyModal: React.FC = () => {
  const { activeStudyType, studyLocation, closeStudy, openChapterStudy, language, setLanguage } = useReading();
  const [studyData, setStudyData] = useState<VerseStudy | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Collapsible section toggle state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    simple: true,
    deep: true,
    context: true,
    scenarios: true,
    perspectives: true,
    learnings: true,
    reflection: true,
    prayer: true
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (activeStudyType === 'verse' && studyLocation && studyLocation.verse) {
      setLoading(true);
      getVerseStudy(studyLocation.bookId, studyLocation.chapter, studyLocation.verse).then((res) => {
        setStudyData(res);
        setLoading(false);
      });
    }
  }, [activeStudyType, studyLocation]);

  useEffect(() => {
    if (activeStudyType === 'verse') {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [activeStudyType]);

  if (activeStudyType !== 'verse' || !studyLocation) return null;

  const isTa = language === 'ta';

  const handleGoToChapterStudy = () => {
    if (studyLocation) {
      openChapterStudy(studyLocation.bookId, studyLocation.chapter);
    }
  };

  return (
    <div className="study-overlay" onClick={closeStudy}>
      <div className="study-container" onClick={(e) => e.stopPropagation()}>
        {/* Header Bar */}
        <div className="study-header">
          <div className="study-title-group">
            <span className="study-badge">
              <Compass size={14} />
              <span>{isTa ? 'ஆழ்ந்த வசன தியானம்' : 'Deep Verse Study'}</span>
            </span>
            <h2 className="study-main-title">
              {studyData
                ? isTa
                  ? `${studyData.book_name_ta} ${studyData.chapter}:${studyData.verse}`
                  : `${studyData.book_name_en} ${studyData.chapter}:${studyData.verse}`
                : isTa
                ? 'ஏற்றுகிறது...'
                : 'Loading...'}
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
              {isTa ? 'ஆழ்ந்த தியான விளக்கங்கள் தயாராகிறது...' : 'Loading deep verse study insights...'}
            </div>
          ) : (
            <>
              {/* 1. Full Bible Verse Hero Box */}
              <div className="study-verse-hero">
                <p className="study-verse-text">"{isTa ? studyData.text_ta : studyData.text_en}"</p>
                <div className="study-verse-ref">
                  — {isTa ? studyData.book_name_ta : studyData.book_name_en} {studyData.chapter}:{studyData.verse}
                </div>
              </div>

              {/* Disclaimer Notice */}
              <div className="study-disclaimer">
                <Info size={18} style={{ flexShrink: 0, color: 'var(--accent-color)', marginTop: '2px' }} />
                <div>
                  <strong>{isTa ? 'ஆதாரப் பிரதியை வேறுபடுத்தல்:' : 'Textual Clarity:'}</strong>{' '}
                  {isTa
                    ? 'மேலே உள்ள வசனம் பரிசுத்த வேதாகம CSV தரவுத்தொகுப்பிலிருந்து பெறப்பட்டது. கீழே உள்ள விளக்கங்கள் எளிய தியானத்திற்கும் நடைமுறை புரிதலுக்கும் உதவியாக உருவாக்கப்பட்டவை.'
                    : 'The verse text above is sourced directly from the Bible dataset. Explanations below provide devotional context and practical insights.'}
                </div>
              </div>

              {/* 2. எளிய விளக்கம் (Simple Explanation) */}
              <div className="study-section">
                <button className="study-section-header" onClick={() => toggleSection('simple')}>
                  <div className="study-section-title-wrapper">
                    <span className="study-section-icon">
                      <Lightbulb size={18} />
                    </span>
                    <span>{isTa ? '2. எளிய விளக்கம்' : '2. Simple Explanation'}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    style={{ transform: openSections.simple ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 240ms ease' }}
                  />
                </button>
                <div className={`study-accordion-body ${openSections.simple ? 'open' : ''}`}>
                  <div className="study-accordion-inner">
                    <div className="study-accordion-content-wrapper">
                      <div className="study-section-content">
                        <p>{isTa ? studyData.simple_explanation_ta : studyData.simple_explanation_en}</p>
                        <div
                          style={{
                            padding: '0.75rem 1rem',
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: '0.5rem',
                            borderLeft: '3px solid var(--accent-color)',
                            fontSize: '0.875rem'
                          }}
                        >
                          <strong>{isTa ? 'முக்கியக் கருத்து:' : 'Key Takeaway:'}</strong>{' '}
                          {isTa ? studyData.key_takeaway_ta : studyData.key_takeaway_en}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. ஆழமான அர்த்தம் (Deep Meaning) */}
              <div className="study-section">
                <button className="study-section-header" onClick={() => toggleSection('deep')}>
                  <div className="study-section-title-wrapper">
                    <span className="study-section-icon">
                      <Layers size={18} />
                    </span>
                    <span>{isTa ? '3. ஆழமான அர்த்தம்' : '3. Deep Meaning'}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    style={{ transform: openSections.deep ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 240ms ease' }}
                  />
                </button>
                <div className={`study-accordion-body ${openSections.deep ? 'open' : ''}`}>
                  <div className="study-accordion-inner">
                    <div className="study-accordion-content-wrapper">
                      <div className="study-section-content">
                        <p>{isTa ? studyData.deep_meaning_ta : studyData.deep_meaning_en}</p>

                        <div style={{ marginTop: '0.5rem' }}>
                          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            {isTa ? 'முக்கிய வார்த்தைகள்:' : 'Key Terms & Concepts:'}
                          </h4>
                          <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                            {(isTa ? studyData.key_terms_ta : studyData.key_terms_en).map((kt, i) => (
                              <li key={i}>
                                <strong>{kt.term}:</strong> {kt.meaning}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                            <span style={{ color: 'var(--accent-color)', fontWeight: 700 }}>
                              ✓ {isTa ? 'வசனம் வலியுறுத்துவது:' : 'What it Emphasizes:'}
                            </span>{' '}
                            {isTa ? studyData.what_it_emphasizes_ta : studyData.what_it_emphasizes_en}
                          </div>
                          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                            <span style={{ color: '#ef4444', fontWeight: 700 }}>
                              ✗ {isTa ? 'வசனம் எதை உணர்த்தவில்லை:' : 'What it Does NOT Mean:'}
                            </span>{' '}
                            {isTa ? studyData.what_it_does_not_mean_ta : studyData.what_it_does_not_mean_en}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. சூழ்நிலை (Context) */}
              <div className="study-section">
                <button className="study-section-header" onClick={() => toggleSection('context')}>
                  <div className="study-section-title-wrapper">
                    <span className="study-section-icon">
                      <BookOpen size={18} />
                    </span>
                    <span>{isTa ? '4. வரலாற்றுச் சூழ்நிலை (Context)' : '4. Context & Background'}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    style={{ transform: openSections.context ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 240ms ease' }}
                  />
                </button>
                <div className={`study-accordion-body ${openSections.context ? 'open' : ''}`}>
                  <div className="study-accordion-inner">
                    <div className="study-accordion-content-wrapper">
                      <div className="study-section-content">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                          <div className="scenario-card">
                            <span className="scenario-title">{isTa ? 'யாருக்காக:' : 'To Whom:'}</span>
                            <span className="scenario-desc">{isTa ? studyData.context_audience_ta : studyData.context_audience_en}</span>
                          </div>
                          <div className="scenario-card">
                            <span className="scenario-title">{isTa ? 'சூழ்நிலை:' : 'Situation:'}</span>
                            <span className="scenario-desc">{isTa ? studyData.context_situation_ta : studyData.context_situation_en}</span>
                          </div>
                        </div>

                        {studyData.surrounding_verses_summary_ta && (
                          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', whiteSpace: 'pre-line', color: 'var(--text-secondary)' }}>
                            <strong>{isTa ? 'சுற்றியுள்ள வசனங்களின் சுருக்கம் (CSV):' : 'Surrounding Scripture Text:'}</strong>
                            <div style={{ fontStyle: 'italic', marginTop: '0.25rem', padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: '0.375rem' }}>
                              {isTa ? studyData.surrounding_verses_summary_ta : studyData.surrounding_verses_summary_en}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. நிஜ வாழ்க்கையில் (Real-world Examples) */}
              <div className="study-section">
                <button className="study-section-header" onClick={() => toggleSection('scenarios')}>
                  <div className="study-section-title-wrapper">
                    <span className="study-section-icon">
                      <HeartHandshake size={18} />
                    </span>
                    <span>{isTa ? '5. நிஜ வாழ்க்கையில் (Real-World Examples)' : '5. Real-World Applications'}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    style={{ transform: openSections.scenarios ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 240ms ease' }}
                  />
                </button>
                <div className={`study-accordion-body ${openSections.scenarios ? 'open' : ''}`}>
                  <div className="study-accordion-inner">
                    <div className="study-accordion-content-wrapper">
                      <div className="study-section-content">
                        {(isTa ? studyData.real_world_scenarios_ta : studyData.real_world_scenarios_en).map((sc, i) => (
                          <div key={i} className="scenario-card">
                            <div className="scenario-title">{sc.scenario_title}</div>
                            <div className="scenario-desc">{sc.example}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. இந்த வசனத்தை எப்படி பார்க்கலாம்? (Multiple Perspectives) */}
              <div className="study-section">
                <button className="study-section-header" onClick={() => toggleSection('perspectives')}>
                  <div className="study-section-title-wrapper">
                    <span className="study-section-icon">
                      <Eye size={18} />
                    </span>
                    <span>{isTa ? '6. இந்த வசனத்தை எப்படி பார்க்கலாம்?' : '6. Multiple Perspectives'}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    style={{ transform: openSections.perspectives ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 240ms ease' }}
                  />
                </button>
                <div className={`study-accordion-body ${openSections.perspectives ? 'open' : ''}`}>
                  <div className="study-accordion-inner">
                    <div className="study-accordion-content-wrapper">
                      <div className="study-section-content">
                        <div className="perspective-grid">
                          {studyData.perspectives.map((p) => {
                            const isWarning = p.id === 'selfish';
                            return (
                              <div key={p.id} className="perspective-card">
                                <span className={`perspective-tag ${isWarning ? 'warning' : ''}`}>
                                  {isTa ? p.badge_ta : p.badge_en}
                                </span>
                                <h4 className="perspective-title">{isTa ? p.title_ta : p.title_en}</h4>
                                <p className="perspective-desc">{isTa ? p.description_ta : p.description_en}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 7. நான் இதிலிருந்து என்ன கற்றுக்கொள்ளலாம்? (Personal Takeaways) */}
              <div className="study-section">
                <button className="study-section-header" onClick={() => toggleSection('learnings')}>
                  <div className="study-section-title-wrapper">
                    <span className="study-section-icon">
                      <CheckCircle2 size={18} />
                    </span>
                    <span>{isTa ? '7. நான் இதிலிருந்து என்ன கற்றுக்கொள்ளலாம்?' : '7. What Should I Learn?'}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    style={{ transform: openSections.learnings ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 240ms ease' }}
                  />
                </button>
                <div className={`study-accordion-body ${openSections.learnings ? 'open' : ''}`}>
                  <div className="study-accordion-inner">
                    <div className="study-accordion-content-wrapper">
                      <div className="study-section-content">
                        {(() => {
                          const L = isTa ? studyData.learnings_ta : studyData.learnings_en;
                          return (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                              <div className="scenario-card">
                                <span className="scenario-title">{isTa ? 'நான் புரிந்துகொள்ள வேண்டியது:' : 'To Understand:'}</span>
                                <span className="scenario-desc">{L.what_to_understand}</span>
                              </div>
                              <div className="scenario-card">
                                <span className="scenario-title">{isTa ? 'நான் மாற்ற வேண்டியது:' : 'To Change:'}</span>
                                <span className="scenario-desc">{L.what_to_change}</span>
                              </div>
                              <div className="scenario-card">
                                <span className="scenario-title">{isTa ? 'நான் வளர்க்க வேண்டிய மனப்பான்மை:' : 'Attitude to Build:'}</span>
                                <span className="scenario-desc">{L.attitude_to_build}</span>
                              </div>
                              <div className="scenario-card">
                                <span className="scenario-title">{isTa ? 'இன்றைய பயிற்சி:' : "Today's Practice:"}</span>
                                <span className="scenario-desc">{L.today_practice}</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 8. என்னை நான் கேட்க வேண்டிய கேள்விகள் (Self-Reflection Questions) */}
              <div className="study-section">
                <button className="study-section-header" onClick={() => toggleSection('reflection')}>
                  <div className="study-section-title-wrapper">
                    <span className="study-section-icon">
                      <HelpCircle size={18} />
                    </span>
                    <span>{isTa ? '8. என்னை நான் கேட்க வேண்டிய கேள்விகள்' : '8. Self-Reflection Questions'}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    style={{ transform: openSections.reflection ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 240ms ease' }}
                  />
                </button>
                <div className={`study-accordion-body ${openSections.reflection ? 'open' : ''}`}>
                  <div className="study-accordion-inner">
                    <div className="study-accordion-content-wrapper">
                      <div className="study-section-content">
                        <ol style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {(isTa ? studyData.reflection_questions_ta : studyData.reflection_questions_en).map((q, i) => (
                            <li key={i} style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                              {q}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 9. தியானிக்க / ஜெபிக்க (Meditation & Prayer) */}
              <div className="study-section">
                <button className="study-section-header" onClick={() => toggleSection('prayer')}>
                  <div className="study-section-title-wrapper">
                    <span className="study-section-icon">
                      <Sparkles size={18} />
                    </span>
                    <span>{isTa ? '9. தியானிக்க & ஜெபிக்க' : '9. Meditation & Prayer'}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    style={{ transform: openSections.prayer ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 240ms ease' }}
                  />
                </button>
                <div className={`study-accordion-body ${openSections.prayer ? 'open' : ''}`}>
                  <div className="study-accordion-inner">
                    <div className="study-accordion-content-wrapper">
                      <div className="study-section-content">
                        <div style={{ padding: '0.875rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem', fontStyle: 'italic', fontSize: '0.9375rem' }}>
                          <strong>{isTa ? 'தியான வழிகாட்டுதல்:' : 'Meditation Direction:'}</strong>{' '}
                          {isTa ? studyData.meditation_direction_ta : studyData.meditation_direction_en}
                        </div>

                        <div style={{ padding: '0.875rem', backgroundColor: 'rgba(var(--accent-rgb, 99, 102, 241), 0.08)', borderRadius: '0.5rem', fontSize: '0.9375rem', borderLeft: '3px solid var(--accent-color)' }}>
                          <strong>{isTa ? 'ஜெபம்:' : 'Prayer:'}</strong> "{isTa ? studyData.prayer_ta : studyData.prayer_en}"
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Navigation Links inside Modal */}
              <div className="study-footer-nav">
                <button className="btn-pill" onClick={closeStudy} style={{ gap: '0.375rem' }}>
                  <ArrowLeft size={15} />
                  <span>{isTa ? '← மீண்டும்' : '← Back'}</span>
                </button>

                <button
                  className="btn-pill"
                  onClick={handleGoToChapterStudy}
                  style={{ gap: '0.375rem', backgroundColor: 'var(--accent-color)', color: '#ffffff', fontWeight: 600 }}
                >
                  <BookOpen size={15} />
                  <span>{isTa ? 'அதிகாரத்தை முழுமையாக அறிய →' : 'Explore Full Chapter →'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
