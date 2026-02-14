import React, { useState, useRef, useEffect } from 'react';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { ViewState } from '../types';
import { api } from '../src/lib/api';

interface Props {
  email: string;
  setView: (view: ViewState) => void;
  onLogin: () => void;
  setUser: (user: any) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function VerifyOTP({ email, setView, onLogin, setUser, darkMode, setDarkMode }: Props) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    setError('');

    // Focus last filled input or next empty
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();

    // Auto-submit if 6 digits
    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await api.request('/auth/verify-otp', 'POST', { email, otp: code });
      
      const { user, token } = response;

      // Normalize user shape
      const normalizedUser = {
        ...user,
        fullName: user.fullName || user.full_name || '',
        isAdmin: user.isAdmin || user.is_admin || false,
      };

      localStorage.setItem('vault_token', token);
      localStorage.setItem('vault-id-user-identity', JSON.stringify(normalizedUser));
      localStorage.removeItem('pending-verification-email'); // Clean up
      setUser(normalizedUser);
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Invalid OTP code');
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    setIsResending(true);

    try {
      await api.request('/auth/resend-otp', 'POST', { email });
      setInfo('New OTP code sent to your email');
      setTimeout(() => setInfo(''), 4000);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={`min-h-full p-4 flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-50'}`}>
      <div className="mb-4 flex justify-between items-center">
        <button 
          onClick={() => setView(ViewState.SIGN_UP)} 
          className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-900'}`}
        >
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-xl transition-colors ${darkMode ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-900'}`}
        >
          {darkMode ? <span>☀️</span> : <span>🌙</span>}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              darkMode ? 'bg-red-600/20 border border-red-500/30' : 'bg-red-100'
            }`}>
              <Mail size={32} className={darkMode ? 'text-red-400' : 'text-red-600'} />
            </div>
          </div>

          {/* Title */}
          <h2 className={`text-2xl font-black tracking-tighter mb-1 leading-tight text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Verify Your Email
          </h2>
          <p className="text-xs text-gray-500 text-center mb-6">
            We sent a 6-digit code to <span className="font-bold text-gray-700 dark:text-gray-300">{email}</span>
          </p>

          {/* OTP Input */}
          <div className="mb-4">
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={`w-12 h-14 text-center text-2xl font-black rounded-xl border-2 transition-all ${
                    darkMode
                      ? 'bg-gray-900 border-gray-800 text-white focus:border-red-600 focus:bg-gray-800'
                      : 'bg-white border-gray-200 text-gray-900 focus:border-red-600 focus:bg-gray-50'
                  } ${error ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="mb-4 min-h-[20px] text-center">
            {error && (
              <p className="text-[9px] font-black uppercase text-red-500 animate-pulse">
                {error}
              </p>
            )}
            {info && (
              <p className="text-[9px] font-black uppercase text-emerald-500">
                {info}
              </p>
            )}
          </div>

          {/* Verify Button */}
          <button
            onClick={() => handleVerify()}
            disabled={isLoading || otp.join('').length !== 6}
            className="w-full bg-red-600 text-white font-black uppercase tracking-widest py-3.5 rounded-xl shadow-xl hover:bg-red-700 active:scale-95 transition-all text-[10px] disabled:opacity-50 disabled:cursor-not-allowed mb-3"
          >
            {isLoading ? 'Verifying...' : 'Verify & Continue'}
          </button>

          {/* Resend */}
          <div className="text-center">
            <p className="text-[9px] text-gray-500 mb-2">Didn't receive the code?</p>
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-[9px] font-black uppercase tracking-widest text-red-600 hover:underline disabled:opacity-50 flex items-center gap-1.5 mx-auto"
            >
              <RefreshCw size={12} className={isResending ? 'animate-spin' : ''} />
              {isResending ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

