import React, { useState, useRef, useEffect } from 'react';
import { api } from '../src/lib/api';
import { Send, X, Bot, Sparkles, ShieldCheck } from 'lucide-react';

interface Props {
  user: { fullName?: string };
  darkMode: boolean;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function AiAssistant({ user, darkMode }: Props) {
  const firstName = (user?.fullName || '').split(' ')[0] || 'Guest';
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: `Good evening, ${firstName}. How may I assist with your Platinum portfolio today?`
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });

      const data = await api.chat(chatHistory);
      setMessages(prev => [...prev, { role: 'model', text: data.text }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Connection encrypted. Session timeout. Please retry." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="fixed bottom-24 right-6 w-14 h-14 bg-red-600 text-white rounded-[20px] shadow-2xl flex items-center justify-center hover:bg-red-700 transition-all active:scale-95 z-50 group">
          <div className="absolute -inset-1 bg-red-600 rounded-[20px] blur opacity-30 group-hover:opacity-60 transition-opacity"></div>
          <Sparkles size={24} className="relative" />
        </button>
      )}

      {isOpen && (
        <div className={`fixed bottom-24 right-6 w-[calc(100%-3rem)] max-w-[350px] h-[550px] rounded-[32px] shadow-2xl flex flex-col overflow-hidden z-[60] border animate-in slide-in-from-bottom-4 duration-500 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'
          }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-800 p-5 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                <Bot size={22} />
              </div>
              <div>
                <h3 className="font-black text-[10px] uppercase tracking-widest leading-none mb-1">Platinum Advisor</h3>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-[8px] font-black opacity-80 uppercase tracking-widest">Encrypted</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-2xl transition-colors"><X size={20} /></button>
          </div>

          <div ref={scrollRef} className={`flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] font-medium leading-relaxed ${m.role === 'user'
                  ? 'bg-red-600 text-white rounded-tr-none shadow-lg'
                  : `${darkMode ? 'bg-gray-900 text-gray-200 border-gray-800' : 'bg-white text-gray-800 border-gray-200'} rounded-tl-none border shadow-sm`
                  }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} p-3 rounded-2xl rounded-tl-none border shadow-sm flex gap-1`}>
                  <div className="w-1 h-1 bg-red-600 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-red-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1 h-1 bg-red-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className={`p-4 border-t ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
            <div className="flex gap-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Consult with AI..." className={`flex-1 text-sm font-bold border-none rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-red-500/50 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
                }`} />
              <button onClick={handleSend} disabled={!input.trim() || isTyping} className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}