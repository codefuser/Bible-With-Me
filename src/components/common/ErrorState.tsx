import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'Unable to fetch Bible data. Please check your connection and try again.',
  onRetry
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
        <AlertCircle size={24} />
      </div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '380px', marginBottom: onRetry ? '1.25rem' : '0' }}>{message}</p>
      {onRetry && (
        <button className="btn-pill" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};
