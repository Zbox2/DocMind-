
import React, { useState, useRef, useEffect } from 'react';
import { 
  Database, Server, Shield, Layers, Globe, CheckCircle2, 
  RotateCcw, Download, Upload, FileJson, AlertTriangle, 
  DatabaseBackup, RefreshCw, Trash2, HardDrive, History,
  Code, Terminal, Copy, Check, ClipboardList, Info, ExternalLink
} from 'lucide-react';
import { Language, t } from '../translations';
import { db } from '../db';
import { SystemSetting } from '../types';

interface SystemDesignProps {
  lang: Language;
}

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-bold text-sm transition-all ${
      active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
    }`}
  >
    {icon}
    {label}
  </button>
);

const SystemDesign: React.FC<SystemDesignProps> = ({ lang }) => {
  const [activeSubTab, setActiveSubTab] = useState<'architecture' | 'deployment' | 'sql' | 'maintenance'>('architecture');
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [stats, setStats] = useState({ docs: 0, users: 0, folders: 0, lastBackup: 'Never' });
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isAm = lang === 'am';

  const sqlSchema = `-- SQL Server Schema for YTWSE DMS
CREATE DATABASE YTWSE_DMS;
GO
USE YTWSE_DMS;
GO

CREATE TABLE Folders (
    ID NVARCHAR(50) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    ParentID NVARCHAR(50) NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Documents (
    ID NVARCHAR(50) PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    ContractNumber NVARCHAR(100),
    Type NVARCHAR(20),
    OwnerID NVARCHAR(50),
    FolderID NVARCHAR(50),
    LastModified DATETIME DEFAULT GETDATE(),
    Size NVARCHAR(50),
    CurrentVersion INT DEFAULT 1,
    IsStarred BIT DEFAULT 0,
    IsTrashed BIT DEFAULT 0,
    FileData NVARCHAR(MAX),
    FOREIGN KEY (FolderID) REFERENCES Folders(ID)
);`;

  useEffect(() => {
    const loadStats = async () => {
      const docs = await db.getAll('documents');
      const users = await db.getAll('users');
      const folders = await db.getAll('folders');
      const lastBackupSetting = await db.getById<SystemSetting>('settings', 'last_backup');
      
      setStats({
        docs: docs.length,
        users: users.length,
        folders: folders.length,
        lastBackup: lastBackupSetting ? new Date(lastBackupSetting.value).toLocaleString() : (isAm ? 'ፈጽሞ አልተከናወነም' : 'Never')
      });
    };
    if (activeSubTab === 'maintenance') loadStats();
  }, [activeSubTab, isExporting, isRestoring]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setMessage(null);
    try {
      const data = await db.exportDatabase();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `YTWSE_DMS_Full_Snapshot_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage({ text: isAm ? 'ምትኬ በተሳካ ሁኔታ ወጥቷል' : 'Backup exported successfully', type: 'success' });
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Export failed', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm(t(lang, 'restoreWarning'))) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsRestoring(true);
    setMessage(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = event.target?.result as string;
        await db.importDatabase(json);
        setMessage({ text: t(lang, 'backupSuccess'), type: 'success' });
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        setMessage({ text: 'Failed to restore: The backup file is corrupted or invalid.', type: 'error' });
        setIsRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  const handleFactoryReset = async () => {
    const confirmationText = isAm ? "ይህ ሁሉንም መረጃዎች በቋሚነት ያጠፋል። እርግጠኛ ነዎት?" : "This will PERMANENTLY delete all local documents, users, and settings. Are you sure?";
    if (!confirm(confirmationText)) return;
    
    const doubleConfirm = isAm ? "እባክዎ ዳግም ለማረጋገጥ 'RESET' ብለው ይተይቡ" : "Please type 'RESET' to confirm factory wipe";
    const input = prompt(doubleConfirm);
    if (input !== 'RESET') return;

    setIsWiping(true);
    try {
      await db.clearAll();
      localStorage.clear();
      setMessage({ text: isAm ? 'ስርዓቱ ዳግም ተጀምሯል። ገጹ እንደገና እየተጫነ ነው...' : 'Factory reset complete. Reloading...', type: 'success' });
      setTimeout(() => window.location.href = '/', 1500);
    } catch (err) {
      console.error(err);
      setIsWiping(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8 animate-in fade-in duration-500">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          {activeSubTab === 'maintenance' ? t(lang, 'maintenance') : (isAm ? 'የስርዓት ዝርጋታ እና መዋቅር' : 'System Deployment & Architecture')}
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          {activeSubTab === 'maintenance' 
            ? t(lang, 'backupRestore') 
            : activeSubTab === 'deployment' 
              ? (isAm ? 'በIIS ሰርቨር ላይ ለመጫን ደረጃ በደረጃ የሚከናወኑ ተግባራት።' : 'Step-by-step checklist for deploying on IIS with SQL Server.')
              : (isAm ? 'DocuMind Proን በአካባቢው ሰርቨር (IIS) ላይ ለመጫን እና ከSQL Server ጋር ለማገናኘት የሚያስችል መመሪያ።' : 'A guide to deploying DocuMind Pro on a local IIS server and establishing MS SQL Server connectivity.')}
        </p>
      </header>

      <div className="flex justify-center border-b border-slate-200">
        <nav className="flex gap-8">
          <TabButton 
            active={activeSubTab === 'architecture'} 
            onClick={() => setActiveSubTab('architecture')} 
            icon={<Layers size={18} />} 
            label={isAm ? "መዋቅር" : "Architecture"} 
          />
          <TabButton 
            active={activeSubTab === 'deployment'} 
            onClick={() => setActiveSubTab('deployment')} 
            icon={<ClipboardList size={18} />} 
            label={isAm ? "የዝርጋታ ቅደም ተከተል" : "Deployment Checklist"} 
          />
          <TabButton 
            active={activeSubTab === 'sql'} 
            onClick={() => setActiveSubTab('sql')} 
            icon={<Database size={18} />} 
            label="SQL Server" 
          />
          <TabButton 
            active={activeSubTab === 'maintenance'} 
            onClick={() => setActiveSubTab('maintenance')} 
            icon={<RotateCcw size={18} />} 
            label={t(lang, 'maintenance')} 
          />
        </nav>
      </div>

      <div className="py-4">
        {activeSubTab === 'maintenance' ? (
          <div className="space-y-8 max-w-4xl mx-auto">
            {message && (
              <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                <p className="font-bold text-sm">{message.text}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <StatCard icon={<HardDrive size={16} />} label={isAm ? "ሰነዶች" : "Documents"} value={stats.docs} />
               <StatCard icon={<Layers size={16} />} label={isAm ? "ቀበሌዎች" : "Kebeles"} value={stats.folders} />
               <StatCard icon={<History size={16} />} label={isAm ? "መጨረሻ ምትኬ" : "Last Backup"} value={stats.lastBackup} isWide />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 flex flex-col">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Download size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900">{t(lang, 'exportBackup')}</h3>
                  <p className="text-sm text-slate-500 mt-2">Download a <b>Full System Snapshot</b> including all binary file content, metadata, users, and kebeles.</p>
                </div>
                <button 
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                >
                  {isExporting ? <RefreshCw className="animate-spin" size={18} /> : <DatabaseBackup size={18} />}
                  {isExporting ? 'Packaging Assets...' : t(lang, 'exportBackup')}
                </button>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 flex flex-col">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <Upload size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900">{t(lang, 'importBackup')}</h3>
                  <p className="text-sm text-slate-500 mt-2">Restore system from a snapshot. This action re-hydrates your entire document library including original files.</p>
                </div>
                <div className="relative">
                  <input 
                    type="file" 
                    accept=".json"
                    ref={fileInputRef}
                    onChange={handleImport}
                    className="hidden" 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isRestoring}
                    className="w-full py-4 bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all disabled:opacity-50"
                  >
                    {isRestoring ? <RefreshCw className="animate-spin" size={18} /> : <FileJson size={18} />}
                    {isRestoring ? 'Restoring Data...' : t(lang, 'importBackup')}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-8 rounded-3xl space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <AlertTriangle size={24} />
                <h3 className="text-lg font-black uppercase tracking-tight">{isAm ? 'አደገኛ ቀጠና' : 'Danger Zone'}</h3>
              </div>
              <p className="text-sm text-rose-800 leading-relaxed">
                {isAm ? 'እነዚህ ተግባራት መመለስ የማይችሉ ናቸው። እባክዎ ጥንቃቄ ያድርጉ።' : 'These actions are destructive and cannot be undone. Always ensure you have a fresh backup before performing a reset.'}
              </p>
              <div className="pt-2">
                 <button 
                  onClick={handleFactoryReset}
                  disabled={isWiping}
                  className="px-6 py-3 bg-rose-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-rose-700 transition-all disabled:opacity-50 shadow-lg shadow-rose-100"
                 >
                   {isWiping ? <RefreshCw className="animate-spin" size={18} /> : <Trash2 size={18} />}
                   {isAm ? 'ሁሉንም መረጃዎች አጥፋ (Factory Reset)' : 'Factory Reset & Wipe All Data'}
                 </button>
              </div>
            </div>
          </div>
        ) : activeSubTab === 'sql' ? (
          <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right duration-500">
            <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-4 bg-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <Terminal size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">SQL Schema Script</span>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy SQL'}
                </button>
              </div>
              <div className="p-6">
                <pre className="text-emerald-400 font-mono text-sm leading-relaxed overflow-x-auto">
                  {sqlSchema}
                </pre>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Step icon="1" title="Create DB" desc="Run the schema script above in SQL Server Management Studio." />
              <Step icon="2" title="Bridge API" desc="Start the server_api.js node process to handle requests." />
              <Step icon="3" title="IIS Binding" desc="Ensure web.config is in your root to proxy traffic to the bridge." />
            </div>
          </div>
        ) : activeSubTab === 'deployment' ? (
          <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black">1</div>
                <h2 className="text-xl font-bold text-slate-900">Database & Bridge Setup</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-12">
                <ChecklistItem label="SQL Auth" desc="Enable Mixed Mode Authentication in SQL Server." />
                <ChecklistItem label="DB Creation" desc="Run the schema script from the SQL Server tab." />
                <ChecklistItem label="Bridge Host" desc="Install Node.js v18+ on the server machine." />
                <ChecklistItem label="Environment" desc="Create .env file with DB_USER and DB_PASSWORD." />
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black">2</div>
                <h2 className="text-xl font-bold text-slate-900">IIS Configuration</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-12">
                <ChecklistItem label="URL Rewrite" desc="Install Microsoft URL Rewrite Module for IIS." />
                <ChecklistItem label="ARR Proxy" desc="Install Application Request Routing (ARR) and 'Enable Proxy' in server settings." />
                <ChecklistItem label="Site Root" desc="Point IIS Site to the frontend build folder." />
                <ChecklistItem label="Permissions" desc="Ensure 'IIS_IUSRS' has Read access to the folder." />
              </div>
            </section>

            <section className="bg-amber-50 border border-amber-200 p-8 rounded-3xl space-y-4">
              <h3 className="font-bold flex items-center gap-2 text-amber-800">
                <Info size={18} /> {isAm ? "መላ ፍለጋ (Troubleshooting)" : "Common Issues & Fixes"}
              </h3>
              <div className="space-y-4 text-sm text-amber-900">
                <p><b>502.3 Bad Gateway:</b> Your Node.js bridge is not running. Start <code className="bg-amber-100 px-1">node server_api.js</code>.</p>
                <p><b>404 on /api/</b>: URL Rewrite is missing or ARR Proxy is not enabled in IIS.</p>
                <p><b>Login Failed:</b> Check the <code className="bg-amber-100 px-1">.env</code> file. Ensure the SQL Server IP/Instance name matches.</p>
              </div>
            </section>
          </div>
        ) : activeSubTab === 'architecture' ? (
          <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-3 text-blue-600">
                  <Server size={24} />
                  <h2 className="text-xl font-bold">{isAm ? 'የማይክሮሶፍት ሥነ-ምህዳር' : 'Backend Stack'}</h2>
                </div>
                <ul className="space-y-3 text-slate-600 text-sm">
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Windows Server 2019+</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> IIS 10.0+ (Web Server)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> MS SQL Server 2019 Express/Standard</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Node.js v18 LTS for Bridge API</li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-3 text-indigo-600">
                  <Shield size={24} />
                  <h2 className="text-xl font-bold">{isAm ? 'ደህንነት' : 'Security'}</h2>
                </div>
                <ul className="space-y-3 text-slate-600 text-sm">
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> SQL-level Encryption (TDE)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> IIS HTTPS Binding</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> AES-256 Client-side Storage</li>
                </ul>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const ChecklistItem = ({ label, desc }: { label: string, desc: string }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-2 text-slate-900">
      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
      <span className="font-bold text-sm">{label}</span>
    </div>
    <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

const StatCard = ({ icon, label, value, isWide = false }: { icon: React.ReactNode, label: string, value: string | number, isWide?: boolean }) => (
  <div className={`bg-slate-50 border border-slate-200 p-4 rounded-2xl ${isWide ? 'md:col-span-2' : ''}`}>
    <div className="flex items-center gap-2 text-slate-400 mb-1">
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-sm font-bold text-slate-800">{value}</p>
  </div>
);

const Step = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">{icon}</div>
    <h4 className="font-bold text-slate-900">{title}</h4>
    <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

export default SystemDesign;
