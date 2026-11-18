'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  RefreshCw,
  Menu,
  Lock
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
    if (currentUser?.permissions?.dispatch) {
      setActiveTab('dispatch');
    }
  };

  const handleUpdateShipment = (updatedShipment: Shipment) => {
    const updated = shipments.map((s) => (s.id === updatedShipment.id ? updatedShipment : s));
    saveShipments(updated);
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
      {/* Sidebar with wider layout (w-72) */}
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
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#ebdcd0] px-6 sm:px-8 h-20 flex items-center justify-between print:hidden shadow-2xs">
          {/* Left: Mobile menu & Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-[#412D15] hover:text-[#6E3511] rounded-xl hover:bg-[#faf6f2] transition"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div>
              <div className="text-xs font-bold text-[#412D15]/60 uppercase tracking-wider hidden sm:block">
                Terminal Gate • {settings.terminalCode}
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-black text-[#412D15] tracking-tight flex items-center gap-2">
                {activeSafeTab === 'dashboard' && 'Discrepancy & Tally Dashboard'}
                {activeSafeTab === 'inbound' && 'AWB Weight In (Intake Station)'}
                {activeSafeTab === 'dispatch' && 'AWB Weight Out & Gate Re-Weigh'}
                {activeSafeTab === 'audit' && 'Chain-of-Custody Audit Ledger'}
                {activeSafeTab === 'report' && 'Master Weight & Cargo Audit Report'}
                {activeSafeTab === 'permissions' && 'Permission Management'}
                {activeSafeTab === 'settings' && 'Password Reset'}
              </h1>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {currentUser?.permissions?.dashboard && pilferageCount > 0 && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold animate-pulse shadow-2xs"
              >
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span className="hidden sm:inline">
                  {pilferageCount} Discrepanc{pilferageCount > 1 ? 'ies' : 'y'}
                </span>
                <span className="sm:hidden">{pilferageCount}</span>
              </button>
            )}

            <button
              onClick={resetToSampleData}
              title="Reset sample data"
              className="text-xs md:text-sm text-[#412D15] hover:text-[#6E3511] p-2 sm:px-3.5 sm:py-2 rounded-xl bg-[#faf6f2] hover:bg-[#f6eee7] border border-[#ebdcd0] flex items-center gap-2 transition font-bold"
            >
              <RefreshCw className="w-4 h-4 text-[#6E3511]" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            {/* User role & handle pill */}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#ebdcd0] text-sm">
              <span className="text-[#412D15] font-bold">@{currentUser.username}</span>
              <span
                className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded uppercase ${
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

        {/* Main View Container with generous whitespace padding */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          {!isCurrentTabAllowed && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-900 text-sm">
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
                <div className="mt-8 border-t border-[#ebdcd0] pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg md:text-xl font-black text-[#412D15]">
                      Inspecting AWB:{' '}
                      <span className="font-mono text-[#6E3511]">{inspectShipment.awbNumber}</span> (
                      {inspectShipment.id})
                    </h3>
                    <button
                      onClick={() => setInspectShipment(null)}
                      className="text-sm text-[#412D15] hover:text-[#6E3511] bg-white px-4 py-2 rounded-xl border border-[#ebdcd0] font-bold shadow-2xs"
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

        {/* Footer */}
        <footer className="border-t border-[#ebdcd0] bg-white py-5 text-center text-xs md:text-sm text-[#412D15]/70 print:hidden mt-auto">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>PMS (Pilferage Management System) • Air Cargo Weight Verification Gate</span>
            <span>
              Signed in as: <strong className="text-[#412D15]">@{currentUser.username}</strong> ({currentUser.role})
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
