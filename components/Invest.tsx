import React, { useState, useMemo } from 'react';
import { TrendingUp, PieChart, Plus, Search, Newspaper, ChevronRight, X, ArrowUpRight, ArrowDownLeft, ShieldCheck, Globe, Cpu, Bitcoin, AlertCircle } from 'lucide-react';

interface Props {
  darkMode: boolean;
}

interface Asset {
  name: string;
  symbol: string;
  price: number;
  change: string;
  trend: 'up' | 'down';
}

interface NewsItem {
  id: number;
  category: 'Tech' | 'Global' | 'Crypto';
  title: string;
  source: string;
  snippet: string;
  time: string;
}

const Sparkline = ({ trend, color, price, symbol }: { trend: 'up' | 'down', color: string, price: number, symbol: string }) => {
  const [hoverX, setHoverX] = useState<number | null>(null);
  
  const points = trend === 'up' 
    ? [20, 18, 22, 15, 10, 12, 5]
    : [5, 12, 10, 18, 22, 18, 25];
  
  const pathData = points.map((p, i) => `${i * 10},${p}`).join(' ');

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setHoverX(x);
  };

  const currentPointPrice = useMemo(() => {
    if (hoverX === null) return null;
    const index = Math.min(6, Math.max(0, Math.floor(hoverX / (60 / 6))));
    const variance = (points[index] - 15) / 10;
    return price + (price * variance * 0.05);
  }, [hoverX, price, points]);

  return (
    <div className="relative group cursor-crosshair" onMouseLeave={() => setHoverX(null)}>
      <svg 
        width="60" height="30" viewBox="0 0 60 30" 
        className="overflow-visible"
        onMouseMove={handleMouseMove}
      >
        <path
          d={`M ${pathData}`}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_4px_rgba(0,0,0,0.1)] transition-all duration-300"
        />
        {hoverX !== null && (
          <line x1={hoverX} y1="0" x2={hoverX} y2="30" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2" className="text-gray-400" />
        )}
      </svg>
      {hoverX !== null && currentPointPrice && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] font-black py-1 px-2 rounded-lg shadow-xl border border-white/10 whitespace-nowrap z-50 animate-in fade-in zoom-in-95">
          ${currentPointPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      )}
    </div>
  );
};

export default function Invest({ darkMode }: Props) {
  const [newsTab, setNewsTab] = useState<'Tech' | 'Global' | 'Crypto'>('Tech');
  const [orderType, setOrderType] = useState<'BUY' | 'SELL' | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [orderModal, setOrderModal] = useState(false);
  const [activeArticle, setActiveArticle] = useState<NewsItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const assets: Asset[] = [
    { name: 'Apple Inc.', symbol: 'AAPL', price: 189.42, change: '+1.24%', trend: 'up' },
    { name: 'Bitcoin', symbol: 'BTC', price: 64210.00, change: '-2.45%', trend: 'down' },
    { name: 'Nvidia', symbol: 'NVDA', price: 942.12, change: '+5.12%', trend: 'up' },
    { name: 'S&P 500 Index', symbol: 'VOO', price: 482.31, change: '+0.15%', trend: 'up' },
  ];

  const news: NewsItem[] = [
    { id: 1, category: 'Tech', title: 'AI Infrastructure Shifts', source: 'Vault Research', snippet: 'Private Equity shifts toward AI infrastructure as sector matures.', time: '2h ago' },
    { id: 2, category: 'Tech', title: 'Quantum Computing Breakthrough', source: 'Digital Assets Daily', snippet: 'New security protocols emerging for high-frequency trading.', time: '5h ago' },
    { id: 3, category: 'Global', title: 'European Market Liquidity', source: 'Global Desk', snippet: 'European central banks hint at potential rate cooling.', time: '1h ago' },
    { id: 4, category: 'Global', title: 'Emerging Markets Surge', source: 'Vault Insights', snippet: 'Southeast Asian startups see record series C funding.', time: '8h ago' },
    { id: 5, category: 'Crypto', title: 'ETF Inflows Hit Record', source: 'Crypto Core', snippet: 'Institutional capital continues to flood spot Bitcoin products.', time: '30m ago' },
    { id: 6, category: 'Crypto', title: 'Layer 2 Scalability', source: 'Eth News', snippet: 'New roll-up technology reduces transaction finality to milliseconds.', time: '4h ago' },
  ];

  const filteredNews = news.filter(n => n.category === newsTab);

  const handleExecuteOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setOrderSuccess(true);
      setTimeout(() => {
        setOrderSuccess(false);
        setOrderModal(false);
        setOrderType(null);
      }, 2000);
    }, 1500);
  };

  return (
    <div className={`min-h-full pb-20 transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-white' : 'bg-gray-50'}`}>
      {/* Portfolio Header */}
      <div className="p-4">
        <div className={`rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden transition-all duration-500 border border-white/5 ${
          darkMode 
            ? 'bg-gradient-to-br from-[#120303] via-[#1a0505] to-[#260808]' 
            : 'bg-gradient-to-br from-[#1a1a1a] via-[#2d0a0a] to-[#450a0a]'
        }`}>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-red-200/50 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Portfolio Valuation</p>
                <h2 className="text-3xl font-black tracking-tighter leading-none">$21,492.50</h2>
              </div>
              <div className="bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-emerald-500/20 backdrop-blur-md">
                <TrendingUp size={14} />
                <span className="text-xs font-black">+18.2%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                 <p className="text-[10px] text-red-100/40 uppercase font-black tracking-widest mb-1">Today's P/L</p>
                 <p className="text-lg font-bold text-emerald-400">+$420.12</p>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-sm">
                 <p className="text-[10px] text-red-100/40 uppercase font-black tracking-widest mb-1">Buying Power</p>
                 <p className="text-lg font-bold text-white">$1,250.00</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => { setOrderType('BUY'); setOrderModal(true); }}
            className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} flex flex-col items-center justify-center p-4 rounded-2xl shadow-sm border active:scale-95 transition-all`}
          >
            <div className={`${darkMode ? 'bg-emerald-500/10' : 'bg-emerald-100'} w-10 h-10 text-emerald-600 rounded-full flex items-center justify-center mb-2`}>
              <Plus size={20} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-tight ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Buy Asset</span>
          </button>
          <button 
            onClick={() => { setOrderType('SELL'); setOrderModal(true); }}
            className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} flex flex-col items-center justify-center p-4 rounded-2xl shadow-sm border active:scale-95 transition-all`}
          >
            <div className={`${darkMode ? 'bg-red-500/10' : 'bg-red-100'} w-10 h-10 text-red-600 rounded-full flex items-center justify-center mb-2`}>
              <ArrowUpRight size={20} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-tight ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Sell Asset</span>
          </button>
          <button className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} flex flex-col items-center justify-center p-4 rounded-2xl shadow-sm border active:scale-95 transition-all`}>
            <div className={`${darkMode ? 'bg-purple-500/10' : 'bg-purple-100'} w-10 h-10 text-purple-600 rounded-full flex items-center justify-center mb-2`}>
              <PieChart size={20} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-tight ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Allocation</span>
          </button>
        </div>
      </div>

      {/* Watchlist */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className={`font-black text-xs uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Equity Holdings</h3>
          <button className="text-red-600 text-[10px] font-black uppercase tracking-widest hover:underline">Market Data</button>
        </div>
        <div className="space-y-3">
          {assets.map((asset) => (
            <div key={asset.symbol} className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} p-4 rounded-2xl shadow-sm border flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer group`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner transition-colors ${
                  asset.trend === 'up' 
                    ? (darkMode ? 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white') 
                    : (darkMode ? 'bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white' : 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white')
                }`}>
                  {asset.symbol.substring(0, 1)}
                </div>
                <div>
                  <div className={`font-bold text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{asset.name}</div>
                  <div className="text-[10px] text-gray-400 font-black uppercase tracking-tight">{asset.symbol} • Weight 12%</div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div>
                  <Sparkline 
                    trend={asset.trend} 
                    color={asset.trend === 'up' ? '#10b981' : '#ef4444'} 
                    price={asset.price}
                    symbol={asset.symbol}
                  />
                </div>
                <div className="text-right">
                  <div className={`font-black text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>${asset.price.toLocaleString()}</div>
                  <div className={`text-[11px] font-black ${asset.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {asset.change}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market News Feed */}
      <div className="px-4 pb-8">
        <div className="flex flex-col gap-4 mb-4">
          <h3 className={`font-black text-xs uppercase tracking-widest ${darkMode ? 'text-gray-400' : 'text-gray-500'} px-1`}>Market Insights</h3>
          <div className="flex gap-2">
            {(['Tech', 'Global', 'Crypto'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setNewsTab(tab)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  newsTab === tab 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                    : `${darkMode ? 'bg-gray-900 text-gray-400 border-gray-800' : 'bg-white text-gray-500 border-gray-200'} border`
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className={`${darkMode ? 'bg-gray-900 border-gray-800 divide-gray-800' : 'bg-white border-gray-100 divide-gray-50'} rounded-3xl border shadow-sm overflow-hidden divide-y`}>
          {filteredNews.map(item => (
            <div 
              key={item.id} 
              onClick={() => setActiveArticle(item)}
              className={`p-5 flex gap-4 items-center cursor-pointer transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}
            >
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-[10px] text-red-600 font-black uppercase tracking-widest">{item.source}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">{item.time}</p>
                </div>
                <h4 className={`text-sm font-bold leading-snug mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{item.title}</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{item.snippet}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          ))}
        </div>
      </div>

      {/* Order Modal */}
      {orderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setOrderModal(false)}></div>
          <div className={`relative w-full max-w-sm rounded-[40px] border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
            <div className={`p-8 text-center border-b ${darkMode ? 'border-gray-800' : 'border-gray-50'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                orderType === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {orderType === 'BUY' ? <ArrowDownLeft size={32} /> : <ArrowUpRight size={32} />}
              </div>
              <h3 className={`text-xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {orderType} Asset
              </h3>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Asset Symbol</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input 
                    type="text" placeholder="e.g. BTC, AAPL"
                    className={`w-full py-3.5 pl-10 pr-4 rounded-2xl border outline-none font-bold text-sm ${
                      darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Quantity</label>
                  <input 
                    type="number" placeholder="0.00"
                    className={`w-full py-3.5 px-4 rounded-2xl border outline-none font-bold text-sm ${
                      darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Order Type</label>
                  <select className={`w-full py-3.5 px-4 rounded-2xl border outline-none font-bold text-sm appearance-none ${
                      darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200'
                    }`}>
                    <option>Market</option>
                    <option>Limit</option>
                  </select>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border flex items-center gap-3 ${darkMode ? 'bg-gray-800/50 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                <AlertCircle size={18} className="text-red-500" />
                <p className="text-[10px] text-gray-500 font-bold leading-tight uppercase">Executing this order will lock funds until settlement.</p>
              </div>

              <button 
                onClick={handleExecuteOrder}
                disabled={isProcessing}
                className={`w-full py-5 rounded-[24px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all relative overflow-hidden ${
                  orderSuccess ? 'bg-emerald-500 text-white' : 'bg-red-600 text-white hover:bg-red-700 active:scale-95'
                }`}
              >
                {isProcessing && <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
                {orderSuccess ? <ShieldCheck size={18} /> : null}
                {orderSuccess ? 'Order Filled' : isProcessing ? 'Verifying...' : `Execute ${orderType}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Article Preview Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={() => setActiveArticle(null)}></div>
          <div className={`relative w-full max-w-md rounded-[40px] border shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in slide-in-from-bottom-8 duration-500 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
            <button 
              onClick={() => setActiveArticle(null)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
            >
              <X size={24} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>
            <div className="p-10 overflow-y-auto no-scrollbar">
               <div className="flex items-center gap-3 mb-6">
                 {activeArticle.category === 'Tech' ? <Cpu size={24} className="text-red-600" /> : activeArticle.category === 'Crypto' ? <Bitcoin size={24} className="text-red-600" /> : <Globe size={24} className="text-red-600" />}
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600">{activeArticle.category} Division</span>
               </div>
               <h3 className={`text-2xl font-black leading-tight tracking-tighter mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{activeArticle.title}</h3>
               <div className={`space-y-4 text-sm font-medium leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                 <p>{activeArticle.snippet}</p>
                 <p>Market analysts from the vault_id intelligence division suggest a major pivot in sector dynamics. Our proprietary data indicates a 14% increase in institutional interest within this category over the last fiscal quarter.</p>
                 <p>Investors are advised to maintain current allocations while preparing for volatility in the mid-term horizon. Full report available to elite-tier members.</p>
               </div>
               <div className="mt-10 pt-8 border-t border-gray-800/20">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Source: {activeArticle.source} • {activeArticle.time}</p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}