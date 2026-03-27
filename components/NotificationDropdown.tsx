
import React, { useEffect, useRef } from 'react';
import { Bell, ChevronRight, X, AlertCircle } from 'lucide-react';

interface Props {
  onClose: () => void;
  onViewAll: () => void;
  darkMode: boolean;
}

export default function NotificationDropdown({ onClose, onViewAll, darkMode }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const transactions: any[] = JSON.parse(localStorage.getItem('vault_transfer_history') || '[]');
  const totalCount = transactions.length * 3; // VAT + Urgent + Success per tx

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay adding listener so the current click doesn't immediately close
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200" />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`absolute top-0 right-0 left-0 max-w-md mx-auto flex flex-col animate-in slide-in-from-top-4 duration-300 ease-out ${
          darkMode ? 'bg-gray-950' : 'bg-white'
        }`}
        style={{ maxHeight: '55dvh' }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b shrink-0 ${
          darkMode ? 'border-gray-800' : 'border-gray-100'
        }`}>
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-red-600" />
            <h2 className={`text-sm font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Notifications
            </h2>
            {totalCount > 0 && (
              <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
                {totalCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable preview list */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 space-y-2.5">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 opacity-50">
              <Bell size={28} className="text-gray-400 mb-2" />
              <p className={`text-xs font-bold ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No notifications yet</p>
            </div>
          ) : (
            transactions.map((tx: any, idx: number) => {
              const amt = parseFloat(tx.amount);
              const baseFee = amt * 0.10;
              const vatFee = baseFee * 0.10;
              const totalFee = baseFee + vatFee;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border-l-4 border-l-red-500 border transition-all ${
                    darkMode
                      ? 'bg-gray-900/80 border-gray-800 hover:bg-gray-900'
                      : 'bg-gray-50 border-gray-100 hover:bg-white'
                  }`}
                >
                  {/* Compact preview row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <AlertCircle size={12} className="text-red-500 shrink-0" />
                        <span className={`text-[11px] font-black uppercase tracking-tight truncate ${
                          darkMode ? 'text-gray-100' : 'text-gray-900'
                        }`}>
                          Action Required: Transfer to {tx.recipientName}
                        </span>
                      </div>
                      <p className={`text-[10px] leading-snug font-semibold line-clamp-2 ${
                        darkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        ${amt.toFixed(2)} → {tx.recipientName} · Fee: ${totalFee.toFixed(2)} · Pending Audit
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-[9px] text-gray-400 font-medium">Now</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Static notification previews */}
          <div className={`p-3 rounded-xl border transition-all ${
            darkMode
              ? 'bg-gray-900/80 border-gray-800'
              : 'bg-gray-50 border-gray-100'
          }`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertCircle size={12} className="text-red-500 shrink-0" />
                  <span className={`text-[11px] font-black uppercase tracking-tight truncate ${
                    darkMode ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    Action Required
                  </span>
                </div>
                <p className={`text-[10px] leading-snug font-semibold line-clamp-1 ${
                  darkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  International transfer of $4,200.00 pending tax clearance...
                </p>
              </div>
              <span className="text-[9px] text-gray-400 font-medium shrink-0">2m</span>
            </div>
          </div>

          <div className={`p-3 rounded-xl border transition-all ${
            darkMode
              ? 'bg-gray-900/80 border-gray-800'
              : 'bg-gray-50 border-gray-100'
          }`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  </div>
                  <span className={`text-[11px] font-black uppercase tracking-tight truncate ${
                    darkMode ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    Security Alert
                  </span>
                </div>
                <p className={`text-[10px] leading-snug font-semibold line-clamp-1 ${
                  darkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  New device signed in from Houston, TX. Was this you?
                </p>
              </div>
              <span className="text-[9px] text-gray-400 font-medium shrink-0">2h</span>
            </div>
          </div>
        </div>

        {/* Sticky "View All" footer */}
        <div className={`shrink-0 border-t px-4 py-3 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
          <button
            onClick={onViewAll}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all font-black text-xs uppercase tracking-widest shadow-lg shadow-red-600/20"
          >
            View All Notifications
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
