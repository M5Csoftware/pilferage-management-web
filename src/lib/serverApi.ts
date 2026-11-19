import { Shipment } from '@/types/shipment';

const SERVER_BASE_URL = (
  process.env.NEXT_PUBLIC_SERVER_URL || 
  process.env.NEXT_PUBLIC_API_URL || 
  'http://localhost:5000'
).replace(/\/$/, '');

// Convert server JSON document to frontend Shipment
export function mapServerDocToShipment(doc: any): Shipment {
  const inboundDateStr = doc.inboundDate 
    ? new Date(doc.inboundDate).toISOString().replace('T', ' ').substring(0, 16)
    : '';

  const outboundDateStr = doc.outboundDate 
    ? new Date(doc.outboundDate).toISOString().replace('T', ' ').substring(0, 16)
    : undefined;

  return {
    id: doc.shipmentCode || doc._id || `SHP-${Math.floor(10000 + Math.random() * 90000)}`,
    awbNumber: doc.trackingNumber || doc.awbNumber || '',
    senderName: doc.senderName || '',
    recipientName: doc.recipientName || '',
    origin: doc.origin || '',
    destination: doc.destination || '',
    category: doc.category || 'General Freight',
    itemsCount: doc.itemsCount || 1,
    tolerancePercentage: typeof doc.tolerancePercentage === 'number' ? doc.tolerancePercentage : 1.0,
    inboundDate: inboundDateStr,
    weightInKg: typeof doc.weightInKg === 'number' ? doc.weightInKg : parseFloat(doc.weightInKg) || 0,
    inboundOperator: doc.inboundOperator || '',
    inboundNotes: doc.inboundNotes || undefined,
    sealNumberIn: doc.sealNumberIn || undefined,
    outboundDate: outboundDateStr,
    weightOutKg: doc.weightOutKg !== undefined && doc.weightOutKg !== null ? parseFloat(doc.weightOutKg) : undefined,
    outboundOperator: doc.outboundOperator || undefined,
    sealNumberOut: doc.sealNumberOut || undefined,
    outboundNotes: doc.outboundNotes || undefined,
    status: doc.status || 'INBOUND_RECORDED',
    weightDiffKg: doc.weightDiffKg !== undefined && doc.weightDiffKg !== null ? parseFloat(doc.weightDiffKg) : undefined,
    weightLossPercentage: doc.weightLossPercentage !== undefined && doc.weightLossPercentage !== null ? parseFloat(doc.weightLossPercentage) : undefined,
    flaggedReason: doc.flaggedReason || undefined,
    weightInPhotoUrl: doc.weightInPhotoUrl || undefined,
    weightOutPhotoUrl: doc.weightOutPhotoUrl || undefined,
  };
}

// 1. Health check to detect if pilferage-management-server is online
export async function isServerOnline(): Promise<boolean> {
  try {
    const res = await fetch(`${SERVER_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

// 2. Fetch all shipments from pilferage-management-server
export async function fetchShipmentsFromServer(): Promise<Shipment[] | null> {
  try {
    const res = await fetch(`${SERVER_BASE_URL}/api/shipments?limit=300`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) return null;

    return json.data.map(mapServerDocToShipment);
  } catch (err) {
    return null;
  }
}

// 3. Create Inbound Shipment on server
export async function createInboundOnServer(shipment: Shipment): Promise<boolean> {
  try {
    const payload = {
      shipmentCode: shipment.id,
      trackingNumber: shipment.awbNumber,
      senderName: shipment.senderName,
      recipientName: shipment.recipientName,
      origin: shipment.origin,
      destination: shipment.destination,
      category: shipment.category,
      itemsCount: shipment.itemsCount,
      tolerancePercentage: shipment.tolerancePercentage,
      weightInKg: shipment.weightInKg,
      inboundOperator: shipment.inboundOperator,
      sealNumberIn: shipment.sealNumberIn || undefined,
      inboundNotes: shipment.inboundNotes || undefined,
      weightInPhotoUrl: shipment.weightInPhotoUrl || undefined,
    };

    const res = await fetch(`${SERVER_BASE_URL}/api/shipments/inbound`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (err) {
    return false;
  }
}

// 4. Record Dispatch Check / Re-weigh on server
export async function recordDispatchOnServer(shipment: Shipment): Promise<boolean> {
  if (shipment.weightOutKg === undefined) return false;
  try {
    const payload = {
      weightOutKg: shipment.weightOutKg,
      outboundOperator: shipment.outboundOperator || 'Dispatch Officer',
      sealNumberOut: shipment.sealNumberOut || undefined,
      outboundNotes: shipment.outboundNotes || undefined,
      weightOutPhotoUrl: shipment.weightOutPhotoUrl || undefined,
      forceOverride: false,
    };

    const targetId = shipment.id || shipment.awbNumber;
    const res = await fetch(`${SERVER_BASE_URL}/api/shipments/${targetId}/dispatch-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (err) {
    return false;
  }
}
