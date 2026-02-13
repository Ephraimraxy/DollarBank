import React, { useState, useEffect } from 'react';
import { ViewState } from '../types';
import { api } from '../src/lib/api';
import { Eye, EyeOff, ArrowUpRight, ArrowDownLeft, Wallet, ShieldCheck, ChevronRight, TrendingUp, Sparkles } from 'lucide-react';

interface Props {
  user: { fullName?: string };
  onViewChange: (view: ViewState) => void;
  darkMode: boolean;
}

export default function Dashboard({ user, onViewChange, darkMode }: Props) {
  const [showBalance, setShowBalance] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getAccounts();
        if (Array.isArray(data)) {
          setAccounts(data);
        } else {
          console.error('API returned non-array for accounts:', data);
          setAccounts([]);
        }
      } catch (err) {
        console.error('Failed to fetch accounts', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalBalance = Array.isArray(accounts) ? accounts.reduce((sum, acc) => sum + (parseFloat(acc?.balance) || 0), 0) : 0;
  const formattedTotal = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalBalance);

  if (isLoading) {
    return (
      <div className="pb-8 animate-in fade-in duration-500">
        <style>{`
          @keyframes shimmerEffect {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .skeleton-shimmer {
            background: linear-gradient(90deg, 
              ${darkMode ? '#111827' : '#f3f4f6'} 25%, 
              ${darkMode ? '#1f2937' : '#e5e7eb'} 50%, 
              ${darkMode ? '#111827' : '#f3f4f6'} 75%
            );
            background-size: 200% 100%;
            animation: shimmerEffect 1.5s infinite linear;
          }
        `}</style>

        {/* Welcome Greeting Skeleton */}
        <div className="px-6 pt-6 pb-2 space-y-3">
          <div className="w-24 h-3 skeleton-shimmer rounded-full" />
          <div className="w-48 h-8 skeleton-shimmer rounded-xl" />
        </div>

        {/* Balance Card Skeleton */}
        <div className="p-4">
          <div className={`h-56 rounded-[32px] skeleton-shimmer border ${darkMode ? 'border-gray-800' : 'border-gray-100'}`} />
        </div>

        {/* Action Required Skeleton */}
        <div className="px-4 mb-4">
          <div className={`h-20 rounded-2xl skeleton-shimmer border ${darkMode ? 'border-gray-800' : 'border-gray-100'}`} />
        </div>

        {/* Account Lists Skeleton */}
        <div className="px-4 space-y-4">
          <div className="w-28 h-3 skeleton-shimmer rounded-full mb-6 mx-2" />
          {[1, 2].map(i => (
            <div key={i} className={`h-36 rounded-[24px] skeleton-shimmer border ${darkMode ? 'border-gray-800' : 'border-gray-100'}`} />
          ))}
        </div>
      </div>
    );
  }

  const firstName = (user?.fullName || '').split(' ')[0] || 'Guest';

  return (
    <div className="pb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Welcome Greeting */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={14} className="text-red-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">vault_id Active</span>
        </div>
        <h2 className={`text-2xl font-black tracking-tighter ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Welcome, <span className="text-red-600">{firstName}</span>
        </h2>
      </div>

      {/* Balance Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-red-700 via-red-800 to-red-950 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4 opacity-70">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Liquid Assets</span>
              <button onClick={() => setShowBalance(!showBalance)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            <div className="text-4xl font-black mb-8 tracking-tighter">
              {showBalance ? formattedTotal : '••••••••'}
            </div>

            <div className="flex gap-3">
              <button onClick={() => onViewChange(ViewState.TRANSFER)} className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 border border-white/10 shadow-lg">
                <ArrowUpRight size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Send</span>
              </button>
              <button onClick={() => onViewChange(ViewState.REQUEST)} className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-md py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 border border-white/10 shadow-lg">
                <ArrowDownLeft size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Request</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Alert */}
      <div className="px-4 mb-4">
        <div onClick={() => onViewChange(ViewState.FEE_PAYMENT)} className={`border-2 p-4 rounded-2xl flex items-center gap-4 cursor-pointer active:scale-95 transition-all ${darkMode ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-100 hover:bg-red-100'}`}>
          <div className={`p-2 rounded-xl ${darkMode ? 'bg-red-500/20 text-red-500' : 'bg-red-100 text-red-600'}`}>
            <ShieldCheck size={20} />
          </div>
          <div className="flex-1">
            <h4 className={`text-xs font-black uppercase tracking-widest ${darkMode ? 'text-red-400' : 'text-red-700'}`}>Action Required</h4>
            <p className="text-[10px] font-bold text-gray-500">1 Pending Wire Transfer Fee Resolution</p>
          </div>
          <ChevronRight className="text-red-400 opacity-50" size={16} />
        </div>
      </div>

      {/* Accounts */}
      <div className="px-4 space-y-4">
        <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 px-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Private Accounts</h3>
        {accounts.map(acc => (
          <AccountCard
            key={acc.id}
            title={`${acc.type} Account`}
            number={`.... ${acc.account_number.slice(-4)}`}
            balance={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(acc.balance)}
            change="+0.0%"
            showBalance={showBalance}
            darkMode={darkMode}
            onClick={() => onViewChange(ViewState.ACTIVITY)}
          />
        ))}
        {accounts.length === 0 && <div className="text-center text-gray-500 text-xs py-4">No active accounts found.</div>}
      </div>
    </div>
  );
}

const AccountCard = ({ title, number, balance, change, showBalance, darkMode, onClick }: any) => (
  <div onClick={onClick} className={`rounded-[24px] p-6 shadow-xl relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all border ${darkMode
    ? 'bg-gradient-to-br from-gray-900 to-red-950/20 border-red-900/30'
    : 'bg-white border-gray-100'
    }`}>
    <div className="flex justify-between items-start mb-6">
      <div>
        <div className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-red-500/70' : 'text-gray-400'}`}>{title}</div>
        <div className="text-[10px] font-mono text-gray-500 mt-1">{number}</div>
      </div>
      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black border ${darkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
        <TrendingUp size={10} /> {change}
      </div>
    </div>
    <div className={`text-2xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {showBalance ? balance : '••••••••'}
    </div>
  </div>
);