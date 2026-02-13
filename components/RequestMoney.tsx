
import React, { useState } from 'react';
import { ArrowLeft, QrCode, Copy } from 'lucide-react';

interface Props {
  onBack: () => void;
  darkMode: boolean;
}

// Fixed Props interface to include darkMode
export default function RequestMoney({ onBack, darkMode }: Props) {
  const [step, setStep] = useState<'AMOUNT' | 'SHARE'>('AMOUNT');
  const [amount, setAmount] = useState('');

  const handleCreateRequest = () => {
     if (!amount) return;
     setStep('SHARE');
  };

  return (
    <div className={`min-h-full flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} px-4 py-3 flex items-center gap-3 shadow-sm sticky top-0 z-40 border-b`}>
        <button onClick={onBack} className={`p-1 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
          <ArrowLeft className={`w-6 h-6 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`} />
        </button>
        <h1 className="text-lg font-bold">Request Money</h1>
      </div>

      {step === 'AMOUNT' ? (
        <div className="flex flex-col h-full pt-6 flex-1">
            <div className="px-4">
                <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Request Amount</label>
                <div className="mt-4 flex items-center justify-center">
                <span className="text-4xl font-bold mr-2">$</span>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className={`text-5xl font-bold bg-transparent border-none outline-none w-full text-center placeholder-gray-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}
                    autoFocus
                />
                </div>
            </div>

            <div className="mt-8 px-4">
                 <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} p-4 rounded-xl border mb-4 shadow-sm`}>
                     <label className="text-xs font-bold text-gray-400 uppercase">Memo (Optional)</label>
                     <input 
                        type="text" 
                        placeholder="What is this for?" 
                        className={`w-full mt-2 outline-none font-medium bg-transparent ${darkMode ? 'text-gray-200 placeholder-gray-600' : 'text-gray-700 placeholder-gray-400'}`} 
                     />
                 </div>
            </div>

            <div className="mt-auto p-4">
                <button
                onClick={handleCreateRequest}
                disabled={!amount}
                className="w-full bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 active:scale-95 transition-all"
                >
                Generate Request Link
                </button>
            </div>
        </div>
      ) : (
        <div className="p-6 flex flex-col items-center flex-1">
             <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} p-8 rounded-3xl shadow-xl border flex flex-col items-center w-full max-w-sm`}>
                  <div className={`${darkMode ? 'bg-red-500/10' : 'bg-red-100'} w-16 h-16 rounded-full flex items-center justify-center text-red-600 mb-4`}>
                      <QrCode size={32} />
                  </div>
                  <h2 className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>${parseFloat(amount).toFixed(2)}</h2>
                  <p className="text-gray-500 text-sm mb-6">Request generated successfully</p>

                  <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} w-full p-4 rounded-xl flex items-center justify-between mb-6 border`}>
                      <div className="overflow-hidden">
                          <div className="text-xs text-gray-400 font-bold uppercase mb-1">Payment Link</div>
                          <div className={`text-sm font-mono truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>pay.me/austin/req_829s...</div>
                      </div>
                      <button className={`p-2 rounded-lg transition-colors text-red-600 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-white'}`}>
                          <Copy size={20} />
                      </button>
                  </div>

                  <div className="w-full space-y-3">
                      <button className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-900/20">
                          Share Link
                      </button>
                      <button onClick={onBack} className={`w-full py-3 font-semibold rounded-xl transition-colors ${darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-50'}`}>
                          Done
                      </button>
                  </div>
             </div>
        </div>
      )}
    </div>
  );
}
