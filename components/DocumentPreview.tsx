
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Download, Printer, Maximize2, FileText, ChevronLeft, ChevronRight, 
  ZoomIn, ZoomOut, Image as ImageIcon, BrainCircuit, Sparkles, Send, 
  RotateCcw, Info, PanelRightClose, PanelRightOpen, MessageSquare, Quote
} from 'lucide-react';
import { Document, FileType } from '../types';
import { getFileIcon } from '../constants';
import { Language, t } from '../translations';
import { askDocumentQuestion, summarizeDocument } from '../services/geminiService';

interface DocumentPreviewProps {
  doc: Document;
  onClose: () => void;
  lang: Language;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ doc, onClose, lang }) => {
  const [zoom, setZoom] = useState(100);
  const [showAI, setShowAI] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isImage = doc.type === FileType.IMG;
  const imageUrl = doc.previewUrl || doc.previewContent;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));

  const handlePrint = () => {
    window.print();
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, aiLoading]);

  const handleSummarize = async () => {
    if (!doc.previewContent) return;
    setAiLoading(true);
    const result = await summarizeDocument(doc.previewContent);
    setSummary(result || "Could not generate summary.");
    setAiLoading(false);
  };

  const handleChat = async () => {
    if (!chatQuery.trim() || !doc.previewContent) return;
    const userMsg = chatQuery;
    setChatQuery('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setAiLoading(true);
    
    const response = await askDocumentQuestion(doc.previewContent, userMsg);
    setChatHistory(prev => [...prev, { role: 'ai', content: response || "I'm sorry, I couldn't process that." }]);
    setAiLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-300 overflow-hidden">
      <style>{`
        @media print {
          /* Hide everything except the print container */
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Reset transforms for print */
          #print-area > div {
            transform: none !important;
            width: 100% !important;
            max-width: none !important;
            box-shadow: none !important;
            border: none !important;
            padding: 2rem !important;
          }
          pre {
            white-space: pre-wrap !important;
            word-wrap: break-word !important;
            font-size: 12pt !important;
          }
          img {
            max-width: 100% !important;
            height: auto !important;
          }
        }
      `}</style>

      {/* Top Toolbar */}
      <header className="h-16 flex items-center justify-between px-6 bg-slate-900 border-b border-slate-800 shrink-0 z-20 no-print">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
              {getFileIcon(doc.type)}
            </div>
            <div>
              <h2 className="text-white font-bold text-sm leading-none mb-1">{doc.name}</h2>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                {t(lang, 'version')} {doc.currentVersion} • {doc.size}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <ToolbarButton icon={<ZoomOut size={16} />} label="Zoom Out" onClick={handleZoomOut} />
            <span className="text-slate-300 text-[10px] font-black w-10 text-center uppercase tracking-tighter">{zoom}%</span>
            <ToolbarButton icon={<ZoomIn size={16} />} label="Zoom In" onClick={handleZoomIn} />
          </div>
          <div className="w-px h-6 bg-slate-700 mx-2" />
          <ToolbarButton icon={<Printer size={18} />} label="Print" onClick={handlePrint} />
          <ToolbarButton icon={<Download size={18} />} label={t(lang, 'download')} />
          <button 
            onClick={() => setShowAI(!showAI)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg ${
              showAI 
              ? 'bg-blue-600 text-white shadow-blue-900/20' 
              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
            }`}
          >
            <BrainCircuit size={18} />
            <span className="hidden md:inline">{showAI ? (lang === 'en' ? 'Hide Assistant' : 'ረዳት ደብቅ') : (lang === 'en' ? 'AI Assistant' : 'የአርቴፊሻል ረዳት')}</span>
          </button>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document Viewer */}
        <main id="print-area" className="flex-1 overflow-auto bg-slate-800/30 relative flex items-start justify-center p-8 scrollbar-hide">
          {isImage ? (
             <div className="relative group max-w-full flex justify-center animate-in zoom-in duration-500 mt-10">
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={doc.name} 
                    style={{ transform: `scale(${zoom / 100})` }}
                    className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl border-4 border-slate-900 transition-transform duration-200 ease-out origin-top" 
                  />
                ) : (
                  <div className="bg-white/5 p-20 rounded-2xl border border-white/10 flex flex-col items-center gap-4 text-slate-400">
                    <ImageIcon size={64} className="opacity-20" />
                    <p className="font-bold">Image source not found</p>
                  </div>
                )}
             </div>
          ) : (
            <div 
              style={{ transform: `scale(${zoom / 100})`, width: '100%', maxWidth: '850px' }}
              className="bg-white shadow-2xl rounded-sm p-16 relative animate-in slide-in-from-bottom-4 duration-500 transition-transform duration-200 ease-out origin-top mb-20"
            >
              <div className="prose prose-slate max-w-none">
                {doc.previewContent ? (
                  <pre className="whitespace-pre-wrap font-sans text-slate-800 text-[16px] leading-relaxed tracking-tight">
                    {doc.previewContent}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center py-40 text-slate-300">
                    <FileText size={80} className="mb-4 opacity-20" />
                    <p className="font-bold text-lg">Preview not available for this file type</p>
                    <p className="text-sm">Please download the file to view its full content.</p>
                  </div>
                )}
              </div>

              {/* Mock Page Indicator */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 bg-slate-900/80 text-white rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10 no-print">
                <button className="hover:text-blue-400 transition-colors"><ChevronLeft size={16} /></button>
                <span>Page 1 of 1</span>
                <button className="hover:text-blue-400 transition-colors"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </main>

        {/* AI Intelligence Sidebar */}
        {showAI && (
          <aside className="w-[380px] bg-white border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-500 shadow-2xl z-10 no-print">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Sparkles size={16} />
                </div>
                <span className="font-black text-xs uppercase tracking-widest text-slate-600">Document Intelligence</span>
              </div>
              <button 
                onClick={() => { setChatHistory([]); setSummary(null); }}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"
                title="Reset Conversation"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Quick Actions */}
              {!summary && chatHistory.length === 0 && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Actions</p>
                  <button 
                    onClick={handleSummarize}
                    disabled={aiLoading}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3 hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
                  >
                    <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-blue-100 group-hover:text-blue-600">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{lang === 'en' ? 'Summarize Document' : 'ሰነዱን በአጭሩ አቅርብ'}</p>
                      <p className="text-[10px] text-slate-400">Generate 3 key takeaways</p>
                    </div>
                  </button>
                  <button className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3 hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left group">
                    <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-emerald-100 group-hover:text-emerald-600">
                      <Quote size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{lang === 'en' ? 'Extract Key Info' : 'ዋና ዋና መረጃዎችን አውጣ'}</p>
                      <p className="text-[10px] text-slate-400">Dates, Entities, and Figures</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Summary Section */}
              {summary && (
                <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 text-blue-600">
                    <BrainCircuit size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">AI Summary</span>
                  </div>
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                    {summary}
                  </div>
                </div>
              )}

              {/* Chat History */}
              <div className="space-y-4">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[90%] p-4 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                      : 'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex gap-1.5 p-4 bg-slate-50 rounded-2xl w-fit">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-.3s]" />
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-.5s]" />
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* AI Chat Input */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="relative">
                <input 
                  type="text"
                  placeholder={lang === 'en' ? "Ask a question about this file..." : "ስለዚህ ሰነድ ጥያቄ ይጠይቁ..."}
                  value={chatQuery}
                  onChange={e => setChatQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleChat()}
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                />
                <button 
                  onClick={handleChat}
                  disabled={aiLoading || !chatQuery.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-30 shadow-md"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

const ToolbarButton = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
    title={label}
  >
    {icon}
  </button>
);

export default DocumentPreview;
