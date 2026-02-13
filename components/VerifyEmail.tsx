import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Loader2, Mail } from 'lucide-react';
import { api } from '../src/lib/api';
import { ViewState } from '../types';

interface Props {
  setView: (view: ViewState) => void;
  darkMode: boolean;
}

export default function VerifyEmail({ setView, darkMode }: Props) {
  const [status, setStatus] = useState<'PENDING' | 'SUCCESS' | 'ERROR'>('PENDING');
  const [message, setMessage] = useState('Verifying your secure identity token...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      setStatus('ERROR');
      setMessage('Missing or invalid verification token.');
      return;
    }

    const verify = async () => {
      try {
        await api.request('/auth/verify-email', 'POST', { token });
        setStatus('SUCCESS');
        setMessage('Your email has been verified successfully.');
      } catch (err: any) {
        setStatus('ERROR');
        setMessage(err.message || 'Verification failed. The link may have expired.');
      }
    };

    verify();
  }, []);

  const isSuccess = status === 'SUCCESS';
  const isError = status === 'ERROR';

  return (
    <div className={`min-h-full p-8 flex flex-col items-center justify-center text-center transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-xs w-full">
        <div className="mb-8">
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
            isSuccess
              ? darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
              : isError
              ? darkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
              : darkMode ? 'bg-gray-900 text-red-400' : 'bg-white text-red-600'
          }`}>
            {status === 'PENDING' && <Loader2 size={32} className="animate-spin" />}
            {isSuccess && <CheckCircle2 size={36} />}
            {isError && <AlertTriangle size={36} />}
          </div>
          <h2 className="text-2xl font-black tracking-tighter mb-2">
            {status === 'PENDING' && 'Verifying Access'}
            {isSuccess && 'Identity Verified'}
            {isError && 'Verification Issue'}
          </h2>
          <p className="text-sm font-medium text-gray-500">
            {message}
          </p>
        </div>

        <button
          onClick={() => setView(ViewState.SIGN_IN)}
          className="w-full bg-red-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-2xl hover:bg-red-700 active:scale-95 transition-all text-xs flex items-center justify-center gap-2"
        >
          <Mail size={16} />
          Return to Secure Sign In
        </button>
      </div>
    </div>
  );
}


