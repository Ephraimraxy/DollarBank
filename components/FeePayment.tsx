
import React, { useState } from 'react';
import { ArrowLeft, Clock, CreditCard, Ticket, X } from 'lucide-react';

interface Props {
  onBack: () => void;
  darkMode: boolean;
}

// Fixed Props interface to include darkMode
export default function FeePayment({ onBack, darkMode }: Props) {
  const [method, setMethod] = useState<'CARD' | 'VOUCHER'>('VOUCHER');
  const [voucherCode, setVoucherCode] = useState('000000 000000 000000');

  return (
    <div className={`min-h-full flex flex-col pb-6 transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} px-4 pt-4 pb-2`}>
         <div className="flex justify-end">
            <button onClick={onBack}>
                <X className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} w-6 h-6`} />
            </button>
         </div>
      </div>

      <div className="px-5 flex-1 overflow-y-auto">
        {/* Title Section */}
        <div className="mb-6">
            <div className="flex items-start gap-2 mb-2">
                <div className="mt-1">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 8V12" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 16H12.01" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <h1 className={`text-xl font-extrabold leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>Wire Transfer Fee Payment Required</h1>
            </div>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm leading-relaxed pl-8`}>
                Complete this compulsory fee payment to release funds to the recipient.
            </p>
        </div>

        {/* Timer */}
        <div className={`${darkMode ? 'bg-orange-950/20 border-orange-900/40' : 'bg-[#FFFBEB] border-[#FEF3C7]'} border rounded-xl p-4 mb-6 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
                <Clock className="text-[#D97706]" size={20} />
                <span className={`font-bold text-sm ${darkMode ? 'text-orange-400' : 'text-[#92400E]'}`}>Time Remaining</span>
            </div>
            <div className={`${darkMode ? 'bg-orange-900/40 text-orange-300' : 'bg-[#FEF3C7] text-[#92400E]'} px-3 py-1 rounded-lg text-sm font-bold`}>
                23h 57m
            </div>
        </div>
        <div className={`text-xs p-3 rounded-lg -mt-4 mb-6 border-x border-b ${darkMode ? 'bg-orange-950/20 border-orange-900/40 text-orange-400/80' : 'bg-[#FFFBEB] border-[#FEF3C7] text-[#92400E]'}`}>
            Fee must be paid before expiration or the transfer will be cancelled.
        </div>

        {/* Method Selection */}
        <div className="flex gap-4 mb-6">
            <button 
                onClick={() => setMethod('CARD')}
                className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    method === 'CARD' 
                    ? 'border-red-500 bg-red-500/10 text-red-500' 
                    : `${darkMode ? 'border-gray-800 bg-gray-900 text-gray-500 hover:border-gray-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`
                }`}
            >
                <CreditCard size={24} />
                <span className="font-bold text-sm">Card Payment</span>
            </button>
            <button 
                onClick={() => setMethod('VOUCHER')}
                className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                    method === 'VOUCHER' 
                    ? 'border-red-500 bg-red-500/10 text-red-500' 
                    : `${darkMode ? 'border-gray-800 bg-gray-900 text-gray-500 hover:border-gray-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`
                }`}
            >
                <Ticket size={24} />
                <span className="font-bold text-sm">Voucher Code</span>
            </button>
        </div>

        {/* Input Section */}
        <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} p-5 rounded-2xl border shadow-sm mb-6`}>
            <div className="flex items-center gap-2 mb-2">
                <Ticket size={18} className={`${darkMode ? 'text-gray-200' : 'text-gray-900'}`} />
                <h3 className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Card Voucher Code</h3>
            </div>
            <p className="text-gray-500 text-xs mb-6">
                Enter the 18-digit voucher code generated by your bank
            </p>

            <label className={`block text-xs font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                Voucher Code
            </label>
            <input 
                type="text" 
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                className={`w-full border rounded-lg py-3 px-4 text-center font-mono text-lg tracking-widest focus:outline-none focus:border-red-500 mb-4 ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
            />

            <p className="text-gray-400 text-[10px] leading-relaxed">
                Enter the 18-digit code provided by your bank to process this payment.
            </p>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="px-5 mt-auto flex gap-4">
        <button 
            onClick={onBack}
            className={`flex-1 py-4 rounded-xl border font-bold transition-colors ${darkMode ? 'border-gray-800 bg-gray-900 text-gray-300 hover:bg-gray-800' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
        >
            Back
        </button>
        <button 
            className="flex-1 py-4 rounded-xl bg-red-600 text-white font-bold shadow-lg shadow-red-900/20 hover:bg-red-700 active:scale-95 transition-all"
        >
            Pay $300.00
        </button>
      </div>
    </div>
  );
}
