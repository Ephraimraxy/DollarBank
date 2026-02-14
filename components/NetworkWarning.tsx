import React, { useState } from 'react';
import { AlertTriangle, X, WifiOff } from 'lucide-react';
import { useNetworkStatus } from '../src/hooks/useNetworkStatus';

interface Props {
  darkMode: boolean;
  onDismiss?: () => void;
  operation?: string;
}

export default function NetworkWarning({ darkMode, onDismiss, operation = 'this operation' }: Props) {
  const network = useNetworkStatus();
  const [isDismissed, setIsDismissed] = useState(false);

  // Only show warning for poor/offline connections
  if ((network.quality !== 'poor' && network.quality !== 'offline' && network.status !== 'slow') || isDismissed) {
    return null;
  }

  const isOffline = network.quality === 'offline';
  const isPoor = network.quality === 'poor' || network.status === 'slow';

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div className={`fixed top-16 left-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300 ${
      isOffline
        ? darkMode ? 'bg-gray-900 border-red-500/40' : 'bg-red-50 border-red-200'
        : darkMode ? 'bg-gray-900 border-orange-500/40' : 'bg-orange-50 border-orange-200'
    } border-2 rounded-xl p-4 shadow-lg backdrop-blur-sm`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${
          isOffline 
            ? darkMode ? 'bg-red-500/20' : 'bg-red-100'
            : darkMode ? 'bg-orange-500/20' : 'bg-orange-100'
        }`}>
          {isOffline ? (
            <WifiOff size={20} className="text-red-600" />
          ) : (
            <AlertTriangle size={20} className="text-orange-600" />
          )}
        </div>
        <div className="flex-1">
          <h4 className={`text-sm font-black uppercase tracking-widest mb-1 ${
            isOffline ? 'text-red-500' : 'text-orange-500'
          }`}>
            {isOffline ? 'No Internet Connection' : 'Poor Network Connection'}
          </h4>
          <p className={`text-xs font-bold ${
            darkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {isOffline 
              ? 'You are currently offline. Please check your internet connection before proceeding.'
              : `Your connection is ${network.quality === 'poor' ? 'poor' : 'slow'}. ${operation} may take longer or fail. Consider waiting for a better connection.`
            }
          </p>
          {network.effectiveType && (
            <p className={`text-[9px] mt-1 font-bold ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Connection: {network.effectiveType.toUpperCase()} • {network.downlink ? `${network.downlink.toFixed(1)} Mbps` : ''} • {network.rtt ? `${network.rtt}ms latency` : ''}
            </p>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className={`p-1 rounded-lg transition-colors flex-shrink-0 ${
            darkMode 
              ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200' 
              : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
          }`}
          aria-label="Close notification"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

