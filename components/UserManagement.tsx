
import React, { useState } from 'react';
import { UserPlus, ToggleLeft, ToggleRight, Key, X } from 'lucide-react';
import { User } from '../types';
import { Language, t } from '../translations';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: Partial<User>) => void;
  onUpdateUser: (id: string, updates: Partial<User>) => void;
  lang: Language;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onAddUser, onUpdateUser, lang }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'User' as const });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser({
      ...newUser,
      id: `u-${Date.now()}`,
      avatar: `https://picsum.photos/seed/${newUser.name}/100/100`,
      status: 'Active'
    });
    setNewUser({ name: '', email: '', password: '', role: 'User' });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t(lang, 'userMgmt')}</h1>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-blue-700 transition-all"
        >
          <UserPlus size={18} /> {t(lang, 'createU')}
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">{t(lang, 'user')}</th>
              <th className="px-6 py-4">{t(lang, 'role')}</th>
              <th className="px-6 py-4">{t(lang, 'status')}</th>
              <th className="px-6 py-4 text-right">{t(lang, 'actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-bold">{u.name}</td>
                <td className="px-6 py-4">{t(lang, u.role === 'Admin' ? 'admin' : 'user')}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold ${u.status === 'Active' ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {t(lang, u.status === 'Active' ? 'active' : 'deactivated')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                   <button 
                    disabled={u.id === 'u-admin'}
                    onClick={() => onUpdateUser(u.id, { status: u.status === 'Active' ? 'Deactivated' : 'Active' })}
                    className={`transition-all ${u.id === 'u-admin' ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                   >
                      {u.status === 'Active' ? <ToggleRight className="text-emerald-500" /> : <ToggleLeft className="text-slate-300" />}
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
            <h2 className="text-xl font-black mb-6">{t(lang, 'createU')}</h2>
            <form onSubmit={handleCreate} className="space-y-4">
               <input placeholder={t(lang, 'fullName')} className="w-full p-3 bg-slate-50 border rounded-xl" required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
               <input placeholder={t(lang, 'email')} className="w-full p-3 bg-slate-50 border rounded-xl" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
               <input placeholder={t(lang, 'password')} className="w-full p-3 bg-slate-50 border rounded-xl" required value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
               <select className="w-full p-3 bg-slate-50 border rounded-xl" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})}>
                  <option value="User">{t(lang, 'user')}</option>
                  <option value="Admin">{t(lang, 'admin')}</option>
               </select>
               <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 p-3 bg-slate-100 rounded-xl font-bold">{t(lang, 'cancel')}</button>
                  <button type="submit" className="flex-1 p-3 bg-blue-600 text-white rounded-xl font-bold">{t(lang, 'create')}</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
