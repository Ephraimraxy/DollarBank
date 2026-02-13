import React, { useEffect, useState } from 'react';
import { Lock, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '../src/lib/api';
import { ViewState } from '../types';

interface Props {
  setView: (view: ViewState) => void;
  darkMode: boolean;
}

export default function ResetPassword({ setView, darkMode }: Props) {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (!t) {
      setStatus('ERROR');
      setMessage('Missing or invalid reset token.');
    } else {
      setToken(t);
    }
  }, []);

  const handleSubmit = async () => {
    if (!token) return;
    if (!password || password.length < 6) {
      setStatus('ERROR');
      setMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setStatus('ERROR');
      setMessage('Passwords do not match.');
      return;
    }

    setStatus('SUBMITTING');
    setMessage('');

    try {
      await api.request('/auth/reset-password', 'POST', { token, newPassword: password });
      setStatus('SUCCESS');
      setMessage('Your password has been updated. You can now sign in with your new credentials.');
    } catch (err: any) {
      setStatus('ERROR');
      setMessage(err.message || 'Unable to reset password. The link may have expired.');
    }
  };

  const isDisabled = !token || status === 'SUBMITTING';

  return (
    <div className={`min-h-full p-4 flex flex-col items-center justify-center text-center transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-xs w-full">
        <div className="mb-6">
          <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${
            status === 'SUCCESS'
              ? darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
              : status === 'ERROR'
              ? darkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
              : darkMode ? 'bg-gray-900 text-red-400' : 'bg-white text-red-600'
          }`}>
            {status === 'SUBMITTING' && <Loader2 size={24} className="animate-spin" />}
            {status === 'SUCCESS' && <CheckCircle2 size={28} />}
            {status === 'ERROR' && <AlertTriangle size={28} />}
            {status === 'IDLE' && <Lock size={24} />}
          </div>
          <h2 className="text-xl font-black tracking-tighter mb-1 leading-tight">
            {status === 'SUCCESS' ? 'Passphrase Updated' : 'Reset Vault Passphrase'}
          </h2>
          <p className="text-xs font-medium text-gray-500 leading-relaxed">
            {status === 'SUCCESS'
              ? message
              : 'Create a new, secure passphrase for your Vault ID account.'}
          </p>
        </div>

        {status !== 'SUCCESS' && (
          <div className="space-y-3 text-left mb-4">
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1 block">
                New Passphrase
              </label>
              <div className="relative flex items-center">
                <div className={`absolute left-0 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`}>
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-transparent border-b-2 py-2 pl-7 pr-2 outline-none font-bold text-xs transition-all ${darkMode ? 'border-gray-800 text-white focus:border-red-600' : 'border-gray-200 text-gray-900 focus:border-red-600'
                    }`}
                />
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1 block">
                Confirm Passphrase
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full bg-transparent border-b-2 py-2 pl-1 pr-2 outline-none font-bold text-xs transition-all ${darkMode ? 'border-gray-800 text-white focus:border-red-600' : 'border-gray-200 text-gray-900 focus:border-red-600'
                  }`}
              />
            </div>
          </div>
        )}

        {message && (
          <p className={`text-[9px] font-black uppercase mb-3 ${
            status === 'ERROR' ? 'text-red-500' : 'text-emerald-500'
          }`}>
            {message}
          </p>
        )}

        {status !== 'SUCCESS' ? (
          <button
            onClick={handleSubmit}
            disabled={isDisabled}
            className="w-full bg-red-600 text-white font-black uppercase tracking-widest py-3 rounded-xl shadow-xl hover:bg-red-700 active:scale-95 transition-all text-[10px] disabled:opacity-50"
          >
            {status === 'SUBMITTING' ? 'Updating...' : 'Update Passphrase'}
          </button>
        ) : (
          <button
            onClick={() => setView(ViewState.SIGN_IN)}
            className="w-full bg-red-600 text-white font-black uppercase tracking-widest py-3 rounded-xl shadow-xl hover:bg-red-700 active:scale-95 transition-all text-[10px]"
          >
            Return to Sign In
          </button>
        )}
      </div>
    </div>
  );
}


