
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Download, Printer, Maximize2, FileText, ChevronLeft, ChevronRight, 
  ZoomIn, ZoomOut, Image as ImageIcon, BrainCircuit, Sparkles, Send, 
  RotateCcw, Info, PanelRightClose, PanelRightOpen, MessageSquare, Quote
} from 'lucide-react';
import { Document, FileType } from '../types';
import { getFileIcon } from '../constants';
import { Language, t } from '../translations';
// Removed geminiService import

interface DocumentPreviewProps {
  doc: Document;
  onClose: () => void;
  lang: Language;
  autoPrint?: boolean;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ doc, onClose, lang, autoPrint = false }) => {
  const [zoom, setZoom] = useState(100);
  // Removed AI related states

  const isImage = doc.type === FileType.IMG;
  const imageUrl = doc.previewUrl || doc.previewContent;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 25));

  const handlePrint = () => {
    window.print();
  };

  // Removed AI related effects and handlers

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-300 overflow-hidden">
      <style>{`
        @media print {
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
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          #print-area > div {
            transform: none !important;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 1cm !important;
          }
          .no-print {
            display: none !important;
          }
          pre {
            white-space: pre-wrap !important;
            font-size: 11pt !important;
            color: black !important;
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
          {/* Removed AI Assistant toggle button */}
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

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 bg-slate-900/80 text-white rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10 no-print">
                <button className="hover:text-blue-400 transition-colors"><ChevronLeft size={16} /></button>
                <span>Page 1 of 1</span>
                <button className="hover:text-blue-400 transition-colors"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </main>

        {/* Removed AI Intelligence Sidebar */}
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
