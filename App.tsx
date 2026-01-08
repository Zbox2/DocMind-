
import React, { useState, useMemo, useEffect } from 'react';
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
  LogOut
} from 'lucide-react';
import { MOCK_DOCS, MOCK_FOLDERS, MOCK_USER, MOCK_AUDIT_LOGS, getFileIcon } from './constants';
import { Document, Folder, FileType, AuditLog, User } from './types';
import FileUploader from './components/FileUploader';
import DocumentDetails from './components/DocumentDetails';
import SystemDesign from './components/SystemDesign';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import UserManagement from './components/UserManagement';
import { db } from './db';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'files' | 'dashboard' | 'starred' | 'trash' | 'system' | 'users'>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [docs, setDocs] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dbReady, setDbReady] = useState(false);
  
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [tempFolderName, setTempFolderName] = useState('');

  // Initialize DB and Load Data
  useEffect(() => {
    const initData = async () => {
      await db.init();
      const savedDocs = await db.getAll<Document>('documents');
      const savedFolders = await db.getAll<Folder>('folders');
      const savedLogs = await db.getAll<AuditLog>('auditLogs');
      const savedUsers = await db.getAll<User>('users');

      // Setup initial users if none exist
      if (savedUsers.length === 0) {
        const initialUsers: User[] = [
          { id: 'u-admin', name: 'System Admin', email: 'admin@documind.pro', password: 'admin123', avatar: 'https://picsum.photos/seed/admin/100/100', role: 'Admin', status: 'Active' },
          { id: 'u-user', name: 'Standard User', email: 'user@documind.pro', password: 'user123', avatar: 'https://picsum.photos/seed/user/100/100', role: 'User', status: 'Active' }
        ];
        initialUsers.forEach(u => db.save('users', u));
        setAllUsers(initialUsers);
      } else {
        setAllUsers(savedUsers);
      }

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

      // Check for persistent session
      const savedSession = localStorage.getItem('documind_session');
      if (savedSession) {
        const userId = JSON.parse(savedSession).id;
        const user = savedUsers.find(u => u.id === userId) || (savedUsers.length === 0 ? { id: 'u-admin' } : null);
        if (user && (user as User).status === 'Active') {
          setCurrentUser(user as User);
        }
      }

      setDbReady(true);
    };

    initData();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
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

  // Fixed: Added handleFolderClick to navigate to specific folders and switch tabs
  const handleFolderClick = (id: string) => {
    setSelectedFolderId(id);
    setActiveTab('files');
    setSelectedDoc(null);
  };

  // Fixed: Added startRenameFolder to initiate folder renaming logic
  const startRenameFolder = (e: React.MouseEvent, folder: Folder) => {
    setEditingFolderId(folder.id);
    setTempFolderName(folder.name);
  };

  const handleAddUser = async (userData: Partial<User>) => {
    const newUser = userData as User;
    setAllUsers(prev => [...prev, newUser]);
    await db.save('users', newUser);
  };

  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    const updatedUsers = allUsers.map(u => u.id === id ? { ...u, ...updates } : u);
    setAllUsers(updatedUsers);
    const user = updatedUsers.find(u => u.id === id);
    if (user) await db.save('users', user);
    
    // If deactivated current user, log them out
    if (id === currentUser?.id && updates.status === 'Deactivated') {
      handleLogout();
    }
  };

  const activeFolderName = useMemo(() => {
    if (!selectedFolderId) return null;
    return folders.find(f => f.id === selectedFolderId)?.name;
  }, [selectedFolderId, folders]);

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
    if (doc) await db.save('documents', doc);
  };

  const moveToTrash = async (id: string) => {
    const updated = docs.map(d => d.id === id ? { ...d, isTrashed: true } : d);
    setDocs(updated);
    setSelectedDoc(null);
    const doc = updated.find(d => d.id === id);
    if (doc) await db.save('documents', doc);
  };

  const handleRenameDoc = async (id: string, newName: string) => {
    const updated = docs.map(d => d.id === id ? { ...d, name: newName } : d);
    setDocs(updated);
    if (selectedDoc?.id === id) {
      setSelectedDoc(prev => prev ? { ...prev, name: newName } : null);
    }
    const doc = updated.find(d => d.id === id);
    if (doc) await db.save('documents', doc);
  };

  const handleRenameFolder = async (id: string, newName: string) => {
    const updated = folders.map(f => f.id === id ? { ...f, name: newName } : f);
    setFolders(updated);
    setEditingFolderId(null);
    const folder = updated.find(f => f.id === id);
    if (folder) await db.save('folders', folder);
  };

  const handleUpload = async (newFiles: File[], folderId: string | null, metadata: { name: string, contractNumber: string }) => {
    const newDocs: Document[] = newFiles.map((f, i) => ({
      id: `new-${Date.now()}-${i}`,
      name: metadata.name || f.name,
      contractNumber: metadata.contractNumber,
      type: f.name.endsWith('.pdf') ? FileType.PDF : FileType.DOCX,
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
    const updatedDocs = [...newDocs, ...docs];
    setDocs(updatedDocs);
    newDocs.forEach(d => db.save('documents', d));
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      docId: newDocs[0].id,
      docName: newDocs[0].name,
      action: 'Created',
      user: currentUser?.name || 'User',
      timestamp: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...auditLogs];
    setAuditLogs(updatedLogs);
    db.save('auditLogs', newLog);
    setIsUploading(false);
  };

  if (!dbReady) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium font-bold uppercase text-[10px] tracking-widest">Initializing Secure System...</p>
      </div>
    </div>
  );

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const isAdmin = currentUser.role === 'Admin';

  return (
    <div className="flex h-screen bg-white text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-slate-50 border-r border-slate-200 transition-all duration-300 flex flex-col ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        <div className="p-4 flex items-center gap-3 h-16 border-b border-slate-200">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0">
            <Database size={20} />
          </div>
          {sidebarOpen && <span className="font-black text-lg tracking-tight">DocuMind</span>}
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            collapsed={!sidebarOpen}
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<File size={20} />} 
            label="All Documents" 
            active={activeTab === 'files' && !selectedFolderId} 
            collapsed={!sidebarOpen}
            onClick={() => { setActiveTab('files'); setSelectedFolderId(null); }} 
          />
          <NavItem 
            icon={<Star size={20} />} 
            label="Starred" 
            active={activeTab === 'starred'} 
            collapsed={!sidebarOpen}
            onClick={() => { setActiveTab('starred'); setSelectedFolderId(null); }} 
          />
          <NavItem 
            icon={<Trash2 size={20} />} 
            label="Trash" 
            active={activeTab === 'trash'} 
            collapsed={!sidebarOpen}
            onClick={() => { setActiveTab('trash'); setSelectedFolderId(null); }} 
          />

          {isAdmin && (
            <div className="pt-4 pb-2">
               {sidebarOpen && <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Administration</p>}
               <NavItem 
                  icon={<UsersIcon size={20} />} 
                  label="User Management" 
                  active={activeTab === 'users'} 
                  collapsed={!sidebarOpen}
                  onClick={() => setActiveTab('users')} 
                />
               <NavItem 
                  icon={<Server size={20} />} 
                  label="System Architecture" 
                  active={activeTab === 'system'} 
                  collapsed={!sidebarOpen}
                  onClick={() => setActiveTab('system')} 
                />
            </div>
          )}
          
          <div className="pt-4 pb-2">
             {sidebarOpen && <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Kebeles</p>}
             {sidebarOpen && folders.map(f => (
               <div key={f.id} className="relative group">
                 {editingFolderId === f.id ? (
                    <div className="flex items-center gap-2 px-2 py-1">
                      <input 
                        autoFocus
                        type="text"
                        value={tempFolderName}
                        onChange={(e) => setTempFolderName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameFolder(f.id, tempFolderName)}
                        onBlur={() => handleRenameFolder(f.id, tempFolderName)}
                        className="w-full text-sm bg-white border border-blue-400 rounded px-2 py-1 outline-none"
                      />
                      <button onClick={() => handleRenameFolder(f.id, tempFolderName)} className="text-green-600 p-1">
                        <Check size={14} />
                      </button>
                    </div>
                 ) : (
                   <button 
                    onClick={() => handleFolderClick(f.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors ${selectedFolderId === f.id ? 'bg-blue-50 text-blue-600 font-bold' : 'text-slate-600 hover:bg-slate-200'}`}
                   >
                     <FolderIcon size={16} className={selectedFolderId === f.id ? 'text-blue-500' : 'text-slate-400'} />
                     <span className="flex-1 text-left truncate">{f.name}</span>
                     {isAdmin && (
                       <Pencil 
                          size={12} 
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity" 
                          onClick={(e) => { e.stopPropagation(); startRenameFolder(e, f); }}
                        />
                     )}
                   </button>
                 )}
               </div>
             ))}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-colors ${isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
            {sidebarOpen && <span>{isOnline ? 'Cloud Sync Online' : 'Local Edge Mode'}</span>}
          </div>
          <div className="flex items-center gap-3 group">
            <img src={currentUser.avatar} alt="User" className="w-8 h-8 rounded-full border border-slate-200" />
            {sidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate text-slate-900">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{currentUser.role}</p>
              </div>
            )}
            <button 
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
              title="Logout"
            >
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
                placeholder="Search local records..." 
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
              <span>Add Record</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {activeTab === 'dashboard' ? (
            <Dashboard 
              docs={docs} 
              folders={folders} 
              auditLogs={auditLogs} 
              user={currentUser} 
              onSelectDoc={setSelectedDoc}
              onSelectFolder={handleFolderClick}
            />
          ) : activeTab === 'system' && isAdmin ? (
            <SystemDesign />
          ) : activeTab === 'users' && isAdmin ? (
            <UserManagement users={allUsers} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight capitalize">
                    {selectedFolderId ? activeFolderName : activeTab}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedFolderId ? 'Persistent Kebele Records' : 'Unified Document Workspace'}
                  </p>
                </div>
                {!isOnline && (
                  <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black border border-amber-100 uppercase tracking-widest">
                    Offline Protection Enabled
                  </div>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Record Name</th>
                      <th className="px-6 py-4">Contract #</th>
                      <th className="px-6 py-4">Modified</th>
                      <th className="px-6 py-4">Size</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDocs.length > 0 ? filteredDocs.map(doc => (
                      <tr 
                        key={doc.id} 
                        className={`hover:bg-blue-50/30 cursor-pointer transition-colors ${selectedDoc?.id === doc.id ? 'bg-blue-50/50' : ''}`}
                        onClick={() => setSelectedDoc(doc)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="shrink-0 p-2 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-white transition-colors">
                              {getFileIcon(doc.type)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800">{doc.name}</span>
                              <div className="flex items-center gap-1 mt-0.5">
                                {doc.tags.map(tag => (
                                  <span key={tag} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-tighter">{tag}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-bold font-mono text-xs">
                          {doc.contractNumber || '—'}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">
                          {new Date(doc.lastModified).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-bold">{doc.size}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleStar(doc.id); }} 
                              className={`p-2 rounded-lg hover:bg-white hover:shadow-sm ${doc.isStarred ? 'text-amber-400' : 'text-slate-300'}`}
                            >
                              <Star size={18} fill={doc.isStarred ? "currentColor" : "none"} />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-slate-300">
                              <MoreVertical size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-3 opacity-30">
                            <File size={64} className="text-slate-900" />
                            <p className="font-black uppercase text-xs tracking-widest">No local documents found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Right Details Panel */}
      {selectedDoc && (
        <aside className="w-96 bg-white border-l border-slate-200 overflow-y-auto flex flex-col shrink-0 animate-in slide-in-from-right duration-300">
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 sticky top-0 bg-white z-10">
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Metadata Panel</h3>
            <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
              <X size={20} />
            </button>
          </div>
          <DocumentDetails doc={selectedDoc} onRename={handleRenameDoc} onTrash={() => moveToTrash(selectedDoc.id)} />
        </aside>
      )}

      {/* Upload Modal */}
      {isUploading && (
        <FileUploader 
          folders={folders} 
          initialFolderId={selectedFolderId}
          onUpload={handleUpload} 
          onClose={() => setIsUploading(false)} 
        />
      )}
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void, collapsed: boolean }> = ({ icon, label, active, onClick, collapsed }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm transition-all ${
      active 
      ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-200' 
      : 'text-slate-600 hover:bg-slate-100 font-medium'
    }`}
    title={collapsed ? label : undefined}
  >
    <div className="shrink-0">{icon}</div>
    {!collapsed && <span>{label}</span>}
  </button>
);

export default App;