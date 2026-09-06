import React, { useState } from 'react';
import { Activity, Filter, Shield, FileText, Settings, Users, RotateCcw } from 'lucide-react';
import { AdminAuditLog } from '../../types/adminTypes';

interface AdminActivityLogsTabProps {
  logs: AdminAuditLog[];
  isEn?: boolean;
}

export const AdminActivityLogsTab: React.FC<AdminActivityLogsTabProps> = ({ logs, isEn = false }) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredLogs = logs.filter((l) => {
    if (categoryFilter === 'all') return true;
    return l.category === categoryFilter;
  });

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">
            <Activity size={20} style={{ color: '#2563eb' }} />
            <span>{isEn ? 'System Audit & Activity Logs' : 'நிர்வாக தணிக்கை பதிவுகள் (Audit Trail)'}</span>
          </h2>
          <p className="admin-card-subtitle">
            {isEn
              ? 'Complete chronological record of all administrative changes, feature toggles, and user role updates.'
              : 'நிர்வாக அமைப்பில் செய்யப்பட்ட மாற்றங்கள் மற்றும் பாதுகாப்பு நிகழ்வுகளின் முழுப் பதிவு.'}
          </p>
        </div>

        <div style={{ minWidth: '160px' }}>
          <select
            className="admin-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">{isEn ? 'All Categories' : 'அனைத்து பிரிவுகள்'}</option>
            <option value="config">{isEn ? 'Configuration' : 'அமைப்புகள் (Config)'}</option>
            <option value="content">{isEn ? 'Scripture Content' : 'வசன உள்ளடக்கம்'}</option>
            <option value="user">{isEn ? 'User Roles' : 'பயனர்கள்'}</option>
            <option value="security">{isEn ? 'Security' : 'பாதுகாப்பு'}</option>
          </select>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{isEn ? 'Timestamp' : 'நேரம் & தேதி'}</th>
              <th>{isEn ? 'Category' : 'பிரிவு'}</th>
              <th>{isEn ? 'Action Event' : 'செயல்'}</th>
              <th>{isEn ? 'Details' : 'விபரம்'}</th>
              <th>{isEn ? 'Operator' : 'செய்தவர்'}</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td>
                  <span
                    className="role-badge"
                    style={{
                      backgroundColor:
                        log.category === 'security'
                          ? 'rgba(239, 68, 68, 0.15)'
                          : log.category === 'content'
                          ? 'rgba(37, 99, 235, 0.15)'
                          : log.category === 'user'
                          ? 'rgba(168, 85, 247, 0.15)'
                          : 'rgba(34, 197, 94, 0.15)',
                      color:
                        log.category === 'security'
                          ? '#dc2626'
                          : log.category === 'content'
                          ? '#2563eb'
                          : log.category === 'user'
                          ? '#9333ea'
                          : '#16a34a'
                    }}
                  >
                    {log.category}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>{log.action}</td>
                <td style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>{log.details}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.adminEmail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
