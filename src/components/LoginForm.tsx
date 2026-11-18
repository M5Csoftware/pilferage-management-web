'use client';

import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Key, 
  ArrowRight, 
  AlertCircle, 
  Scale
} from 'lucide-react';
import { AuthUser, UserAccount, DEFAULT_ADMIN_PERMISSIONS, DEFAULT_USER_PERMISSIONS } from '@/types/shipment';

interface LoginFormProps {
  accounts: UserAccount[];
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ accounts, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const cleanUser = username.trim().toLowerCase();
      const cleanPass = password.trim();

      const matched = accounts.find(
        (a) => a.username.toLowerCase() === cleanUser && a.password === cleanPass
      );

      if (matched) {
        const user: AuthUser = {
          id: matched.id,
          username: matched.username,
          role: matched.role,
          name: matched.name,
          permissions: matched.permissions || (matched.role === 'admin' ? DEFAULT_ADMIN_PERMISSIONS : DEFAULT_USER_PERMISSIONS),
          loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        onLoginSuccess(user);
      } else {
        setError('Invalid username or password.');
        setIsLoading(false);
      }
    }, 200);
  };

  const fillQuick = (u: string) => {
    const acc = accounts.find((a) => a.username.toLowerCase() === u.toLowerCase());
    if (acc) {
      setUsername(acc.username);
      setPassword(acc.password);
      setError('');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3.5 sm:p-4 bg-[#faf8f5] relative text-[#412D15]">
      <div className="w-full max-w-md bg-white border border-[#ebdcd0] rounded-2xl p-5 sm:p-8 shadow-sm">
        {/* Brand Header */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="inline-flex p-2.5 sm:p-3 bg-[#6E3511] rounded-2xl text-white mb-2.5 sm:mb-3 shadow-xs">
            <Scale className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#412D15] tracking-tight">
            PMS Cargo Gate
          </h1>
          <p className="text-xs sm:text-sm text-[#412D15]/75 mt-0.5 sm:mt-1 font-medium">
            Multi-Account Permission & Weighing Portal
          </p>
        </div>

        {/* Quick Test Accounts */}
        <div className="bg-[#faf6f2] border border-[#ebdcd0] rounded-xl p-3 sm:p-3.5 mb-4 sm:mb-5 text-xs text-[#412D15]">
          <div className="text-[11px] sm:text-xs text-[#412D15]/80 font-bold mb-2 flex items-center justify-between">
            <span className="uppercase tracking-wide">Quick Test Accounts:</span>
            <span className="font-mono text-[#6E3511] font-bold">{accounts.length} available</span>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
            {accounts.map(acc => (
              <button
                key={acc.id}
                type="button"
                onClick={() => fillQuick(acc.username)}
                className="p-2 sm:p-2.5 rounded-lg bg-white hover:bg-[#f6eee7] active:bg-[#ebdcd0] border border-[#ebdcd0] text-left transition shadow-2xs min-h-[42px]"
              >
                <div className="font-bold text-[#412D15] flex items-center justify-between truncate text-xs">
                  <span className="truncate">@{acc.username}</span>
                  <ArrowRight className="w-3 h-3 text-[#6E3511] shrink-0 ml-1" />
                </div>
                <div className="text-[10px] sm:text-[11px] text-[#6E3511] font-semibold capitalize truncate">{acc.role}</div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-3.5 sm:mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3.5 sm:space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#412D15] uppercase tracking-wider mb-1">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-[#faf6f2] text-[#412D15] font-semibold border border-[#ebdcd0] focus:border-[#6E3511] focus:bg-white rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm focus:outline-none transition min-h-[44px]"
              />
              <User className="w-4 h-4 text-[#6E3511] absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#412D15] uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#faf6f2] text-[#412D15] font-semibold border border-[#ebdcd0] focus:border-[#6E3511] focus:bg-white rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm focus:outline-none transition min-h-[44px]"
              />
              <Key className="w-4 h-4 text-[#6E3511] absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#6E3511] hover:bg-[#582a0d] active:bg-[#412D15] text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-xs sm:text-sm mt-2 disabled:opacity-50 shadow-xs min-h-[46px]"
          >
            <Lock className="w-4 h-4" />
            <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
