import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-slate-800 text-white px-4 py-2 flex items-center justify-center gap-3 shadow-md animate-fade-in z-50 sticky top-0">
      <WifiOff className="w-4 h-4 text-orange-400" />
      <span className="text-sm font-medium">
        Offline Mode Active. Data will be saved locally and synced when connection is restored.
      </span>
      <button className="ml-4 text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-md transition-colors">
        Retry Sync
      </button>
    </div>
  );
};
