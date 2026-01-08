
import React from 'react';
import { 
  File, 
  Database, 
  TrendingUp, 
  Users, 
  Clock, 
  Star, 
  MoreHorizontal,
  FileText,
  PieChart,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { Document, Folder as FolderType, AuditLog, User } from '../types';
import { getFileIcon } from '../constants';
import { Language, t } from '../translations';

interface DashboardProps {
  docs: Document[];
  folders: FolderType[];
  auditLogs: AuditLog[];
  user: User;
  onSelectDoc: (doc: Document) => void;
  onSelectFolder: (id: string) => void;
  lang: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ docs, folders, auditLogs, user, onSelectDoc, onSelectFolder, lang }) => {
  const starredDocs = docs.filter(d => d.isStarred).slice(0, 3);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <section className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 text-white shadow-2xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold border border-blue-500/30 uppercase tracking-widest">
              <ShieldCheck size={14} /> {t(lang, 'online')}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {t(lang, 'goodMorning')}, {user.name.split(' ')[0]}
            </h1>
            <p className="text-slate-400 max-w-lg">
              {t(lang, 'welcomeBack')}!
            </p>
          </div>
          <div className="flex gap-3">
             {folders.slice(0, 3).map(f => (
               <button 
                key={f.id}
                onClick={() => onSelectFolder(f.id)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-medium transition-all"
               >
                 {f.name}
               </button>
             ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label={t(lang, 'totalRecords')} 
          value={docs.length} 
          trend="+12%" 
          icon={<File className="text-blue-600" />} 
          chart={<MiniSparkline color="#2563eb" />}
        />
        <MetricCard 
          label={t(lang, 'storageEff')} 
          value="42%" 
          trend="SQL" 
          icon={<Database className="text-indigo-600" />} 
          chart={<MiniSparkline color="#4f46e5" />}
        />
        <MetricCard 
          label={t(lang, 'activeUsers')} 
          value="24" 
          trend="Live" 
          icon={<Users className="text-emerald-600" />} 
          chart={<MiniSparkline color="#10b981" />}
        />
        <MetricCard 
          label={t(lang, 'syncHealth')} 
          value="99.9%" 
          trend="Stable" 
          icon={<TrendingUp className="text-amber-600" />} 
          chart={<MiniSparkline color="#d97706" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Star size={20} className="text-amber-400 fill-amber-400" />
                {t(lang, 'pinnedRecords')}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {starredDocs.map(doc => (
                <div 
                  key={doc.id}
                  onClick={() => onSelectDoc(doc)}
                  className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                      {getFileIcon(doc.type)}
                    </div>
                  </div>
                  <p className="font-bold text-slate-800 truncate mb-1">{doc.name}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 border border-slate-200 rounded-3xl shadow-sm space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2 text-slate-800">
                  <PieChart size={20} className="text-indigo-600" />
                  {t(lang, 'docDist')}
                </h3>
             </div>
             <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="4"></circle>
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-blue-600" strokeWidth="4" strokeDasharray="60, 100"></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-800">{docs.length}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{lang === 'en' ? 'Files' : 'ሰነዶች'}</span>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <ChartLegend color="bg-blue-600" label="PDF" value="60%" />
                  <ChartLegend color="bg-indigo-600" label="Word" value="25%" />
                  <ChartLegend color="bg-emerald-600" label="Excel" value="15%" />
                </div>
             </div>
          </section>
        </div>

        <div className="space-y-8">
           <section className="bg-white p-6 border border-slate-200 rounded-3xl shadow-sm h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold flex items-center gap-2 text-slate-800">
                  <Clock size={20} className="text-blue-600" />
                  {t(lang, 'auditPulse')}
                </h3>
              </div>
              <div className="space-y-6 relative">
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-100" />
                {auditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="relative flex items-start gap-4 pl-0 group">
                    <div className="mt-1.5 w-8 h-8 rounded-full border-4 border-white bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 z-10">
                      <FileText size={14} />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 font-bold">{log.user}</p>
                      <p className="text-xs text-slate-400">{log.action}</p>
                    </div>
                  </div>
                ))}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, trend, icon, chart }: { label: string, value: string | number, trend: string, icon: React.ReactNode, chart: React.ReactNode }) => (
  <div className="bg-white p-6 border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="text-right">
        <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
        <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1 uppercase tracking-wider">{trend}</p>
      </div>
    </div>
    <div className="flex items-end justify-between">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="w-20 h-8 opacity-40 group-hover:opacity-100 transition-opacity">
        {chart}
      </div>
    </div>
  </div>
);

const MiniSparkline = ({ color }: { color: string }) => (
  <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
    <path d="M0 35 Q 20 5, 40 25 T 80 15 L 100 30" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const ChartLegend = ({ color, label, value }: { color: string, label: string, value: string }) => (
  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-xs font-bold text-slate-600">{label}</span>
    </div>
    <span className="text-xs font-black text-slate-800">{value}</span>
  </div>
);

export default Dashboard;
