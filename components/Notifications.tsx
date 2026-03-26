
import React from 'react';
import { ArrowLeft, Bell, AlertCircle, Info, CheckCircle, ChevronRight } from 'lucide-react';
import { ViewState } from '../types';

interface Props {
  onBack: () => void;
  onSupport: () => void;
  darkMode: boolean;
}

// Fixed Props interface to include darkMode
export default function Notifications({ onBack, onSupport, darkMode }: Props) {
  return (
    <div className={`min-h-full transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-50'}`}>
      <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-40 border-b`}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className={`p-1 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
            <ArrowLeft className={`w-6 h-6 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`} />
          </button>
          <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Notifications</h1>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('vault_recent_transfer');
            window.location.reload();
          }}
          className="text-red-600 text-sm font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="p-4 space-y-4">
        {localStorage.getItem('vault_recent_transfer') && (
          (() => {
            const tx = JSON.parse(localStorage.getItem('vault_recent_transfer')!);
            return (
              <div 
                className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} p-4 rounded-xl border-l-4 border-l-orange-500 shadow-sm animate-in slide-in-from-top-4 duration-500 border`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-orange-500" />
                    <span className={`font-bold text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Action Required</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Just Now</span>
                </div>
                <p className={`text-[12px] font-bold mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  CONTACT ACCOUNT MANAGER FOR APPROVAL of your recent transfer of ${tx.amount.toLocaleString()}.
                </p>
                <div onClick={onSupport} className="mt-3 flex items-center text-red-600 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:underline">
                  Contact Support <ChevronRight size={12} />
                </div>
              </div>
            );
          })()
        )}

        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Today</div>
        
        <div 
            onClick={() => {
                window.dispatchEvent(new CustomEvent('navigate-fee-payment'));
            }}
            className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} p-4 rounded-xl border-l-4 border-l-red-500 shadow-sm cursor-pointer hover:bg-opacity-80 transition-colors border`}
        >
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" />
              <span className={`font-bold text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Action Required</span>
            </div>
            <span className="text-xs text-gray-400">2m ago</span>
          </div>
          <p className={`text-sm mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Your international transfer of $4,200.00 is pending. A tax clearance code is required to complete this transaction.
          </p>
          <div className="flex items-center text-red-600 text-xs font-bold uppercase tracking-wide">
            Resolve Issue <ChevronRight size={14} />
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} p-4 rounded-xl border shadow-sm`}>
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-blue-500" />
              <span className={`font-bold text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Security Alert</span>
            </div>
            <span className="text-xs text-gray-400">2h ago</span>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            New device signed in from Houston, TX. Was this you?
          </p>
        </div>

        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-6">Yesterday</div>

        <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} p-4 rounded-xl border shadow-sm opacity-75`}>
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              <span className={`font-bold text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Payment Received</span>
            </div>
            <span className="text-xs text-gray-400">1d ago</span>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            You received $142.50 from Sarah Jenkins.
          </p>
        </div>
      </div>
    </div>
  );
}
