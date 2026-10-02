import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPendingCount, drainSyncQueue } from '../../services/offlineSyncQueue';

interface OfflineBannerProps {
  language?: 'ta' | 'en' | 'parallel';
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ language = 'ta' }) => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [justSynced, setJustSynced] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (user?.id) {
        setIsSyncing(true);
        drainSyncQueue(user.id)
          .then(() => {
            setPendingCount(getPendingCount(user.id));
            setJustSynced(true);
            setTimeout(() => setJustSynced(false), 3000);
          })
          .finally(() => setIsSyncing(false));
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setPendingCount(getPendingCount(user?.id));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check of pending queue
    setPendingCount(getPendingCount(user?.id));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user?.id]);

  // If online and nothing just synced, do not show
  if (isOnline && !justSynced) {
    return null;
  }

  const isEn = language === 'en';

  return (
    <div
      style={{
        position: 'fixed',
        top: '3.6rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99,
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.4rem 0.85rem',
        borderRadius: '9999px',
        backgroundColor: justSynced ? 'rgba(16, 185, 129, 0.95)' : 'rgba(30, 41, 59, 0.92)',
        color: '#ffffff',
        fontSize: '0.78rem',
        fontWeight: 600,
        boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(8px)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        maxWidth: '90vw',
        animation: 'fadeIn 0.25s ease'
      }}
    >
      {justSynced ? (
        <>
          <CheckCircle2 size={15} color="#ffffff" />
          <span>{isEn ? 'All changes synced successfully!' : 'அனைத்து மாற்றங்களும் ஒத்திசைக்கப்பட்டன!'}</span>
        </>
      ) : (
        <>
          <WifiOff size={15} color="#fbbf24" />
          <span>
            {isEn
              ? 'Offline mode: reading & bookmarks saved locally'
              : 'ஆஃப்லைன் முறை: வாசிப்பு & புக்மார்க் சாதனத்தில் சேமிக்கப்படுகிறது'}
            {pendingCount > 0 && ` (${pendingCount} ${isEn ? 'pending' : 'காத்திருக்கிறது'})`}
          </span>
          {isSyncing && <RefreshCw size={13} className="spin-animation" />}
        </>
      )}
    </div>
  );
};
