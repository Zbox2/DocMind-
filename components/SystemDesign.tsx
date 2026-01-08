
import React from 'react';
import { Database, Server, Shield, Search, FileText, Layers, Cloud, Code, BrainCircuit, Activity, WifiOff, Cpu } from 'lucide-react';

const SystemDesign: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-12">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Hybrid Cloud & Edge Architecture</h1>
        <p className="text-slate-500 text-lg">A Local-First system that blends SQL Server stability with offline browser persistence.</p>
      </header>

      {/* Tech Stack Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 text-blue-600">
            <Server size={24} />
            <h2 className="text-xl font-bold">Microsoft Ecosystem</h2>
          </div>
          <ul className="space-y-3 text-slate-600">
            <li className="flex gap-2"><strong>Database:</strong> MS SQL Server 2022 / Azure SQL</li>
            <li className="flex gap-2"><strong>ORM:</strong> EF Core or Prisma (SQL Server Provider)</li>
            <li className="flex gap-2"><strong>File Storage:</strong> Azure Blob Storage</li>
            <li className="flex gap-2"><strong>Sync:</strong> Background Sync via Service Workers</li>
          </ul>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 text-amber-600">
            <WifiOff size={24} />
            <h2 className="text-xl font-bold">Edge & Offline Features</h2>
          </div>
          <ul className="space-y-3 text-slate-600">
            <li className="flex gap-2"><strong>Local Store:</strong> IndexedDB (Persistence on device)</li>
            <li className="flex gap-2"><strong>Caching:</strong> PWA Service Workers for 0-latency loads</li>
            <li className="flex gap-2"><strong>Blobs:</strong> Direct binary storage in browser DB</li>
            <li className="flex gap-2"><strong>Integrity:</strong> Local SHA-256 checksum verification</li>
          </ul>
        </div>
      </section>

      {/* Schema Section */}
      <section className="bg-slate-900 text-slate-300 p-8 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 text-white">
            <Code size={24} />
            <h2 className="text-xl font-bold">Local-to-Cloud Schema</h2>
          </div>
          <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-blue-400 font-mono">Sync-Ready</span>
        </div>
        <pre className="text-sm font-mono overflow-x-auto bg-slate-800 p-6 rounded-xl border border-slate-700 leading-relaxed text-blue-100">
{`// IndexedDB Store Definition
const OfflineStore = {
    documents: 'id, name, contractNumber, folderId, lastModified',
    folders: 'id, name, parentId',
    auditLogs: 'id, timestamp, action',
    syncQueue: 'id, action, payload, status' // For offline-to-online sync
};

// SQL Server Temporal Schema for History
CREATE TABLE Documents (
    ID UNIQUEIDENTIFIER PRIMARY KEY,
    LocalID NVARCHAR(50), -- Map back to browser IndexedDB
    ContractNumber NVARCHAR(100),
    IsSynced BIT DEFAULT 1
);`}
        </pre>
      </section>

      {/* Enterprise Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard 
          icon={<Cpu className="text-purple-500" />} 
          title="Edge Processing" 
          desc="Metadata extraction and sorting happens on-device for maximum speed." 
        />
        <FeatureCard 
          icon={<Shield className="text-emerald-500" />} 
          title="Zero-Trust Local" 
          desc="Data stored in IndexedDB is sandboxed and inaccessible to other sites." 
        />
        <FeatureCard 
          icon={<Activity className="text-rose-500" />} 
          title="Bi-Directional Sync" 
          desc="Conflict resolution using Last-Write-Wins or custom merge logic." 
        />
      </section>

      {/* Visual Workflow */}
      <section className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold mb-8 text-center">Offline-First Workflow</h2>
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
          <WorkflowStep icon={<FileText />} label="User Action" color="bg-blue-100 text-blue-600" />
          <div className="hidden md:block h-px w-full bg-slate-200" />
          <WorkflowStep icon={<Database />} label="Save to IndexedDB" color="bg-amber-100 text-amber-600" />
          <div className="hidden md:block h-px w-full bg-slate-200" />
          <WorkflowStep icon={<WifiOff />} label="Offline Safe" color="bg-slate-100 text-slate-600" />
          <div className="hidden md:block h-px w-full bg-slate-200" />
          <WorkflowStep icon={<Cloud />} label="Sync when Online" color="bg-blue-600 text-white" />
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="p-6 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-200 transition-colors">
    <div className="mb-3">{icon}</div>
    <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

const WorkflowStep = ({ icon, label, color }: { icon: any, label: string, color: string }) => (
  <div className="flex flex-col items-center gap-4 z-10">
    <div className={`p-4 rounded-full ${color} shadow-sm border border-white`}>
      {React.cloneElement(icon, { size: 32 })}
    </div>
    <span className="font-bold text-slate-700 text-sm">{label}</span>
  </div>
);

export default SystemDesign;
