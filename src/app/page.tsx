'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  RefreshCw,
  Menu,
  Lock,
  PackagePlus,
  Truck,
  LayoutDashboard,
  ClipboardList
} from 'lucide-react';
import { 
  Shipment, 
  INITIAL_SHIPMENTS, 
  AuthUser, 
  UserAccount, 
  INITIAL_USER_ACCOUNTS,
  DEFAULT_ADMIN_PERMISSIONS,
  DEFAULT_USER_PERMISSIONS 
} from '@/types/shipment';
import { SystemSettings, DEFAULT_SETTINGS } from '@/types/settings';
import { Sidebar, NavTab } from '@/components/Sidebar';
import { LoginForm } from '@/components/LoginForm';
import { InboundWeighForm } from '@/components/InboundWeighForm';
import { OutboundDispatch } from '@/components/OutboundDispatch';
import { ShipmentAuditList } from '@/components/ShipmentAuditList';
import { DiscrepancyDashboard } from '@/components/DiscrepancyDashboard';
import { MasterReport } from '@/components/MasterReport';
import { PermissionManagement } from '@/components/PermissionManagement';
import { SettingsView } from '@/components/SettingsView';
import { WeightComparisonCard } from '@/components/WeightComparisonCard';
import { 
  isSupabaseConfigured, 
  getShipmentsFromDb, 
  insertShipmentToDb, 
  updateShipmentInDb, 
  getUserAccountsFromDb, 
  upsertUserAccountInDb 
} from '@/lib/supabase';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [accounts, setAccounts] = useState<UserAccount[]>(INITIAL_USER_ACCOUNTS);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<NavTab>('inbound');
  const [inspectShipment, setInspectShipment] = useState<Shipment | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedAccounts = localStorage.getItem('PMS_ACCOUNTS_V3');
    let loadedAccounts = INITIAL_USER_ACCOUNTS;
    if (savedAccounts) {
      try {
        loadedAccounts = JSON.parse(savedAccounts);
        setAccounts(loadedAccounts);
      } catch (e) {
        setAccounts(INITIAL_USER_ACCOUNTS);
      }
    } else {
      localStorage.setItem('PMS_ACCOUNTS_V3', JSON.stringify(INITIAL_USER_ACCOUNTS));
    }

    const savedUser = localStorage.getItem('PMS_AUTH_USER');
    if (savedUser) {
      try {
        const u: AuthUser = JSON.parse(savedUser);
        const freshAccount = loadedAccounts.find(a => a.id === u.id || a.username === u.username);
        const permissionsFallback = freshAccount?.permissions || u.permissions || (u.role === 'admin' ? DEFAULT_ADMIN_PERMISSIONS : DEFAULT_USER_PERMISSIONS);
        const refreshedUser: AuthUser = {
          ...u,
          permissions: permissionsFallback
        };
        setCurrentUser(refreshedUser);

        const permittedTabs: NavTab[] = [
          'dashboard', 'inbound', 'dispatch', 'audit', 'report', 'permissions', 'settings'
        ];
        const defaultTab = permittedTabs.find(tab => refreshedUser.permissions?.[tab]) || 'inbound';
        setActiveTab(defaultTab);
      } catch (e) {
        localStorage.removeItem('PMS_AUTH_USER');
      }
    }

    const savedShipments = localStorage.getItem('PMS_SHIPMENTS_V2');
    if (savedShipments) {
      try {
        setShipments(JSON.parse(savedShipments));
      } catch (e) {
        setShipments(INITIAL_SHIPMENTS);
      }
    } else {
      setShipments(INITIAL_SHIPMENTS);
      localStorage.setItem('PMS_SHIPMENTS_V2', JSON.stringify(INITIAL_SHIPMENTS));
    }

    const savedSettings = localStorage.getItem('PMS_SETTINGS');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        setSettings(DEFAULT_SETTINGS);
      }
    }

    // Connect to Supabase live database if configured
    if (isSupabaseConfigured) {
      getUserAccountsFromDb().then(dbAccounts => {
        if (dbAccounts && dbAccounts.length > 0) {
          setAccounts(dbAccounts);
        }
      });

      getShipmentsFromDb().then(dbShipments => {
        if (dbShipments && dbShipments.length > 0) {
          setShipments(dbShipments);
        }
      });
    }
  }, []);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    localStorage.setItem('PMS_AUTH_USER', JSON.stringify(user));

    const tabsOrder: NavTab[] = ['dashboard', 'inbound', 'dispatch', 'audit', 'report', 'permissions', 'settings'];
    const landingTab = tabsOrder.find(t => user.permissions?.[t]) || 'inbound';
    setActiveTab(landingTab);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('PMS_AUTH_USER');
  };

  const handleUpdateAccounts = (newAccounts: UserAccount[]) => {
    setAccounts(newAccounts);
    localStorage.setItem('PMS_ACCOUNTS_V3', JSON.stringify(newAccounts));

    if (isSupabaseConfigured) {
      newAccounts.forEach(acc => upsertUserAccountInDb(acc));
    }

    if (currentUser) {
      const me = newAccounts.find(a => a.id === currentUser.id);
      if (me) {
        const updatedCurrentUser: AuthUser = {
          ...currentUser,
          permissions: me.permissions,
          role: me.role,
          name: me.name
        };
        setCurrentUser(updatedCurrentUser);
        localStorage.setItem('PMS_AUTH_USER', JSON.stringify(updatedCurrentUser));
      }
    }
  };

  const handleUpdatePassword = (username: string, newPass: string) => {
    const updated = accounts.map((acc) =>
      acc.username.toLowerCase() === username.toLowerCase()
        ? { ...acc, password: newPass }
        : acc
    );
    handleUpdateAccounts(updated);
  };

  const saveShipments = (newShipments: Shipment[]) => {
    setShipments(newShipments);
    localStorage.setItem('PMS_SHIPMENTS_V2', JSON.stringify(newShipments));
  };

  const handleShipmentRecorded = (newShipment: Shipment) => {
    const updated = [newShipment, ...shipments];
    saveShipments(updated);
    if (isSupabaseConfigured) {
      insertShipmentToDb(newShipment);
    }
    if (currentUser?.permissions?.dispatch) {
      setActiveTab('dispatch');
    }
  };

  const handleUpdateShipment = (updatedShipment: Shipment) => {
    const updated = shipments.map((s) => (s.id === updatedShipment.id ? updatedShipment : s));
    saveShipments(updated);
    if (isSupabaseConfigured) {
      updateShipmentInDb(updatedShipment);
    }
  };

  const resetToSampleData = () => {
    saveShipments(INITIAL_SHIPMENTS);
    setInspectShipment(null);
  };

  if (!currentUser) {
    return <LoginForm accounts={accounts} onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = currentUser.role === 'admin';
  const pilferageCount = shipments.filter((s) => s.status === 'PILFERAGE_FLAGGED').length;

  const hasAccessToTab = (tab: NavTab): boolean => {
    return Boolean(currentUser?.permissions?.[tab]);
  };

  const isCurrentTabAllowed = hasAccessToTab(activeTab);

  const tabsList: NavTab[] = ['dashboard', 'inbound', 'dispatch', 'audit', 'report', 'permissions', 'settings'];
  const firstAllowedTab = tabsList.find(t => hasAccessToTab(t)) || 'inbound';
  const activeSafeTab = isCurrentTabAllowed ? activeTab : firstAllowedTab;

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#412D15] flex font-sans selection:bg-[#6E3511] selection:text-white">
      {/* Sidebar with responsive slide-in drawer */}
      <Sidebar
        currentTab={activeSafeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setInspectShipment(null);
        }}
        currentUser={currentUser}
        pilferageCount={pilferageCount}
        onLogout={handleLogout}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header Bar (Mobile Friendly) */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#ebdcd0] px-3.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between print:hidden shadow-2xs">
          {/* Left: Mobile menu button & Module Title */}
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-[#412D15] hover:text-[#6E3511] rounded-xl hover:bg-[#faf6f2] active:bg-[#f6eee7] transition shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs font-bold text-[#412D15]/60 uppercase tracking-wider hidden xs:block truncate">
                Terminal Gate • {settings.terminalCode}
              </div>
              <h1 className="text-sm xs:text-base sm:text-xl md:text-2xl font-black text-[#412D15] tracking-tight truncate max-w-[170px] xs:max-w-[260px] sm:max-w-none">
                {activeSafeTab === 'dashboard' && 'Dashboard & Tally'}
                {activeSafeTab === 'inbound' && 'AWB Weight In'}
                {activeSafeTab === 'dispatch' && 'Weight Out & Gate Check'}
                {activeSafeTab === 'audit' && 'Chain-of-Custody Audit'}
                {activeSafeTab === 'report' && 'Master Cargo Report'}
                {activeSafeTab === 'permissions' && 'Permission Management'}
                {activeSafeTab === 'settings' && 'Password Reset'}
              </h1>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {currentUser?.permissions?.dashboard && pilferageCount > 0 && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-1.5 sm:gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold animate-pulse shadow-2xs min-h-[38px]"
              >
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="hidden sm:inline">
                  {pilferageCount} Discrepanc{pilferageCount > 1 ? 'ies' : 'y'}
                </span>
                <span className="sm:hidden font-mono">{pilferageCount}</span>
              </button>
            )}

            <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#faf6f2] border border-[#ebdcd0] text-xs font-semibold">
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-[11px] font-mono text-[#412D15]">
                {isSupabaseConfigured ? 'Supabase' : 'Offline'}
              </span>
            </div>

            <button
              onClick={resetToSampleData}
              title="Reset sample data"
              className="text-xs sm:text-sm text-[#412D15] hover:text-[#6E3511] p-2 sm:px-3.5 sm:py-2 rounded-xl bg-[#faf6f2] hover:bg-[#f6eee7] border border-[#ebdcd0] flex items-center gap-1.5 sm:gap-2 transition font-bold min-h-[38px]"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6E3511]" />
              <span className="hidden md:inline">Reset Demo</span>
            </button>

            {/* User role & handle pill */}
            <div className="hidden sm:flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#ebdcd0] text-sm">
              <span className="text-[#412D15] font-bold truncate max-w-[100px]">@{currentUser.username}</span>
              <span
                className={`text-xs font-bold font-mono px-2 py-0.5 rounded uppercase ${
                  isAdmin
                    ? 'bg-[#6E3511] text-white'
                    : 'bg-[#ebdcd0] text-[#412D15]'
                }`}
              >
                {currentUser.role}
              </span>
            </div>
          </div>
        </header>

        {/* Main View Container with mobile-adapted padding (p-3.5 sm:p-6 lg:p-10) */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-10 pb-24 lg:pb-10 max-w-7xl w-full mx-auto">
          {!isCurrentTabAllowed && (
            <div className="mb-4 sm:mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-900 text-sm">
              <Lock className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                Access Restricted: Your user account (@{currentUser.username}) is not authorized to view this module.
              </span>
            </div>
          )}

          {/* Tab View: Dashboard */}
          {activeSafeTab === 'dashboard' && hasAccessToTab('dashboard') && (
            <div className="animate-fadeIn">
              <DiscrepancyDashboard
                shipments={shipments}
                settings={settings}
                onNavigateToTab={(tab) => {
                  if (hasAccessToTab(tab)) setActiveTab(tab);
                }}
                onSelectShipment={(s) => {
                  if (hasAccessToTab('audit')) {
                    setInspectShipment(s);
                    setActiveTab('audit');
                  }
                }}
              />
            </div>
          )}

          {/* Tab View: Inbound */}
          {activeSafeTab === 'inbound' && hasAccessToTab('inbound') && (
            <div className="animate-fadeIn">
              <InboundWeighForm
                onShipmentRecorded={handleShipmentRecorded}
                currentUser={currentUser}
                settings={settings}
              />
            </div>
          )}

          {/* Tab View: Dispatch Re-weigh */}
          {activeSafeTab === 'dispatch' && hasAccessToTab('dispatch') && (
            <div className="animate-fadeIn">
              <OutboundDispatch
                shipments={shipments}
                onUpdateShipment={handleUpdateShipment}
                currentUser={currentUser}
                settings={settings}
              />
            </div>
          )}

          {/* Tab View: Audit Ledger */}
          {activeSafeTab === 'audit' && hasAccessToTab('audit') && (
            <div className="animate-fadeIn space-y-6">
              <ShipmentAuditList
                shipments={shipments}
                onSelectShipment={(s) => setInspectShipment(s)}
                currentUser={currentUser}
              />

              {inspectShipment && (
                <div className="mt-6 sm:mt-8 border-t border-[#ebdcd0] pt-6 sm:pt-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h3 className="text-base sm:text-lg md:text-xl font-black text-[#412D15] truncate">
                      Inspecting AWB:{' '}
                      <span className="font-mono text-[#6E3511]">{inspectShipment.awbNumber}</span> (
                      {inspectShipment.id})
                    </h3>
                    <button
                      onClick={() => setInspectShipment(null)}
                      className="self-start sm:self-auto text-xs sm:text-sm text-[#412D15] hover:text-[#6E3511] bg-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-[#ebdcd0] font-bold shadow-2xs"
                    >
                      Close Inspection
                    </button>
                  </div>
                  <WeightComparisonCard
                    shipment={inspectShipment}
                    testWeightOut={inspectShipment.weightOutKg}
                  />
                </div>
              )}
            </div>
          )}

          {/* Tab View: Master Report */}
          {activeSafeTab === 'report' && hasAccessToTab('report') && (
            <div className="animate-fadeIn">
              <MasterReport
                shipments={shipments}
                currentUser={currentUser}
                settings={settings}
              />
            </div>
          )}

          {/* Tab View: Permission Management */}
          {activeSafeTab === 'permissions' && hasAccessToTab('permissions') && (
            <div className="animate-fadeIn">
              <PermissionManagement
                accounts={accounts}
                currentUserId={currentUser.id}
                onUpdateAccounts={handleUpdateAccounts}
              />
            </div>
          )}

          {/* Tab View: Password Reset */}
          {activeSafeTab === 'settings' && hasAccessToTab('settings') && (
            <div className="animate-fadeIn">
              <SettingsView
                currentUser={currentUser}
                accounts={accounts}
                onUpdatePassword={handleUpdatePassword}
              />
            </div>
          )}
        </main>

        {/* Mobile Persistent Bottom Bar (For quick warehouse thumb navigation) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#ebdcd0] px-2 py-1.5 flex items-center justify-around shadow-lg">
          {hasAccessToTab('inbound') && (
            <button
              onClick={() => {
                setActiveTab('inbound');
                setInspectShipment(null);
              }}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition flex-1 min-h-[48px] ${
                activeSafeTab === 'inbound' ? 'text-[#6E3511] font-bold' : 'text-[#412D15]/60 hover:text-[#412D15]'
              }`}
            >
              <PackagePlus className={`w-5 h-5 ${activeSafeTab === 'inbound' ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] mt-0.5">Weight In</span>
            </button>
          )}

          {hasAccessToTab('dispatch') && (
            <button
              onClick={() => {
                setActiveTab('dispatch');
                setInspectShipment(null);
              }}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition flex-1 min-h-[48px] ${
                activeSafeTab === 'dispatch' ? 'text-[#6E3511] font-bold' : 'text-[#412D15]/60 hover:text-[#412D15]'
              }`}
            >
              <Truck className={`w-5 h-5 ${activeSafeTab === 'dispatch' ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] mt-0.5">Weight Out</span>
            </button>
          )}

          {hasAccessToTab('dashboard') && (
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setInspectShipment(null);
              }}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition flex-1 min-h-[48px] relative ${
                activeSafeTab === 'dashboard' ? 'text-[#6E3511] font-bold' : 'text-[#412D15]/60 hover:text-[#412D15]'
              }`}
            >
              <LayoutDashboard className={`w-5 h-5 ${activeSafeTab === 'dashboard' ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] mt-0.5">Dashboard</span>
              {pilferageCount > 0 && (
                <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>
          )}

          {hasAccessToTab('audit') && (
            <button
              onClick={() => {
                setActiveTab('audit');
                setInspectShipment(null);
              }}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition flex-1 min-h-[48px] ${
                activeSafeTab === 'audit' ? 'text-[#6E3511] font-bold' : 'text-[#412D15]/60 hover:text-[#412D15]'
              }`}
            >
              <ClipboardList className={`w-5 h-5 ${activeSafeTab === 'audit' ? 'stroke-[2.2]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] mt-0.5">Audit</span>
            </button>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center p-1.5 rounded-xl transition flex-1 text-[#412D15]/60 hover:text-[#412D15] min-h-[48px]"
          >
            <Menu className="w-5 h-5 stroke-[1.75]" />
            <span className="text-[10px] mt-0.5">Menu</span>
          </button>
        </nav>

        {/* Footer */}
        <footer className="border-t border-[#ebdcd0] bg-white py-4 sm:py-5 text-center text-xs text-[#412D15]/70 print:hidden mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2">
            <span>PMS (Pilferage Management System) • Air Cargo Verification Gate</span>
            <span>
              Signed in as: <strong className="text-[#412D15]">@{currentUser.username}</strong> ({currentUser.role})
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
