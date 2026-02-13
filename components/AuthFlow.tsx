import React, { useState } from 'react';
import { ViewState } from '../types';
import { Mail, Lock, User, ArrowLeft, ShieldCheck, RefreshCw, AlertTriangle, Eye, EyeOff, Globe, ChevronRight, Sun, Moon } from 'lucide-react';

interface Props {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  onLogin: () => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

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
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (isRegister: boolean) => {
    setError('');
    setIsLoading(true);
    try {
      let response;
      if (isRegister) {
        response = await api.register({ fullName, email, password });
      } else {
        response = await api.login({ email, password });
      }

      const { user, token } = response;
      localStorage.setItem('vault_token', token);
      localStorage.setItem('vault-id-user-identity', JSON.stringify(user));
      setUser(user); // Update App state
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Authentication Failed');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSignIn = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-12">
        <h2 className={`text-4xl font-black tracking-tighter mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Welcome Back</h2>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Identify Yourself to Continue</p>
      </div>

      <div className="space-y-8">
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

      <div className="mt-12 space-y-4">
        <button onClick={() => handleAuth(false)} disabled={isLoading} className="w-full bg-red-600 text-white font-black uppercase tracking-[0.2em] py-5 rounded-[24px] shadow-2xl hover:bg-red-700 active:scale-95 transition-all text-xs disabled:opacity-50">
          {isLoading ? 'Decrypting...' : 'Open Secure Vault'}
        </button>
        <button onClick={() => setView(ViewState.SIGN_UP)} className={`w-full font-black uppercase tracking-widest py-5 rounded-[24px] border-2 text-xs transition-all ${darkMode ? 'border-gray-800 text-gray-400 hover:bg-gray-800' : 'border-gray-100 text-gray-500 hover:bg-gray-50'
          }`}>
          Create New Identity
        </button>
      </div>
    </div>
  );

  const renderSignUp = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-12">
        <h2 className={`text-4xl font-black tracking-tighter mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>New Account</h2>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Establish your Platinum Identity</p>
      </div>

      <div className="space-y-8">
        <AuthInput icon={<User size={18} />} label="Legal Full Name" type="text" value={fullName} onChange={setFullName} darkMode={darkMode} />
        <AuthInput icon={<Mail size={18} />} label="Secure Email" type="email" value={email} onChange={setEmail} darkMode={darkMode} />
        <AuthInput icon={<Lock size={18} />} label="Vault Passphrase" type="password" value={password} onChange={setPassword} darkMode={darkMode} />
      </div>

      <div className="mt-12 space-y-4">
        <button onClick={() => handleAuth(true)} disabled={isLoading} className="w-full bg-red-600 text-white font-black uppercase tracking-widest py-5 rounded-[24px] shadow-2xl hover:bg-red-700 active:scale-95 transition-all text-xs disabled:opacity-50">
          {isLoading ? 'Registering...' : 'Register Platinum Identity'}
        </button>
        <button onClick={() => setView(ViewState.SIGN_IN)} className={`w-full font-black uppercase tracking-widest py-5 rounded-[24px] border-2 text-xs transition-all ${darkMode ? 'border-gray-800 text-gray-400 hover:bg-gray-800' : 'border-gray-100 text-gray-500 hover:bg-gray-50'
          }`}>
          Already Have Access? Sign In
        </button>
      </div>
    </div>
  );

  const renderForgot = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-12">
        <h2 className={`text-3xl font-black tracking-tighter mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Vault Recovery</h2>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Restore Access to Assets</p>
      </div>

      <div className={`${darkMode ? 'bg-red-500/5 border-red-900/20' : 'bg-red-50 border-red-100'} p-6 rounded-3xl border mb-10`}>
        <div className="flex gap-4 items-start">
          <div className="p-2 bg-red-600 rounded-xl text-white">
            <Globe size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm mb-1 text-red-600">Encrypted Reset</h4>
            <p className="text-xs text-gray-500 leading-relaxed">For security, we will send an encrypted recovery sequence to your verified email address.</p>
          </div>
        </div>
      </div>

      <AuthInput icon={<Mail size={18} />} label="Verification Email" type="email" value="" onChange={() => { }} darkMode={darkMode} />

      <div className="mt-12">
        <button onClick={() => setView(ViewState.REVERIFY)} className="w-full bg-red-600 text-white font-black uppercase tracking-widest py-5 rounded-[24px] shadow-2xl hover:bg-red-700 active:scale-95 transition-all text-xs">
          Begin Recovery
        </button>
      </div>
    </div>
  );

  const renderReverify = () => (
    <div className="animate-in zoom-in-95 duration-700 flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="relative mb-10">
        <div className="absolute -inset-4 bg-red-600/20 rounded-full blur-2xl animate-pulse"></div>
        <div className={`relative w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center animate-[spin_10s_linear_infinite] ${darkMode ? 'border-red-900/40' : 'border-red-200'}`}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <AlertTriangle size={40} className="text-red-600" />
        </div>
      </div>

      <h2 className={`text-2xl font-black tracking-tighter mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Verification Interrupted</h2>
      <p className="text-sm text-gray-500 font-medium mb-10 max-w-[280px]">
        A network instability or security handshake failure was detected. Please recalibrate your connection.
      </p>

      <div className="w-full space-y-4 px-4">
        <button onClick={() => setView(ViewState.SIGN_IN)} className="w-full bg-red-600 text-white font-black uppercase tracking-widest py-5 rounded-[24px] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all text-xs">
          <RefreshCw size={18} />
          Recalibrate & Retry
        </button>
        <button onClick={() => setView(ViewState.SUPPORT)} className={`w-full font-black uppercase tracking-widest py-5 rounded-[24px] border-2 text-xs transition-all ${darkMode ? 'border-gray-800 text-gray-400 hover:bg-gray-800' : 'border-gray-100 text-gray-500 hover:bg-gray-50'
          }`}>
          Contact Concierge
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-full p-8 flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-50'}`}>
      <div className="mb-10 flex justify-between items-center">
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
      {currentView === ViewState.SIGN_UP && renderSignUp()}
      {currentView === ViewState.FORGOT_PASSWORD && renderForgot()}
      {currentView === ViewState.REVERIFY && renderReverify()}
    </div>
  );
}

const AuthInput = ({ icon, label, type, value, onChange, showToggle, onToggle, darkMode }: any) => (
  <div className="relative group">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2 block">{label}</label>
    <div className="relative flex items-center">
      <div className={`absolute left-0 transition-colors ${darkMode ? 'text-gray-700' : 'text-gray-300'} group-focus-within:text-red-600`}>
        {icon}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-transparent border-b-2 py-3 pl-8 pr-10 outline-none font-bold text-sm transition-all ${darkMode ? 'border-gray-800 text-white focus:border-red-600' : 'border-gray-200 text-gray-900 focus:border-red-600'
          }`}
      />
      {showToggle && (
        <button onClick={onToggle} className="absolute right-0 text-gray-500 hover:text-red-600 transition-colors">
          {type === 'password' ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      )}
    </div>
  </div>
);