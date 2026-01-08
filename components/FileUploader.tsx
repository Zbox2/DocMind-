
import React, { useState } from 'react';
import { Upload, X, Tag, Hash } from 'lucide-react';
import { Folder } from '../types';
import { Language, t } from '../translations';

interface FileUploaderProps {
  folders: Folder[];
  initialFolderId?: string | null;
  onUpload: (files: File[], folderId: string | null, metadata: { name: string, contractNumber: string }) => void;
  onClose: () => void;
  lang: Language;
}

const FileUploader: React.FC<FileUploaderProps> = ({ folders, initialFolderId, onUpload, onClose, lang }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(initialFolderId || (folders.length > 0 ? folders[0].id : null));
  const [docName, setDocName] = useState('');
  const [contractNumber, setContractNumber] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden p-8 animate-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-xl font-bold">{lang === 'en' ? 'Upload' : 'ሰነድ አክል'}</h2>
           <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{t(lang, 'name')}</label>
              <input value={docName} onChange={e => setDocName(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{t(lang, 'contractNo')}</label>
              <input value={contractNumber} onChange={e => setContractNumber(e.target.value)} className="w-full p-3 bg-slate-50 border rounded-xl outline-none" />
            </div>
          </div>
          
          <div className="border-2 border-dashed border-slate-200 p-10 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer relative hover:border-blue-500 transition-colors">
            <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
            <Upload size={32} className="text-blue-500 mb-2" />
            <p className="text-sm font-bold">{files.length > 0 ? `${files.length} files selected` : (lang === 'en' ? 'Select Files' : 'ሰነዶችን ይምረጡ')}</p>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button onClick={onClose} className="flex-1 p-3 bg-slate-100 font-bold rounded-xl">{t(lang, 'cancel')}</button>
          <button onClick={() => onUpload(files, selectedFolderId, { name: docName, contractNumber })} disabled={files.length === 0} className="flex-1 p-3 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50">
             {lang === 'en' ? 'Start Upload' : 'ሰቀላ ጀምር'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
