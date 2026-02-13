import React, { useState } from 'react';
import { ChevronRight, Cpu, Eye, Lock, Settings, ShieldAlert, ShoppingBag, Smartphone, Unlock, Wifi } from 'lucide-react';

interface Props {
  darkMode: boolean;
}

export default function Cards({ darkMode }: Props) {
  const [isLocked, setIsLocked] = useState(false);
  const [showCardNumber, setShowCardNumber] = useState(false);

  return (
    <div className={`min-h-full pb-10 transition-colors duration-300 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        .card-glimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            transparent,
            rgba(255, 255, 255, 0.1) 20%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0.1) 80%,
            transparent
          );
          animation: shimmer 4s infinite linear;
          pointer-events: none;
        }
      `}</style>

      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} px-4 py-3 shadow-sm sticky top-0 z-40 border-b`}>
        <h1 className={`text-sm font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-gray-900'}`}>Secure Assets</h1>
      </div>

      {/* Card Visual */}
      <div className="p-6 flex justify-center overflow-hidden">
        <div className={`relative w-full aspect-[1.586/1] max-w-sm rounded-[32px] shadow-2xl overflow-hidden transition-all duration-700 transform ${isLocked ? 'grayscale opacity-80 scale-95' : 'hover:scale-105'}`}>
          {/* Card Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-800 via-red-600 to-red-950"></div>

          {/* Glimmer */}
          {!isLocked && <div className="card-glimmer"></div>}

          {/* Decorative SVG Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="0.5" fill="none" />
              <circle cx="50" cy="50" r="30" stroke="white" strokeWidth="0.5" fill="none" />
            </svg>
          </div>

          <div className="relative h-full p-8 flex flex-col justify-between text-white">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Platinum Private</div>
                <div className="font-bold italic text-sm mt-1">Austin Keith</div>
              </div>
              <Wifi size={24} className="opacity-50 rotate-90" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg shadow-inner flex items-center justify-center">
                <Cpu size={24} className="text-amber-900/50" />
              </div>
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="h-8 opacity-80" alt="Mastercard" />
            </div>

            <div>
              <div className="font-mono text-xl tracking-[0.2em] mb-4 drop-shadow-md">
                {showCardNumber ? '4552 1928 3811 8832' : '•••• •••• •••• 8832'}
              </div>
              <div className="flex justify-between items-end">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Exp 09/28</div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60">CVV •••</div>
              </div>
            </div>
          </div>

          {isLocked && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white z-20 animate-in fade-in duration-300">
              <Lock size={40} className="mb-2 animate-bounce" />
              <span className="font-black tracking-[0.3em] text-[10px] uppercase">Asset Frozen</span>
            </div>
          )}
        </div>
      </div>

      {/* Control Actions */}
      <div className="px-4 mb-8">
        <div className="grid grid-cols-3 gap-3">
          <CardAction icon={isLocked ? <Unlock size={20} /> : <Lock size={20} />} label={isLocked ? 'Unfreeze' : 'Freeze'} isActive={isLocked} onClick={() => setIsLocked(!isLocked)} darkMode={darkMode} />
          <CardAction icon={<Eye size={20} />} label="Numbers" onClick={() => setShowCardNumber(!showCardNumber)} darkMode={darkMode} />
          <CardAction icon={<Settings size={20} />} label="Limits" onClick={() => { }} darkMode={darkMode} />
        </div>
      </div>

      {/* Settings */}
      <div className="px-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 px-2 text-gray-500">Security Suite</h3>
        <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} rounded-[32px] shadow-sm border overflow-hidden`}>
          <SettingItem icon={<ShoppingBag size={18} />} label="Online Purchases" active={true} darkMode={darkMode} />
          <SettingItem icon={<Smartphone size={18} />} label="Contactless Pay" active={true} darkMode={darkMode} />
          <SettingItem icon={<ShieldAlert size={18} />} label="Global Coverage" active={false} darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
}

const CardAction = ({ icon, label, isActive, onClick, darkMode }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all active:scale-95 ${isActive ? 'bg-red-600 border-red-600 text-white' : `${darkMode ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-white border-gray-100 text-gray-600 hover:border-red-500'}`}`}>
    <div className="mb-2">{icon}</div>
    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

const SettingItem = ({ icon, label, active, darkMode }: any) => (
  <div className={`p-5 flex items-center justify-between border-b last:border-0 ${darkMode ? 'border-gray-800' : 'border-gray-50'}`}>
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>{icon}</div>
      <span className={`text-sm font-bold tracking-tight ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{label}</span>
    </div>
    <div className={`w-10 h-6 rounded-full relative transition-colors ${active ? 'bg-emerald-500' : 'bg-gray-300'}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${active ? 'right-1' : 'left-1'}`}></div>
    </div>
  </div>
);