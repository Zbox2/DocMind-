
import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, File, Folder as FolderIcon, ChevronDown, Tag, Hash } from 'lucide-react';
import { Folder } from '../types';

interface FileUploaderProps {
  folders: Folder[];
  initialFolderId?: string | null;
  onUpload: (files: File[], folderId: string | null, metadata: { name: string, contractNumber: string }) => void;
  onClose: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ folders, initialFolderId, onUpload, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(initialFolderId || (folders.length > 0 ? folders[0].id : null));
  const [docName, setDocName] = useState('');
  const [contractNumber, setContractNumber] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialFolderId !== undefined) {
      setSelectedFolderId(initialFolderId);
    }
  }, [initialFolderId]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold">Upload Document</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Metadata Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Tag size={14} /> Document Label (Name)
              </label>
              <input 
                type="text" 
                placeholder="e.g. Q4 Strategy"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Hash size={14} /> Contract Number
              </label>
              <input 
                type="text" 
                placeholder="e.g. CN-2024-001"
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Destination Folder Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <FolderIcon size={14} /> Destination Kebele
            </label>
            <div className="relative">
              <select 
                value={selectedFolderId || ''} 
                onChange={(e) => setSelectedFolderId(e.target.value || null)}
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer transition-all hover:bg-slate-100"
              >
                <option value="">Root / General</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Drag & Drop Area */}
          <div 
            className={`relative border-2 border-dashed rounded-2xl p-10 transition-all flex flex-col items-center justify-center text-center gap-4 ${
              dragActive ? 'border-blue-500 bg-blue-50 scale-[1.01]' : 'border-slate-200 hover:border-slate-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              ref={inputRef}
              type="file" 
              multiple 
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
            <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
              <Upload size={32} />
            </div>
            <div>
              <p className="text-base font-bold text-slate-800">Drag & drop files here</p>
              <p className="text-xs text-slate-500 mt-1">Or click to browse from your computer</p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ready to upload ({files.length})</p>
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <File size={16} className="text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={() => removeFile(i)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 mt-auto">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button 
            onClick={() => onUpload(files, selectedFolderId, { name: docName, contractNumber })}
            disabled={files.length === 0}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-200"
          >
            Start Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
