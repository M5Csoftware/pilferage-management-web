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
  X,
  ChevronRight
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
    subtitle: string;
    icon: React.ReactNode; 
    badge?: number | string; 
  }[] = [
    {
      id: 'dashboard',
      permissionKey: 'dashboard',
      label: 'Dashboard & Tally',
      subtitle: 'Overview & cargo discrepancy stats',
      icon: <LayoutDashboard className="w-5 h-5 stroke-[2]" />,
      badge: pilferageCount > 0 ? `${pilferageCount} Alert` : undefined,
    },
    {
      id: 'inbound',
      permissionKey: 'inbound',
      label: 'AWB Weight In',
      subtitle: 'Intake station & baseline weight',
      icon: <PackagePlus className="w-5 h-5 stroke-[2]" />,
    },
    {
      id: 'dispatch',
      permissionKey: 'dispatch',
      label: 'Weight Out & Gate Check',
      subtitle: 'Exit scale & anti-theft verify',
      icon: <Truck className="w-5 h-5 stroke-[2]" />,
    },
    {
      id: 'audit',
      permissionKey: 'audit',
      label: 'Audit & Weight Ledger',
      subtitle: 'Consignment chain-of-custody',
      icon: <ClipboardList className="w-5 h-5 stroke-[2]" />,
    },
    {
      id: 'report',
      permissionKey: 'report',
      label: 'Master Cargo Report',
      subtitle: 'Compliance, PDF & CSV export',
      icon: <FileSpreadsheet className="w-5 h-5 stroke-[2]" />,
    },
    {
      id: 'permissions',
      permissionKey: 'permissions',
      label: 'Permission Management',
      subtitle: 'Manage user accounts & modules',
      icon: <ShieldCheck className="w-5 h-5 stroke-[2]" />,
    },
    {
      id: 'settings',
      permissionKey: 'settings',
      label: 'Password Reset',
      subtitle: 'Terminal account security',
      icon: <SettingsIcon className="w-5 h-5 stroke-[2]" />,
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

      {/* Sidebar: Responsive slide-in on mobile (85vw max 380px) and static w-72 on desktop */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-[85vw] max-w-[360px] lg:w-72 bg-white border-r border-[#ebdcd0] shadow-2xl lg:shadow-none flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="overflow-y-auto no-scrollbar flex-1 flex flex-col">
          {/* Top Branding Section */}
          <div className="h-18 px-5 sm:px-6 border-b border-[#ebdcd0] flex items-center justify-between sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6E3511] flex items-center justify-center text-white shadow-xs shrink-0">
                <Scale className="w-5 h-5 stroke-[2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-[#412D15] tracking-tight text-lg">PMS GATE</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#6E3511]/10 text-[#6E3511] border border-[#6E3511]/25 uppercase tracking-wide">
                    Cargo
                  </span>
                </div>
                <div className="text-xs text-[#412D15]/70 font-medium truncate">
                  Pilferage Management System
                </div>
              </div>
            </div>

            <button 
              onClick={onCloseMobile}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-[#412D15] hover:bg-[#faf6f2] active:bg-[#ebdcd0] rounded-xl transition shrink-0"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card (Prominent at top of drawer on mobile) */}
          <div className="p-4 border-b border-[#ebdcd0] bg-[#faf6f2]">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-base shrink-0 shadow-2xs ${
                isAdmin 
                  ? 'bg-[#6E3511] text-white' 
                  : 'bg-[#412D15]/15 text-[#412D15]'
              }`}>
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-[#412D15] truncate">@{currentUser.username}</span>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                    isAdmin ? 'bg-[#6E3511] text-white' : 'bg-[#ebdcd0] text-[#412D15]'
                  }`}>
                    {currentUser.role}
                  </span>
                </div>
                <div className="text-xs text-[#412D15]/70 truncate font-medium">
                  {currentUser.name}
                </div>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#ebdcd0]/70 flex items-center justify-between text-[11px] text-[#412D15]/75">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-[#6E3511]" /> HUB-DEL-04
              </span>
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <Radio className="w-3.5 h-3.5 text-emerald-600" /> Scale Connected
              </span>
            </div>
          </div>

          {/* Navigation Items (Touch friendly 52px items) */}
          <nav className="p-3 sm:p-4 space-y-1.5 flex-1">
            <div className="px-3 py-1.5 text-xs font-bold text-[#412D15]/60 uppercase tracking-wider flex items-center justify-between">
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
                    w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition min-h-[50px]
                    ${isActive 
                      ? 'bg-[#6E3511] text-white shadow-xs' 
                      : 'text-[#412D15] hover:bg-[#faf5f0] active:bg-[#f6eee7]'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`shrink-0 ${isActive ? 'text-white' : 'text-[#6E3511]'}`}>
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-bold truncate leading-tight">{item.label}</div>
                      <div className={`text-[11px] truncate leading-tight mt-0.5 ${isActive ? 'text-amber-100/90' : 'text-[#412D15]/60'}`}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {item.badge && (
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isAlert 
                          ? isActive ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-700 border border-rose-200' 
                          : isActive ? 'bg-white/20 text-white' : 'bg-[#6E3511]/15 text-[#6E3511]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white/70' : 'text-[#412D15]/30'}`} />
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sign Out (Sticky at bottom) */}
        <div className="p-3 sm:p-4 border-t border-[#ebdcd0] bg-[#faf6f2] pb-safe">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-rose-700 hover:text-rose-800 hover:bg-rose-50 active:bg-rose-100 rounded-xl transition border border-rose-200/80 min-h-[46px] shadow-2xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};
