import React from 'react';
import { Wifi, WifiOff, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useNetworkStatus, ConnectionQuality } from '../src/hooks/useNetworkStatus';

interface Props {
  darkMode: boolean;
  showDetailed?: boolean;
}

export default function NetworkIndicator({ darkMode, showDetailed = false }: Props) {
  const network = useNetworkStatus();

  const getStatusConfig = () => {
    switch (network.quality) {
      case 'excellent':
        return {
          icon: <Wifi size={14} className="text-emerald-500" />,
          text: 'Excellent',
          color: 'text-emerald-500',
          bgColor: darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50',
          borderColor: darkMode ? 'border-emerald-500/30' : 'border-emerald-200',
        };
      case 'good':
        return {
          icon: <Wifi size={14} className="text-blue-500" />,
          text: 'Good',
          color: 'text-blue-500',
          bgColor: darkMode ? 'bg-blue-500/10' : 'bg-blue-50',
          borderColor: darkMode ? 'border-blue-500/30' : 'border-blue-200',
        };
      case 'fair':
        return {
          icon: <Wifi size={14} className="text-yellow-500" />,
          text: 'Fair',
          color: 'text-yellow-500',
          bgColor: darkMode ? 'bg-yellow-500/10' : 'bg-yellow-50',
          borderColor: darkMode ? 'border-yellow-500/30' : 'border-yellow-200',
        };
      case 'poor':
        return {
          icon: <AlertTriangle size={14} className="text-orange-500" />,
          text: 'Poor',
          color: 'text-orange-500',
          bgColor: darkMode ? 'bg-orange-500/10' : 'bg-orange-50',
          borderColor: darkMode ? 'border-orange-500/30' : 'border-orange-200',
        };
      case 'offline':
        return {
          icon: <WifiOff size={14} className="text-red-500" />,
          text: 'Offline',
          color: 'text-red-500',
          bgColor: darkMode ? 'bg-red-500/10' : 'bg-red-50',
          borderColor: darkMode ? 'border-red-500/30' : 'border-red-200',
        };
      default:
        return {
          icon: <Wifi size={14} className="text-gray-500" />,
          text: 'Unknown',
          color: 'text-gray-500',
          bgColor: darkMode ? 'bg-gray-500/10' : 'bg-gray-50',
          borderColor: darkMode ? 'border-gray-500/30' : 'border-gray-200',
        };
    }
  };

  const config = getStatusConfig();

  if (!showDetailed) {
    return (
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
        {network.isChecking ? (
          <Loader2 size={12} className={`${config.color} animate-spin`} />
        ) : (
          config.icon
        )}
        <span className={`text-[8px] font-black uppercase tracking-widest ${config.color}`}>
          {network.isChecking ? 'Checking...' : config.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`p-3 rounded-xl border ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-center gap-2 mb-2">
        {network.isChecking ? (
          <Loader2 size={16} className={`${config.color} animate-spin`} />
        ) : (
          config.icon
        )}
        <div>
          <div className={`text-xs font-black uppercase tracking-widest ${config.color}`}>
            Network: {config.text}
          </div>
          {network.effectiveType && (
            <div className="text-[9px] text-gray-500 font-bold mt-0.5">
              {network.effectiveType.toUpperCase()} • {network.downlink ? `${network.downlink.toFixed(1)} Mbps` : ''} • {network.rtt ? `${network.rtt}ms` : ''}
            </div>
          )}
        </div>
      </div>
      {network.saveData && (
        <div className="text-[8px] text-gray-500 font-bold">
          Data Saver Mode Active
        </div>
      )}
    </div>
  );
}

