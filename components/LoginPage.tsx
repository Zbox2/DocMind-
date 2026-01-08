
import React, { useState } from 'react';
import { Database, Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Language, t } from '../translations';

interface LoginPageProps {
  onLogin: (email: string, pass: string) => Promise<boolean>;
  error?: string;
  lang: Language;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, error: externalError, lang }) => {
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
      setError(lang === 'en' ? 'Invalid credentials or account inactive.' : 'የመግቢያ መረጃው ስህተት ነው ወይም አካውንቱ ንቁ አይደለም።');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4">
            <Database size={32} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">DocuMind Pro</h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {(error || externalError) && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100">
              {error || externalError}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="relative">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">{t(lang, 'email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">{t(lang, 'password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-4 px-4 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '...' : t(lang, 'signIn')}
          </button>
        </form>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
          <ShieldCheck size={14} className="text-emerald-500" />
          Secure SQL-Server Auth
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
