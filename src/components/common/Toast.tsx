import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 300,
        backgroundColor: 'var(--bg-elevated)',
        color: 'var(--text-primary)',
        padding: '0.625rem 1.125rem',
        borderRadius: '0.5rem',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: 500,
        animation: 'slideUp 180ms ease'
      }}
    >
      <CheckCircle2 size={16} style={{ color: 'var(--accent-color)' }} />
      <span>{message}</span>
    </div>
  );
};
