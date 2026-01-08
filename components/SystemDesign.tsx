
import React, { useState } from 'react';
import { Database, Server, Shield, FileText, Code, WifiOff, Cpu, Activity, Terminal, Globe, Key, Layers } from 'lucide-react';
import { Language, t } from '../translations';

interface SystemDesignProps {
  lang: Language;
}

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
          {isAm ? 'DocuMind Proን በአካባቢው ሰርቨር ላይ ለመጫን እና ከSQL Server ጋር ለማገናኘት የሚያስችል መመሪያ።' : 'A guide to deploying DocuMind Pro on a local server and establishing MS SQL Server connectivity.'}
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
            label={isAm ? "አቀማመጥ" : "Deployment"} 
          />
          <TabButton 
            active={activeSubTab === 'sql'} 
            onClick={() => setActiveSubTab('sql')} 
            icon={<Database size={18} />} 
            label="SQL Server" 
          />
        </nav>
      </div>

      {activeSubTab === 'architecture' && (
        <div className="space-y-12 py-4">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-blue-600">
                <Server size={24} />
                <h2 className="text-xl font-bold">{isAm ? 'የማይክሮሶፍት ሥነ-ምህዳር' : 'Backend Stack'}</h2>
              </div>
              <ul className="space-y-3 text-slate-600 text-sm">
                <li className="flex gap-2"><strong>{isAm ? 'ዳታቤዝ:' : 'Database:'}</strong> MS SQL Server 2022 / Express</li>
                <li className="flex gap-2"><strong>{isAm ? 'ኤፒአይ:' : 'API Layer:'}</strong> Node.js + Express (Port 5000)</li>
                <li className="flex gap-2"><strong>{isAm ? 'ኦአርኤም:' : 'ORM:'}</strong> Tedious / mssql-node</li>
                <li className="flex gap-2"><strong>{isAm ? 'ማከማቻ:' : 'Storage:'}</strong> Local Disk / Azure Blob Bridge</li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3 text-amber-600">
                <WifiOff size={24} />
                <h2 className="text-xl font-bold">{isAm ? 'ኤጅ እና ከመስመር ውጭ' : 'Edge Persistence'}</h2>
              </div>
              <ul className="space-y-3 text-slate-600 text-sm">
                <li className="flex gap-2"><strong>{isAm ? 'አካባቢያዊ:' : 'Local Store:'}</strong> IndexedDB (Offline Cache)</li>
                <li className="flex gap-2"><strong>{isAm ? 'ማመሳሰል:' : 'Sync:'}</strong> Background Workers</li>
                <li className="flex gap-2"><strong>{isAm ? 'ደህንነት:' : 'Encryption:'}</strong> Client-side AES-256</li>
              </ul>
            </div>
          </section>

          <section className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-bold mb-8 text-center">{isAm ? 'ከመስመር ውጭ-ቀዳሚ የሥራ ፍሰት' : 'Local-to-Cloud Workflow'}</h2>
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
              <WorkflowStep icon={<FileText />} label={isAm ? "ሰነድ" : "Upload"} color="bg-blue-100 text-blue-600" />
              <WorkflowStep icon={<Database />} label={isAm ? "IndexedDB" : "IndexedDB"} color="bg-amber-100 text-amber-600" />
              <WorkflowStep icon={<Activity />} label={isAm ? "ማመሳሰል" : "Sync Bridge"} color="bg-indigo-100 text-indigo-600" />
              <WorkflowStep icon={<Server />} label={isAm ? "SQL ሰርቨር" : "SQL Server"} color="bg-blue-600 text-white shadow-lg shadow-blue-200" />
            </div>
          </section>
        </div>
      )}

      {activeSubTab === 'deployment' && (
        <div className="space-y-8 py-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-slate-800">
              <Terminal size={20} className="text-blue-600" />
              {isAm ? 'የዝርጋታ ደረጃዎች (Deployment Steps)' : 'Step-by-Step Deployment Guide'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest">1. Frontend Build</h4>
                <div className="bg-slate-900 p-4 rounded-xl text-blue-300 font-mono text-xs">
                  npm run build<br/>
                  # Result: /dist folder
                </div>
                <p className="text-sm text-slate-500 italic">Copy /dist content to your web server (IIS/Nginx/Apache).</p>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest">2. API Setup</h4>
                <div className="bg-slate-900 p-4 rounded-xl text-emerald-400 font-mono text-xs">
                  npm install express mssql dotenv<br/>
                  node server.js
                </div>
                <p className="text-sm text-slate-500 italic">Run the backend as a Windows Service using PM2 or NSSM.</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
             <h3 className="font-bold flex items-center gap-2 text-slate-800">
              <Globe size={20} className="text-indigo-600" />
              IIS Reverse Proxy Config
            </h3>
            <p className="text-sm text-slate-600">To allow the frontend to talk to SQL Server without CORS issues, configure a Rewrite Rule in IIS:</p>
            <div className="bg-slate-900 p-4 rounded-xl text-slate-300 font-mono text-[10px] overflow-x-auto">
{`<rewrite>
  <rules>
    <rule name="API Proxy" stopProcessing="true">
      <match url="api/(.*)" />
      <action type="Rewrite" url="http://localhost:5000/{R:1}" />
    </rule>
  </rules>
</rewrite>`}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'sql' && (
        <div className="space-y-8 py-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2 text-slate-800">
                <Database size={20} className="text-blue-600" />
                SQL Server Connection String
              </h3>
              <Key size={18} className="text-slate-300" />
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs font-mono text-slate-700 break-all">
              Server=LOCAL_SERVER_IP;Database=DocuMind;User Id=sa;Password=YourStrongPassword;Encrypt=True;
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl">
             <div className="bg-slate-800 px-6 py-3 border-b border-slate-700 flex items-center justify-between">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Master Table Schema (MS SQL)</span>
                <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded uppercase font-bold">SQL Server 2022</span>
             </div>
             <div className="p-6">
               <pre className="text-xs font-mono text-blue-100 leading-relaxed overflow-x-auto">
{`CREATE DATABASE DocuMind;
GO

USE DocuMind;
GO

CREATE TABLE Documents (
    ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(255) NOT NULL,
    Type NVARCHAR(20),
    ContractNumber NVARCHAR(100),
    OwnerID UNIQUEIDENTIFIER,
    FolderID UNIQUEIDENTIFIER,
    LastModified DATETIMEOFFSET DEFAULT SYSDATETIMEOFFSET(),
    Size NVARCHAR(50),
    IsStarred BIT DEFAULT 0,
    IsTrashed BIT DEFAULT 0,
    Tags NVARCHAR(MAX), -- JSON representation
    CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Folders (
    ID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(255),
    ParentID UNIQUEIDENTIFIER,
    CreatedAt DATETIME DEFAULT GETDATE()
);`}
               </pre>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 py-4 px-2 border-b-2 transition-all ${
      active 
      ? 'border-blue-600 text-blue-600 font-bold' 
      : 'border-transparent text-slate-500 hover:text-slate-800 font-medium'
    }`}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

const WorkflowStep = ({ icon, label, color }: { icon: any, label: string, color: string }) => (
  <div className="flex flex-col items-center gap-4 z-10 flex-1">
    <div className={`p-4 rounded-full ${color} shadow-sm border border-white transition-transform hover:scale-110`}>
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <span className="font-bold text-slate-700 text-[10px] uppercase tracking-widest text-center whitespace-nowrap">{label}</span>
  </div>
);

export default SystemDesign;
