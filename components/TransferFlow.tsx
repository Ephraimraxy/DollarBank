import React, { useState, useMemo } from 'react';
import { ArrowLeft, User, Search, Check, ChevronRight, Calendar, Info, Trash2, Edit2, Plus, AlertCircle, AlertTriangle, X, Clock, ShieldCheck, Repeat, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../src/lib/api';
import SensitiveOperationGuard from './SensitiveOperationGuard';
import { useNetworkStatus } from '../src/hooks/useNetworkStatus';

interface Recipient {
  id: number;
  name: string;
  bank: string;
  account: string;
  email: string;
}

interface Props {
  onBack: () => void;
  darkMode: boolean;
}

const INTERNATIONAL_BANKS = [
  // UK Banks
  "HSBC Bank (UK)",
  "Barclays Bank",
  "Lloyds Bank",
  "NatWest",
  "Standard Chartered",
  "Santander UK",
  "Royal Bank of Scotland",
  "Nationwide Building Society",
  // USA Banks
  "JPMorgan Chase",
  "Bank of America",
  "Citigroup (Citibank)",
  "Wells Fargo",
  "Goldman Sachs",
  "Morgan Stanley",
  "U.S. Bancorp",
  "Truist Financial",
  "PNC Financial Services",
  "TD Bank (USA)",
  "Capital One",
];

type Step = 'AMOUNT' | 'RECIPIENT' | 'MANAGE_RECIPIENTS' | 'REVIEW' | 'SUCCESS';

export default function TransferFlow({ onBack, darkMode }: Props) {
  const [step, setStep] = useState<Step>('AMOUNT');
  const [amount, setAmount] = useState<string>('');
  const [recipientName, setRecipientName] = useState('');
  const [bankSearch, setBankSearch] = useState('');
  const [bankName, setBankName] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationStage, setNotificationStage] = useState(0); // 0: none, 1: Success, 2: URGENT Fee, 3: VAT Fee
  const [reference] = useState(`TXN${Math.random().toString(16).slice(2, 10)}`);
  const network = useNetworkStatus();

  const filteredBanks = useMemo(() => {
    if (!bankSearch) return INTERNATIONAL_BANKS;
    return INTERNATIONAL_BANKS.filter(b => b.toLowerCase().includes(bankSearch.toLowerCase()));
  }, [bankSearch]);

  // Recurring Transfer State
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState('MONTHLY');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [showScheduleConfirm, setShowScheduleConfirm] = useState(false);

  // Limits State (Simulation)
  const limits = {
    daily: 5000,
    perTransaction: 2500,
    currentDailyUsed: 1200
  };



  const validateTransfer = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return "Please enter a valid amount";
    if (numAmount > limits.perTransaction) return `Exceeds per-transaction limit of $${limits.perTransaction}`;
    if (numAmount + limits.currentDailyUsed > limits.daily) return `Exceeds remaining daily limit of $${limits.daily - limits.currentDailyUsed}`;
    return null;
  };

  const handleAmountContinue = () => {
    const error = validateTransfer();
    if (error) return;
    setStep('RECIPIENT');
  };

  const handleRecipientContinue = () => {
    if (!recipientName.trim() || !bankName.trim()) return;
    setStep('REVIEW');
  };

  const handleFinalConfirm = async () => {
    setShowScheduleConfirm(false);
    setIsLoading(true);
    
    // Show network-aware loading message
    const loadingMessage = network.speed === 'slow' 
      ? 'Processing with slow connection...' 
      : network.quality === 'fair'
      ? 'Processing...'
      : 'Sending...';
    
    try {
      if (!recipientName || !bankName) throw new Error("Missing recipient details");

      // Simulating recurring logic on backend or ignoring for MVP
      if (!isRecurring) {
        await api.transfer({
          amount: parseFloat(amount),
          recipientName,
          bankName
        });
      } else {
        // Mock success for recurring as backend doesn't support it yet
        await new Promise(r => setTimeout(r, network.speed === 'slow' ? 2000 : 1000));
      }
      setStep('SUCCESS');
      setNotificationStage(1);
    } catch (err: any) {
      const errorMsg = network.quality === 'poor' || network.quality === 'offline'
        ? "Transfer failed. Please check your connection and try again."
        : err.message || "Transfer Failed";
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferClick = () => {
    if (isRecurring) {
      setShowScheduleConfirm(true);
    } else {
      handleFinalConfirm();
    }
  };

  const renderAmountStep = () => {
    const error = validateTransfer();
    const numAmount = parseFloat(amount) || 0;

    return (
      <div className="flex flex-col h-full pt-6">
        <div className="px-4 overflow-y-auto no-scrollbar flex-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block">Enter Amount</label>
          <div className="flex items-center justify-center mb-8">
            <span className={`text-4xl font-bold mr-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`text-5xl font-black bg-transparent border-none outline-none w-full text-center placeholder-gray-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}
              autoFocus
            />
          </div>

          {error && amount && (
            <div className="mb-6 flex items-center justify-center gap-1 text-red-500 text-xs font-bold animate-pulse">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Recurring Toggle Section */}
          <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} p-5 rounded-3xl border shadow-sm mb-6 transition-all`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${darkMode ? 'bg-red-500/10 text-red-500' : 'bg-red-50 text-red-600'}`}>
                  <Repeat size={18} />
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recurring Transfer</h4>
                  <p className="text-[10px] text-gray-500 font-medium">Automate this payment</p>
                </div>
              </div>
              <button
                onClick={() => setIsRecurring(!isRecurring)}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isRecurring ? 'bg-red-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${isRecurring ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>

            {isRecurring && (
              <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Frequency</label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className={`w-full text-xs font-bold p-3 rounded-xl outline-none border transition-colors ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    >
                      <option value="WEEKLY">Weekly</option>
                      <option value="BI-WEEKLY">Bi-Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`w-full text-xs font-bold p-3 rounded-xl outline-none border transition-colors ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">End Date (Optional)</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`w-full text-xs font-bold p-3 rounded-xl outline-none border transition-colors ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Limits Visualization */}
          <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} p-4 rounded-2xl border shadow-sm`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Daily Limit Usage</span>
              <span className={`text-[10px] font-bold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>${limits.currentDailyUsed + numAmount} / ${limits.daily}</span>
            </div>
            <div className={`w-full h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div
                className={`h-full transition-all duration-500 ${(limits.currentDailyUsed + numAmount) > limits.daily ? 'bg-red-500' : 'bg-red-600'}`}
                style={{ width: `${Math.min(100, ((limits.currentDailyUsed + numAmount) / limits.daily) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className={`mt-auto p-4 border-t transition-colors duration-300 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
          <button
            onClick={handleAmountContinue}
            disabled={!amount || !!error}
            className="w-full bg-red-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-all active:scale-95 text-xs"
          >
            Continue
          </button>
        </div>
      </div>
    );
  };

  const renderScheduleConfirmDialog = () => {
    if (!showScheduleConfirm) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowScheduleConfirm(false)}></div>
        <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} relative w-full max-w-sm rounded-[32px] border shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-300`}>
          <div className="flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-inner ${darkMode ? 'bg-red-500/10 text-red-500' : 'bg-red-50 text-red-600'}`}>
              <Repeat size={32} />
            </div>
            <h3 className={`text-xl font-black tracking-tight mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Confirm Schedule</h3>
            <p className="text-xs text-gray-500 font-medium mb-8">Please review your automated payment instructions.</p>

            <div className="w-full space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-gray-800/20">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</span>
                <span className={`text-sm font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>${parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-800/20">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Frequency</span>
                <span className={`text-sm font-black text-red-600 uppercase`}>{frequency}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-800/20">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Next Payment</span>
                <span className={`text-sm font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{startDate}</span>
              </div>
              {endDate && (
                <div className="flex justify-between items-center py-3 border-b border-gray-800/20">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expires</span>
                  <span className={`text-sm font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{endDate}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowScheduleConfirm(false)}
                className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Modify
              </button>
              <button
                onClick={handleFinalConfirm}
                className="flex-[2] py-4 rounded-2xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-900/20 hover:bg-red-700 active:scale-95 transition-all"
              >
                Activate Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReviewStep = () => (
    <div className="p-4 flex flex-col h-full pt-6 relative">
      {/* Processing Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
          <div className="w-16 h-16 border-4 border-white/20 border-t-red-600 rounded-full animate-spin mb-6"></div>
          <ShieldCheck size={32} className="text-red-600 mb-2 animate-bounce" />
          <p className="font-black text-xs uppercase tracking-widest">Securing Transaction</p>
          <p className="text-[10px] opacity-60 mt-1 uppercase tracking-tight">Verifying credentials and limits...</p>
        </div>
      )}

      {renderScheduleConfirmDialog()}

      <div className="flex-1">
        <h2 className={`text-2xl font-black tracking-tighter mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Review Transfer</h2>

        <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} rounded-[32px] shadow-sm border overflow-hidden mb-6`}>
          <div className={`p-8 flex flex-col items-center border-b relative group ${darkMode ? 'border-gray-800' : 'border-gray-50'}`}>
            <span className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Amount to Send</span>
            <div className="flex items-center gap-2">
              <span className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>${parseFloat(amount).toFixed(2)}</span>
            </div>
            {isRecurring && (
              <div className="mt-4 flex items-center gap-1.5 px-3 py-1 bg-red-600/10 text-red-600 rounded-full border border-red-600/10">
                <Repeat size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest">{frequency} AUTOMATION</span>
              </div>
            )}
          </div>

          <div className="p-6 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Recipient</span>
              <div className="text-right">
                <div className={`font-black text-sm ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{recipientName}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{bankName}</div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Service Fee</span>
              <span className="font-black text-sm text-green-600 uppercase">Waived</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Protection</span>
              <span className="flex items-center gap-1 font-black text-sm text-blue-500 uppercase">
                <ShieldCheck size={14} />
                Encrypted
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {network.quality === 'offline' && (
          <div className={`mb-3 p-3 rounded-xl border-2 ${
            darkMode ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600" />
              <p className="text-[9px] font-black text-red-600 uppercase">No Internet Connection</p>
            </div>
            <p className="text-[8px] text-gray-500 mt-1">Please check your connection to proceed.</p>
          </div>
        )}
        <SensitiveOperationGuard
          darkMode={darkMode}
          operation="Money transfer"
          onProceed={handleTransferClick}
        >
          <button
            disabled={isLoading || network.quality === 'offline'}
            className="w-full bg-red-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-red-900/20 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {network.speed === 'slow' ? 'Processing...' : 'Sending...'}
              </>
            ) : (
              <>
                {isRecurring ? 'Setup Schedule' : 'Confirm & Send Money'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </SensitiveOperationGuard>
      </div>
    </div>
  );

  const renderSuccessStep = () => {
    const amt = parseFloat(amount);
    const fee = amt * 0.10;
    const vat = fee * 0.10;
    const totalFee = fee + vat;
    const formattedAmt = amt.toFixed(2);
    const formattedFee = fee.toFixed(2);
    const formattedVat = vat.toFixed(2);
    const formattedTotalFee = totalFee.toFixed(2);

    return (
      <div className={`h-full flex flex-col items-center justify-center p-6 text-center relative transition-colors duration-300 ${darkMode ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
        {notificationStage === 1 && (
          <div className="animate-in zoom-in-95 duration-500 w-full max-w-sm">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ${darkMode ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-green-100 text-green-600'}`}>
              <Check size={40} className="drop-shadow-sm" />
            </div>
            <h2 className="text-2xl font-black tracking-tighter mb-4">Transfer Successful</h2>
            <div className={`p-6 rounded-2xl mb-8 border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
              <p className="font-bold text-sm mb-2 text-left">You sent ${formattedAmt} to {recipientName}.</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-left">Reference: {reference}</p>
            </div>
            <button onClick={() => setNotificationStage(2)} className="w-full bg-red-600 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg hover:bg-red-700 active:scale-95 text-xs">
              Continue
            </button>
          </div>
        )}

        {notificationStage === 2 && (
          <div className="animate-in slide-in-from-right-8 duration-500 w-full max-w-sm">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ${darkMode ? 'bg-red-900/30 text-red-500 border border-red-800' : 'bg-red-100 text-red-600'}`}>
              <AlertCircle size={40} className="drop-shadow-sm" />
            </div>
            <h2 className="text-xl font-black tracking-tighter mb-4 text-red-500 uppercase">! URGENT: Wire Transfer Fee Required</h2>
            <div className={`p-6 rounded-2xl mb-8 border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'} text-left`}>
              <p className="font-bold text-sm mb-4">COMPULSORY ACTION: Transaction Fee of ${formattedTotalFee} (10% fee + 10% VAT) was applied to your wire transfer of ${formattedAmt} to {recipientName}.</p>
              <div className="space-y-3">
                <p className="font-black text-xs text-red-500 uppercase">IMPORTANT: This fee must be paid by the receiver to verify that the payment is going to the correct source.</p>
                <p className={`text-[10px] font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>ACTION REQUIRED: The receiver must contact the bank manager immediately and make payment for the VAT before the funds can be released to their account.</p>
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-6">Reference: {reference}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">9m ago</p>
            </div>
            <button onClick={() => setNotificationStage(3)} className="w-full bg-red-600 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg hover:bg-red-700 active:scale-95 text-xs flex justify-center gap-2 items-center">
              Acknowledge & Continue <ChevronRight size={16} />
            </button>
          </div>
        )}

        {notificationStage === 3 && (
          <div className="animate-in slide-in-from-right-8 duration-500 w-full max-w-sm">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ${darkMode ? 'bg-yellow-900/30 text-yellow-500 border border-yellow-800' : 'bg-yellow-100 text-yellow-600'}`}>
              <AlertTriangle size={40} className="drop-shadow-sm" />
            </div>
            <h2 className="text-lg font-black tracking-tighter mb-4 text-yellow-500 uppercase">VAT Fee Payment Notice - COMPULSORY</h2>
            <div className={`p-6 rounded-2xl mb-8 border ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'} text-left`}>
              <p className="font-bold text-sm mb-4">MANDATORY: A VAT fee of ${formattedVat} (10% of transfer fee) has been added to your wire transfer fee of ${formattedFee}. Total inclusive fee: ${formattedTotalFee}.</p>
              <div className="space-y-3">
                <p className="font-black text-xs text-yellow-600 uppercase">NOTE: The receiver must pay this fee to verify that the payment is going to the correct destination.</p>
                <p className={`text-[10px] font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>FAILURE TO COMPLY: The funds will remain held until the receiver contacts the manager to settle the VAT payment of ${formattedVat}.</p>
              </div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-6">Reference: {reference}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">9m ago</p>
            </div>
            <button onClick={onBack} className="w-full bg-gray-600 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg hover:bg-gray-700 active:scale-95 text-xs">
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderRecipientStep = () => (
    <div className="flex flex-col h-full pt-6 relative" onClick={() => setShowBankDropdown(false)}>
      <div className="px-4 flex-1">
        <h2 className={`text-2xl font-black tracking-tighter mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recipient Details</h2>
        
        <div className="space-y-6">
          <div className="relative">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Selecting Bank</label>
            <div 
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                darkMode ? 'bg-gray-900 border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setShowBankDropdown(!showBankDropdown);
              }}
            >
              <span className={`text-sm font-bold ${bankName ? (darkMode ? 'text-white' : 'text-gray-900') : 'text-gray-400'}`}>
                {bankName || "Select International Bank"}
              </span>
              <ChevronRight size={18} className={`transition-transform duration-300 ${showBankDropdown ? 'rotate-90' : ''}`} />
            </div>

            {showBankDropdown && (
              <div 
                className={`absolute z-50 left-0 right-0 mt-2 rounded-[24px] border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${
                  darkMode ? 'bg-gray-900 border-gray-800 shadow-black/50' : 'bg-white border-gray-100 shadow-gray-200/50'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-3 border-b border-gray-800/10">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search banks..."
                      value={bankSearch}
                      onChange={(e) => setBankSearch(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-bold outline-none ${
                        darkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto no-scrollbar py-2">
                  {filteredBanks.length > 0 ? filteredBanks.map((bank) => (
                    <button
                      key={bank}
                      onClick={() => {
                        setBankName(bank);
                        setShowBankDropdown(false);
                        setBankSearch('');
                      }}
                      className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors ${
                        bankName === bank 
                          ? 'bg-red-600 text-white' 
                          : darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {bank}
                    </button>
                  )) : (
                    <div className="px-4 py-6 text-center text-[10px] font-black text-gray-500 uppercase">No banks found</div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Recipient Full Name</label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. Jayden Ruff"
              className={`w-full text-sm font-bold p-4 rounded-xl outline-none border transition-colors ${darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
            />
          </div>
        </div>
      </div>

      <div className={`mt-auto p-4 border-t transition-colors duration-300 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
        <button
          onClick={handleRecipientContinue}
          disabled={!recipientName.trim() || !bankName.trim()}
          className="w-full bg-red-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-all active:scale-95 text-xs"
        >
          Review Transfer
        </button>
      </div>
    </div>
  );

  if (step === 'SUCCESS') return renderSuccessStep();

  return (
    <div className={`flex flex-col h-full transition-colors duration-300 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'} overflow-hidden`}>
      <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} px-4 py-3 flex items-center gap-4 shadow-sm sticky top-0 z-40 border-b`}>
        <button onClick={() => {
          if (step === 'AMOUNT') onBack();
          else if (step === 'RECIPIENT') setStep('AMOUNT');
          else if (step === 'REVIEW') setStep('RECIPIENT');
        }} className={`p-1 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-700'}`}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className={`text-sm font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {step === 'AMOUNT' ? 'Transfer' : step === 'RECIPIENT' ? 'Recipient' : 'Review'}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {step === 'AMOUNT' && renderAmountStep()}
        {step === 'RECIPIENT' && renderRecipientStep()}
        {step === 'REVIEW' && renderReviewStep()}
      </div>
    </div>
  );
}
