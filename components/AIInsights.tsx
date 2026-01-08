
import React, { useState } from 'react';
import { Send, BrainCircuit, Sparkles, MessageSquare, BookOpen, Quote } from 'lucide-react';
import { askDocumentQuestion } from '../services/geminiService';

const AIInsights: React.FC = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;
    
    const userMsg = query;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setQuery('');
    setLoading(true);

    // Mock document context for demonstration
    const mockContext = "The Q4 strategy focuses on expanding into the European market, specifically the DACH region. We aim for 15% revenue growth by leveraging our new AI-native features and improving enterprise retention rates. Key risks include regulatory changes in data privacy.";
    
    const response = await askDocumentQuestion(mockContext, userMsg);
    setMessages(prev => [...prev, { role: 'ai', content: response || "Something went wrong." }]);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-160px)] flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg">
          <BrainCircuit size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Assistant</h1>
          <p className="text-sm text-slate-500">Currently analyzing <span className="font-semibold text-indigo-600">Q4 Strategy.pdf</span></p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden flex flex-col shadow-inner">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
              <Sparkles size={48} className="text-indigo-400" />
              <div className="max-w-sm">
                <p className="font-bold text-lg">Ask me anything about your files</p>
                <p className="text-sm">I can summarize documents, find specific data points, or draft emails based on your content.</p>
              </div>
              <div className="grid grid-cols-1 gap-2 w-full max-w-xs mt-4">
                <QuickAction text="Summarize this strategy" onClick={() => setQuery("Summarize this strategy")} />
                <QuickAction text="What are the key risks?" onClick={() => setQuery("What are the key risks?")} />
                <QuickAction text="Write a LinkedIn post about this" onClick={() => setQuery("Write a LinkedIn post about this")} />
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl flex gap-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.3s]" />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-.5s]" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Type your question..." 
              className="w-full pl-6 pr-14 py-4 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-[10px] text-center mt-3 text-slate-400 font-medium tracking-wide">AI-generated content may be inaccurate. Always verify important information.</p>
        </div>
      </div>
    </div>
  );
};

const QuickAction = ({ text, onClick }: { text: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold hover:border-indigo-400 hover:text-indigo-600 transition-all text-slate-600 shadow-sm"
  >
    {text}
  </button>
);

export default AIInsights;
