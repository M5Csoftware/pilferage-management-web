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

export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: "SHP-98214",
    awbNumber: "AWB-2026-8801",
    senderName: "Shenzhen Tech Logistics",
    recipientName: "Metro Hub Warehouse #4",
    origin: "Shenzhen Cargo Air Terminal",
    destination: "Delhi Cargo Terminal Hub",
    category: "Electronics",
    itemsCount: 42,
    tolerancePercentage: 1.0,
    inboundDate: "2026-11-18 09:30",
    weightInKg: 125.80,
    inboundOperator: "Marcus Vance",
    sealNumberIn: "SEAL-A9921",
    status: "INBOUND_RECORDED",
  },
  {
    id: "SHP-98215",
    awbNumber: "AWB-2026-8802",
    senderName: "Apex Luxury Goods",
    recipientName: "Boutique Retailers LLC",
    origin: "Dubai International Freight Gate 3",
    destination: "Mumbai Air Freight Zone",
    category: "High-Value",
    itemsCount: 15,
    tolerancePercentage: 0.5,
    inboundDate: "2026-11-18 10:15",
    weightInKg: 45.00,
    inboundOperator: "Sarah Jenkins",
    sealNumberIn: "SEAL-B4109",
    outboundDate: "2026-11-18 13:20",
    weightOutKg: 42.10,
    outboundOperator: "Derek Cole",
    sealNumberOut: "SEAL-B4109",
    status: "PILFERAGE_FLAGGED",
    weightDiffKg: -2.90,
    weightLossPercentage: -6.44,
    flaggedReason: "CRITICAL: Weight deficit exceeds safe tolerance (6.44% loss, 2.90 kg missing). Suspected box tampering & item removal.",
    outboundNotes: "Bottom seam tape slit and taped over with clear packaging tape. Security audit hold raised."
  },
  {
    id: "SHP-98216",
    awbNumber: "AWB-2026-8803",
    senderName: "Pacific Apparel Mills",
    recipientName: "Grand Central Distribution",
    origin: "Vietnam Cargo Port",
    destination: "Bengaluru Logistics Park",
    category: "Apparel",
    itemsCount: 120,
    tolerancePercentage: 2.0,
    inboundDate: "2026-11-17 16:45",
    weightInKg: 284.50,
    inboundOperator: "Elena Rostova",
    sealNumberIn: "SEAL-C8873",
    outboundDate: "2026-11-18 11:00",
    weightOutKg: 284.10,
    outboundOperator: "Elena Rostova",
    sealNumberOut: "SEAL-C8873",
    status: "DISPATCHED_CLEARED",
    weightDiffKg: -0.40,
    weightLossPercentage: -0.14,
    outboundNotes: "Within allowable atmospheric moisture variation (0.14%). Package cleared for truck load."
  },
  {
    id: "SHP-98217",
    awbNumber: "AWB-2026-8804",
    senderName: "Zenith Automotive Parts",
    recipientName: "Express Logistics Hub",
    origin: "Frankfurt Hub FRA-4",
    destination: "Chennai Auto Corridor",
    category: "General Freight",
    itemsCount: 65,
    tolerancePercentage: 1.5,
    inboundDate: "2026-11-18 11:30",
    weightInKg: 310.25,
    inboundOperator: "Marcus Vance",
    sealNumberIn: "SEAL-D1042",
    status: "INBOUND_RECORDED"
  },
  {
    id: "SHP-98218",
    awbNumber: "AWB-2026-8805",
    senderName: "BioHealth Diagnostics Inc",
    recipientName: "Apollo Labs Center",
    origin: "Basel Pharma Cargo Center",
    destination: "Hyderabad Genome Valley",
    category: "Pharma",
    itemsCount: 8,
    tolerancePercentage: 0.5,
    inboundDate: "2026-11-18 08:20",
    weightInKg: 38.60,
    inboundOperator: "Sarah Jenkins",
    sealNumberIn: "SEAL-PH9021",
    outboundDate: "2026-11-18 12:45",
    weightOutKg: 34.20,
    outboundOperator: "Derek Cole",
    sealNumberOut: "SEAL-PH9021",
    status: "PILFERAGE_FLAGGED",
    weightDiffKg: -4.40,
    weightLossPercentage: -11.40,
    flaggedReason: "SEVERITY HIGH: 4.40 kg (-11.4%) cold-storage parcel shortfall. Inner cold packs or vials compromised.",
    outboundNotes: "Dry ice weight checked; loss is substantially larger than sublimation curve. Immediate police & insurance memo generated."
  },
  {
    id: "SHP-98219",
    awbNumber: "AWB-2026-8806",
    senderName: "Tokyo Precision Optics",
    recipientName: "Advanced Vision Systems",
    origin: "Haneda Airport HND",
    destination: "Pune Industrial Hub",
    category: "Electronics",
    itemsCount: 30,
    tolerancePercentage: 1.0,
    inboundDate: "2026-11-18 07:15",
    weightInKg: 94.20,
    inboundOperator: "Elena Rostova",
    sealNumberIn: "SEAL-T7712",
    outboundDate: "2026-11-18 10:45",
    weightOutKg: 94.15,
    outboundOperator: "Marcus Vance",
    sealNumberOut: "SEAL-T7712",
    status: "DISPATCHED_CLEARED",
    weightDiffKg: -0.05,
    weightLossPercentage: -0.05,
    outboundNotes: "Exact tare match, security seal verified intact."
  }
];
