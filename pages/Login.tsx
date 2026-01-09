
import React, { useState } from 'react';
import { useApp } from '../store';
import { UserRole } from '../types';
import { ShieldAlert, ArrowRight, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const { login, register } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CITIZEN);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const success = login(email, role);
      if (!success) {
        setError('Invalid credentials for selected role.');
      }
    } else {
      if (!name || !email || !password) {
        setError('All fields are required.');
        return;
      }
      const success = register(name, email, role);
      if (!success) {
        setError('Email already registered for this role.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10 transition-all duration-500">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-900/50 mb-6">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white font-poppins">
            {isLogin ? 'Welcome to CivicPulse' : 'Join CivicPulse'}
          </h1>
          <p className="text-slate-400 mt-2">
            {isLogin ? 'Empowering Citizens, Improving Governance.' : 'Create an account to help improve your city.'}
          </p>
        </div>

        <div className="bg-[#161e31] p-8 rounded-[2.5rem] shadow-2xl shadow-black/40 border border-slate-800 overflow-hidden relative">
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Account Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[UserRole.CITIZEN, UserRole.ADMIN, UserRole.OFFICER].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-3 px-1 text-[10px] font-bold rounded-xl transition-all border ${
                      role === r 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-900/40' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-900/30 rounded-xl text-red-400 text-sm animate-in fade-in zoom-in-95">
                <AlertCircle size={18} />
                <p>{error}</p>
              </div>
            )}

            {!isLogin && (
              <div className="animate-in slide-in-from-left-4 duration-300">
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    className="w-full pl-12 pr-4 py-3.5 bg-white text-slate-900 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/30 transition-all outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-white text-slate-900 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/30 transition-all outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-white text-slate-900 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/30 transition-all outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-indigo-900/50 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 group active:scale-95"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center relative z-10">
            <p className="text-slate-500 text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="ml-2 text-indigo-400 font-bold hover:underline"
              >
                {isLogin ? 'Register now' : 'Log in here'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
