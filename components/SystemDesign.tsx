
import React, { useState } from 'react';
import { Database, Server, Shield, FileText, Code, WifiOff, Cpu, Activity, Terminal, Globe, Key, Layers, CheckCircle2, AlertCircle, HardDrive, Settings } from 'lucide-react';
import { Language, t } from '../translations';

interface SystemDesignProps {
  lang: Language;
}

// Fixed: Added missing TabButton component used in navigation tabs
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
  const [activeSubTab, setActiveSubTab] = useState<'architecture' | 'deployment' | 'sql'>('architecture');
  const isAm = lang === 'am';

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8 animate-in fade-in duration-500">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          {isAm ? 'የስርዓት መዋቅር እና ዝርጋታ' : 'System Architecture & Deployment'}
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          {isAm ? 'DocuMind Proን በአካባቢው ሰርቨር (IIS) ላይ ለመጫን እና ከSQL Server ጋር ለማገናኘት የሚያስችል መመሪያ።' : 'A guide to deploying DocuMind Pro on a local IIS server and establishing MS SQL Server connectivity.'}
        </p>
      </header>

      {/* Navigation Tabs */}
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
            icon={<Globe size={18} />} 
            label={isAm ? "አቀማመጥ (IIS)" : "Deployment (IIS)"} 
          />
          <TabButton 
            active={activeSubTab === 'sql'} 
            onClick={() => setActiveSubTab('sql')} 
            icon={<Database size={18} />} 
            label="SQL Server" 
          />
        </nav>
      </div>

      {/* Tab Content */}
      {activeSubTab === 'architecture' && (
        <div className="space-y-12 py-4">
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
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Local Auth via hashed passwords</li>
              </ul>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

// Fixed: Added default export to fix error in App.tsx line 35
export default SystemDesign;
