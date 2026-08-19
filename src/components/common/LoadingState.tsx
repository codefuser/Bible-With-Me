import React from 'react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading Scripture...' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
      <div 
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--accent-color)',
          animation: 'spin 800ms linear infinite',
          marginBottom: '1rem'
        }}
      />
      <p style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{message}</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
