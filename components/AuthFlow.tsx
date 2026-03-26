import React, { useState, useMemo } from 'react';
import { ViewState } from '../types';
import { Lock, User, ArrowLeft, ShieldCheck, RefreshCw, AlertTriangle, Eye, EyeOff, ChevronRight, Mail, Globe, Sun, Moon } from 'lucide-react';
import { checkPasswordStrength, PasswordStrength } from '../src/lib/passwordStrength';
import { api } from '../src/lib/api';

interface Props {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  onLogin: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  setUser: (user: any) => void;
}

export default function AuthFlow({ currentView, setView, onLogin, darkMode, setDarkMode, setUser }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('test@gmail.com');
  const [password, setPassword] = useState('123456');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate password strength
  const passwordStrength = useMemo(() => checkPasswordStrength(password), [password]);

  const handleAuth = async () => {
    setError('');
    setIsLoading(true);
    try {
      const response = await api.login({ email, password });

      const { user, token } = response;

      // Normalize user shape between API (full_name) and frontend (fullName)
      const normalizedUser = {
        ...user,
        fullName: user.fullName || user.full_name || '',
        isAdmin: user.isAdmin || user.is_admin || false,
      };

      localStorage.setItem('vault_token', token);
      localStorage.setItem('vault-id-user-identity', JSON.stringify(normalizedUser));
      setUser(normalizedUser); // Update App state
      onLogin();
    } catch (err: any) {
      // Handle validation errors with detailed messages
      if (err.errors && Array.isArray(err.errors)) {
        const errorMessages = err.errors.map((e: any) => e.message || `${e.field}: ${e.message}`).join(', ');
        setError(errorMessages || err.message || 'Validation failed');
      } else {
        setError(err.message || 'Authentication Failed');
      }
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSignIn = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h2 className={`text-3xl font-black tracking-tighter mb-1 leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>Welcome Back</h2>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Identify Yourself to Continue</p>
      </div>

      <div className="space-y-5">
        <AuthInput icon={<Mail size={18} />} label="Email Address" type="email" value={email} onChange={setEmail} darkMode={darkMode} />
        <AuthInput icon={<Lock size={18} />} label="Security Key" type={showPassword ? "text" : "password"} value={password} onChange={setPassword} showToggle onToggle={() => setShowPassword(!showPassword)} darkMode={darkMode} />

        <div className="flex justify-between items-center">
          {error ? (
            <span className="text-[10px] font-black uppercase text-red-500 animate-pulse">{error}</span>
          ) : <div />}
          <button onClick={() => setView(ViewState.FORGOT_PASSWORD)} className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:underline">
            Lost access to vault?
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <button onClick={() => handleAuth()} disabled={isLoading} className="w-full bg-red-600 text-white font-black uppercase tracking-[0.2em] py-3.5 rounded-xl shadow-xl hover:bg-red-700 active:scale-95 transition-all text-[10px] disabled:opacity-50">
          {isLoading ? 'Decrypting...' : 'Open Secure Vault'}
        </button>
      </div>
    </div>
  );

  const handleForgotPassword = async () => {
    setError('');
    setInfo('');
    setIsLoading(true);
    try {
      await api.request('/auth/forgot-password', 'POST', { email });
      setInfo('Recovery email sent. Check your inbox.');
      setTimeout(() => setInfo(''), 4000);
      setTimeout(() => setView(ViewState.REVERIFY), 800);
    } catch (err: any) {
      setError(err.message || 'Failed to start recovery');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const renderForgot = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h2 className={`text-2xl font-black tracking-tighter mb-1 leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>Vault Recovery</h2>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Restore Access to Assets</p>
      </div>

      <div className={`${darkMode ? 'bg-red-500/5 border-red-900/20' : 'bg-red-50 border-red-100'} p-4 rounded-xl border mb-4`}>
        <div className="flex gap-3 items-start">
          <div className="p-1.5 bg-red-600 rounded-lg text-white">
            <Globe size={16} />
          </div>
          <div>
            <h4 className="font-bold text-xs mb-0.5 text-red-600">Encrypted Reset</h4>
            <p className="text-[10px] text-gray-500 leading-relaxed">For security, we will send an encrypted recovery sequence to your verified email address.</p>
          </div>
        </div>
      </div>

      <AuthInput icon={<Mail size={16} />} label="Verification Email" type="email" value={email} onChange={setEmail} darkMode={darkMode} />

      <div className="mt-3 h-3">
        {error && <span className="text-[9px] font-black uppercase text-red-500">{error}</span>}
        {info && <span className="text-[9px] font-black uppercase text-emerald-500">{info}</span>}
      </div>

      <div className="mt-4">
        <button
          onClick={handleForgotPassword}
          disabled={isLoading || !email}
          className="w-full bg-red-600 text-white font-black uppercase tracking-widest py-3.5 rounded-xl shadow-xl hover:bg-red-700 active:scale-95 transition-all text-[10px] disabled:opacity-50"
        >
          {isLoading ? 'Sending Link...' : 'Begin Recovery'}
        </button>
      </div>
    </div>
  );

  const renderReverify = () => (
    <div className="animate-in zoom-in-95 duration-700 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="relative mb-6">
        <div className="absolute -inset-3 bg-red-600/20 rounded-full blur-xl animate-pulse"></div>
        <div className={`relative w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center animate-[spin_10s_linear_infinite] ${darkMode ? 'border-red-900/40' : 'border-red-200'}`}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <AlertTriangle size={32} className="text-red-600" />
        </div>
      </div>

      <h2 className={`text-xl font-black tracking-tighter mb-2 leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>Verification Interrupted</h2>
      <p className="text-xs text-gray-500 font-medium mb-4 max-w-[280px] leading-relaxed">
        A verification issue was detected. You can recalibrate your connection or request a new secure link.
      </p>

      {info && (
        <p className="text-[10px] font-black uppercase text-emerald-500 mb-4">
          {info}
        </p>
      )}
      {error && !info && (
        <p className="text-[10px] font-black uppercase text-red-500 mb-4">
          {error}
        </p>
      )}

      <div className="w-full space-y-2 px-4">
        <button onClick={() => setView(ViewState.SIGN_IN)} className="w-full bg-red-600 text-white font-black uppercase tracking-widest py-3 rounded-xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all text-[10px]">
          <RefreshCw size={14} />
          Recalibrate & Retry
        </button>
        <button onClick={() => setView(ViewState.SUPPORT)} className={`w-full font-black uppercase tracking-widest py-3 rounded-xl border-2 text-[10px] transition-all ${darkMode ? 'border-gray-800 text-gray-400 hover:bg-gray-800' : 'border-gray-100 text-gray-500 hover:bg-gray-50'
          }`}>
          Contact Concierge
        </button>
        <button
          onClick={async () => {
            setError('');
            setInfo('');
            setIsLoading(true);
            try {
              await api.request('/auth/resend-verification', 'POST', { email });
              setInfo('New verification email sent. Check your inbox.');
              setTimeout(() => setInfo(''), 4000);
            } catch (err: any) {
              setError(err.message || 'Unable to resend verification email');
              setTimeout(() => setError(''), 3000);
            } finally {
              setIsLoading(false);
            }
          }}
          disabled={isLoading || !email}
          className="w-full text-[9px] font-black uppercase tracking-widest py-2.5 rounded-lg border border-dashed border-red-500/50 text-red-600 disabled:opacity-50"
        >
          {isLoading ? 'Sending...' : 'Resend Verification Email'}
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-full p-4 flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-50'}`}>
      <div className="mb-4 flex justify-between items-center">
        {currentView !== ViewState.SIGN_IN && currentView !== ViewState.REVERIFY ? (
          <button onClick={() => setView(ViewState.SIGN_IN)} className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-900'}`}>
            <ArrowLeft size={24} />
          </button>
        ) : <div />}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-900'}`}
        >
          {darkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>

      {currentView === ViewState.SIGN_IN && renderSignIn()}
      {currentView === ViewState.FORGOT_PASSWORD && renderForgot()}
      {currentView === ViewState.REVERIFY && renderReverify()}
    </div>
  );
}

const PasswordStrengthIndicator = ({ strength, darkMode }: { strength: any; darkMode: boolean }) => {
  const getStrengthColor = () => {
    switch (strength.strength) {
      case 'weak':
        return darkMode ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-red-50 border-red-200 text-red-600';
      case 'medium':
        return darkMode ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' : 'bg-yellow-50 border-yellow-200 text-yellow-600';
      case 'strong':
        return darkMode ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600';
      default:
        return darkMode ? 'bg-gray-500/20 border-gray-500/50' : 'bg-gray-50 border-gray-200';
    }
  };

  const getStrengthLabel = () => {
    switch (strength.strength) {
      case 'weak':
        return 'Weak';
      case 'medium':
        return 'Medium';
      case 'strong':
        return 'Strong';
      default:
        return '';
    }
  };

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="flex items-center gap-2">
        <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
          <div
            className={`h-full transition-all duration-300 ${
              strength.strength === 'weak' ? 'bg-red-500' :
              strength.strength === 'medium' ? 'bg-yellow-500' :
              'bg-emerald-500'
            }`}
            style={{ width: `${strength.score}%` }}
          />
        </div>
        <span className={`text-[9px] font-black uppercase tracking-widest ${getStrengthColor()}`}>
          {getStrengthLabel()}
        </span>
      </div>

      {/* Feedback Messages */}
      {strength.feedback.length > 0 && (
        <div className={`text-[8px] space-y-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {strength.feedback.slice(0, 3).map((msg: string, idx: number) => (
            <div key={idx} className="flex items-center gap-1">
              <span className="text-red-500">•</span>
              <span>{msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AuthInput = ({ icon, label, type, value, onChange, showToggle, onToggle, darkMode }: any) => (
  <div className="relative group">
    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1 block">{label}</label>
    <div className="relative flex items-center">
      <div className={`absolute left-0 transition-colors ${darkMode ? 'text-gray-700' : 'text-gray-300'} group-focus-within:text-red-600`}>
        {icon}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-transparent border-b-2 py-2 pl-7 pr-8 outline-none font-bold text-xs transition-all ${darkMode ? 'border-gray-800 text-white focus:border-red-600' : 'border-gray-200 text-gray-900 focus:border-red-600'
          }`}
      />
      {showToggle && (
        <button onClick={onToggle} className="absolute right-0 text-gray-500 hover:text-red-600 transition-colors">
          {type === 'password' ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
      )}
    </div>
  </div>
);