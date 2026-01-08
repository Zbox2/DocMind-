
import React, { useState, useEffect } from 'react';
import { Document } from '../types';
import { getFileIcon } from '../constants';
import { Download, History, Share2, Trash2, Info, User, Calendar, Database, Shield, Pencil, Check, X as CloseIcon, Hash } from 'lucide-react';
import { Language, t } from '../translations';

interface Props {
  doc: Document;
  onRename: (id: string, newName: string) => void;
  onTrash: () => void;
  lang: Language;
}

const DocumentDetails: React.FC<Props> = ({ doc, onRename, onTrash, lang }) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState(doc.name);

  useEffect(() => {
    setTempName(doc.name);
    setIsRenaming(false);
  }, [doc.id]);

  const handleConfirmRename = () => {
    if (tempName.trim() && tempName !== doc.name) {
      onRename(doc.id, tempName);
    }
    setIsRenaming(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Overview */}
      <div className="p-6 text-center space-y-4 border-b border-slate-100">
        <div className="inline-flex p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm mx-auto">
          {getFileIcon(doc.type)}
        </div>
        
        <div className="space-y-1">
          {isRenaming ? (
            <div className="flex items-center gap-2 px-4">
              <input 
                autoFocus
                type="text" 
                className="w-full text-center text-sm font-bold border-b-2 border-blue-500 outline-none pb-1"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirmRename()}
              />
              <button onClick={handleConfirmRename} className="p-1 text-green-600 hover:bg-green-50 rounded">
                <Check size={16} />
              </button>
              <button onClick={() => { setIsRenaming(false); setTempName(doc.name); }} className="p-1 text-red-600 hover:bg-red-50 rounded">
                <CloseIcon size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 group">
              <h2 className="text-lg font-bold text-slate-900 break-words line-clamp-2">{doc.name}</h2>
              <button 
                onClick={() => setIsRenaming(true)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 transition-all"
              >
                <Pencil size={14} />
              </button>
            </div>
          )}
          {doc.contractNumber && (
            <p className="text-xs font-bold text-blue-600 flex items-center justify-center gap-1">
              <Hash size={12} /> {doc.contractNumber}
            </p>
          )}
          <p className="text-sm text-slate-500 mt-1 uppercase tracking-wider font-semibold">{t(lang, 'version')} {doc.currentVersion}</p>
        </div>
        
        <div className="flex items-center justify-center gap-2 pt-2">
          <ActionButton icon={<Download size={18} />} label={t(lang, 'download')} />
          <ActionButton icon={<Share2 size={18} />} label={t(lang, 'share')} />
          <ActionButton icon={<Trash2 size={18} />} label={t(lang, 'delete')} variant="danger" onClick={onTrash} />
        </div>
      </div>

      {/* Info Sections */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Info size={14} /> {t(lang, 'details')}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem icon={<User size={14} />} label={lang === 'en' ? "Owner" : "ባለቤት"} value="System Admin" />
            <InfoItem icon={<Database size={14} />} label={t(lang, 'size')} value={doc.size} />
            <InfoItem icon={<Calendar size={14} />} label={t(lang, 'modified')} value={new Date(doc.lastModified).toLocaleDateString()} />
            <InfoItem icon={<Shield size={14} />} label={lang === 'en' ? "Security" : "ደህንነት"} value="AES-256" />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <History size={14} /> {t(lang, 'history')}
          </h3>
          <div className="space-y-3">
            {doc.versions.map((v, idx) => (
              <div key={v.id} className={`p-3 rounded-xl border ${idx === 0 ? 'bg-blue-50 border-blue-100' : 'bg-white border-slate-100 hover:bg-slate-50'} transition-all group`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800">v{v.versionNumber}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{new Date(v.updatedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-1">{v.changeNote}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 pb-8">
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t(lang, 'tags')}</h3>
           <div className="flex flex-wrap gap-2">
              {doc.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium border border-slate-200">#{tag}</span>
              ))}
              <button className="px-2 py-1 bg-white border border-dashed border-slate-300 text-slate-400 rounded-lg text-xs font-medium hover:border-blue-400 hover:text-blue-500 transition-all">+ {lang === 'en' ? 'Add' : 'አክል'}</button>
           </div>
        </section>
      </div>
    </div>
  );
};

const ActionButton = ({ icon, label, variant = 'default', onClick }: { icon: React.ReactNode, label: string, variant?: 'default' | 'danger', onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`p-3 rounded-xl transition-all shadow-sm border ${
      variant === 'danger' 
      ? 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100' 
      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
    }`}
    title={label}
  >
    {icon}
  </button>
);

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
      {icon} {label}
    </p>
    <p className="text-sm font-semibold text-slate-800">{value}</p>
  </div>
);

export default DocumentDetails;
