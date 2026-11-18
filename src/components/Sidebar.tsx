'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  PackagePlus, 
  Truck, 
  ClipboardList, 
  FileSpreadsheet, 
  Settings as SettingsIcon,
  ShieldCheck, 
  Scale, 
  LogOut, 
  Building2, 
  Radio, 
  X
} from 'lucide-react';
import { AuthUser, PermissionKey } from '@/types/shipment';

export type NavTab = 'dashboard' | 'inbound' | 'dispatch' | 'audit' | 'report' | 'permissions' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentUser: AuthUser;
  pilferageCount: number;
  onLogout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  pilferageCount,
  onLogout,
  isOpenMobile,
  onCloseMobile
}) => {
  const isAdmin = currentUser.role === 'admin';

  const allNavItems: { 
    id: NavTab; 
    permissionKey: PermissionKey;
    label: string; 
    icon: React.ReactNode; 
    badge?: number | string; 
  }[] = [
    {
      id: 'dashboard',
      permissionKey: 'dashboard',
      label: 'Dashboard & Tally',
      icon: <LayoutDashboard className="w-5 h-5 stroke-[1.75]" />,
      badge: pilferageCount > 0 ? `${pilferageCount} Alert` : undefined,
    },
    {
      id: 'inbound',
      permissionKey: 'inbound',
      label: 'AWB Weight In',
      icon: <PackagePlus className="w-5 h-5 stroke-[1.75]" />,
    },
    {
      id: 'dispatch',
      permissionKey: 'dispatch',
      label: 'Weight Out & Gate Check',
      icon: <Truck className="w-5 h-5 stroke-[1.75]" />,
    },
    {
      id: 'audit',
      permissionKey: 'audit',
      label: 'Audit & Weight Ledger',
      icon: <ClipboardList className="w-5 h-5 stroke-[1.75]" />,
    },
    {
      id: 'report',
      permissionKey: 'report',
      label: 'Master Report',
      icon: <FileSpreadsheet className="w-5 h-5 stroke-[1.75]" />,
    },
    {
      id: 'permissions',
      permissionKey: 'permissions',
      label: 'Permission Management',
      icon: <ShieldCheck className="w-5 h-5 stroke-[1.75]" />,
    },
    {
      id: 'settings',
      permissionKey: 'settings',
      label: 'Password Reset',
      icon: <SettingsIcon className="w-5 h-5 stroke-[1.75]" />,
    }
  ];

  const navItems = allNavItems.filter(item => {
    return currentUser.permissions && currentUser.permissions[item.permissionKey];
  });

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-50 bg-[#412D15]/50 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar with mobile drawer responsiveness (max-w-[85vw]) */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 max-w-[85vw] bg-white border-r border-[#ebdcd0] shadow-xl lg:shadow-none flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="overflow-y-auto no-scrollbar flex-1">
          {/* Top Branding Section */}
          <div className="h-18 sm:h-20 px-5 sm:px-6 border-b border-[#ebdcd0] flex items-center justify-between sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6E3511] flex items-center justify-center text-white shadow-xs shrink-0">
                <Scale className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#412D15] tracking-tight text-lg">PMS GATE</span>
                  <span className="text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded bg-[#6E3511]/10 text-[#6E3511] border border-[#6E3511]/25 uppercase tracking-wide">
                    Cargo
                  </span>
                </div>
                <div className="text-xs text-[#412D15]/70 font-normal truncate mt-0.5">
                  Pilferage Management System
                </div>
              </div>
            </div>

            <button 
              onClick={onCloseMobile}
              className="lg:hidden w-9 h-9 flex items-center justify-center text-[#412D15]/70 hover:text-[#412D15] hover:bg-[#faf6f2] rounded-xl transition shrink-0 ml-1"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Terminal status bar */}
          <div className="px-5 sm:px-6 py-3 border-b border-[#ebdcd0] bg-[#faf6f2]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#412D15]/75 flex items-center gap-1.5 font-medium">
                <Building2 className="w-3.5 h-3.5 text-[#6E3511]" /> Terminal:
              </span>
              <span className="font-mono text-xs font-bold text-[#412D15]">HUB-DEL-04</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1.5">
              <span className="text-[#412D15]/75 flex items-center gap-1.5 font-medium">
                <Radio className="w-3.5 h-3.5 text-emerald-600" /> Digital Scale:
              </span>
              <span className="text-emerald-700 font-mono text-[11px] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Connected
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 sm:p-4 space-y-1">
            <div className="px-3 py-2 text-xs font-bold text-[#412D15]/60 uppercase tracking-wider flex items-center justify-between">
              <span>Navigation Menu</span>
              <span className="font-mono text-[11px] text-[#6E3511] font-semibold">{navItems.length} modules</span>
            </div>

            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              const isAlert = item.id === 'dashboard' && pilferageCount > 0;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onCloseMobile();
                  }}
                  className={`
                    w-full flex items-center justify-between px-3.5 sm:px-4 py-3 rounded-xl text-sm font-bold transition min-h-[46px]
                    ${isActive 
                      ? 'bg-[#6E3511] text-white shadow-xs' 
                      : 'text-[#412D15]/85 hover:bg-[#faf5f0] hover:text-[#412D15] active:bg-[#f6eee7]'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-white' : 'text-[#6E3511]'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                      isAlert 
                        ? isActive ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700 border border-rose-200' 
                        : isActive ? 'bg-white/20 text-white' : 'bg-[#6E3511]/15 text-[#6E3511]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Sign Out (Sticky at bottom) */}
        <div className="p-3 sm:p-4 border-t border-[#ebdcd0] bg-[#faf6f2]">
          <div className="p-3 rounded-xl bg-white border border-[#ebdcd0] shadow-2xs mb-2">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                isAdmin 
                  ? 'bg-[#6E3511] text-white' 
                  : 'bg-[#412D15]/10 text-[#412D15]'
              }`}>
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[#412D15] truncate">@{currentUser.username}</div>
                <div className="text-xs text-[#412D15]/70 font-medium truncate">
                  {currentUser.role} • {currentUser.name}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold text-rose-700 hover:text-rose-800 hover:bg-rose-50 active:bg-rose-100 rounded-xl transition border border-rose-200/80 min-h-[42px]"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};
