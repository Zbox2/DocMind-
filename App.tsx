
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Folder as FolderIcon, 
  File, 
  Search, 
  Plus, 
  Clock, 
  Star, 
  Trash2, 
  LayoutDashboard, 
  Database, 
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  MoreVertical,
  Share2,
  X,
  Pencil,
  Check,
  Server,
  Wifi,
  WifiOff,
  Users as UsersIcon,
  LogOut,
  Languages,
  Eye,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { MOCK_DOCS, MOCK_FOLDERS, MOCK_USER, MOCK_AUDIT_LOGS, getFileIcon } from './constants';
import { Document, Folder, FileType, AuditLog, User } from './types';
import FileUploader from './components/FileUploader';
import DocumentDetails from './components/DocumentDetails';
import DocumentPreview from './components/DocumentPreview';
import SystemDesign from './components/SystemDesign';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import UserManagement from './components/UserManagement';
import { db } from './db';
import { Language, t } from './translations';
import { apiService } from './services/apiService';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('documind_lang') as Language) || 'en');
  const [activeTab, setActiveTab] = useState<'files' | 'dashboard' | 'starred' | 'trash' | 'system' | 'users'>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [kebeleDropdownOpen, setKebeleDropdownOpen] = useState(false);
  const [kebeleSearch, setKebeleSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [docs, setDocs] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dbReady, setDbReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [tempFolderName, setTempFolderName] = useState('');

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setKebeleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Persist language
  useEffect(() => {
    localStorage.setItem('documind_lang', lang);
  }, [lang]);

  const syncWithSQL = async () => {
    if (!navigator.onLine) return;
    setIsSyncing(true);
    try {
      const sqlDocs = await apiService.getDocuments();
      if (sqlDocs && sqlDocs.length > 0) {
        setDocs(prev => {
          const merged = [...prev];
          sqlDocs.forEach(sqlDoc => {
            const idx = merged.findIndex(d => d.id === sqlDoc.id);
            if (idx > -1) merged[idx] = sqlDoc;
            else merged.unshift(sqlDoc);
          });
          return merged;
        });
        for (const doc of sqlDocs) {
          await db.save('documents', doc);
        }
      }
    } catch (err) {
      console.warn("SQL Sync failed");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const initData = async () => {
      await db.init();
      const savedDocs = await db.getAll<Document>('documents');
      const savedFolders = await db.getAll<Folder>('folders');
      const savedLogs = await db.getAll<AuditLog>('auditLogs');
      const savedUsers = await db.getAll<User>('users');

      let finalUsers = savedUsers;

      if (savedUsers.length === 0) {
        const initialUsers: User[] = [
          { id: 'u-admin', name: 'System Admin', email: 'admin@documind.pro', password: 'admin123', avatar: 'https://picsum.photos/seed/admin/100/100', role: 'Admin', status: 'Active' },
          { id: 'u-user', name: 'Standard User', email: 'user@documind.pro', password: 'user123', avatar: 'https://picsum.photos/seed/user/100/100', role: 'User', status: 'Active' }
        ];
        initialUsers.forEach(u => db.save('users', u));
        finalUsers = initialUsers;
      }
      setAllUsers(finalUsers);

      if (savedDocs.length === 0 && savedFolders.length === 0) {
        setDocs(MOCK_DOCS);
        setFolders(MOCK_FOLDERS);
        setAuditLogs(MOCK_AUDIT_LOGS);
        MOCK_DOCS.forEach(d => db.save('documents', d));
        MOCK_FOLDERS.forEach(f => db.save('folders', f));
        MOCK_AUDIT_LOGS.forEach(l => db.save('auditLogs', l));
      } else {
        setDocs(savedDocs);
        setFolders(savedFolders);
        setAuditLogs(savedLogs);
      }

      const savedSession = localStorage.getItem('documind_session');
      if (savedSession) {
        const userId = JSON.parse(savedSession).id;
        const user = finalUsers.find(u => u.id === userId);
        if (user && user.status === 'Active') {
          setCurrentUser(user);
        }
      }
      setDbReady(true);
      if (navigator.onLine) syncWithSQL();
    };
    initData();
  }, []);

  const handleLogin = async (email: string, pass: string): Promise<boolean> => {
    const user = allUsers.find(u => u.email === email && u.password === pass);
    if (user && user.status === 'Active') {
      setCurrentUser(user);
      localStorage.setItem('documind_session', JSON.stringify({ id: user.id }));
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('documind_session');
    setActiveTab('dashboard');
  };

  const handleFolderClick = (id: string | null) => {
    setSelectedFolderId(id);
    setActiveTab('files');
    setSelectedDoc(null);
    setKebeleDropdownOpen(false);
  };

  const activeFolderName = useMemo(() => {
    if (!selectedFolderId) return t(lang, 'allDocs');
    return folders.find(f => f.id === selectedFolderId)?.name || t(lang, 'allDocs');
  }, [selectedFolderId, folders, lang]);

  const filteredKebeles = useMemo(() => {
    if (!kebeleSearch) return folders;
    return folders.filter(f => f.name.toLowerCase().includes(kebeleSearch.toLowerCase()));
  }, [folders, kebeleSearch]);

  const filteredDocs = useMemo(() => {
    let baseDocs = docs;
    if (activeTab === 'starred') {
      baseDocs = docs.filter(d => d.isStarred && !d.isTrashed);
    } else if (activeTab === 'trash') {
      baseDocs = docs.filter(d => d.isTrashed);
    } else {
      baseDocs = docs.filter(d => !d.isTrashed);
      if (selectedFolderId) {
        baseDocs = baseDocs.filter(d => d.folderId === selectedFolderId);
      }
    }
    if (!searchQuery) return baseDocs;
    return baseDocs.filter(doc => 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (doc.contractNumber && doc.contractNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [docs, activeTab, searchQuery, selectedFolderId]);

  const toggleStar = async (id: string) => {
    const updated = docs.map(d => d.id === id ? { ...d, isStarred: !d.isStarred } : d);
    setDocs(updated);
    const doc = updated.find(d => d.id === id);
    if (doc) {
      await db.save('documents', doc);
      if (isOnline) await apiService.updateDocumentStatus(id, { isStarred: doc.isStarred });
    }
  };

  const moveToTrash = async (id: string) => {
    const updated = docs.map(d => d.id === id ? { ...d, isTrashed: true } : d);
    setDocs(updated);
    setSelectedDoc(null);
    const doc = updated.find(d => d.id === id);
    if (doc) {
      await db.save('documents', doc);
      if (isOnline) await apiService.updateDocumentStatus(id, { isTrashed: true });
    }
  };

  const handleRenameDoc = async (id: string, newName: string) => {
    const updated = docs.map(d => d.id === id ? { ...d, name: newName } : d);
    setDocs(updated);
    const doc = updated.find(d => d.id === id);
    if (doc) await db.save('documents', doc);
  };

  const handleUpload = async (newFiles: File[], folderId: string | null, metadata: { name: string, contractNumber: string }) => {
    const newDocs: Document[] = newFiles.map((f, i) => ({
      id: `new-${Date.now()}-${i}`,
      name: metadata.name || f.name,
      contractNumber: metadata.contractNumber,
      type: FileType.PDF, // Simplified for brevity
      ownerId: currentUser?.id || 'unknown',
      folderId: folderId,
      lastModified: new Date().toISOString(),
      size: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      currentVersion: 1,
      versions: [{ id: `v1-${Date.now()}`, versionNumber: 1, updatedAt: new Date().toISOString(), author: currentUser?.name || 'User', changeNote: 'Initial upload', size: `${(f.size / 1024).toFixed(0)} KB` }],
      tags: [],
      isStarred: false,
      isTrashed: false,
    }));
    
    setDocs(prev => [...newDocs, ...prev]);
    for (const d of newDocs) {
      await db.save('documents', d);
      if (isOnline) apiService.uploadDocument(d, newFiles);
    }
    setIsUploading(false);
  };

  if (!dbReady) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Booting DocuMind...</p>
      </div>
    </div>
  );

  if (!currentUser) return <LoginPage onLogin={handleLogin} lang={lang} />;

  const isAdmin = currentUser.role === 'Admin';

  return (
    <div className="flex h-screen bg-white text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-slate-50 border-r border-slate-200 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        {/* Logo Section */}
        <div className="p-4 flex items-center gap-3 h-16 border-b border-slate-200 shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-100">
            <Database size={18} />
          </div>
          {sidebarOpen && <span className="font-black text-lg tracking-tight">DocuMind</span>}
        </div>

        {/* Kebele Dropdown Switcher */}
        <div className="px-3 py-4 border-b border-slate-200/60 shrink-0" ref={dropdownRef}>
          {sidebarOpen ? (
            <div className="relative">
              <button 
                onClick={() => setKebeleDropdownOpen(!kebeleDropdownOpen)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-2xl border transition-all text-left ${
                  kebeleDropdownOpen 
                  ? 'bg-white border-blue-400 shadow-xl shadow-blue-100/20' 
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <MapPin size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t(lang, 'kebele')}</p>
                  <p className="text-sm font-bold text-slate-800 truncate">{activeFolderName}</p>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${kebeleDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Floating Menu */}
              {kebeleDropdownOpen && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
                  <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input 
                        autoFocus
                        type="text"
                        placeholder="Search Kebeles..."
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                        value={kebeleSearch}
                        onChange={(e) => setKebeleSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-2 scrollbar-hide">
                    <button 
                      onClick={() => handleFolderClick(null)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-colors ${!selectedFolderId ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Database size={14} className={!selectedFolderId ? 'text-blue-500' : 'text-slate-400'} />
                        {t(lang, 'allDocs')}
                      </div>
                      {!selectedFolderId && <CheckCircle2 size={14} />}
                    </button>
                    <div className="h-px bg-slate-100 my-1 mx-2" />
                    {filteredKebeles.map(f => (
                      <button 
                        key={f.id}
                        onClick={() => handleFolderClick(f.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-colors ${selectedFolderId === f.id ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <div className="flex items-center gap-3">
                          <FolderIcon size={14} className={selectedFolderId === f.id ? 'text-blue-500' : 'text-slate-400'} />
                          {f.name}
                        </div>
                        {selectedFolderId === f.id && <CheckCircle2 size={14} />}
                      </button>
                    ))}
                    {filteredKebeles.length === 0 && (
                      <div className="p-8 text-center text-slate-400 italic text-xs">No matches found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center py-2">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 bg-white border border-slate-200 rounded-xl text-blue-600 shadow-sm"
              >
                <MapPin size={18} />
              </button>
            </div>
          )}
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          <NavItem icon={<LayoutDashboard size={20} />} label={t(lang, 'dashboard')} active={activeTab === 'dashboard'} collapsed={!sidebarOpen} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<File size={20} />} label={t(lang, 'allDocs')} active={activeTab === 'files' && !selectedFolderId} collapsed={!sidebarOpen} onClick={() => { setActiveTab('files'); setSelectedFolderId(null); }} />
          <NavItem icon={<Star size={20} />} label={t(lang, 'starred')} active={activeTab === 'starred'} collapsed={!sidebarOpen} onClick={() => { setActiveTab('starred'); setSelectedFolderId(null); }} />
          <NavItem icon={<Trash2 size={20} />} label={t(lang, 'trash')} active={activeTab === 'trash'} collapsed={!sidebarOpen} onClick={() => { setActiveTab('trash'); setSelectedFolderId(null); }} />

          {isAdmin && (
            <div className="pt-4 pb-2">
               {sidebarOpen && <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Admin</p>}
               <NavItem icon={<UsersIcon size={20} />} label={t(lang, 'userMgmt')} active={activeTab === 'users'} collapsed={!sidebarOpen} onClick={() => setActiveTab('users')} />
               <NavItem icon={<Server size={20} />} label={t(lang, 'sysArch')} active={activeTab === 'system'} collapsed={!sidebarOpen} onClick={() => setActiveTab('system')} />
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-4">
          <button 
            onClick={() => setLang(lang === 'en' ? 'am' : 'en')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all text-xs font-black uppercase tracking-widest text-slate-600"
          >
            <div className="flex items-center gap-2">
              <Languages size={14} />
              {sidebarOpen && <span>{lang === 'en' ? 'Amharic' : 'English'}</span>}
            </div>
            {sidebarOpen && <span className="text-blue-600">{lang === 'en' ? 'EN' : 'AM'}</span>}
          </button>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-colors ${isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            {sidebarOpen && <span>{isOnline ? t(lang, 'online') : t(lang, 'localMode')}</span>}
          </div>
          <div className="flex items-center gap-3">
            <img src={currentUser.avatar} alt="User" className="w-8 h-8 rounded-full border border-slate-200" />
            {sidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate text-slate-900">{currentUser.name}</p>
              </div>
            )}
            <button onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
              {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={t(lang, 'searchPlaceholder')} 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsUploading(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-100"
            >
              <Plus size={18} />
              <span>{t(lang, 'addRecord')}</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {activeTab === 'dashboard' ? (
            <Dashboard docs={docs} folders={folders} auditLogs={auditLogs} user={currentUser} onSelectDoc={setSelectedDoc} onSelectFolder={handleFolderClick} lang={lang} />
          ) : activeTab === 'system' && isAdmin ? (
            <SystemDesign lang={lang} />
          ) : activeTab === 'users' && isAdmin ? (
            <UserManagement users={allUsers} onAddUser={() => {}} onUpdateUser={() => {}} lang={lang} />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight capitalize">
                  {activeFolderName}
                </h1>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">{t(lang, 'name')}</th>
                      <th className="px-6 py-4">{t(lang, 'contractNo')}</th>
                      <th className="px-6 py-4">{t(lang, 'modified')}</th>
                      <th className="px-6 py-4">{t(lang, 'size')}</th>
                      <th className="px-6 py-4 text-right">{t(lang, 'actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDocs.map(doc => (
                      <tr key={doc.id} className="hover:bg-blue-50/30 cursor-pointer" onClick={() => setSelectedDoc(doc)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="shrink-0 p-2 bg-slate-50 rounded-xl border border-slate-100">{getFileIcon(doc.type)}</div>
                            <span className="font-bold text-slate-800">{doc.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-bold font-mono text-xs">{doc.contractNumber || '—'}</td>
                        <td className="px-6 py-4 text-slate-500 font-medium">{new Date(doc.lastModified).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-slate-500 font-bold">{doc.size}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={(e) => { e.stopPropagation(); setPreviewDoc(doc); }} className="p-2 text-slate-400 hover:text-blue-600"><Eye size={18} /></button>
                            <button onClick={(e) => { e.stopPropagation(); toggleStar(doc.id); }} className={`p-2 ${doc.isStarred ? 'text-amber-400' : 'text-slate-300'}`}><Star size={18} fill={doc.isStarred ? "currentColor" : "none"} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Right Details Panel */}
      {selectedDoc && (
        <aside className="w-96 bg-white border-l border-slate-200 overflow-y-auto flex flex-col shrink-0">
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 sticky top-0 bg-white z-10">
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">{t(lang, 'details')}</h3>
            <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><X size={20} /></button>
          </div>
          <DocumentDetails doc={selectedDoc} onRename={handleRenameDoc} onTrash={() => moveToTrash(selectedDoc.id)} onPreview={() => setPreviewDoc(selectedDoc)} lang={lang} />
        </aside>
      )}

      {/* Preview Modal */}
      {previewDoc && <DocumentPreview doc={previewDoc} onClose={() => setPreviewDoc(null)} lang={lang} />}

      {/* Upload Modal */}
      {isUploading && <FileUploader folders={folders} initialFolderId={selectedFolderId} onUpload={handleUpload} onClose={() => setIsUploading(false)} lang={lang} />}
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void, collapsed: boolean }> = ({ icon, label, active, onClick, collapsed }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm transition-all ${active ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-100 font-medium'}`}
    title={collapsed ? label : undefined}
  >
    <div className="shrink-0">{icon}</div>
    {!collapsed && <span>{label}</span>}
  </button>
);

export default App;
