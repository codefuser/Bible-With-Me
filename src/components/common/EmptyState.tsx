import React from 'react';
import { BookOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There are no items to display at this time.',
  actionText,
  onAction
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: 'var(--text-muted)' }}>
        <BookOpen size={24} />
      </div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '360px', marginBottom: actionText ? '1.25rem' : '0' }}>{description}</p>
      {actionText && onAction && (
        <button className="btn-pill" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};
