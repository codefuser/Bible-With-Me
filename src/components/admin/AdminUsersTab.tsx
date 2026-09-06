import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Bookmark,
  Highlighter,
  FileText,
  Calendar,
  Clock,
  MoreVertical,
  X
} from 'lucide-react';
import { AdminUserDetails } from '../../types/adminTypes';

interface AdminUsersTabProps {
  users: AdminUserDetails[];
  onUpdateRole: (userId: string, newRole: 'admin' | 'user' | 'moderator') => void;
  onToggleSuspend: (userId: string) => void;
  isEn?: boolean;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  users,
  onUpdateRole,
  onToggleSuspend,
  isEn = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUserDetails | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2 className="admin-card-title">
              <Users size={20} style={{ color: '#2563eb' }} />
              <span>{isEn ? 'All Registered Users' : 'அனைத்து பயனர் விபரங்கள் (User Management)'}</span>
            </h2>
            <p className="admin-card-subtitle">
              {isEn
                ? 'Manage members, permissions, access roles, and monitor reading engagement.'
                : 'பயனர்களின் விபரங்கள், அவர்களின் புக்மார்க் & வாசிப்பு செயல்பாடுகள் மற்றும் அதிகாரங்கள்.'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="admin-kpi-badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#2563eb' }}>
              {filteredUsers.length} {isEn ? 'users' : 'பயனர்கள்'}
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '1.25rem'
          }}
        >
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <input
              type="text"
              className="admin-input"
              placeholder={isEn ? 'Search user by name or email...' : 'பெயர் அல்லது மின்னஞ்சல் தேடுக...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.4rem' }}
            />
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }}
            />
          </div>

          <div style={{ minWidth: '160px' }}>
            <select
              className="admin-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">{isEn ? 'All Roles' : 'அனைத்து நிலைகள்'}</option>
              <option value="admin">{isEn ? 'Admin Only' : 'நிர்வாகிகள் மட்டும்'}</option>
              <option value="moderator">{isEn ? 'Moderators' : 'மதிப்பீட்டாளர்கள்'}</option>
              <option value="user">{isEn ? 'Regular Users' : 'வழக்கமான வாசகர்கள்'}</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{isEn ? 'User Profile' : 'பயனர் விபரம்'}</th>
                <th>{isEn ? 'Role' : 'அனுமதி நிலை'}</th>
                <th>{isEn ? 'Reading Progress' : 'வாசிப்பு செயல்பாடு'}</th>
                <th>{isEn ? 'Last Active' : 'கடைசி செயல்பாடு'}</th>
                <th>{isEn ? 'Status' : 'நிலை'}</th>
                <th style={{ textAlign: 'right' }}>{isEn ? 'Actions' : 'செயல்கள்'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ opacity: user.isSuspended ? 0.6 : 1 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="user-avatar-badge">
                        {user.displayName.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {user.displayName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.78rem' }}>
                      <span title={isEn ? 'Bookmarks' : 'புக்மார்க்குகள்'} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Bookmark size={13} style={{ color: '#ca8a04' }} /> {user.bookmarksCount}
                      </span>
                      <span title={isEn ? 'Highlights' : 'ஹைலைட்டுகள்'} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Highlighter size={13} style={{ color: '#2563eb' }} /> {user.highlightsCount}
                      </span>
                      <span title={isEn ? 'Notes' : 'குறிப்புகள்'} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <FileText size={13} style={{ color: '#059669' }} /> {user.notesCount}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(user.lastActive).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    {user.isSuspended ? (
                      <span className="role-badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#dc2626' }}>
                        {isEn ? 'Suspended' : 'முடக்கப்பட்டது'}
                      </span>
                    ) : (
                      <span className="role-badge" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#16a34a' }}>
                        {isEn ? 'Active' : 'செயலில்'}
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button
                        className="admin-btn admin-btn-sm admin-btn-outline"
                        onClick={() => setSelectedUser(user)}
                        title={isEn ? 'Inspect & Edit Role' : 'விபரம் & அனுமதி மாற்றம்'}
                      >
                        {isEn ? 'Manage' : 'நிர்வகி'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── User Detail Modal ── */}
      {selectedUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ maxWidth: '480px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="user-avatar-badge" style={{ width: '42px', height: '42px', fontSize: '1.1rem' }}>
                  {selectedUser.displayName.substring(0, 1).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                    {selectedUser.displayName}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {selectedUser.email}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.825rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>{isEn ? 'User ID:' : 'பயனர் எண்:'}</span>
                  <div style={{ fontWeight: 600, wordBreak: 'break-all', fontSize: '0.75rem' }}>{selectedUser.id}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>{isEn ? 'Current Role:' : 'தற்போதைய நிலை:'}</span>
                  <div style={{ fontWeight: 600 }}>{selectedUser.role.toUpperCase()}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>{isEn ? 'Account Created:' : 'பதிவு செய்த நாள்:'}</span>
                  <div>{new Date(selectedUser.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>{isEn ? 'Reading Streak:' : 'தொடர் வாசிப்பு:'}</span>
                  <div>{selectedUser.readingProgressDays} {isEn ? 'days' : 'நாட்கள்'}</div>
                </div>
              </div>
            </div>

            {/* Change Role Section */}
            <div className="admin-form-group">
              <label className="admin-form-label">
                <Shield size={14} style={{ display: 'inline', marginRight: '0.35rem' }} />
                {isEn ? 'Change Permission Role' : 'அனுமதி நிலையை மாற்று (Role Assignment)'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                {(['user', 'moderator', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`admin-btn ${selectedUser.role === r ? 'admin-btn-primary' : 'admin-btn-outline'}`}
                    style={{ fontSize: '0.775rem', justifyContent: 'center', textTransform: 'capitalize' }}
                    onClick={() => {
                      onUpdateRole(selectedUser.id, r);
                      setSelectedUser({ ...selectedUser, role: r });
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Suspend / Reactivate */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button
                type="button"
                className={`admin-btn ${selectedUser.isSuspended ? 'admin-btn-success' : 'admin-btn-danger'}`}
                onClick={() => {
                  onToggleSuspend(selectedUser.id);
                  setSelectedUser({ ...selectedUser, isSuspended: !selectedUser.isSuspended });
                }}
              >
                {selectedUser.isSuspended ? (
                  <>
                    <UserCheck size={16} />
                    <span>{isEn ? 'Reinstate User' : 'மீண்டும் அனுமதி'}</span>
                  </>
                ) : (
                  <>
                    <UserX size={16} />
                    <span>{isEn ? 'Suspend User' : 'பயனரை முடக்கு'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="admin-btn admin-btn-outline"
                onClick={() => setSelectedUser(null)}
              >
                {isEn ? 'Close' : 'மூடு'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
