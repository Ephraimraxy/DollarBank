import React, { useState, useEffect } from 'react';
import { Home, ArrowRightLeft, CreditCard, TrendingUp, FileText, Bell, User, Menu, ShieldCheck, Lock, ScanFace } from 'lucide-react';
import Dashboard from './components/Dashboard';
import TransferFlow from './components/TransferFlow';
import Notifications from './components/Notifications';
import FeePayment from './components/FeePayment';
import Support from './components/Support';
import Cards from './components/Cards';
import Activity from './components/Activity';
import Profile from './components/Profile';
import Admin from './components/Admin';
import RequestMoney from './components/RequestMoney';
import Invest from './components/Invest';
import AiAssistant from './components/AiAssistant';
import Splash from './components/Splash';
import AuthFlow from './components/AuthFlow';
import VerifyEmail from './components/VerifyEmail';
import VerifyOTP from './components/VerifyOTP';
import ResetPassword from './components/ResetPassword';
import { ViewState } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    const isAuth = localStorage.getItem('vault-session-active');

    const path = window.location.pathname;
    if (path.startsWith('/verify')) {
      return ViewState.VERIFY_EMAIL;
    }
    if (path.startsWith('/reset-password')) {
      return ViewState.RESET_PASSWORD;
    }

    return isAuth ? ViewState.HOME : ViewState.SPLASH;
  });

  useEffect(() => {
    const handleNavigateToSignup = () => {
      setCurrentView(ViewState.SIGN_UP);
    };
    window.addEventListener('navigate-to-signup', handleNavigateToSignup);
    return () => window.removeEventListener('navigate-to-signup', handleNavigateToSignup);
  }, []);

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vault-id-user-identity');
    return saved ? JSON.parse(saved) : {
      fullName: 'Austin Keith',
      email: 'austin.keith@icloud.com',
      phone: '+1 (555) 019-2834',
      address: '42 Wallaby Way, Sydney'
    };
  });

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('vault-id-dark-mode');
    return saved ? JSON.parse(saved) : true;
  });

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStage, setAuthStage] = useState<'SCANNING' | 'SUCCESS'>('SCANNING');

  useEffect(() => {
    localStorage.setItem('vault-id-dark-mode', JSON.stringify(darkMode));
    localStorage.setItem('vault-id-user-identity', JSON.stringify(user));
  }, [darkMode, user]);

  const handleLoginSuccess = () => {
    localStorage.setItem('vault-session-active', 'true');
    setIsAuthenticating(true);
    setAuthStage('SCANNING');

    setTimeout(() => setAuthStage('SUCCESS'), 1200);
    setTimeout(() => {
      setIsAuthenticating(false);
      setCurrentView(ViewState.HOME);
    }, 1800);
  };

  const handleLogout = () => {
    localStorage.removeItem('vault-session-active');
    setCurrentView(ViewState.SIGN_IN);
  };

  const Header = () => (
    <div className={`${darkMode ? 'bg-gray-950 border-gray-900' : 'bg-white border-gray-100'} px-3 py-2.5 flex justify-between items-center shadow-sm sticky top-0 z-40 border-b transition-colors duration-300`}>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <h1 className={`text-xs font-black tracking-[0.3em] uppercase leading-none ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            vault_<span className="text-red-600">id</span>
          </h1>
          <div className={`px-1 py-0.5 rounded border text-[6px] font-black uppercase tracking-widest ${darkMode
            ? 'bg-red-500/10 border-red-500/30 text-red-500'
            : 'bg-red-50 border-red-200 text-red-700'
            }`}>
            Secure
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <button
          onClick={() => setCurrentView(ViewState.NOTIFICATIONS)}
          className={`relative p-1.5 rounded-lg transition-all active:scale-90 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
        >
          <Bell className={`w-4 h-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} />
          <span className="absolute top-1 right-1 bg-red-600 text-white text-[8px] font-black px-0.5 py-0 rounded-full border border-white leading-none">2</span>
        </button>

        <button
          onClick={() => setCurrentView(ViewState.PROFILE)}
          className="active:scale-95 transition-transform ml-0.5 p-0.5"
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-amber-500 rounded-full opacity-20 group-hover:opacity-40 transition-opacity blur-sm"></div>
            <img
              src="https://picsum.photos/100/100"
              alt="Profile"
              className={`relative w-7 h-7 rounded-full border-2 object-cover shadow-sm ${darkMode ? 'border-gray-800' : 'border-white'}`}
            />
          </div>
        </button>
      </div>
    </div>
  );

  if (isAuthenticating) {
    return (
      <div className={`max-w-md mx-auto h-[100dvh] flex flex-col items-center justify-center transition-colors duration-700 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="relative flex flex-col items-center">
          <div className={`relative w-32 h-32 flex items-center justify-center`}>
            <div className={`absolute inset-0 rounded-[40px] border-2 transition-all duration-700 ${authStage === 'SUCCESS' ? 'border-emerald-500 scale-110 opacity-0' : 'border-red-600/20 animate-[spin_4s_linear_infinite]'}`} />
            <div className={`transition-all duration-500 ${authStage === 'SUCCESS' ? 'scale-125 text-emerald-500' : 'text-red-600 scale-100'}`}>
              <ScanFace size={64} className={authStage === 'SCANNING' ? 'animate-pulse' : ''} />
            </div>
          </div>
          <div className="mt-12 text-center">
            <h2 className={`text-sm font-black uppercase tracking-[0.5em] mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {authStage === 'SUCCESS' ? 'Verified' : 'Accessing Vault'}
            </h2>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case ViewState.SPLASH:
        return <Splash darkMode={darkMode} setDarkMode={setDarkMode} onNext={() => setCurrentView(ViewState.SIGN_IN)} />;
      case ViewState.SIGN_IN:
      case ViewState.SIGN_UP:
      case ViewState.FORGOT_PASSWORD:
      case ViewState.REVERIFY:
        return <AuthFlow currentView={currentView} setView={setCurrentView} onLogin={handleLoginSuccess} darkMode={darkMode} setDarkMode={setDarkMode} setUser={setUser} />;
      case ViewState.VERIFY_EMAIL:
        return <VerifyEmail setView={setCurrentView} darkMode={darkMode} />;
      case ViewState.VERIFY_OTP:
        return <VerifyOTP 
          email={localStorage.getItem('pending-verification-email') || ''} 
          setView={setCurrentView} 
          onLogin={handleLoginSuccess}
          setUser={setUser}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />;
      case ViewState.RESET_PASSWORD:
        return <ResetPassword setView={setCurrentView} darkMode={darkMode} />;
      case ViewState.HOME:
        return <Dashboard user={user} onViewChange={setCurrentView} darkMode={darkMode} />;
      case ViewState.TRANSFER:
        return <TransferFlow onBack={() => setCurrentView(ViewState.HOME)} darkMode={darkMode} />;
      case ViewState.NOTIFICATIONS:
        return <Notifications onBack={() => setCurrentView(ViewState.HOME)} onSupport={() => setCurrentView(ViewState.SUPPORT)} darkMode={darkMode} />;
      case ViewState.FEE_PAYMENT:
        return <FeePayment onBack={() => setCurrentView(ViewState.HOME)} darkMode={darkMode} />;
      case ViewState.CARDS:
        return <Cards darkMode={darkMode} />;
      case ViewState.ACTIVITY:
        return <Activity onBack={() => setCurrentView(ViewState.HOME)} darkMode={darkMode} />;
      case ViewState.PROFILE:
        return <Profile user={user} setUser={setUser} onBack={() => setCurrentView(ViewState.HOME)} darkMode={darkMode} setDarkMode={setDarkMode} onLogout={handleLogout} onAdmin={() => setCurrentView(ViewState.ADMIN)} />;
      case ViewState.ADMIN:
        return <Admin onBack={() => setCurrentView(ViewState.PROFILE)} darkMode={darkMode} user={user} />;
      case ViewState.REQUEST:
        return <RequestMoney onBack={() => setCurrentView(ViewState.HOME)} darkMode={darkMode} />;
      case ViewState.SUPPORT:
        return <Support onBack={() => setCurrentView(ViewState.HOME)} darkMode={darkMode} />;
      case ViewState.INVEST:
        return <Invest darkMode={darkMode} />;
      default:
        return <Dashboard user={user} onViewChange={setCurrentView} darkMode={darkMode} />;
    }
  };

  const isAuthView = [
    ViewState.SPLASH,
    ViewState.SIGN_IN,
    ViewState.SIGN_UP,
    ViewState.FORGOT_PASSWORD,
    ViewState.REVERIFY,
    ViewState.VERIFY_EMAIL,
    ViewState.VERIFY_OTP,
    ViewState.RESET_PASSWORD,
  ].includes(currentView);

  return (
    <ErrorBoundary>
      <div className={`max-w-md mx-auto h-[100dvh] flex flex-col overflow-hidden shadow-2xl relative transition-colors duration-300 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
        {!isAuthView && <Header />}

        <main className="flex-1 overflow-y-auto no-scrollbar pb-16">
          {renderContent()}
        </main>

        {!isAuthView && <AiAssistant user={user} darkMode={darkMode} />}

        {!isAuthView && (
          <div className={`border-t flex justify-around items-stretch px-1 fixed bottom-0 w-full max-w-md z-50 transition-all duration-500 h-[60px] ${darkMode
            ? 'bg-gray-950/90 border-gray-800 backdrop-blur-xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)]'
            : 'bg-white/90 border-gray-100 backdrop-blur-xl shadow-[0_-10px_30px_rgba(0,0,0,0.05)]'
            }`}>
            <NavButton icon={<Home size={18} />} label="Home" isActive={currentView === ViewState.HOME} onClick={() => setCurrentView(ViewState.HOME)} darkMode={darkMode} />
            <NavButton icon={<ArrowRightLeft size={18} />} label="Transfer" isActive={currentView === ViewState.TRANSFER} onClick={() => setCurrentView(ViewState.TRANSFER)} darkMode={darkMode} />
            <NavButton icon={<CreditCard size={18} />} label="Cards" isActive={currentView === ViewState.CARDS} onClick={() => setCurrentView(ViewState.CARDS)} darkMode={darkMode} />
            <NavButton icon={<TrendingUp size={18} />} label="Invest" isActive={currentView === ViewState.INVEST} onClick={() => setCurrentView(ViewState.INVEST)} darkMode={darkMode} />
            <NavButton icon={<FileText size={18} />} label="Activity" isActive={currentView === ViewState.ACTIVITY} onClick={() => setCurrentView(ViewState.ACTIVITY)} darkMode={darkMode} />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

const NavButton = ({ icon, label, isActive, onClick, darkMode }: any) => (
  <button onClick={onClick} className="relative flex flex-col items-center justify-center flex-1 transition-all duration-300 outline-none group">
    <div className={`absolute inset-0 mx-0.5 my-1 rounded-xl transition-all duration-700 ease-out ${isActive ? (darkMode ? 'bg-red-500/10' : 'bg-red-50') : 'bg-transparent group-hover:bg-gray-100/30'}`} />
    <div className={`relative z-10 flex flex-col items-center gap-0.5 transition-all duration-500 ease-in-out ${isActive ? '-translate-y-0.5' : 'translate-y-0'}`}>
      <div className={`transition-all duration-500 p-1 rounded-lg ${isActive ? 'text-red-600 scale-110 drop-shadow-[0_0_8px_rgba(220,38,38,0.3)]' : darkMode ? 'text-gray-500 opacity-60' : 'text-gray-400 opacity-70'}`}>
        {icon}
      </div>
      <span className={`text-[7px] font-black uppercase tracking-[0.18em] transition-all duration-500 ${isActive ? 'text-red-600 opacity-100' : 'text-gray-500 opacity-0 translate-y-1'}`}>
        {label}
      </span>
    </div>
    <div className={`absolute bottom-0 h-0.5 rounded-full bg-red-600 transition-all duration-500 ease-in-out shadow-[0_-2px_6px_rgba(220,38,38,0.4)] ${isActive ? 'w-6 opacity-100' : 'w-0 opacity-0'}`} />
  </button>
);