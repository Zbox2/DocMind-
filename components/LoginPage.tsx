
import React, { useState } from 'react';
import { Database, Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (email: string, pass: string) => Promise<boolean>;
  error?: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, error: externalError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await onLogin(email, password);
    if (!success) {
      setError('Invalid email or password, or account deactivated.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 mb-4">
            <Database size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">DocuMind Pro</h2>
          <p className="mt-2 text-sm text-slate-500">Secure Document Management System</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {(error || externalError) && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100 animate-in fade-in slide-in-from-top-1">
              {error || externalError}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="relative">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-blue-200 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <ShieldCheck size={14} className="text-emerald-500" />
            Local AES-256 Encryption Active
          </div>
        </div>
        
        <div className="text-center">
            <p className="text-[10px] text-slate-400">Default Accounts:</p>
            <p className="text-[10px] text-slate-400">Admin: admin@documind.pro / admin123</p>
            <p className="text-[10px] text-slate-400">User: user@documind.pro / user123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
