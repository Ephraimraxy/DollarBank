import React from 'react';
import { AlertTriangle, X, WifiOff } from 'lucide-react';
import { useNetworkStatus } from '../src/hooks/useNetworkStatus';

interface Props {
  darkMode: boolean;
  onDismiss?: () => void;
  operation?: string;
}

export default function NetworkWarning({ darkMode, onDismiss, operation = 'this operation' }: Props) {
  const network = useNetworkStatus();

  // Only show warning for poor/offline connections
  if (network.quality !== 'poor' && network.quality !== 'offline' && network.status !== 'slow') {
    return null;
  }

  const isOffline = network.quality === 'offline';
  const isPoor = network.quality === 'poor' || network.status === 'slow';

  return (
    <div className={`fixed top-16 left-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300 ${
      darkMode ? 'bg-orange-500/10 border-orange-500/30' : 'bg-orange-50 border-orange-200'
    } border-2 rounded-xl p-4 shadow-lg`}>
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
            isOffline ? 'text-red-600' : 'text-orange-600'
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
            <p className="text-[9px] text-gray-500 mt-1 font-bold">
              Connection: {network.effectiveType.toUpperCase()} • {network.downlink ? `${network.downlink.toFixed(1)} Mbps` : ''} • {network.rtt ? `${network.rtt}ms latency` : ''}
            </p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`p-1 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
            }`}
          >
            <X size={16} className="text-gray-500" />
          </button>
        )}
      </div>
    </div>
  );
}

