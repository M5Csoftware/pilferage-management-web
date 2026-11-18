'use client';

import React, { useState } from 'react';
import { 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Eye, 
  EyeOff
} from 'lucide-react';
import { AuthUser, UserAccount } from '@/types/shipment';

interface SettingsViewProps {
  currentUser: AuthUser;
  accounts: UserAccount[];
  onUpdatePassword: (username: string, newPass: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  accounts,
  onUpdatePassword,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const [targetUsername, setTargetUsername] = useState<string>(currentUser.username);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const account = accounts.find((a) => a.username.toLowerCase() === targetUsername.toLowerCase());
    if (!account) {
      setMessage({ type: 'error', text: 'Target account not found.' });
      return;
    }

    if (targetUsername.toLowerCase() === currentUser.username.toLowerCase()) {
      if (currentPassword !== account.password) {
        setMessage({ type: 'error', text: 'Current password does not match.' });
        return;
      }
    }

    if (!newPassword || newPassword.trim().length < 3) {
      setMessage({ type: 'error', text: 'New password must be at least 3 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    onUpdatePassword(targetUsername, newPassword.trim());
    setMessage({
      type: 'success',
      text: `Password for @${targetUsername} updated successfully.`,
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto text-[#412D15]">
      {/* Header Banner */}
      <div className="bg-white border border-[#ebdcd0] rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#6E3511] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <KeyRound className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#412D15] tracking-tight">
              Password Reset
            </h2>
            <p className="text-xs md:text-sm text-[#412D15]/70 mt-0.5">
              Update password for @{targetUsername}.
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2.5 text-sm animate-fadeIn ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white border border-[#ebdcd0] rounded-2xl p-6 md:p-8 shadow-xs">
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#412D15] uppercase tracking-wider mb-2">
              Account Username
            </label>
            {isAdmin ? (
              <select
                value={targetUsername}
                onChange={(e) => {
                  setTargetUsername(e.target.value);
                  setMessage(null);
                }}
                className="w-full bg-[#faf6f2] text-[#412D15] font-mono font-bold border border-[#ebdcd0] rounded-xl px-4 py-3 text-sm focus:border-[#6E3511] focus:bg-white focus:outline-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.username} value={acc.username}>
                    @{acc.username} ({acc.role}) — {acc.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2.5 px-4 py-3 bg-[#faf6f2] border border-[#ebdcd0] rounded-xl text-sm text-[#412D15] font-mono font-bold">
                <User className="w-4 h-4 text-[#6E3511]" />
                <span>@{currentUser.username} ({currentUser.role})</span>
              </div>
            )}
          </div>

          {targetUsername.toLowerCase() === currentUser.username.toLowerCase() && (
            <div>
              <label className="block text-xs font-bold text-[#412D15] uppercase tracking-wider mb-2">
                Current Password *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[#faf6f2] text-[#412D15] border border-[#ebdcd0] rounded-xl px-4 py-3 text-sm focus:border-[#6E3511] focus:bg-white focus:outline-none transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#412D15] uppercase tracking-wider mb-2">
              New Password *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#faf6f2] text-[#412D15] border border-[#ebdcd0] rounded-xl px-4 py-3 text-sm focus:border-[#6E3511] focus:bg-white focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#412D15] uppercase tracking-wider mb-2">
              Confirm New Password *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Re-type new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#faf6f2] text-[#412D15] border border-[#ebdcd0] rounded-xl px-4 py-3 text-sm focus:border-[#6E3511] focus:bg-white focus:outline-none transition"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-[#412D15]/70 hover:text-[#412D15] flex items-center gap-1.5 font-medium"
            >
              {showPassword ? <EyeOff className="w-4 h-4 text-[#6E3511]" /> : <Eye className="w-4 h-4 text-[#6E3511]" />}
              <span>{showPassword ? 'Hide characters' : 'Show characters'}</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#6E3511] hover:bg-[#582a0d] text-white font-bold py-3.5 px-4 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-xs"
            >
              <KeyRound className="w-4 h-4" />
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
