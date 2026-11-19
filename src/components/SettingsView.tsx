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
import { getCloudinaryConfig } from '@/lib/cloudinary';
import { Cloud, Check, Copy } from 'lucide-react';

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
    <div className="space-y-4 sm:space-y-6 w-full max-w-4xl mx-auto text-[#412D15]">
      {/* Header Banner */}
      <div className="bg-white border border-[#ebdcd0] rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#6E3511] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#412D15] tracking-tight">
              Password Reset
            </h2>
            <p className="text-xs sm:text-sm text-[#412D15]/70 mt-0.5">
              Update password for @{targetUsername}.
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 sm:p-4 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm animate-fadeIn ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white border border-[#ebdcd0] rounded-2xl p-4 sm:p-6 md:p-8 shadow-xs">
        <form onSubmit={handleResetPassword} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#412D15] uppercase tracking-wider mb-1.5 sm:mb-2">
              Account Username
            </label>
            {isAdmin ? (
              <select
                value={targetUsername}
                onChange={(e) => {
                  setTargetUsername(e.target.value);
                  setMessage(null);
                }}
                className="w-full bg-[#faf6f2] text-[#412D15] font-mono font-bold border border-[#ebdcd0] rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm focus:border-[#6E3511] focus:bg-white focus:outline-none min-h-[44px]"
              >
                {accounts.map((acc) => (
                  <option key={acc.username} value={acc.username}>
                    @{acc.username} ({acc.role}) — {acc.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2 px-3.5 py-2.5 sm:py-3 bg-[#faf6f2] border border-[#ebdcd0] rounded-xl text-xs sm:text-sm text-[#412D15] font-mono font-bold min-h-[44px]">
                <User className="w-4 h-4 text-[#6E3511]" />
                <span>@{currentUser.username} ({currentUser.role})</span>
              </div>
            )}
          </div>

          {targetUsername.toLowerCase() === currentUser.username.toLowerCase() && (
            <div>
              <label className="block text-xs font-bold text-[#412D15] uppercase tracking-wider mb-1.5 sm:mb-2">
                Current Password *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[#faf6f2] text-[#412D15] border border-[#ebdcd0] rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm focus:border-[#6E3511] focus:bg-white focus:outline-none transition min-h-[44px]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#412D15] uppercase tracking-wider mb-1.5 sm:mb-2">
              New Password *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#faf6f2] text-[#412D15] border border-[#ebdcd0] rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm focus:border-[#6E3511] focus:bg-white focus:outline-none transition min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#412D15] uppercase tracking-wider mb-1.5 sm:mb-2">
              Confirm New Password *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Re-type new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#faf6f2] text-[#412D15] border border-[#ebdcd0] rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm focus:border-[#6E3511] focus:bg-white focus:outline-none transition min-h-[44px]"
            />
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-[#412D15]/70 hover:text-[#412D15] flex items-center gap-1.5 font-medium py-1"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5 text-[#6E3511]" /> : <Eye className="w-3.5 h-3.5 text-[#6E3511]" />}
              <span>{showPassword ? 'Hide characters' : 'Show characters'}</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#6E3511] hover:bg-[#582a0d] active:bg-[#412D15] text-white font-bold py-3 sm:py-3.5 px-4 rounded-xl transition text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs min-h-[46px]"
            >
              <KeyRound className="w-4 h-4" />
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </div>

      {/* Cloudinary Storage Setup Status Banner */}
      <div className="bg-white border border-[#ebdcd0] rounded-2xl p-4 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#faf6f2] border border-[#ebdcd0] flex items-center justify-center text-[#6E3511]">
              <Cloud className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#412D15]">
                Cloudinary Storage Integration
              </h3>
              <p className="text-[11px] text-[#412D15]/70">
                Persistent 25 GB free cloud photo evidence tier
              </p>
            </div>
          </div>

          <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full border ${
            getCloudinaryConfig().isConfigured 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            {getCloudinaryConfig().isConfigured ? '🟢 Connected' : '🟡 Keys Pending in .env'}
          </span>
        </div>

        {getCloudinaryConfig().isConfigured ? (
          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              Cloudinary is configured and ready for live uploads!
            </div>
            <div className="font-mono text-[11px] text-emerald-800">
              Cloud Name: <strong>{getCloudinaryConfig().cloudName}</strong> • Preset: <strong>{getCloudinaryConfig().uploadPreset}</strong>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs text-[#412D15]">
            <p className="text-[#412D15]/80 text-[11px] sm:text-xs leading-relaxed">
              When ready, paste your free Cloudinary credentials into your <code className="font-mono font-bold bg-[#faf6f2] px-1 py-0.5 rounded border border-[#ebdcd0]">.env.local</code> file:
            </p>

            <div className="bg-[#24170c] text-amber-100/90 font-mono text-[11px] p-3 rounded-xl border border-[#412D15] space-y-1">
              <div><span className="text-amber-400">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</span>=your_cloud_name</div>
              <div><span className="text-amber-400">NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</span>=your_unsigned_preset</div>
            </div>

            <div className="bg-[#faf6f2] p-3 rounded-xl border border-[#ebdcd0] text-[11px] text-[#412D15]/80 space-y-1">
              <strong className="text-[#412D15] block">Quick 2-minute steps:</strong>
              <div>1. Sign up for free at <span className="font-mono text-[#6E3511]">cloudinary.com</span> (No credit card needed).</div>
              <div>2. Copy your <strong>Cloud Name</strong> from the Cloudinary dashboard.</div>
              <div>3. In Cloudinary <strong>Settings $\rightarrow$ Upload $\rightarrow$ Upload presets</strong>, click <strong>Add upload preset</strong>, set Signing Mode to <strong>Unsigned</strong>, and click Save.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
