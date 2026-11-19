export type UserRole = 'admin' | 'user';

// Distinct feature modules in PMS that can be toggled per account
export type PermissionKey = 
  | 'dashboard'   // Discrepancy & Tally Dashboard
  | 'inbound'     // AWB Weight In (Intake Station)
  | 'dispatch'    // AWB Weight Out & Dispatch Gate
  | 'audit'       // Audit & Historical Weight Ledger
  | 'report'      // Master Tally & PDF/CSV Export
  | 'permissions' // Permission Management
  | 'settings';   // Password Reset

export interface UserPermissions {
  dashboard: boolean;
  inbound: boolean;
  dispatch: boolean;
  audit: boolean;
  report: boolean;
  permissions: boolean;
  settings: boolean;
}

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  role: UserRole; // strictly 'admin' or 'user'
  name: string;
  createdAt: string;
  permissions: UserPermissions;
}

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  permissions: UserPermissions;
  loginTime: string;
}

export const DEFAULT_ADMIN_PERMISSIONS: UserPermissions = {
  dashboard: true,
  inbound: true,
  dispatch: true,
  audit: true,
  report: true,
  permissions: true,
  settings: true,
};

export const DEFAULT_USER_PERMISSIONS: UserPermissions = {
  dashboard: false,
  inbound: true,
  dispatch: true,
  audit: false,
  report: false,
  permissions: false,
  settings: true,
};

export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  {
    id: 'ACC-001',
    username: 'admin',
    password: 'admin',
    role: 'admin',
    name: 'Super Admin Officer',
    createdAt: '2026-11-01',
    permissions: DEFAULT_ADMIN_PERMISSIONS,
  },
  {
    id: 'ACC-002',
    username: 'user',
    password: 'user',
    role: 'user',
    name: 'Floor Operator 1',
    createdAt: '2026-11-05',
    permissions: DEFAULT_USER_PERMISSIONS,
  },
  {
    id: 'ACC-003',
    username: 'auditor',
    password: 'user',
    role: 'user',
    name: 'Security & Loss Auditor',
    createdAt: '2026-11-10',
    permissions: {
      dashboard: true,
      inbound: false,
      dispatch: false,
      audit: true,
      report: true,
      permissions: false,
      settings: true,
    },
  },
  {
    id: 'ACC-004',
    username: 'gate_clerk',
    password: 'user',
    role: 'user',
    name: 'Dispatch Gate Attendant',
    createdAt: '2026-11-12',
    permissions: {
      dashboard: false,
      inbound: false,
      dispatch: true,
      audit: false,
      report: false,
      permissions: false,
      settings: true,
    },
  },
];

export interface Shipment {
  id: string;
  awbNumber: string;
  senderName: string;
  recipientName: string;
  origin: string;
  destination: string;
  category: 'Electronics' | 'Apparel' | 'High-Value' | 'Perishables' | 'General Freight' | 'Pharma';
  itemsCount: number;
  tolerancePercentage: number;
  
  // Inbound (Weight In)
  inboundDate: string;
  weightInKg: number;
  inboundOperator: string;
  inboundNotes?: string;
  sealNumberIn?: string;

  // Outbound (Weight Out / Dispatch)
  outboundDate?: string;
  weightOutKg?: number;
  outboundOperator?: string;
  sealNumberOut?: string;
  outboundNotes?: string;

  // Status & Analysis
  status: 'INBOUND_RECORDED' | 'DISPATCH_VERIFIED' | 'PILFERAGE_FLAGGED' | 'DISPATCHED_CLEARED';
  weightDiffKg?: number;
  weightLossPercentage?: number;
  flaggedReason?: string;

  // Photo Evidence
  weightInPhotoUrl?: string;
  weightOutPhotoUrl?: string;
}

export interface MasterTallySummary {
  totalShipments: number;
  weighedInCount: number;
  weighedOutCount: number;
  pendingOutCount: number;
  pilferedCount: number;
  clearedCount: number;
  
  totalWeightInKg: number;
  totalWeightOutKg: number;
  netWeightVarianceKg: number;
  totalMissingPilferedKg: number;
  discrepancyRatePercentage: number;
}

export const INITIAL_SHIPMENTS: Shipment[] = [];
