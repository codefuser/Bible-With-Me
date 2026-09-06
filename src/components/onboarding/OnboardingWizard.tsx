import React, { useState } from 'react';
import {
  Clock,
  BookOpen,
  Bell,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Sun,
  Moon,
  Scroll,
  Trees,
  User,
  LogIn,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { ThemeOption } from '../../types/bible';
import {
  requestNotificationPermission,
  getNotificationPermission,
  saveNotificationSchedule
} from '../../services/notificationService';
import '../../styles/onboarding.css';

interface OnboardingWizardProps {
  onComplete: (data: {
    goalMinutes: number;
    theme: ThemeOption;
    reminderTime: string;
    notificationsEnabled: boolean;
    action: 'guest' | 'auth';
  }) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;

  // Step 1: Goal
  const [goalMinutes, setGoalMinutes] = useState<number>(15);

  // Step 2: Theme
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>(() => {
    return (document.documentElement.getAttribute('data-theme') as ThemeOption) || 'light';
  });

  // Step 3: Notifications
  const [reminderTime, setReminderTime] = useState<string>('07:00');
  const [notifGranted, setNotifGranted] = useState<boolean>(() => {
    return getNotificationPermission() === 'granted';
  });
  const [isRequestingNotif, setIsRequestingNotif] = useState<boolean>(false);

  // Step 4: Strict Commitment Covenant
  const [covenantAccepted, setCovenantAccepted] = useState<boolean>(true);

  // Handle Theme Change with real-time DOM update preview
  const handleThemeSelect = (theme: ThemeOption) => {
    setSelectedTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
  };

  // Handle Push Permission Request
  const handleEnableNotifications = async () => {
    setIsRequestingNotif(true);
    const granted = await requestNotificationPermission();
    setNotifGranted(granted);
    setIsRequestingNotif(false);
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const finishOnboarding = (action: 'guest' | 'auth') => {
    saveNotificationSchedule({
      enabled: notifGranted,
      time: reminderTime,
      goalMinutes
    });

    onComplete({
      goalMinutes,
      theme: selectedTheme,
      reminderTime,
      notificationsEnabled: notifGranted,
      action
    });
  };

  const progressPercent = (step / totalSteps) * 100;

  return (
    <div className="onboarding-backdrop" role="dialog" aria-modal="true">
      <div className="onboarding-card">
        {/* Progress Bar */}
        <div className="onboarding-progress-bar-container">
          <div
            className="onboarding-progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* STEP 1: Daily Reading Goal */}
        {step === 1 && (
          <>
            <div className="onboarding-header">
              <div className="onboarding-step-indicator">
                <Sparkles size={13} /> படி 1 / 5 · Step 1 of 5
              </div>
              <h2 className="onboarding-title">தினம் எவ்வளவு நேரம் வாசிக்க விரும்புகிறீர்கள்?</h2>
              <p className="onboarding-subtitle">
                Choose your daily scripture reading goal to build a lifelong spiritual habit.
              </p>
            </div>

            <div className="onboarding-body">
              <div className="onboarding-options-list">
                {/* 5 Min Option */}
                <div
                  className={`onboarding-option-card ${goalMinutes === 5 ? 'selected' : ''}`}
                  onClick={() => setGoalMinutes(5)}
                >
                  <div className="onboarding-option-left">
                    <div className="onboarding-option-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                      <Clock size={20} />
                    </div>
                    <div className="onboarding-option-text">
                      <h4>
                        5 நிமிடங்கள் / நாள்
                        <span className="onboarding-option-badge" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                          Quick Habit
                        </span>
                      </h4>
                      <p>சுருக்கமான தியானம் (1-2 அதிகாரங்கள்) · Quick spiritual spark</p>
                    </div>
                  </div>
                  {goalMinutes === 5 && <CheckCircle2 size={20} color="#2563eb" />}
                </div>

                {/* 15 Min Option */}
                <div
                  className={`onboarding-option-card ${goalMinutes === 15 ? 'selected' : ''}`}
                  onClick={() => setGoalMinutes(15)}
                >
                  <div className="onboarding-option-left">
                    <div className="onboarding-option-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                      <BookOpen size={20} />
                    </div>
                    <div className="onboarding-option-text">
                      <h4>
                        15 நிமிடங்கள் / நாள்
                        <span className="onboarding-option-badge" style={{ background: '#dcfce7', color: '#15803d' }}>
                          Recommended
                        </span>
                      </h4>
                      <p>ஆழமான வேத தியானம் (3-4 அதிகாரங்கள்) · Daily devotional walk</p>
                    </div>
                  </div>
                  {goalMinutes === 15 && <CheckCircle2 size={20} color="#2563eb" />}
                </div>

                {/* 30 Min Option */}
                <div
                  className={`onboarding-option-card ${goalMinutes === 30 ? 'selected' : ''}`}
                  onClick={() => setGoalMinutes(30)}
                >
                  <div className="onboarding-option-left">
                    <div className="onboarding-option-icon" style={{ background: '#faf5ff', color: '#9333ea' }}>
                      <Flame size={20} />
                    </div>
                    <div className="onboarding-option-text">
                      <h4>
                        30 நிமிடங்கள் / நாள்
                        <span className="onboarding-option-badge" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                          Discipline
                        </span>
                      </h4>
                      <p>முழுமையான ஆய்வு & ஜெபம் (5+ அதிகாரங்கள்) · Deep immersion</p>
                    </div>
                  </div>
                  {goalMinutes === 30 && <CheckCircle2 size={20} color="#2563eb" />}
                </div>
              </div>
            </div>

            <div className="onboarding-footer">
              <div />
              <button
                type="button"
                className="onboarding-btn onboarding-btn-primary"
                onClick={handleNext}
              >
                அடுத்தது · Continue <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}

        {/* STEP 2: Theme & Ambiance */}
        {step === 2 && (
          <>
            <div className="onboarding-header">
              <div className="onboarding-step-indicator">
                <Sparkles size={13} /> படி 2 / 5 · Step 2 of 5
              </div>
              <h2 className="onboarding-title">வாசிப்பு சூழல் & வண்ணம்</h2>
              <p className="onboarding-subtitle">
                Select your comfortable reading ambiance with real-time live preview.
              </p>
            </div>

            <div className="onboarding-body">
              <div className="onboarding-theme-grid">
                {/* Light */}
                <div
                  className={`onboarding-theme-card ${selectedTheme === 'light' ? 'selected' : ''}`}
                  onClick={() => handleThemeSelect('light')}
                >
                  <div
                    className="onboarding-theme-preview"
                    style={{ background: '#ffffff', border: '1px solid #cbd5e1' }}
                  >
                    <div className="onboarding-theme-preview-line" style={{ background: '#0f172a' }} />
                    <div className="onboarding-theme-preview-line short" style={{ background: '#64748b' }} />
                  </div>
                  <div className="onboarding-theme-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Sun size={15} color="#d97706" /> வெளிச்சம் (Light)
                    </span>
                    {selectedTheme === 'light' && <Check size={16} color="#2563eb" />}
                  </div>
                </div>

                {/* Sepia */}
                <div
                  className={`onboarding-theme-card ${selectedTheme === 'sepia' ? 'selected' : ''}`}
                  onClick={() => handleThemeSelect('sepia')}
                >
                  <div
                    className="onboarding-theme-preview"
                    style={{ background: '#fbf0d9', border: '1px solid #e7d7b8' }}
                  >
                    <div className="onboarding-theme-preview-line" style={{ background: '#5f4b32' }} />
                    <div className="onboarding-theme-preview-line short" style={{ background: '#8c7355' }} />
                  </div>
                  <div className="onboarding-theme-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Scroll size={15} color="#b45309" /> செப்பியா (Sepia)
                    </span>
                    {selectedTheme === 'sepia' && <Check size={16} color="#2563eb" />}
                  </div>
                </div>

                {/* Dark */}
                <div
                  className={`onboarding-theme-card ${selectedTheme === 'dark' ? 'selected' : ''}`}
                  onClick={() => handleThemeSelect('dark')}
                >
                  <div
                    className="onboarding-theme-preview"
                    style={{ background: '#0f172a', border: '1px solid #334155' }}
                  >
                    <div className="onboarding-theme-preview-line" style={{ background: '#f8fafc' }} />
                    <div className="onboarding-theme-preview-line short" style={{ background: '#94a3b8' }} />
                  </div>
                  <div className="onboarding-theme-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Moon size={15} color="#818cf8" /> இருள் (Dark)
                    </span>
                    {selectedTheme === 'dark' && <Check size={16} color="#2563eb" />}
                  </div>
                </div>

                {/* Forest */}
                <div
                  className={`onboarding-theme-card ${selectedTheme === 'forest' ? 'selected' : ''}`}
                  onClick={() => handleThemeSelect('forest')}
                >
                  <div
                    className="onboarding-theme-preview"
                    style={{ background: '#0b1d16', border: '1px solid #1e3a2f' }}
                  >
                    <div className="onboarding-theme-preview-line" style={{ background: '#e2f5ec' }} />
                    <div className="onboarding-theme-preview-line short" style={{ background: '#6ee7b7' }} />
                  </div>
                  <div className="onboarding-theme-label">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Trees size={15} color="#10b981" /> வனம் (Forest)
                    </span>
                    {selectedTheme === 'forest' && <Check size={16} color="#2563eb" />}
                  </div>
                </div>
              </div>
            </div>

            <div className="onboarding-footer">
              <button
                type="button"
                className="onboarding-btn onboarding-btn-secondary"
                onClick={handlePrev}
              >
                <ChevronLeft size={18} /> பின்னால் · Back
              </button>
              <button
                type="button"
                className="onboarding-btn onboarding-btn-primary"
                onClick={handleNext}
              >
                அடுத்தது · Continue <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}

        {/* STEP 3: Notification & Reminder */}
        {step === 3 && (
          <>
            <div className="onboarding-header">
              <div className="onboarding-step-indicator">
                <Sparkles size={13} /> படி 3 / 5 · Step 3 of 5
              </div>
              <h2 className="onboarding-title">தினசரி நினைவூட்டல் நேரம்</h2>
              <p className="onboarding-subtitle">
                Set a daily reminder time so you never break your reading streak.
              </p>
            </div>

            <div className="onboarding-body">
              <div className="onboarding-time-presets">
                <button
                  type="button"
                  className={`onboarding-time-btn ${reminderTime === '06:00' ? 'selected' : ''}`}
                  onClick={() => setReminderTime('06:00')}
                >
                  🌅 06:00 AM
                  <div style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 500 }}>விடியற்காலை</div>
                </button>
                <button
                  type="button"
                  className={`onboarding-time-btn ${reminderTime === '08:00' ? 'selected' : ''}`}
                  onClick={() => setReminderTime('08:00')}
                >
                  ☀️ 08:00 AM
                  <div style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 500 }}>காலை தியானம்</div>
                </button>
                <button
                  type="button"
                  className={`onboarding-time-btn ${reminderTime === '21:00' ? 'selected' : ''}`}
                  onClick={() => setReminderTime('21:00')}
                >
                  🌙 09:00 PM
                  <div style={{ fontSize: '0.7rem', opacity: 0.8, fontWeight: 500 }}>இரவு ஜெபம்</div>
                </button>
              </div>

              <div className="onboarding-custom-time">
                <Clock size={18} color="var(--text-muted)" />
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>தனிப்பயன் நேரம் (Custom Time):</span>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                />
              </div>

              {/* Notification Permission Card */}
              <div className="onboarding-notif-cta">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: notifGranted ? '#dcfce7' : '#dbeafe',
                      color: notifGranted ? '#16a34a' : '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Bell size={20} />
                  </div>
                  <div>
                    <h5 style={{ margin: '0 0 0.15rem 0', fontSize: '0.875rem', fontWeight: 700 }}>
                      {notifGranted ? 'அறிவிப்புகள் அனுமதிக்கப்பட்டது' : 'Web Push Notification'}
                    </h5>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {notifGranted
                        ? 'தினமும் குறித்த நேரத்தில் நற்செய்தி நினைவூட்டல் வரும்.'
                        : 'Allow browser notifications for your daily spiritual reminder.'}
                    </p>
                  </div>
                </div>

                {!notifGranted ? (
                  <button
                    type="button"
                    onClick={handleEnableNotifications}
                    disabled={isRequestingNotif}
                    className="onboarding-btn onboarding-btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap', flex: 'none' }}
                  >
                    {isRequestingNotif ? 'அனுமதிக்கிறது...' : 'அனுமதி · Enable'}
                  </button>
                ) : (
                  <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle2 size={16} /> தயார்
                  </span>
                )}
              </div>
            </div>

            <div className="onboarding-footer">
              <button
                type="button"
                className="onboarding-btn onboarding-btn-secondary"
                onClick={handlePrev}
              >
                <ChevronLeft size={18} /> பின்னால் · Back
              </button>
              <button
                type="button"
                className="onboarding-btn onboarding-btn-primary"
                onClick={handleNext}
              >
                அடுத்தது · Continue <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}

        {/* STEP 4: Strict Spiritual Commitment Rule */}
        {step === 4 && (
          <>
            <div className="onboarding-header">
              <div className="onboarding-step-indicator">
                <Sparkles size={13} /> படி 4 / 5 · Step 4 of 5
              </div>
              <h2 className="onboarding-title">வாசிப்பு அர்ப்பணிப்பு & விதிமுறை</h2>
              <p className="onboarding-subtitle">
                A sacred accountability covenant to honor your daily time with God.
              </p>
            </div>

            <div className="onboarding-body">
              <div className="onboarding-commitment-box">
                <div className="onboarding-rule-row">
                  <div className="onboarding-rule-icon">
                    <Clock size={16} />
                  </div>
                  <div className="onboarding-rule-text">
                    <h5>வாசிப்பு நேரக் கணக்கீடு (Active Session Timer)</h5>
                    <p>
                      நீங்கள் வாசிக்கத் தொடங்கியவுடன் திரையின் கீழே உங்கள் {goalMinutes} நிமிட இலக்குக்கான நேரக் கணக்கீடு தொடங்கும்.
                    </p>
                  </div>
                </div>

                <div className="onboarding-rule-row">
                  <div className="onboarding-rule-icon">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="onboarding-rule-text">
                    <h5>முழு இலக்கை நிறைவு செய்தல் (Honor Today's Target)</h5>
                    <p>
                      இன்றைய இலக்கு முடியும் வரை தொடர்ச்சியாக வாசிக்க வேண்டும். இடையில் வெளியேற முயன்றால் பொறுப்புணர்வை நினைவூட்டும் செய்தி தோன்றும்.
                    </p>
                  </div>
                </div>

                <div className="onboarding-rule-row">
                  <div className="onboarding-rule-icon">
                    <Flame size={16} />
                  </div>
                  <div className="onboarding-rule-text">
                    <h5>தொடர் வெற்றி & ஆசீர்வாதம் (Streaks & Rewards)</h5>
                    <p>
                      தினசரி இலக்கு முடிந்தவுடன் உங்கள் தொடர் நாள் (Streak) வெற்றிகரமாகப் பதிவு செய்யப்படும்.
                    </p>
                  </div>
                </div>
              </div>

              {/* Checkbox agreement */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.75rem 1rem',
                  background: 'rgba(37, 99, 235, 0.05)',
                  border: '1px solid rgba(37, 99, 235, 0.2)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)'
                }}
              >
                <input
                  type="checkbox"
                  checked={covenantAccepted}
                  onChange={(e) => setCovenantAccepted(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                />
                <span>இறை வார்த்தைக்கு தினமும் நேரம் ஒதுக்குவேன் என உறுதியளிக்கிறேன்</span>
              </label>
            </div>

            <div className="onboarding-footer">
              <button
                type="button"
                className="onboarding-btn onboarding-btn-secondary"
                onClick={handlePrev}
              >
                <ChevronLeft size={18} /> பின்னால் · Back
              </button>
              <button
                type="button"
                className="onboarding-btn onboarding-btn-primary"
                disabled={!covenantAccepted}
                onClick={handleNext}
                style={{ opacity: covenantAccepted ? 1 : 0.5 }}
              >
                அடுத்தது · Continue <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}

        {/* STEP 5: Start Journey - Guest vs Cloud Sign In */}
        {step === 5 && (
          <>
            <div className="onboarding-header">
              <div className="onboarding-step-indicator">
                <Sparkles size={13} /> படி 5 / 5 · Step 5 of 5
              </div>
              <h2 className="onboarding-title">எப்படி தொடங்க விரும்புகிறீர்கள்?</h2>
              <p className="onboarding-subtitle">
                Choose to start immediately as a guest or sign in to sync with cloud.
              </p>
            </div>

            <div className="onboarding-body">
              <div className="onboarding-options-list">
                {/* Guest Option */}
                <div
                  className="onboarding-option-card"
                  onClick={() => finishOnboarding('guest')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="onboarding-option-left">
                    <div className="onboarding-option-icon" style={{ background: '#f1f5f9', color: '#475569' }}>
                      <User size={20} />
                    </div>
                    <div className="onboarding-option-text">
                      <h4>விருந்தினராக தொடங்கு (Guest Mode)</h4>
                      <p>பதிவு செய்யாமல் இந்த சாதனத்தில் உடனடியாக வாசிக்கத் தொடங்குங்கள்.</p>
                    </div>
                  </div>
                  <ChevronRight size={20} color="var(--text-muted)" />
                </div>

                {/* Cloud Sign In Option */}
                <div
                  className="onboarding-option-card"
                  onClick={() => finishOnboarding('auth')}
                  style={{ cursor: 'pointer', borderColor: '#2563eb', background: 'rgba(37, 99, 235, 0.04)' }}
                >
                  <div className="onboarding-option-left">
                    <div className="onboarding-option-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                      <LogIn size={20} />
                    </div>
                    <div className="onboarding-option-text">
                      <h4>
                        உள்நுழை / கணக்கு உருவாக்கு (Cloud Sync)
                        <span className="onboarding-option-badge" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                          Free Sync
                        </span>
                      </h4>
                      <p>மொபைல் மற்றும் கணினியில் புக்மார்க்குகள் & ஸ்ட்ரீக் சேமிக்க உள்நுழையவும்.</p>
                    </div>
                  </div>
                  <ChevronRight size={20} color="#2563eb" />
                </div>
              </div>
            </div>

            <div className="onboarding-footer">
              <button
                type="button"
                className="onboarding-btn onboarding-btn-secondary"
                onClick={handlePrev}
              >
                <ChevronLeft size={18} /> பின்னால் · Back
              </button>
              <div />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
