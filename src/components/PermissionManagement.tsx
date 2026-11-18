'use client';

import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  LayoutDashboard, 
  PackagePlus, 
  Truck, 
  ClipboardList, 
  FileSpreadsheet, 
  Settings as SettingsIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  UserAccount, 
  UserPermissions, 
  PermissionKey, 
  DEFAULT_USER_PERMISSIONS, 
  DEFAULT_ADMIN_PERMISSIONS 
} from '@/types/shipment';

interface PermissionManagementProps {
  accounts: UserAccount[];
  currentUserId: string;
  onUpdateAccounts: (accounts: UserAccount[]) => void;
}

const MODULE_DEFINITIONS: { 
  key: PermissionKey; 
  title: string; 
  description: string; 
  icon: React.ReactNode 
}[] = [
  {
    key: 'dashboard',
    title: 'Dashboard & Tally',
    description: 'Overview metrics, live pilferage alert banners, and net cargo reconciliations.',
    icon: <LayoutDashboard className="w-5 h-5 text-[#6E3511]" />
  },
  {
    key: 'inbound',
    title: 'AWB Weight In (Intake)',
    description: 'Log arrival scale readings, barcode seals, carrier origins, and baseline weight.',
    icon: <PackagePlus className="w-5 h-5 text-[#6E3511]" />
  },
  {
    key: 'dispatch',
    title: 'Weight Out & Gate Check',
    description: 'Re-weigh parcels on dispatch, compare against baseline, and issue clearances or theft holds.',
    icon: <Truck className="w-5 h-5 text-[#6E3511]" />
  },
  {
    key: 'audit',
    title: 'Audit & Weight Ledger',
    description: 'Searchable historical chain-of-custody ledger with itemized variance records.',
    icon: <ClipboardList className="w-5 h-5 text-[#6E3511]" />
  },
  {
    key: 'report',
    title: 'Master Report',
    description: 'Print official station audit reports, supervisor sign-offs, and CSV exports.',
    icon: <FileSpreadsheet className="w-5 h-5 text-[#6E3511]" />
  },
  {
    key: 'permissions',
    title: 'Permission Management',
    description: 'Authorize or restrict specific application screens for operators and administrators.',
    icon: <ShieldCheck className="w-5 h-5 text-[#6E3511]" />
  },
  {
    key: 'settings',
    title: 'Password Reset',
    description: 'Self-service password update for terminal operator accounts.',
    icon: <SettingsIcon className="w-5 h-5 text-[#6E3511]" />
  }
];

export const PermissionManagement: React.FC<PermissionManagementProps> = ({
  accounts,
  currentUserId,
  onUpdateAccounts
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('user');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');

  const selectedAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];

  const handleTogglePermission = (permissionKey: PermissionKey) => {
    if (!selectedAccount) return;

    if (selectedAccount.id === currentUserId && permissionKey === 'permissions') {
      alert('Safety Lock: You cannot disable your own Permission Management privilege.');
      return;
    }

    const updatedPermissions: UserPermissions = {
      ...selectedAccount.permissions,
      [permissionKey]: !selectedAccount.permissions[permissionKey]
    };

    const updatedAccounts = accounts.map(acc => 
      acc.id === selectedAccount.id 
        ? { ...acc, permissions: updatedPermissions }
        : acc
    );

    onUpdateAccounts(updatedAccounts);
    setFeedbackMessage({
      type: 'success',
      text: `Updated "${MODULE_DEFINITIONS.find(m => m.key === permissionKey)?.title}" permission for @${selectedAccount.username}.`
    });
    setTimeout(() => setFeedbackMessage(null), 2500);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newName.trim()) {
      alert('Please fill in username and full name.');
      return;
    }

    const usernameClean = newUsername.trim().toLowerCase();
    if (accounts.some(a => a.username.toLowerCase() === usernameClean)) {
      alert(`Username "${usernameClean}" is already in use.`);
      return;
    }

    const newAcc: UserAccount = {
      id: `ACC-${Math.floor(100 + Math.random() * 900)}`,
      username: usernameClean,
      name: newName.trim(),
      password: newPassword || 'user',
      role: newRole,
      createdAt: new Date().toISOString().slice(0, 10),
      permissions: newRole === 'admin' 
        ? { ...DEFAULT_ADMIN_PERMISSIONS } 
        : { ...DEFAULT_USER_PERMISSIONS }
    };

    const updated = [...accounts, newAcc];
    onUpdateAccounts(updated);
    setSelectedAccountId(newAcc.id);
    setIsCreatingNew(false);
    setNewUsername('');
    setNewName('');
    setNewPassword('user');
    setFeedbackMessage({
      type: 'success',
      text: `Account "@${newAcc.username}" (${newAcc.role}) created successfully.`
    });
    setTimeout(() => setFeedbackMessage(null), 2500);
  };

  const handleDeleteAccount = (accToDelete: UserAccount) => {
    if (accToDelete.id === currentUserId) {
      alert('You cannot delete your own currently logged-in account.');
      return;
    }

    if (confirm(`Are you sure you want to delete account "@${accToDelete.username}"?`)) {
      const remaining = accounts.filter(a => a.id !== accToDelete.id);
      onUpdateAccounts(remaining);
      setSelectedAccountId(remaining[0]?.id || '');
      setFeedbackMessage({
        type: 'success',
        text: `Account "@${accToDelete.username}" deleted.`
      });
      setTimeout(() => setFeedbackMessage(null), 2500);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 text-[#412D15]">
      {/* Top Banner */}
      <div className="bg-white border border-[#ebdcd0] rounded-2xl p-4 sm:p-6 md:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#412D15] flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#6E3511] stroke-[2] shrink-0" />
            <span>Permission Management</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#412D15]/70 font-normal mt-0.5">
            Manage user accounts (admin or user) and customize what each account can see and do.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingNew(!isCreatingNew)}
          className="text-xs sm:text-sm bg-[#6E3511] hover:bg-[#582a0d] active:bg-[#412D15] text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition self-start sm:self-auto font-bold shadow-xs min-h-[42px]"
        >
          <UserPlus className="w-4 h-4 shrink-0" />
          <span>{isCreatingNew ? 'Close Form' : '+ Add Account'}</span>
        </button>
      </div>

      {feedbackMessage && (
        <div className={`p-3.5 sm:p-4 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm animate-fadeIn ${
          feedbackMessage.type === 'success' 
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          {feedbackMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
          <span className="font-medium">{feedbackMessage.text}</span>
        </div>
      )}

      {/* New Account Creation Form */}
      {isCreatingNew && (
        <div className="bg-white border border-[#ebdcd0] rounded-2xl p-4 sm:p-6 md:p-8 shadow-xs animate-fadeIn">
          <h3 className="text-xs sm:text-sm font-bold text-[#412D15] uppercase tracking-wider mb-3.5 flex items-center gap-2">
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-[#6E3511]" />
            <span>Create Account (Category: Admin or User)</span>
          </h3>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 text-sm">
            <div>
              <label className="block text-[#412D15] font-bold uppercase text-[11px] mb-1">Username *</label>
              <input
                type="text"
                required
                placeholder="e.g. gate_operator_2"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full bg-[#faf6f2] text-[#412D15] font-mono font-bold border border-[#ebdcd0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#6E3511] focus:bg-white focus:outline-none min-h-[42px]"
              />
            </div>

            <div>
              <label className="block text-[#412D15] font-bold uppercase text-[11px] mb-1">Display Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Ray"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-[#faf6f2] text-[#412D15] border border-[#ebdcd0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#6E3511] focus:bg-white focus:outline-none min-h-[42px]"
              />
            </div>

            <div>
              <label className="block text-[#412D15] font-bold uppercase text-[11px] mb-1">Password</label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#faf6f2] text-[#412D15] border border-[#ebdcd0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#6E3511] focus:bg-white focus:outline-none min-h-[42px]"
              />
            </div>

            <div>
              <label className="block text-[#412D15] font-bold uppercase text-[11px] mb-1">Category (Role)</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'admin' | 'user')}
                className="w-full bg-[#faf6f2] text-[#412D15] font-semibold border border-[#ebdcd0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:border-[#6E3511] focus:bg-white focus:outline-none min-h-[42px]"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
            </div>

            <div className="sm:col-span-2 md:col-span-4 flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-4 py-2 rounded-xl text-[#412D15]/75 hover:text-[#412D15] border border-[#ebdcd0] font-semibold text-xs sm:text-sm min-h-[40px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#6E3511] hover:bg-[#582a0d] active:bg-[#412D15] text-white rounded-xl font-bold shadow-xs text-xs sm:text-sm min-h-[40px]"
              >
                Save Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile-Only Account Selector Carousel: fast 1-tap switching without having to scroll down */}
      <div className="lg:hidden bg-white border border-[#ebdcd0] rounded-2xl p-3 shadow-xs">
        <div className="text-xs font-bold text-[#412D15]/70 uppercase tracking-wide mb-2 flex items-center justify-between">
          <span>Switch Account to Manage:</span>
          <span className="font-mono text-[#6E3511] font-bold">{accounts.length} Total</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {accounts.map(acc => {
            const isSelected = selectedAccount?.id === acc.id;
            return (
              <button
                key={acc.id}
                onClick={() => setSelectedAccountId(acc.id)}
                className={`px-3 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap border shrink-0 transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#6E3511] text-white border-[#6E3511] shadow-2xs'
                    : 'bg-[#faf6f2] text-[#412D15] border-[#ebdcd0] hover:bg-[#f6eee7]'
                }`}
              >
                <span>@{acc.username}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded uppercase ${
                  isSelected ? 'bg-black/25 text-white' : 'bg-[#ebdcd0] text-[#412D15]'
                }`}>
                  {acc.role}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left: Accounts Roster (Hidden on Mobile because of the mobile strip above) */}
        <div className="hidden lg:block lg:col-span-4 bg-white border border-[#ebdcd0] rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="text-xs font-bold text-[#412D15]/70 uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Accounts ({accounts.length})</span>
            <Users className="w-4 h-4 text-[#6E3511]" />
          </div>

          <div className="space-y-2">
            {accounts.map(acc => {
              const isSelected = selectedAccount?.id === acc.id;
              const isSelf = acc.id === currentUserId;

              return (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccountId(acc.id)}
                  className={`p-3.5 sm:p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected 
                      ? 'bg-[#6E3511] text-white border-[#6E3511] shadow-xs' 
                      : 'bg-[#faf6f2] border-[#ebdcd0] hover:border-[#dfcebf] hover:bg-[#f6eee7]'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-mono font-bold truncate ${isSelected ? 'text-white' : 'text-[#412D15]'}`}>
                        @{acc.username}
                      </span>
                      {isSelf && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-[#ebdcd0] text-[#412D15]'}`}>
                          You
                        </span>
                      )}
                    </div>
                    <div className={`text-xs truncate font-medium mt-0.5 ${isSelected ? 'text-amber-100/90' : 'text-[#412D15]/70'}`}>
                      {acc.name}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      acc.role === 'admin' 
                        ? isSelected ? 'bg-black/25 text-white border border-white/20' : 'bg-[#6E3511] text-white'
                        : isSelected ? 'bg-black/25 text-white border border-white/20' : 'bg-[#ebdcd0] text-[#412D15]'
                    }`}>
                      {acc.role}
                    </span>

                    {!isSelf && accounts.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAccount(acc);
                        }}
                        title="Delete user"
                        className={`p-1.5 rounded transition ${isSelected ? 'text-amber-100 hover:text-white' : 'text-[#412D15]/50 hover:text-rose-600'}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Permission Toggles Matrix */}
        <div className="lg:col-span-8 bg-white border border-[#ebdcd0] rounded-2xl p-4 sm:p-6 md:p-8 shadow-xs">
          {selectedAccount ? (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 sm:pb-5 mb-4 sm:mb-5 border-b border-[#ebdcd0]">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-base sm:text-lg md:text-xl font-bold font-mono text-[#412D15]">@{selectedAccount.username}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#faf6f2] text-[#412D15] font-bold border border-[#ebdcd0]">
                      {selectedAccount.role}
                    </span>
                  </div>
                  <div className="text-xs text-[#412D15]/70 font-medium mt-0.5">
                    {selectedAccount.name}
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-[#412D15]/70 font-mono">
                  Allowed Modules: <strong className="text-[#6E3511] font-bold">{Object.values(selectedAccount.permissions).filter(Boolean).length} / {MODULE_DEFINITIONS.length}</strong>
                </div>
              </div>

              {/* Module Permissions Toggles */}
              <div className="space-y-2.5 sm:space-y-3">
                {MODULE_DEFINITIONS.map(mod => {
                  const isEnabled = selectedAccount.permissions[mod.key];

                  return (
                    <div
                      key={mod.key}
                      onClick={() => handleTogglePermission(mod.key)}
                      className={`p-3.5 sm:p-5 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                        isEnabled
                          ? 'bg-[#faf6f2] border-[#ebdcd0] shadow-2xs'
                          : 'bg-white border-[#ebdcd0] hover:border-[#dfcebf]'
                      }`}
                    >
                      <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                        <div className={`p-2 sm:p-2.5 rounded-xl border mt-0.5 shrink-0 ${
                          isEnabled 
                            ? 'bg-[#6E3511] text-white border-[#6E3511]' 
                            : 'bg-[#faf6f2] text-[#412D15]/40 border-[#ebdcd0]'
                        }`}>
                          {mod.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 truncate">
                            <span className={`text-xs sm:text-sm md:text-base font-bold truncate ${
                              isEnabled ? 'text-[#412D15]' : 'text-[#412D15]/50'
                            }`}>
                              {mod.title}
                            </span>
                            <span className={`text-[10px] sm:text-xs font-mono uppercase px-1.5 sm:px-2 py-0.5 rounded font-bold shrink-0 ${
                              isEnabled 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                : 'bg-[#faf6f2] text-[#412D15]/50 border border-[#ebdcd0]'
                            }`}>
                              {isEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs md:text-sm text-[#412D15]/70 mt-0.5 line-clamp-2">
                            {mod.description}
                          </p>
                        </div>
                      </div>

                      {/* Custom Toggle Switch */}
                      <div className="shrink-0 ml-2">
                        <div className={`w-11 sm:w-12 h-6 rounded-full transition relative p-0.5 ${
                          isEnabled ? 'bg-[#6E3511]' : 'bg-[#ebdcd0]'
                        }`}>
                          <div className={`w-5 h-5 rounded-full bg-white transition transform ${
                            isEnabled ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0'
                          } shadow-xs`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-[#412D15]/60 text-xs sm:text-sm">
              Select an account on the left to configure module permissions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
