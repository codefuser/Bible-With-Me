import React from 'react';
import { Shield, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useReading } from '../../context/ReadingContext';

export const AdminRoutePlaceholder: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { language } = useReading();

  const isEn = language === 'en';

  if (!isAuthenticated || !isAdmin) {
    return (
      <div
        style={{
          padding: '2.5rem 1.5rem',
          maxWidth: '500px',
          margin: '3rem auto',
          textAlign: 'center',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '0.75rem'
        }}
      >
        <ShieldAlert size={48} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          {isEn ? 'Access Denied' : 'அணுகல் மறுக்கப்பட்டது'}
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          {isEn
            ? 'This area requires administrator privileges. Your user role is not authorized.'
            : 'இந்த பகுதிக்கு நிர்வாகி உரிமைகள் தேவை.'}
        </p>
        <button
          className="btn-pill"
          onClick={() => (window.location.hash = '')}
          style={{ margin: '0 auto', gap: '0.375rem' }}
        >
          <ArrowLeft size={16} />
          <span>{isEn ? 'Return to Reader' : 'வாசிப்புக்கு திரும்பு'}</span>
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '2.5rem 1.5rem',
        maxWidth: '500px',
        margin: '3rem auto',
        textAlign: 'center',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--accent-color)',
        borderRadius: '0.75rem'
      }}
    >
      <Shield size={48} style={{ color: 'var(--accent-color)', margin: '0 auto 1rem' }} />
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        {isEn ? 'Admin Foundation Ready' : 'நிர்வாக பகுதி தயார்'}
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        {isEn
          ? 'Admin area ready for Phase 11 (Daily Verse & Research Manager).'
          : 'கட்டம் 11 க்கான நிர்வாகப் பகுதி தயார் நிலையிலுள்ளது.'}
      </p>
      <button
        className="btn-pill"
        onClick={() => (window.location.hash = '')}
        style={{ margin: '0 auto', gap: '0.375rem' }}
      >
        <ArrowLeft size={16} />
        <span>{isEn ? 'Return to Reader' : 'வாசிப்புக்கு திரும்பு'}</span>
      </button>
    </div>
  );
};
