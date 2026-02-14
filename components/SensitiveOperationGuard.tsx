import React, { useState } from 'react';
import { AlertTriangle, X, Wifi, Loader2 } from 'lucide-react';
import { useNetworkStatus } from '../src/hooks/useNetworkStatus';

interface Props {
  darkMode: boolean;
  operation: string;
  onProceed: () => void;
  onCancel?: () => void;
  children: React.ReactNode;
}

export default function SensitiveOperationGuard({ 
  darkMode, 
  operation, 
  onProceed, 
  onCancel,
  children 
}: Props) {
  const network = useNetworkStatus();
  const [showWarning, setShowWarning] = useState(false);
  const [userConfirmed, setUserConfirmed] = useState(false);

  const isPoorConnection = network.quality === 'poor' || 
                          network.quality === 'offline' || 
                          network.status === 'slow';

  const handleAction = () => {
    if (isPoorConnection && !userConfirmed) {
      setShowWarning(true);
    } else {
      onProceed();
    }
  };

  const handleProceedAnyway = () => {
    setUserConfirmed(true);
    setShowWarning(false);
    onProceed();
  };

  return (
    <>
      {React.cloneElement(children as React.ReactElement, {
        onClick: handleAction,
        disabled: network.quality === 'offline',
      })}

      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-2xl shadow-2xl ${
            darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
          }`}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl ${
                  darkMode ? 'bg-orange-500/20' : 'bg-orange-100'
                }`}>
                  <AlertTriangle size={24} className="text-orange-600" />
                </div>
                <div>
                  <h3 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Poor Connection Detected
                  </h3>
                  <p className="text-xs text-gray-500">Network quality: {network.quality}</p>
                </div>
              </div>

              <div className={`p-4 rounded-xl mb-4 ${
                darkMode ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <p className={`text-sm font-bold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                  {operation} requires a stable connection.
                </p>
                <p className="text-xs text-gray-500">
                  Your current connection is {network.quality === 'poor' ? 'poor' : 'slow'}. 
                  This may cause the operation to fail or take a very long time.
                </p>
                {network.effectiveType && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <div className="flex items-center gap-2 text-[9px] text-gray-400">
                      <Wifi size={12} />
                      <span>{network.effectiveType.toUpperCase()} • {network.downlink ? `${network.downlink.toFixed(1)} Mbps` : ''} • {network.rtt ? `${network.rtt}ms` : ''}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowWarning(false);
                    onCancel?.();
                  }}
                  className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                    darkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceedAnyway}
                  className="flex-1 bg-orange-600 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {network.isChecking ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Checking...
                    </>
                  ) : (
                    'Proceed Anyway'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

