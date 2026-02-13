import React, { useState } from 'react';
import { ArrowRight, LayoutGrid, Sun, Moon, Info, Shield, Server, X } from 'lucide-react';

interface Props {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  onNext: () => void;
}

export default function Splash({ darkMode, setDarkMode, onNext }: Props) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className={`h-full relative overflow-hidden flex flex-col justify-between p-8 transition-colors duration-700 ${
      darkMode 
        ? 'bg-gradient-to-b from-gray-900 via-gray-950 to-black' 
        : 'bg-red-700'
    }`}>
      {/* Information Overlay (Functional Box Icon Content) */}
      {showInfo && (
        <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
          <div className={`w-full max-w-sm p-8 rounded-[40px] border shadow-2xl relative ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
            <button 
              onClick={() => setShowInfo(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100/10 transition-colors"
            >
              <X size={20} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>
            
            <h3 className={`text-xl font-black uppercase tracking-widest mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>vault_id system</h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-600/10 text-red-600 rounded-xl flex items-center justify-center"><Shield size={20} /></div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Encryption</p>
                  <p className={`text-xs font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>AES-256 Quantum Proof</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600/10 text-blue-600 rounded-xl flex items-center justify-center"><Server size={20} /></div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Node Status</p>
                  <p className={`text-xs font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Global Core Active</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-600/10 text-purple-600 rounded-xl flex items-center justify-center"><Info size={20} /></div>
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Build Version</p>
                  <p className={`text-xs font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>V3.2.0 Platinum</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowInfo(false)}
              className="w-full mt-10 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]"
            >
              Return to Access
            </button>
          </div>
        </div>
      )}

      {/* Background Abstract Geometric Shape */}
      <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
        <div className="relative w-[300px] h-[300px] animate-[pulse_6s_ease-in-out_infinite]">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop
                          offset="0%"
                          style={{
                            stopColor: darkMode ? '#ef4444' : '#b91c1c',
                            stopOpacity: 0.9
                          }}
                        />
                        <stop
                          offset="100%"
                          style={{
                            stopColor: darkMode ? '#7f1d1d' : '#7f1d1d',
                            stopOpacity: 0.8
                          }}
                        />
                    </linearGradient>
                </defs>
                <path fill="url(#grad1)" d="M44.7,-76.4C58.1,-69.2,69.2,-58.1,76.4,-44.7C83.7,-31.3,87.1,-15.7,85.6,-0.9C84,14,77.5,27.9,68.7,40.1C59.9,52.3,48.7,62.8,35.6,70.5C22.5,78.2,7.5,83.1,-8.5,82.3C-24.5,81.5,-41.5,75.1,-55.1,64.2C-68.7,53.4,-78.9,38.1,-83.9,21.7C-88.9,5.3,-88.7,-12.3,-82.9,-27.9C-77.1,-43.5,-65.7,-57.1,-52.1,-64.4C-38.5,-71.7,-22.7,-72.7,-7.1,-71.4C8.4,-70.2,24,-66.6,44.7,-76.4Z" transform="translate(100 100)" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-40 h-40 bg-red-800/40 backdrop-blur-3xl rounded-[40px] border border-red-900/50 rotate-12"></div>
                 <div className="absolute w-40 h-40 bg-red-900/50 backdrop-blur-2xl rounded-[40px] border border-red-900/60 -rotate-12"></div>
            </div>
        </div>
      </div>

      {/* Top Header */}
      <div className="relative z-10 flex justify-between items-center text-white">
        <span className="font-black text-sm tracking-widest uppercase opacity-80">vault_id</span>
        <div className="flex gap-2">
            <button 
                onClick={() => setDarkMode(!darkMode)}
                className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
            >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={() => setShowInfo(true)}
              className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
            >
                <LayoutGrid size={20} />
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-6">
           <div className="rotate-[-90deg] origin-center -ml-8">
             <span className="text-white text-[10px] font-black uppercase tracking-[0.6em] opacity-40">Manage</span>
           </div>
           <h1 className="text-white text-6xl font-black leading-tight tracking-tighter">
             Your-<br />
             <span className="opacity-90">Finance</span>
           </h1>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="flex gap-1.5 items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40"></div>
            <div className="w-4 h-1.5 rounded-full bg-white"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40"></div>
        </div>

        <button 
            onClick={onNext}
            className="w-full bg-white text-black py-5 rounded-[24px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all group"
        >
            Swipe left to access
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
        </button>

        <button 
            onClick={onNext}
            className="text-white text-[10px] font-black uppercase tracking-[0.4em] opacity-60 hover:opacity-100 transition-opacity"
        >
            Skip
        </button>
      </div>
    </div>
  );
}