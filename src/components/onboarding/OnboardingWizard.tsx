import React, { useState, useEffect } from 'react';
import {
  Clock,
  BookOpen,
  Bell,
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
  CheckCircle2,
  Globe
} from 'lucide-react';
import { ThemeOption, AppLanguage, BibleLanguage } from '../../types/bible';
import {
  requestNotificationPermission,
  getNotificationPermission,
  saveNotificationSchedule,
  getNotificationSchedule
} from '../../services/notificationService';
import '../../styles/onboarding.css';

interface OnboardingWizardProps {
  onComplete: (data: {
    goalMinutes: number;
    theme: ThemeOption;
    reminderTime: string;
    notificationsEnabled: boolean;
    appLanguage: AppLanguage;
    bibleLanguage: BibleLanguage;
    action: 'guest' | 'auth';
  }) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 5;

  // Language separation (App UI vs Scripture Translation)
  const [appLang, setAppLang] = useState<AppLanguage>('ta');
  const [bibleLang, setBibleLang] = useState<BibleLanguage>('ta');

  // Step 1: Goal
  const [goalMinutes, setGoalMinutes] = useState<number>(15);
  const [isCustomGoal, setIsCustomGoal] = useState<boolean>(false);
  const [customGoalValue, setCustomGoalValue] = useState<number>(20);

  // Step 2: Theme
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>(() => {
    return (document.documentElement.getAttribute('data-theme') as ThemeOption) || 'light';
  });

  // Step 3: Notifications
  const [reminderTime, setReminderTime] = useState<string>('07:00');
  const [customTimesList, setCustomTimesList] = useState<string[]>([]);
  const [newCustomTime, setNewCustomTime] = useState<string>('18:00');
  const [morningSlot, setMorningSlot] = useState<boolean>(true);
  const [afternoonSlot, setAfternoonSlot] = useState<boolean>(false);
  const [nightSlot, setNightSlot] = useState<boolean>(true);
  const [notifGranted, setNotifGranted] = useState<boolean>(false);
  const [isRequestingNotif, setIsRequestingNotif] = useState<boolean>(false);

  useEffect(() => {
    getNotificationPermission().then((p) => setNotifGranted(p === 'granted'));
  }, []);

  // Step 4: Strict Commitment Covenant
  const [covenantAccepted, setCovenantAccepted] = useState<boolean>(true);

  const isTa = appLang === 'ta';

  // Handle Theme Change with real-time DOM update preview & localStorage persistence
  const handleThemeSelect = (theme: ThemeOption) => {
    setSelectedTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    try {
      const raw = localStorage.getItem('bible_app_preferences');
      const prefs = raw ? JSON.parse(raw) : {};
      prefs.theme = theme;
      localStorage.setItem('bible_app_preferences', JSON.stringify(prefs));
    } catch {
      // ignore
    }
  };

  const handleAddCustomTime = () => {
    if (!newCustomTime) return;
    if (!customTimesList.includes(newCustomTime)) {
      setCustomTimesList([...customTimesList, newCustomTime]);
    }
  };

  const handleRemoveCustomTime = (timeToRemove: string) => {
    setCustomTimesList(customTimesList.filter((t) => t !== timeToRemove));
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

  const effectiveGoal = isCustomGoal ? Math.max(1, customGoalValue) : goalMinutes;

  const finishOnboarding = (action: 'guest' | 'auth') => {
    // Persist all preferences to localStorage immediately so app restart maintains them perfectly
    try {
      const raw = localStorage.getItem('bible_app_preferences');
      const prefs = raw ? JSON.parse(raw) : {};
      prefs.theme = selectedTheme;
      prefs.appLanguage = appLang;
      prefs.bibleLanguage = bibleLang;
      prefs.language = bibleLang;
      prefs.dailyGoalMinutes = effectiveGoal;
      prefs.reminderTime = reminderTime;
      prefs.notificationsEnabled = notifGranted;
      prefs.onboardingCompleted = true;
      localStorage.setItem('bible_app_preferences', JSON.stringify(prefs));
    } catch {
      // ignore
    }

    const existing = getNotificationSchedule();
    const mappedCustoms = customTimesList.map((t, idx) => ({
      id: 301 + idx,
      time: t,
      labelEn: `Custom Reminder ${idx + 1}`,
      labelTa: `தனிப்பயன் நேரம் ${idx + 1}`,
      enabled: true
    }));

    saveNotificationSchedule({
      ...existing,
      enabled: notifGranted,
      goalMinutes: effectiveGoal,
      slots: {
        ...existing.slots,
        ...(existing.slots.morning ? { morning: { ...existing.slots.morning, enabled: morningSlot } } : {}),
        ...(existing.slots.night ? { night: { ...existing.slots.night, enabled: nightSlot } } : {})
      },
      customTimes: mappedCustoms
    }, appLang);


    onComplete({
      goalMinutes: effectiveGoal,
      theme: selectedTheme,
      reminderTime,
      notificationsEnabled: notifGranted,
      appLanguage: appLang,
      bibleLanguage: bibleLang,
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

        {/* STEP 1: Daily Reading Goal & Language */}
        {step === 1 && (
          <>
            <div className="onboarding-header">
              <div className="onboarding-step-indicator">
                <Sparkles size={13} /> {isTa ? 'படி 1 / 5' : 'Step 1 of 5'}
              </div>
              <h2 className="onboarding-title">
                {isTa ? 'தினசரி வாசிப்பு இலக்கு' : 'Daily Reading Goal'}
              </h2>
              <p className="onboarding-subtitle">
                {isTa
                  ? 'தினம் எவ்வளவு நேரம் வேதாகமம் வாசிக்க விரும்புகிறீர்கள்?'
                  : 'How many minutes per day do you want to read?'}
              </p>
            </div>

            <div className="onboarding-body">
              {/* Separate Language Configurations (Requirement 4 & 5) */}
              <div className="onboarding-lang-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                  <Globe size={14} color="#2563eb" />
                  <span className="onboarding-lang-label">
                    {isTa ? 'பயன்பாட்டு மொழி (App UI Language)' : 'App Language'}
                  </span>
                </div>
                <div className="onboarding-lang-pills">
                  <button
                    type="button"
                    className={`onboarding-lang-pill ${appLang === 'ta' ? 'selected' : ''}`}
                    onClick={() => setAppLang('ta')}
                  >
                    🇮🇳 தமிழ்
                  </button>
                  <button
                    type="button"
                    className={`onboarding-lang-pill ${appLang === 'en' ? 'selected' : ''}`}
                    onClick={() => setAppLang('en')}
                  >
                    🇬🇧 English
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem', marginBottom: '0.2rem' }}>
                  <BookOpen size={14} color="#16a34a" />
                  <span className="onboarding-lang-label">
                    {isTa ? 'வேதாகம மொழி (Bible Translation)' : 'Bible Scripture Language'}
                  </span>
                </div>
                <div className="onboarding-lang-pills">
                  <button
                    type="button"
                    className={`onboarding-lang-pill ${bibleLang === 'ta' ? 'selected' : ''}`}
                    onClick={() => setBibleLang('ta')}
                  >
                    தமிழ் (BSI)
                  </button>
                  <button
                    type="button"
                    className={`onboarding-lang-pill ${bibleLang === 'en' ? 'selected' : ''}`}
                    onClick={() => setBibleLang('en')}
                  >
                    English (KJV)
                  </button>
                  <button
                    type="button"
                    className={`onboarding-lang-pill ${bibleLang === 'parallel' ? 'selected' : ''}`}
                    onClick={() => setBibleLang('parallel')}
                  >
                    தமிழ் + English
                  </button>
                </div>
              </div>

              {/* Reading Duration Options */}
              <div className="onboarding-options-list">
                {/* 5 Min Option */}
                <div
                  className={`onboarding-option-card ${!isCustomGoal && goalMinutes === 5 ? 'selected' : ''}`}
                  onClick={() => {
                    setIsCustomGoal(false);
                    setGoalMinutes(5);
                  }}
                >
                  <div className="onboarding-option-left">
                    <div className="onboarding-option-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                      <Clock size={20} />
                    </div>
                    <div className="onboarding-option-text">
                      <div className="onboarding-option-title-row">
                        <h4>{isTa ? '5 நிமிடங்கள் / நாள்' : '5 minutes / day'}</h4>
                        <span className="onboarding-option-badge" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                          {isTa ? 'விரைவு' : 'Quick'}
                        </span>
                      </div>
                      <p>{isTa ? '1-2 அதிகாரங்கள் சுருக்கமான தியானம்' : 'Quick spiritual spark (1-2 chapters)'}</p>
                    </div>
                  </div>
                  {!isCustomGoal && goalMinutes === 5 && <CheckCircle2 size={20} color="#2563eb" />}
                </div>

                {/* 15 Min Option */}
                <div
                  className={`onboarding-option-card ${!isCustomGoal && goalMinutes === 15 ? 'selected' : ''}`}
                  onClick={() => {
                    setIsCustomGoal(false);
                    setGoalMinutes(15);
                  }}
                >
                  <div className="onboarding-option-left">
                    <div className="onboarding-option-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                      <BookOpen size={20} />
                    </div>
                    <div className="onboarding-option-text">
                      <div className="onboarding-option-title-row">
                        <h4>{isTa ? '15 நிமிடங்கள் / நாள்' : '15 minutes / day'}</h4>
                        <span className="onboarding-option-badge" style={{ background: '#dcfce7', color: '#15803d' }}>
                          {isTa ? 'பரிந்துரை' : 'Suggested'}
                        </span>
                      </div>
                      <p>{isTa ? '3-4 அதிகாரங்கள் தினசரி வேதாகம வாசிப்பு' : 'Daily devotional walk (3-4 chapters)'}</p>
                    </div>
                  </div>
                  {!isCustomGoal && goalMinutes === 15 && <CheckCircle2 size={20} color="#2563eb" />}
                </div>

                {/* 30 Min Option */}
                <div
                  className={`onboarding-option-card ${!isCustomGoal && goalMinutes === 30 ? 'selected' : ''}`}
                  onClick={() => {
                    setIsCustomGoal(false);
                    setGoalMinutes(30);
                  }}
                >
                  <div className="onboarding-option-left">
                    <div className="onboarding-option-icon" style={{ background: '#faf5ff', color: '#9333ea' }}>
                      <Flame size={20} />
                    </div>
                    <div className="onboarding-option-text">
                      <div className="onboarding-option-title-row">
                        <h4>{isTa ? '30 நிமிடங்கள் / நாள்' : '30 minutes / day'}</h4>
                        <span className="onboarding-option-badge" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
                          {isTa ? 'ஆழமான' : 'Deep'}
                        </span>
                      </div>
                      <p>{isTa ? '5+ அதிகாரங்கள் ஆழமான ஆய்வு & ஜெபம்' : 'Deep scripture study (5+ chapters)'}</p>
                    </div>
                  </div>
                  {!isCustomGoal && goalMinutes === 30 && <CheckCircle2 size={20} color="#2563eb" />}
                </div>

                {/* Custom Option (Requirement 2) */}
                <div
                  className={`onboarding-option-card ${isCustomGoal ? 'selected' : ''}`}
                  onClick={() => setIsCustomGoal(true)}
                >
                  <div className="onboarding-option-left">
                    <div className="onboarding-option-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
                      <Clock size={20} />
                    </div>
                    <div className="onboarding-option-text">
                      <div className="onboarding-option-title-row">
                        <h4>{isTa ? 'தனிப்பயன் கால அளவு' : 'Custom Duration'}</h4>
                        <span className="onboarding-option-badge" style={{ background: '#fef3c7', color: '#92400e' }}>
                          {isCustomGoal ? `${customGoalValue} ${isTa ? 'நிமிடம்' : 'min'}` : (isTa ? 'மாற்றக்கூடியது' : 'Flexible')}
                        </span>
                      </div>
                      <p>{isTa ? 'உங்கள் வசதிக்கேற்ப வாசிப்பு நேரத்தை நிர்ணயிக்கவும்' : 'Set your own reading goal'}</p>
                    </div>
                  </div>
                  {isCustomGoal && <CheckCircle2 size={20} color="#2563eb" />}
                </div>

                {/* Custom Goal Input Box when Custom is selected */}
                {isCustomGoal && (
                  <div className="onboarding-custom-box active">
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {isTa ? 'தினசரி இலக்கு (நிமிடங்கள்):' : 'Enter target minutes:'}
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={180}
                      className="onboarding-custom-input"
                      value={customGoalValue}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val > 0) setCustomGoalValue(val);
                      }}
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {isTa ? 'நிமிடங்கள் / நாள்' : 'mins / day'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="onboarding-footer">
              <div />
              <button
                type="button"
                className="onboarding-btn onboarding-btn-primary"
                onClick={handleNext}
              >
                {isTa ? 'அடுத்தது' : 'Continue'} <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}

        {/* STEP 2: Theme & Ambiance */}
        {step === 2 && (
          <>
            <div className="onboarding-header">
              <div className="onboarding-step-indicator">
                <Sparkles size={13} /> {isTa ? 'படி 2 / 5' : 'Step 2 of 5'}
              </div>
              <h2 className="onboarding-title">{isTa ? 'வாசிப்பு சூழல் & வண்ணம்' : 'Reading Ambiance'}</h2>
              <p className="onboarding-subtitle">
                {isTa
                  ? 'கண்களுக்கு இதமான வண்ண அமைப்பைத் தேர்ந்தெடுக்கவும்.'
                  : 'Select your comfortable reading theme.'}
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
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Sun size={15} color="#d97706" /> {isTa ? 'வெளிச்சம் (Light)' : 'Light'}
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
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Scroll size={15} color="#b45309" /> {isTa ? 'செப்பியா (Sepia)' : 'Sepia'}
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
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Moon size={15} color="#818cf8" /> {isTa ? 'இருள் (Dark)' : 'Dark'}
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
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Trees size={15} color="#10b981" /> {isTa ? 'வனம் (Forest)' : 'Forest'}
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
                <ChevronLeft size={18} /> {isTa ? 'பின்னால்' : 'Back'}
              </button>
              <button
                type="button"
                className="onboarding-btn onboarding-btn-primary"
                onClick={handleNext}
              >
                {isTa ? 'அடுத்தது' : 'Continue'} <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}

        {/* STEP 3: Notification & Reminder (Requirements 7, 8, 9, 10, 11, 12) */}
        {step === 3 && (
          <>
            <div className="onboarding-header">
              <div className="onboarding-step-indicator">
                <Sparkles size={13} /> {isTa ? 'படி 3 / 5' : 'Step 3 of 5'}
              </div>
              <h2 className="onboarding-title">
                {isTa ? 'தினசரி நினைவூட்டல்' : 'Daily Bible Reminders'}
              </h2>
              <p className="onboarding-subtitle">
                {isTa
                  ? 'வேதாகம வாசிப்பைத் தவறவிடாமல் இருக்க நினைவூட்டலை அமைக்கவும்.'
                  : 'Receive daily scripture alerts even while offline.'}
              </p>
            </div>

            <div className="onboarding-body">
              {/* Presets */}
              <div className="onboarding-time-presets">
                <button
                  type="button"
                  className={`onboarding-time-btn ${reminderTime === '06:00' ? 'selected' : ''}`}
                  onClick={() => setReminderTime('06:00')}
                >
                  🌅 06:00 AM
                  <div style={{ fontSize: '0.6875rem', opacity: 0.8, fontWeight: 500 }}>
                    {isTa ? 'காலை' : 'Morning'}
                  </div>
                </button>
                <button
                  type="button"
                  className={`onboarding-time-btn ${reminderTime === '12:30' ? 'selected' : ''}`}
                  onClick={() => setReminderTime('12:30')}
                >
                  ☀️ 12:30 PM
                  <div style={{ fontSize: '0.6875rem', opacity: 0.8, fontWeight: 500 }}>
                    {isTa ? 'மதியம்' : 'Midday'}
                  </div>
                </button>
                <button
                  type="button"
                  className={`onboarding-time-btn ${reminderTime === '21:00' ? 'selected' : ''}`}
                  onClick={() => setReminderTime('21:00')}
                >
                  🌙 09:00 PM
                  <div style={{ fontSize: '0.6875rem', opacity: 0.8, fontWeight: 500 }}>
                    {isTa ? 'இரவு' : 'Night'}
                  </div>
                </button>
              </div>

              {/* Custom Time */}
              <div className="onboarding-custom-time">
                <Clock size={18} color="var(--text-muted)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {isTa ? 'முதன்மை நேரம்:' : 'Primary Time:'}
                </span>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                />
              </div>

              {/* Multiple Custom Notification Times */}
              <div style={{ marginTop: '0.75rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{isTa ? 'கூடுதல் தனிப்பயன் நேரங்கள்' : 'Multiple Custom Times'}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {isTa ? 'எத்தனை வேண்டுமானாலும் சேர்க்கலாம்' : 'Add as many as you want'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="time"
                    value={newCustomTime}
                    onChange={(e) => setNewCustomTime(e.target.value)}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '0.4rem 0.6rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      flex: 1
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTime}
                    style={{
                      background: 'var(--accent-color)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + {isTa ? 'சேர்' : 'Add'}
                  </button>
                </div>

                {customTimesList.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {customTimesList.map((t) => (
                      <span
                        key={t}
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '16px',
                          padding: '0.2rem 0.6rem',
                          fontSize: '0.75rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontWeight: 600
                        }}
                      >
                        ⏰ {t}
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomTime(t)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            padding: 0,
                            lineHeight: 1
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Multi-slot Reminder Toggles (Requirement 10) */}
              <div className="onboarding-slots-grid">
                <label className={`onboarding-slot-row ${morningSlot ? 'active' : ''}`} style={{ cursor: 'pointer' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                    🌅 {isTa ? 'விடியற்காலை நினைவூட்டல் (06:00 AM)' : 'Morning Reminder (06:00 AM)'}
                  </span>
                  <input
                    type="checkbox"
                    checked={morningSlot}
                    onChange={(e) => setMorningSlot(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                  />
                </label>
                <label className={`onboarding-slot-row ${afternoonSlot ? 'active' : ''}`} style={{ cursor: 'pointer' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                    ☀️ {isTa ? 'மதிய வேத வசனம் (12:30 PM)' : 'Afternoon Verse (12:30 PM)'}
                  </span>
                  <input
                    type="checkbox"
                    checked={afternoonSlot}
                    onChange={(e) => setAfternoonSlot(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                  />
                </label>
                <label className={`onboarding-slot-row ${nightSlot ? 'active' : ''}`} style={{ cursor: 'pointer' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                    🌙 {isTa ? 'இரவு தியானம் & ஜெபம் (09:00 PM)' : 'Night Devotional (09:00 PM)'}
                  </span>
                  <input
                    type="checkbox"
                    checked={nightSlot}
                    onChange={(e) => setNightSlot(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#2563eb' }}
                  />
                </label>
              </div>

              {/* Vertical Notification Permission Section (Requirement 7) */}
              <div className="onboarding-notif-cta">
                <div className="onboarding-notif-header">
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: notifGranted ? '#dcfce7' : '#dbeafe',
                      color: notifGranted ? '#16a34a' : '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Bell size={18} />
                  </div>
                  <div>
                    <h5 style={{ margin: '0 0 0.15rem 0', fontSize: '0.875rem', fontWeight: 700 }}>
                      {notifGranted
                        ? (isTa ? 'அறிவிப்புகள் தயார்' : 'Notifications Active')
                        : (isTa ? 'தினசரி நினைவூட்டல் அனுமதி' : 'Daily Reminder Permission')}
                    </h5>
                    <p className="onboarding-notif-body">
                      {notifGranted
                        ? (isTa
                            ? 'ஆண்ட்ராய்டு சாதனத்தில் ஆஃப்லைனிலும் நினைவூட்டல் இயங்கும்.'
                            : 'Offline local notifications scheduled on device.')
                        : (isTa
                            ? 'செயலி மூடப்பட்டிருந்தாலும் தினசரி வேதாகம நினைவூட்டலைப் பெற அனுமதியை வழங்கவும்.'
                            : 'Allow notifications so the app can remind you to read the Bible every day.')}
                    </p>
                  </div>
                </div>

                {!notifGranted ? (
                  <button
                    type="button"
                    onClick={handleEnableNotifications}
                    disabled={isRequestingNotif}
                    className="onboarding-notif-btn"
                  >
                    <Bell size={16} />
                    {isRequestingNotif
                      ? (isTa ? 'அனுமதிக்கிறது...' : 'Requesting...')
                      : (isTa ? 'அறிவிப்புகளை அனுமதி' : 'Allow Notifications')}
                  </button>
                ) : (
                  <div style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={16} /> {isTa ? 'அனுமதி வழங்கப்பட்டது' : 'Permission Granted'}
                  </div>
                )}
              </div>
            </div>

            <div className="onboarding-footer">
              <button
                type="button"
                className="onboarding-btn onboarding-btn-secondary"
                onClick={handlePrev}
              >
                <ChevronLeft size={18} /> {isTa ? 'பின்னால்' : 'Back'}
              </button>
              <button
                type="button"
                className="onboarding-btn onboarding-btn-primary"
                onClick={handleNext}
              >
                {isTa ? 'அடுத்தது' : 'Continue'} <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}

        {/* STEP 4: Reading Commitment (Requirement 14 & 15) */}
        {step === 4 && (
          <>
            <div className="onboarding-header">
              <div className="onboarding-step-indicator">
                <Sparkles size={13} /> {isTa ? 'படி 4 / 5' : 'Step 4 of 5'}
              </div>
              <h2 className="onboarding-title">
                {isTa ? 'வாசிப்பு அர்ப்பணிப்பு' : 'Reading Commitment'}
              </h2>
              <p className="onboarding-subtitle">
                {isTa
                  ? 'தேவ வார்த்தையை தினமும் வாசிக்க எளிய உறுதிமொழி.'
                  : 'A simple habit builder for daily devotion.'}
              </p>
            </div>

            <div className="onboarding-body">
              {/* 3 Concise Feature Cards (Requirement 14) */}
              <div className="onboarding-feature-list">
                <div className="onboarding-feature-card">
                  <div className="onboarding-feature-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                    <Clock size={18} />
                  </div>
                  <div className="onboarding-feature-text">
                    <h5>{isTa ? '⏱ நேரக் கணக்கீடு' : '⏱ Active Session Timer'}</h5>
                    <p>{isTa ? 'உங்கள் வாசிப்பு நேரத்தை நிகழ்நேரத்தில் கண்காணிக்கலாம்.' : 'Track your reading session.'}</p>
                  </div>
                </div>

                <div className="onboarding-feature-card">
                  <div className="onboarding-feature-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                    <CheckCircle2 size={18} />
                  </div>
                  <div className="onboarding-feature-text">
                    <h5>{isTa ? '✓ தினசரி இலக்கு' : '✓ Daily Goal'}</h5>
                    <p>{isTa ? `இன்றைய ${effectiveGoal} நிமிட வாசிப்பு இலக்கை நிறைவு செய்யவும்.` : `Complete today's ${effectiveGoal}-minute target.`}</p>
                  </div>
                </div>

                <div className="onboarding-feature-card">
                  <div className="onboarding-feature-icon" style={{ background: '#faf5ff', color: '#9333ea' }}>
                    <Flame size={18} />
                  </div>
                  <div className="onboarding-feature-text">
                    <h5>{isTa ? '🔥 தொடர் பழக்கம்' : '🔥 Streaks'}</h5>
                    <p>{isTa ? 'தினமும் வாசித்து தொடர் நாட்களை (Streaks) கட்டமைக்கவும்.' : 'Build a consistent reading habit.'}</p>
                  </div>
                </div>
              </div>

              {/* Checkbox agreement */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.75rem',
                  background: 'rgba(37, 99, 235, 0.05)',
                  border: '1px solid rgba(37, 99, 235, 0.2)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
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
                <span>
                  {isTa
                    ? 'இறை வார்த்தைக்கு தினமும் நேரம் ஒதுக்குவேன் என உறுதியளிக்கிறேன்.'
                    : 'I commit to reading God\'s word daily.'}
                </span>
              </label>
            </div>

            <div className="onboarding-footer">
              <button
                type="button"
                className="onboarding-btn onboarding-btn-secondary"
                onClick={handlePrev}
              >
                <ChevronLeft size={18} /> {isTa ? 'பின்னால்' : 'Back'}
              </button>
              <button
                type="button"
                className="onboarding-btn onboarding-btn-primary"
                disabled={!covenantAccepted}
                onClick={handleNext}
                style={{ opacity: covenantAccepted ? 1 : 0.5 }}
              >
                {isTa ? 'அடுத்தது' : 'Continue'} <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}

        {/* STEP 5: Start Journey - Guest vs Cloud Sign In */}
        {step === 5 && (
          <>
            <div className="onboarding-header">
              <div className="onboarding-step-indicator">
                <Sparkles size={13} /> {isTa ? 'படி 5 / 5' : 'Step 5 of 5'}
              </div>
              <h2 className="onboarding-title">
                {isTa ? 'எப்படி தொடங்க விரும்புகிறீர்கள்?' : 'Get Started'}
              </h2>
              <p className="onboarding-subtitle">
                {isTa
                  ? 'விருந்தினராக உடனடியாகத் தொடங்கலாம் அல்லது கணக்குடன் இணையலாம்.'
                  : 'Start reading as guest or sign in to sync with cloud.'}
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
                      <div className="onboarding-option-title-row">
                        <h4>{isTa ? 'விருந்தினராக தொடங்கு' : 'Start as Guest'}</h4>
                        <span className="onboarding-option-badge" style={{ background: '#e2e8f0', color: '#475569' }}>
                          {isTa ? 'உடனடி' : 'Instant'}
                        </span>
                      </div>
                      <p>{isTa ? 'பதிவு செய்யாமல் உடனடியாக வாசிக்கலாம்' : 'Start reading immediately without account'}</p>
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
                      <div className="onboarding-option-title-row">
                        <h4 style={{ color: '#2563eb' }}>
                          {isTa ? 'உள்நுழை / கணக்கு தொடங்கு' : 'Sign In / Register'}
                        </h4>
                        <span className="onboarding-option-badge" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                          {isTa ? 'கிளவுட் ஒத்திசைவு' : 'Cloud Sync'}
                        </span>
                      </div>
                      <p>{isTa ? 'புக்மார்க், சிறப்பம்சங்கள் மற்றும் சாதன ஒத்திசைவு' : 'Sync bookmarks, streaks across devices'}</p>
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
                <ChevronLeft size={18} /> {isTa ? 'பின்னால்' : 'Back'}
              </button>
              <button
                type="button"
                className="onboarding-btn onboarding-btn-primary"
                onClick={() => finishOnboarding('guest')}
              >
                {isTa ? 'வாசிக்கத் தொடங்கு' : 'Start Reading'} <ChevronRight size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
