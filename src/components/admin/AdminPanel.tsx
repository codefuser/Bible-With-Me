import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  LayoutDashboard,
  Users,
  Flame,
  BookOpen,
  Settings,
  Activity,
  ArrowLeft,
  Lock,
  Unlock,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useReading } from '../../context/ReadingContext';
import {
  getAdminConfig,
  saveAdminConfig,
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  toggleUserSuspension,
  getRevivalWords,
  saveRevivalWord,
  deleteRevivalWord,
  getCustomMeditations,
  saveCustomMeditation,
  deleteCustomMeditation,
  getAuditLogs,
  isAdminSessionActive,
  setAdminSession
} from '../../services/adminService';
import {
  AdminAuditLog,
  AdminDashboardStats,
  AdminGlobalConfig,
  AdminRevivalWord,
  AdminUserDetails,
  CustomVerseMeditation
} from '../../types/adminTypes';
import { AdminPasscodeModal } from './AdminPasscodeModal';
import { AdminDashboardTab } from './AdminDashboardTab';
import { AdminUsersTab } from './AdminUsersTab';
import { AdminRevivalWordTab } from './AdminRevivalWordTab';
import { AdminStudyManagerTab } from './AdminStudyManagerTab';
import { AdminSettingsTab } from './AdminSettingsTab';
import { AdminActivityLogsTab } from './AdminActivityLogsTab';
import '../../styles/admin.css';

export const AdminPanel: React.FC = () => {
  const { isAuthenticated, profile } = useAuth();
  const { language } = useReading();
  const isEn = language === 'en';

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    return isAdminSessionActive() || profile?.role === 'admin';
  });
  const [showPasscodeModal, setShowPasscodeModal] = useState<boolean>(() => {
    return !(isAdminSessionActive() || profile?.role === 'admin');
  });

  const [config, setConfig] = useState<AdminGlobalConfig>(getAdminConfig);
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalUsers: 0,
    activeUsersToday: 0,
    totalBookmarks: 0,
    totalHighlights: 0,
    totalStudiesConducted: 0,
    customMeditationsCount: 0,
    scheduledRevivalWordsCount: 0,
    recentActivities: []
  });
  const [users, setUsers] = useState<AdminUserDetails[]>([]);
  const [revivalWords, setRevivalWords] = useState<AdminRevivalWord[]>(getRevivalWords);
  const [customMeditations, setCustomMeditations] = useState<CustomVerseMeditation[]>(getCustomMeditations);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(getAuditLogs);

  const refreshAllData = useCallback(async () => {
    const currentConfig = getAdminConfig();
    setConfig(currentConfig);

    const u = await getAllUsers();
    setUsers(u);

    const rw = getRevivalWords();
    setRevivalWords(rw);

    const cm = getCustomMeditations();
    setCustomMeditations(cm);

    const logs = getAuditLogs();
    setAuditLogs(logs);

    const s = await getDashboardStats();
    setStats(s);
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      refreshAllData();
    }
  }, [isAuthorized, refreshAllData]);

  // Listen to cross-system changes
  useEffect(() => {
    const onConfigUpdate = () => setConfig(getAdminConfig());
    const onRevivalUpdate = () => {
      setRevivalWords(getRevivalWords());
      refreshAllData();
    };
    const onMeditationUpdate = () => {
      setCustomMeditations(getCustomMeditations());
      refreshAllData();
    };

    window.addEventListener('admin-config-updated', onConfigUpdate);
    window.addEventListener('admin-revival-word-updated', onRevivalUpdate);
    window.addEventListener('admin-custom-meditation-updated', onMeditationUpdate);

    return () => {
      window.removeEventListener('admin-config-updated', onConfigUpdate);
      window.removeEventListener('admin-revival-word-updated', onRevivalUpdate);
      window.removeEventListener('admin-custom-meditation-updated', onMeditationUpdate);
    };
  }, [refreshAllData]);

  const handleUpdateConfig = (partial: Partial<AdminGlobalConfig>) => {
    const updated = saveAdminConfig(partial, profile?.email || 'Admin');
    setConfig(updated);
    refreshAllData();
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'admin' | 'user' | 'moderator') => {
    await updateUserRole(userId, newRole, profile?.email || 'Admin');
    const u = await getAllUsers();
    setUsers(u);
    refreshAllData();
  };

  const handleToggleSuspend = async (userId: string) => {
    await toggleUserSuspension(userId, profile?.email || 'Admin');
    const u = await getAllUsers();
    setUsers(u);
    refreshAllData();
  };

  const handleSaveRevivalWord = (word: Omit<AdminRevivalWord, 'id' | 'created_at'> & { id?: string }) => {
    saveRevivalWord(word, profile?.email || 'Admin');
    setRevivalWords(getRevivalWords());
    refreshAllData();
  };

  const handleDeleteRevivalWord = (id: string) => {
    deleteRevivalWord(id, profile?.email || 'Admin');
    setRevivalWords(getRevivalWords());
    refreshAllData();
  };

  const handleSaveMeditation = (meditation: CustomVerseMeditation) => {
    saveCustomMeditation(meditation, profile?.email || 'Admin');
    setCustomMeditations(getCustomMeditations());
    refreshAllData();
  };

  const handleDeleteMeditation = (bookId: number, chapter: number, verse: number) => {
    deleteCustomMeditation(bookId, chapter, verse, profile?.email || 'Admin');
    setCustomMeditations(getCustomMeditations());
    refreshAllData();
  };

  const handleReturnToReader = () => {
    window.location.hash = '';
  };

  const handleLockAdmin = () => {
    setAdminSession(false);
    setIsAuthorized(false);
    setShowPasscodeModal(true);
  };

  const handlePasscodeSuccess = () => {
    setIsAuthorized(true);
    setShowPasscodeModal(false);
    refreshAllData();
  };

  return (
    <div className="admin-wrapper">
      {/* ── Sticky Header Container (Navbar + Tabs Strip) ── */}
      <div className="admin-header-sticky">
        {/* ── Admin Navigation Bar ── */}
        <header className="admin-navbar">
          <div className="admin-navbar-title">
            <div className="admin-shield-icon">
              <Shield size={22} />
            </div>
            <div className="admin-title-text">
              <h1>
                <span>{isEn ? 'Admin Control Center' : 'வேதாகம நிர்வாக மையம்'}</span>
                <span className="admin-title-badge">{isEn ? 'Full Access' : 'முழு அதிகாரம்'}</span>
              </h1>
              <p>
                {isEn
                  ? 'App Configurations, User Database, Daily Revival & Verse Meditation'
                  : 'அம்சங்கள் கட்டுப்பாடு, பயனர் பட்டியல், எழுப்புதல் வாக்கு & வசன தியான மேலாண்மை'}
              </p>
            </div>
          </div>

          <div className="admin-navbar-actions">
            <button
              className="admin-btn admin-btn-outline"
              onClick={handleLockAdmin}
              title={isEn ? 'Lock Admin Panel' : 'நிர்வாக பூட்டு'}
            >
              <Lock size={16} />
              <span>{isEn ? 'Lock' : 'பூட்டு'}</span>
            </button>

            <button
              className="admin-btn admin-btn-primary"
              onClick={handleReturnToReader}
              title={isEn ? 'Return to Bible Reader' : 'வாசகருக்கு திரும்பு'}
            >
              <ArrowLeft size={16} />
              <span>{isEn ? 'Open Reader' : 'வாசகருக்கு திரும்பு'}</span>
            </button>
          </div>
        </header>

        {/* ── Tabs Navigation Strip (Segmented & High Contrast) ── */}
        <nav className="admin-tabs-nav" aria-label="Admin Navigation Tabs">
          <button
            className={`admin-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="admin-tab-icon icon-dashboard">
              <LayoutDashboard size={18} />
            </span>
            <span>{isEn ? 'Dashboard' : 'கட்டுப்பாட்டு பலகை'}</span>
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span className="admin-tab-icon icon-users">
              <Users size={18} />
            </span>
            <span>{isEn ? 'All Users' : 'பயனர்கள்'}</span>
            <span className="admin-tab-count">{users.length}</span>
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'revival' ? 'active' : ''}`}
            onClick={() => setActiveTab('revival')}
          >
            <span className="admin-tab-icon icon-revival">
              <Flame size={18} />
            </span>
            <span>{isEn ? 'Daily Revival Word' : 'எழுப்புதல் வாக்கு'}</span>
            <span className="admin-tab-count">{revivalWords.length}</span>
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'study-mgr' ? 'active' : ''}`}
            onClick={() => setActiveTab('study-mgr')}
          >
            <span className="admin-tab-icon icon-study">
              <BookOpen size={18} />
            </span>
            <span>{isEn ? 'Verse & Chapter Study' : 'வேத தியான ஆய்வுகள்'}</span>
            {config.verseStudyEnabled ? (
              <span className="admin-status-dot on" title="Study Mode Active"></span>
            ) : (
              <span className="admin-status-dot off" title="Study Mode Disabled"></span>
            )}
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="admin-tab-icon icon-settings">
              <Settings size={18} />
            </span>
            <span>{isEn ? 'Settings & Banners' : 'அமைப்புகள் & அறிவிப்பு'}</span>
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <span className="admin-tab-icon icon-logs">
              <Activity size={18} />
            </span>
            <span>{isEn ? 'Activity Logs' : 'தணிக்கை பதிவுகள்'}</span>
          </button>
        </nav>
      </div>

      {/* ── Main Tab Content ── */}
      <main className="admin-container">
        {activeTab === 'dashboard' && (
          <AdminDashboardTab
            stats={stats}
            config={config}
            onUpdateConfig={handleUpdateConfig}
            onNavigateTab={(tab) => setActiveTab(tab)}
            isEn={isEn}
          />
        )}

        {activeTab === 'users' && (
          <AdminUsersTab
            users={users}
            onUpdateRole={handleUpdateUserRole}
            onToggleSuspend={handleToggleSuspend}
            isEn={isEn}
          />
        )}

        {activeTab === 'revival' && (
          <AdminRevivalWordTab
            revivalWords={revivalWords}
            onSaveWord={handleSaveRevivalWord}
            onDeleteWord={handleDeleteRevivalWord}
            isEn={isEn}
          />
        )}

        {activeTab === 'study-mgr' && (
          <AdminStudyManagerTab
            config={config}
            customMeditations={customMeditations}
            onUpdateConfig={handleUpdateConfig}
            onSaveMeditation={handleSaveMeditation}
            onDeleteMeditation={handleDeleteMeditation}
            isEn={isEn}
          />
        )}

        {activeTab === 'settings' && (
          <AdminSettingsTab
            config={config}
            onUpdateConfig={handleUpdateConfig}
            isEn={isEn}
          />
        )}

        {activeTab === 'logs' && (
          <AdminActivityLogsTab
            logs={auditLogs}
            isEn={isEn}
          />
        )}
      </main>

      {/* ── Passcode Modal ── */}
      <AdminPasscodeModal
        isOpen={showPasscodeModal}
        onSuccess={handlePasscodeSuccess}
        onCancel={handleReturnToReader}
        isEn={isEn}
      />
    </div>
  );
};
