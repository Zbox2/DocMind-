
import React, { useState } from 'react';
import { Users, UserPlus, Shield, ToggleLeft, ToggleRight, Key, Mail, Trash2, Check, X } from 'lucide-react';
import { User } from '../types';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: Partial<User>) => void;
  onUpdateUser: (id: string, updates: Partial<User>) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onAddUser, onUpdateUser }) => {
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500">Manage organizational access and roles.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
        >
          <UserPlus size={18} /> Add New User
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Last Login</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full border border-slate-100" />
                    <div>
                      <p className="font-bold text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                    u.role === 'Admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1.5 text-xs font-bold ${
                    u.status === 'Active' ? 'text-emerald-600' : 'text-rose-500'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-600' : 'bg-rose-500'}`} />
                    {u.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                  {u.id === 'u-admin' ? 'Just now' : 'Never'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      title="Toggle Status"
                      onClick={() => onUpdateUser(u.id, { status: u.status === 'Active' ? 'Deactivated' : 'Active' })}
                      className={`p-2 rounded-lg transition-colors ${u.status === 'Active' ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 hover:bg-slate-100'}`}
                    >
                      {u.status === 'Active' ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    </button>
                    <button 
                      title="Reset Password"
                      onClick={() => {
                        const newPass = prompt(`Enter new password for ${u.name}`);
                        if (newPass) onUpdateUser(u.id, { password: newPass });
                      }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <Key size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8 animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Create New User</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">Initial Password</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 block">System Role</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value as any})}
                >
                  <option value="User">User (Standard Access)</option>
                  <option value="Admin">Administrator (Full Access)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-100 hover:bg-blue-700"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
