
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, MessageCircle, Phone, Mail, Search, 
  ChevronRight, HelpCircle, FileText, Send, X, ExternalLink, TicketCheck
} from 'lucide-react';

interface Props {
  onBack: () => void;
  darkMode: boolean;
}

interface Message {
  id: number;
  text: string;
  sender: 'USER' | 'AGENT';
  timestamp: Date;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

// Fixed Props interface to include darkMode
export default function Support({ onBack, darkMode }: Props) {
  const [activeTab, setActiveTab] = useState<'HOME' | 'CHAT'>('HOME');
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm Sarah from Community First. How can I help you today?", sender: 'AGENT', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const faqs: FAQ[] = [
    { id: 1, question: "How do I reset my transaction PIN?", answer: "Go to Profile > Security & Privacy > Change PIN. You will need your current 2FA enabled." },
    { id: 2, question: "Why is my transfer pending?", answer: "Transfers can be held for 24-48 hours for security verification, especially for large amounts." },
    { id: 3, question: "How to update my legal address?", answer: "Legal address updates require a valid proof of residence uploaded in Profile > Identity Details." },
    { id: 4, question: "Are there fees for international wires?", answer: "Standard international wires cost $15. Premier clients enjoy fee waivers." }
  ];

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now(), text: input, sender: 'USER', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const agentMsg: Message = { 
        id: Date.now() + 1, 
        text: "Thanks for reaching out! I'm looking into your account details now. One moment please...", 
        sender: 'AGENT', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, agentMsg]);
    }, 1500);
  };

  if (activeTab === 'CHAT') {
    return (
      <div className={`h-full flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-950' : 'bg-white'}`}>
        {/* Chat Header */}
        <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} p-4 border-b flex items-center justify-between shadow-sm sticky top-0 z-50`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab('HOME')} className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-700'}`}><ArrowLeft size={24} /></button>
            <div>
              <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Support Chat</div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-[10px] text-gray-500 font-bold uppercase">Sarah • Online</span>
              </div>
            </div>
          </div>
          <button onClick={() => setActiveTab('HOME')} className="text-gray-400 hover:text-red-500 transition-colors"><X size={20} /></button>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                m.sender === 'USER' 
                  ? 'bg-red-600 text-white rounded-tr-none' 
                  : `${darkMode ? 'bg-gray-900 text-gray-200 border-gray-800' : 'bg-white text-gray-800 border-gray-100'} rounded-tl-none border`
              }`}>
                {m.text}
                <div className={`text-[9px] mt-1 opacity-60 text-right`}>
                  {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className={`p-4 border-t ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className={`flex-1 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-red-500 outline-none ${darkMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-gray-100 text-gray-900'}`}
            />
            <button 
              onClick={handleSendMessage}
              className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-full flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Support Home Header */}
      <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} px-4 pt-4 pb-4 shadow-sm sticky top-0 z-40 border-b`}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className={`p-1 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
              <ArrowLeft className={`w-6 h-6 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`} />
            </button>
            <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Support Center</h1>
          </div>
          <button className={`p-2 rounded-full transition-colors ${darkMode ? 'text-gray-400 hover:text-red-500' : 'text-gray-400 hover:text-red-600'}`}>
            <TicketCheck size={24} />
          </button>
        </div>

        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search FAQs and articles..."
                className={`w-full border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all ${darkMode ? 'bg-gray-800 text-white placeholder-gray-500' : 'bg-gray-100 text-gray-900 placeholder-gray-400'}`}
            />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {searchTerm ? (
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">Search Results</h2>
            <div className="space-y-3">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map(faq => (
                  <div key={faq.id} className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} p-4 rounded-2xl border shadow-sm`}>
                    <h3 className={`font-bold text-sm mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{faq.question}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{faq.answer}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm italic">No direct matches. Try a different keyword.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => setActiveTab('CHAT')}
                  className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} flex items-center gap-4 p-4 rounded-2xl border shadow-sm hover:bg-opacity-80 transition-all group`}
                >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-inner ${darkMode ? 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white' : 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                        <MessageCircle size={24} />
                    </div>
                    <div className="text-left flex-1">
                        <div className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Live Chat</div>
                        <div className="text-xs text-gray-500">Connect with an agent <span className="text-green-600 font-bold">Instantly</span></div>
                    </div>
                    <ChevronRight size={18} className="text-gray-300" />
                </button>

                <button className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} flex items-center gap-4 p-4 rounded-2xl border shadow-sm hover:bg-opacity-80 transition-all group`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-inner ${darkMode ? 'bg-green-500/10 text-green-400 group-hover:bg-green-500 group-hover:text-white' : 'bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white'}`}>
                        <Phone size={24} />
                    </div>
                    <div className="text-left flex-1">
                        <div className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Call Priority Support</div>
                        <div className="text-xs text-gray-500">+1 (800) 555-0123 • Available 24/7</div>
                    </div>
                    <ChevronRight size={18} className="text-gray-300" />
                </button>

                <button className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} flex items-center gap-4 p-4 rounded-2xl border shadow-sm hover:bg-opacity-80 transition-all group`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-inner ${darkMode ? 'bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-white' : 'bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white'}`}>
                        <Mail size={24} />
                    </div>
                    <div className="text-left flex-1">
                        <div className={`font-bold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Email Support</div>
                        <div className="text-xs text-gray-500">Typical response in <span className="font-bold">24 hours</span></div>
                    </div>
                    <ChevronRight size={18} className="text-gray-300" />
                </button>
            </div>

            <div>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">Common Questions</h2>
                <div className={`${darkMode ? 'bg-gray-900 border-gray-800 divide-gray-800' : 'bg-white border-gray-100 divide-gray-50'} rounded-2xl border shadow-sm overflow-hidden divide-y`}>
                    {faqs.map(faq => (
                      <button key={faq.id} className={`w-full p-4 flex items-center justify-between text-left transition-colors group ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                          <div className="flex items-center gap-3">
                              <HelpCircle size={18} className="text-gray-400 group-hover:text-red-500 transition-colors" />
                              <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{faq.question}</span>
                          </div>
                          <ChevronRight size={16} className="text-gray-300" />
                      </button>
                    ))}
                </div>
            </div>

            <div className={`rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all active:scale-[0.98] ${darkMode ? 'bg-red-950 border border-red-900/40' : 'bg-red-900'}`}>
                <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
                    <FileText size={120} className="text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">Help Center Resources</h3>
                <p className="text-white/70 text-sm mb-4">Browse our comprehensive guides on secure banking and managing your portfolio.</p>
                <button className="bg-white text-red-900 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-red-50 transition-colors">
                    <ExternalLink size={14} />
                    Open Help Center
                </button>
            </div>
          </>
        )}

        <div className="text-center pb-10">
            <p className="text-xs text-gray-400">Community First Bank N.A. • Available 24/7</p>
        </div>
      </div>
    </div>
  );
}
