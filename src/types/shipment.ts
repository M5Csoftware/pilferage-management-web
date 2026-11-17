export interface Shipment {
  id: string;
  trackingNumber: string;
  senderName: string;
  recipientName: string;
  origin: string;
  destination: string;
  category: 'Electronics' | 'Apparel' | 'High-Value' | 'Perishables' | 'General Freight';
  itemsCount: number;
  tolerancePercentage: number; // e.g. 1.5% acceptable discrepancy due to moisture/scale difference
  
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

export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: "SHP-98214",
    trackingNumber: "TRK-2026-8801",
    senderName: "Shenzhen Tech Logistics",
    recipientName: "Metro Hub Warehouse #4",
    origin: "Port Facility A",
    destination: "Regional DC North",
    category: "Electronics",
    itemsCount: 42,
    tolerancePercentage: 1.0,
    inboundDate: "2026-11-17 09:30",
    weightInKg: 125.80,
    inboundOperator: "Marcus Vance",
    sealNumberIn: "SEAL-A9921",
    status: "INBOUND_RECORDED",
  },
  {
    id: "SHP-98215",
    trackingNumber: "TRK-2026-8802",
    senderName: "Apex Luxury Goods",
    recipientName: "Boutique Retailers LLC",
    origin: "Customs Depo B",
    destination: "West Coast Outlet",
    category: "High-Value",
    itemsCount: 15,
    tolerancePercentage: 0.5,
    inboundDate: "2026-11-17 11:15",
    weightInKg: 45.00,
    inboundOperator: "Sarah Jenkins",
    sealNumberIn: "SEAL-B4109",
    outboundDate: "2026-11-17 14:20",
    weightOutKg: 42.10,
    outboundOperator: "Derek Cole",
    sealNumberOut: "SEAL-B4109",
    status: "PILFERAGE_FLAGGED",
    weightDiffKg: -2.90,
    weightLossPercentage: -6.44,
    flaggedReason: "Weight deficit exceeds safe tolerance (6.44% loss, 2.90 kg missing). Suspected partial content extraction.",
    outboundNotes: "Box carton tape looked re-sealed on lower corner. Immediate audit requested."
  },
  {
    id: "SHP-98216",
    trackingNumber: "TRK-2026-8803",
    senderName: "Pacific Apparel Mills",
    recipientName: "Grand Central Distribution",
    origin: "Inland Dry Port",
    destination: "Fleet Center 2",
    category: "Apparel",
    itemsCount: 120,
    tolerancePercentage: 2.0,
    inboundDate: "2026-11-16 16:45",
    weightInKg: 284.50,
    inboundOperator: "Elena Rostova",
    sealNumberIn: "SEAL-C8873",
    outboundDate: "2026-11-17 13:00",
    weightOutKg: 284.10,
    outboundOperator: "Elena Rostova",
    sealNumberOut: "SEAL-C8873",
    status: "DISPATCHED_CLEARED",
    weightDiffKg: -0.40,
    weightLossPercentage: -0.14,
    outboundNotes: "Within standard 2% moisture variation. Cleared for truck dispatch."
  },
  {
    id: "SHP-98217",
    trackingNumber: "TRK-2026-8804",
    senderName: "Zenith Automotive Parts",
    recipientName: "Express Logistics Hub",
    origin: "Plant Zone 7",
    destination: "Assembly Site 1",
    category: "General Freight",
    itemsCount: 65,
    tolerancePercentage: 1.5,
    inboundDate: "2026-11-17 12:00",
    weightInKg: 310.25,
    inboundOperator: "Marcus Vance",
    sealNumberIn: "SEAL-D1042",
    status: "INBOUND_RECORDED"
  }
];
