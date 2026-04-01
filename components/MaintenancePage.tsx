import React, { useEffect, useState } from 'react';
import { Settings, ShieldCheck, RefreshCw } from 'lucide-react';

export default function MaintenancePage() {
  const [dots, setDots] = useState('');
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 600);
    const pulseInterval = setInterval(() => {
      setPulse(prev => !prev);
    }, 2000);
    return () => { clearInterval(dotInterval); clearInterval(pulseInterval); };
  }, []);

  return (
    <div className="min-h-[100dvh] bg-gray-950 flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(220,38,38,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.3) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Glowing orb */}
      <div className={`absolute w-[300px] h-[300px] rounded-full transition-all duration-[3000ms] ${pulse ? 'opacity-20 scale-110' : 'opacity-10 scale-90'}`}
        style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.4) 0%, transparent 70%)' }} />

      {/* Icon cluster */}
      <div className="relative mb-8">
        <div className={`transition-transform duration-[3000ms] ${pulse ? 'rotate-[30deg]' : 'rotate-0'}`}>
          <Settings className="w-16 h-16 text-red-500 drop-shadow-[0_0_20px_rgba(220,38,38,0.4)]" />
        </div>
        <div className="absolute -bottom-1 -right-3">
          <ShieldCheck className="w-7 h-7 text-red-400/60" />
        </div>
      </div>

      {/* Branding */}
      <h1 className="text-xs font-black tracking-[0.3em] uppercase text-white mb-1">
        vault_<span className="text-red-600">id</span>
      </h1>
      <div className="px-2 py-0.5 rounded border bg-red-500/10 border-red-500/30 mb-8">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500">Maintenance</span>
      </div>

      {/* Main message */}
      <h2 className="text-xl font-bold text-white mb-3 tracking-tight">
        We'll Be Right Back
      </h2>
      <p className="text-gray-400 text-sm max-w-xs leading-relaxed mb-2">
        Vault ID is currently undergoing scheduled maintenance to improve your experience. 
        All services will be restored shortly.
      </p>
      <p className="text-gray-500 text-xs mb-10">
        Your funds and data are completely safe and secure.
      </p>

      {/* Animated status indicator */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900/80 border border-gray-800">
        <RefreshCw className={`w-3.5 h-3.5 text-red-500 ${pulse ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
        <span className="text-xs text-gray-400 font-medium tracking-wide">
          Performing upgrades{dots}
        </span>
      </div>

      {/* Auto-retry notice */}
      <p className="text-gray-600 text-[10px] mt-6 tracking-wide">
        This page will automatically refresh when services are restored
      </p>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-30" />
    </div>
  );
}
