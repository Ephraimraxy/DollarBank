import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Download, Share2, CheckCircle, Clock, X, ArrowUpRight, ArrowDownLeft, Calendar } from 'lucide-react';

interface Props {
  onBack: () => void;
  darkMode: boolean;
}

interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  time: string;
  type: 'credit' | 'debit';
  status: 'Success' | 'Pending' | 'Failed';
  icon: string;
  reference: string;
  category: string;
}

type TypeFilter = 'ALL' | 'IN' | 'OUT';
type DateFilter = 'ALL' | 'WEEK' | 'MONTH' | 'YEAR';

export default function Activity({ onBack, darkMode }: Props) {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [dateFilter, setDateFilter] = useState<DateFilter>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const transactions: Transaction[] = [
    { id: 'TX982374', name: 'Netflix Subscription', amount: -14.99, date: 'Today', time: '9:41 AM', type: 'debit', status: 'Success', icon: 'N', reference: 'REF-NET-9928', category: 'Entertainment' },
    { id: 'TX982373', name: 'Salary Deposit', amount: 4250.00, date: 'Yesterday', time: '4:30 PM', type: 'credit', status: 'Success', icon: 'S', reference: 'REF-SAL-2938', category: 'Income' },
    { id: 'TX982372', name: 'Walmart Supercenter', amount: -142.80, date: 'Oct 24, 2023', time: '12:20 PM', type: 'debit', status: 'Success', icon: 'W', reference: 'REF-WAL-9921', category: 'Groceries' },
    { id: 'TX982371', name: 'Transfer to Savings', amount: -500.00, date: 'Oct 22, 2023', time: '10:00 AM', type: 'debit', status: 'Success', icon: 'T', reference: 'REF-TRF-1122', category: 'Transfer' },
    { id: 'TX982370', name: 'Shell Station', amount: -45.00, date: 'Oct 20, 2023', time: '6:15 PM', type: 'debit', status: 'Success', icon: 'S', reference: 'REF-GAS-4432', category: 'Transport' },
    { id: 'TX982369', name: 'Wire Transfer Fee', amount: -330.00, date: 'Oct 19, 2023', time: '2:15 PM', type: 'debit', status: 'Pending', icon: 'F', reference: 'REF-FEE-8872', category: 'Fees' },
  ];

  const filteredTransactions = transactions.filter(tx => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      tx.name.toLowerCase().includes(searchLower) || 
      tx.category.toLowerCase().includes(searchLower) || 
      tx.reference.toLowerCase().includes(searchLower);

    const matchesType = typeFilter === 'ALL' || 
      (typeFilter === 'IN' ? tx.type === 'credit' : tx.type === 'debit');

    let matchesDate = true;
    if (dateFilter === 'WEEK') {
      matchesDate = tx.date === 'Today' || tx.date === 'Yesterday';
    } else if (dateFilter === 'MONTH') {
      matchesDate = tx.date === 'Today' || tx.date === 'Yesterday' || tx.date.includes('Oct');
    }

    return matchesSearch && matchesType && matchesDate;
  });

  const renderReceipt = () => {
    if (!selectedTx) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
        <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity"
            onClick={() => setSelectedTx(null)}
        ></div>
        
        <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} w-full max-w-md h-[90vh] sm:h-auto sm:rounded-3xl rounded-t-3xl p-6 relative pointer-events-auto transform transition-transform duration-300 flex flex-col shadow-2xl animate-in slide-in-from-bottom-full`}>
            <div className={`w-12 h-1.5 rounded-full mx-auto mb-6 sm:hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>

            <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Transaction Receipt</h2>
                <button onClick={() => setSelectedTx(null)} className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}>
                    <X size={20} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="flex flex-col items-center mb-8">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                        selectedTx.status === 'Success' 
                          ? (darkMode ? 'bg-green-500/10 text-green-500' : 'bg-green-100 text-green-600') 
                          : (darkMode ? 'bg-orange-500/10 text-orange-500' : 'bg-orange-100 text-orange-600')
                    }`}>
                        {selectedTx.status === 'Success' ? <CheckCircle size={40} /> : <Clock size={40} />}
                    </div>
                    <div className={`text-3xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedTx.type === 'debit' ? '-' : '+'}${Math.abs(selectedTx.amount).toFixed(2)}
                    </div>
                    <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                        selectedTx.status === 'Success' 
                          ? (darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700') 
                          : (darkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700')
                    }`}>
                        {selectedTx.status}
                    </div>
                </div>

                <div className={`space-y-4 border-t pt-6 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                    <div className={`flex justify-between py-2 border-b ${darkMode ? 'border-gray-800/50' : 'border-gray-50'}`}>
                        <span className="text-gray-500 text-sm">To / From</span>
                        <span className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{selectedTx.name}</span>
                    </div>
                    <div className={`flex justify-between py-2 border-b ${darkMode ? 'border-gray-800/50' : 'border-gray-50'}`}>
                        <span className="text-gray-500 text-sm">Date</span>
                        <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{selectedTx.date}, {selectedTx.time}</span>
                    </div>
                    <div className={`flex justify-between py-2 border-b ${darkMode ? 'border-gray-800/50' : 'border-gray-50'}`}>
                        <span className="text-gray-500 text-sm">Category</span>
                        <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{selectedTx.category}</span>
                    </div>
                    <div className={`flex justify-between py-2 border-b ${darkMode ? 'border-gray-800/50' : 'border-gray-50'}`}>
                        <span className="text-gray-500 text-sm">Reference</span>
                        <span className={`font-mono text-xs px-2 py-1 rounded ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>{selectedTx.reference}</span>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex gap-3">
                <button className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-colors ${darkMode ? 'border-gray-800 bg-gray-800 text-gray-300 hover:bg-gray-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}>
                    <Download size={18} />
                    <span>PDF</span>
                </button>
                <button className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors ${darkMode ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-black'}`}>
                    <Share2 size={18} />
                    <span>Share</span>
                </button>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-full flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
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

      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} px-4 pt-4 pb-2 sticky top-0 z-30 shadow-sm border-b`}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className={`p-1 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
            <ArrowLeft className={`w-6 h-6 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`} />
          </button>
          <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Activity History</h1>
        </div>

        <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, category, or ref..."
                className={`w-full border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all ${darkMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-gray-100 text-gray-900 placeholder-gray-400'}`}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
        </div>

        <div className="space-y-3 pb-2 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max">
              {(['ALL', 'IN', 'OUT'] as const).map((f) => (
                  <button
                      key={f}
                      onClick={() => setTypeFilter(f)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        typeFilter === f 
                          ? 'bg-red-600 text-white shadow-md' 
                          : `${darkMode ? 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`
                      }`}
                  >
                      {f === 'ALL' ? 'All Types' : f === 'IN' ? 'Money In' : 'Money Out'}
                  </button>
              ))}
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 pb-24">
        {isLoading ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className={`p-4 rounded-2xl border flex items-center justify-between ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl skeleton-shimmer" />
                  <div className="space-y-2">
                    <div className="w-32 h-4 skeleton-shimmer rounded-md" />
                    <div className="w-24 h-3 skeleton-shimmer rounded-md" />
                  </div>
                </div>
                <div className="w-16 h-4 skeleton-shimmer rounded-md" />
              </div>
            ))}
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="space-y-3 animate-in fade-in duration-300">
              {filteredTransactions.map((tx) => (
                  <div 
                      key={tx.id} 
                      onClick={() => setSelectedTx(tx)}
                      className={`p-4 rounded-2xl shadow-sm border flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all ${darkMode ? 'bg-gray-900 border-gray-800 hover:border-red-900' : 'bg-white border-gray-100 hover:border-red-200'}`}
                  >
                      <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold ${
                              tx.type === 'credit' 
                                ? (darkMode ? 'bg-green-500/10 text-green-500' : 'bg-green-50 text-green-600') 
                                : (darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600')
                          }`}>
                              {tx.type === 'credit' ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
                          </div>
                          <div>
                              <div className={`font-bold text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{tx.name}</div>
                              <div className="text-[11px] text-gray-500 font-medium">{tx.date} • {tx.time}</div>
                          </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-sm ${tx.type === 'credit' ? 'text-green-600' : (darkMode ? 'text-white' : 'text-gray-900')}`}>
                            {tx.type === 'credit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                        </div>
                        {tx.status === 'Pending' && (
                          <div className="text-[9px] font-bold text-orange-500 uppercase tracking-tight">Pending</div>
                        )}
                      </div>
                  </div>
              ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
              <Search className="text-gray-300" size={32} />
            </div>
            <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>No results found</h3>
            <p className="text-gray-500 text-sm mt-1 max-w-[200px]">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>

      {selectedTx && renderReceipt()}
    </div>
  );
}