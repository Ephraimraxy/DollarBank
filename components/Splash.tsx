import React, { useState } from 'react';
import { ArrowRight, Sun, Moon, Info, Shield, Server, X, DollarSign, Sparkles, TrendingUp } from 'lucide-react';

interface Props {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  onNext: () => void;
}

export default function Splash({ darkMode, setDarkMode, onNext }: Props) {
  const [currentScreen, setCurrentScreen] = useState(0); // 0: left, 1: middle, 2: right
  const [showInfo, setShowInfo] = useState(false);

  const screens = [
    {
      title: "Welcome to Vault ID",
      description: "Get ready for seamless bill payments and effortless money transfers.",
      bgColor: darkMode ? 'bg-gradient-to-b from-gray-900 via-gray-950 to-black' : 'bg-red-700',
      showSkip: true
    },
    {
      title: "Let's get you in",
      description: "Ready to experience seamless banking and management. Let's start by creating your account.",
      bgColor: darkMode ? 'bg-gradient-to-b from-gray-900 via-gray-950 to-black' : 'bg-white',
      showSkip: false
    },
    {
      title: "Start Exploring",
      description: "Dive into a world of convenience. Pay bills, transfer funds, and stay in control of your finances—all in one place.",
      bgColor: darkMode ? 'bg-gradient-to-b from-gray-900 via-gray-950 to-black' : 'bg-red-700',
      showSkip: true
    }
  ];

  const handleNext = () => {
    if (currentScreen < 2) {
      setCurrentScreen(currentScreen + 1);
    } else {
      onNext();
    }
  };

  const handleSkip = () => {
    onNext();
  };

  return (
    <div className={`h-full relative overflow-hidden flex flex-col transition-colors duration-700 ${screens[currentScreen].bgColor}`}>
      {/* Information Overlay */}
      {showInfo && (
        <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className={`w-full max-w-sm p-6 rounded-[32px] border shadow-2xl relative ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
            <button 
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100/10 transition-colors"
            >
              <X size={18} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>
            
            <h3 className={`text-lg font-black uppercase tracking-widest mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>vault_id system</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-red-600/10 text-red-600 rounded-xl flex items-center justify-center"><Shield size={18} /></div>
                <div>
                  <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Encryption</p>
                  <p className={`text-xs font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>AES-256 Quantum Proof</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-600/10 text-blue-600 rounded-xl flex items-center justify-center"><Server size={18} /></div>
                <div>
                  <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Node Status</p>
                  <p className={`text-xs font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Global Core Active</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-600/10 text-purple-600 rounded-xl flex items-center justify-center"><Info size={18} /></div>
                <div>
                  <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Build Version</p>
                  <p className={`text-xs font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>V3.2.0 Platinum</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setShowInfo(false)}
              className="w-full mt-6 py-3 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-[9px]"
            >
              Return to Access
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="relative z-10 flex justify-between items-center p-4">
        <span className={`font-black text-xs tracking-widest uppercase ${darkMode || currentScreen === 1 ? 'text-white' : 'text-white'} opacity-80`}>vault_id</span>
        <div className="flex gap-2">
          {screens[currentScreen].showSkip && (
            <button 
              onClick={handleSkip}
              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-colors ${
                darkMode || currentScreen === 1 
                  ? 'text-white/60 hover:text-white' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Skip
            </button>
          )}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`w-9 h-9 backdrop-blur-md rounded-lg flex items-center justify-center border transition-all ${
              darkMode || currentScreen === 1
                ? 'bg-white/10 border-white/10 text-white'
                : 'bg-white/10 border-white/10 text-white'
            } active:scale-90`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button 
            onClick={() => setShowInfo(true)}
            className={`w-9 h-9 backdrop-blur-md rounded-lg flex items-center justify-center border transition-all ${
              darkMode || currentScreen === 1
                ? 'bg-white/10 border-white/10 text-white'
                : 'bg-white/10 border-white/10 text-white'
            } active:scale-90`}
          >
            <Info size={18} />
          </button>
        </div>
      </div>

      {/* Screen Content */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* Screen 0: Left - Welcome */}
        {currentScreen === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 animate-in fade-in slide-in-from-left duration-500">
            {/* Badge */}
            <div className={`mb-6 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
              darkMode ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-yellow-400 text-yellow-900'
            }`}>
              Fast and safe
            </div>
            
            {/* Coins */}
            <div className="relative mb-8">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black shadow-lg ${
                  darkMode ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-yellow-400 text-yellow-900'
                }`}>
                  $
                </div>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black shadow-lg ${
                  darkMode ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-yellow-400 text-yellow-900'
                }`}>
                  £
                </div>
              </div>
              {/* Decorative shapes */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-red-600/20 rounded-lg rotate-45 blur-sm"></div>
              <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-red-500/20 rounded-lg rotate-12 blur-sm"></div>
            </div>
          </div>
        )}

        {/* Screen 1: Middle - Auth Options */}
        {currentScreen === 1 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Circular element with cards */}
            <div className="relative mb-8">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
                darkMode ? 'bg-red-600/20 border border-red-500/30' : 'bg-red-100'
              }`}>
                <Sparkles size={48} className={darkMode ? 'text-red-400' : 'text-red-600'} />
              </div>
              
              {/* Left card */}
              <div className={`absolute -left-8 top-1/2 -translate-y-1/2 w-20 p-2 rounded-lg shadow-lg ${
                darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
              }`}>
                <div className="w-6 h-6 rounded-full bg-red-600 mx-auto mb-1"></div>
                <p className="text-[8px] font-bold text-center mb-0.5">Subscription paid</p>
                <p className={`text-[9px] font-black text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>$1,002</p>
              </div>
              
              {/* Right card */}
              <div className={`absolute -right-8 top-1/2 -translate-y-1/2 w-20 p-2 rounded-lg shadow-lg ${
                darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
              }`}>
                <div className="text-2xl text-center mb-1">😊</div>
                <p className={`text-[8px] font-bold text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Satisfied Users</p>
              </div>
            </div>
          </div>
        )}

        {/* Screen 2: Right - Start Exploring */}
        {currentScreen === 2 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 animate-in fade-in slide-in-from-right duration-500">
            {/* Speech bubble with stars */}
            <div className="relative mb-8">
              <div className={`w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg ${
                darkMode ? 'bg-white/10 border border-white/20' : 'bg-white'
              }`}>
                <div className="flex gap-1">
                  <span className="text-2xl">⭐</span>
                  <span className="text-2xl">⭐</span>
                  <span className="text-2xl">⭐</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Card */}
      <div className="relative z-10 px-4 pb-6">
        <div className={`rounded-[32px] p-6 shadow-2xl ${
          darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white'
        }`}>
          <h2 className={`text-2xl font-black mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {screens[currentScreen].title}
          </h2>
          <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {screens[currentScreen].description}
          </p>

          {/* Pagination dots */}
          {currentScreen !== 1 && (
            <div className="flex gap-1.5 justify-center mb-6">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentScreen
                      ? darkMode ? 'bg-white w-6' : 'bg-red-600 w-6'
                      : darkMode ? 'bg-white/30 w-1.5' : 'bg-gray-300 w-1.5'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Action Buttons */}
          {currentScreen === 1 ? (
            <div className="space-y-3">
              <button
                onClick={onNext}
                className={`w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${
                  darkMode
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                } active:scale-95`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  onNext();
                  // Navigate to sign up - this will be handled by App.tsx
                  setTimeout(() => {
                    const event = new CustomEvent('navigate-to-signup');
                    window.dispatchEvent(event);
                  }, 100);
                }}
                className={`w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-xs border-2 transition-all ${
                  darkMode
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                } active:scale-95`}
              >
                Signup
              </button>
            </div>
          ) : (
            <button
              onClick={handleNext}
              className={`w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${
                darkMode
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              } active:scale-95 flex items-center justify-center gap-2`}
            >
              Next
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
