import { createClient } from '@supabase/supabase-js';
import { Shipment, UserAccount, INITIAL_SHIPMENTS, INITIAL_USER_ACCOUNTS } from '@/types/shipment';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon-key')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Convert DB snake_case row to frontend Shipment interface
export function mapDbToShipment(row: any): Shipment {
  return {
    id: row.id,
    awbNumber: row.awb_number,
    senderName: row.sender_name || '',
    recipientName: row.recipient_name || '',
    origin: row.origin || '',
    destination: row.destination || '',
    category: row.category || 'General Freight',
    itemsCount: row.items_count || 1,
    weightInKg: parseFloat(row.weight_in_kg) || 0,
    weightOutKg: row.weight_out_kg ? parseFloat(row.weight_out_kg) : undefined,
    weightDiffKg: row.weight_diff_kg !== null && row.weight_diff_kg !== undefined ? parseFloat(row.weight_diff_kg) : undefined,
    weightLossPercentage: row.weight_loss_percentage !== null && row.weight_loss_percentage !== undefined ? parseFloat(row.weight_loss_percentage) : undefined,
    tolerancePercentage: parseFloat(row.tolerance_percentage) || 0.5,
    status: row.status || 'INBOUND_RECORDED',
    inboundDate: row.inbound_date || '',
    inboundOperator: row.inbound_operator || '',
    sealNumberIn: row.seal_number_in || '',
    inboundNotes: row.inbound_notes || '',
    outboundDate: row.outbound_date || undefined,
    outboundOperator: row.outbound_operator || undefined,
    outboundNotes: row.outbound_notes || undefined,
    flaggedReason: row.flagged_reason || undefined,
    weightInPhotoUrl: row.weight_in_photo_url || undefined,
    weightOutPhotoUrl: row.weight_out_photo_url || undefined,
  };
}

// Convert frontend Shipment to DB snake_case payload
export function mapShipmentToDb(s: Shipment): any {
  return {
    id: s.id,
    awb_number: s.awbNumber,
    sender_name: s.senderName,
    recipient_name: s.recipientName,
    origin: s.origin,
    destination: s.destination,
    category: s.category,
    items_count: s.itemsCount,
    weight_in_kg: s.weightInKg,
    weight_out_kg: s.weightOutKg ?? null,
    weight_diff_kg: s.weightDiffKg ?? null,
    weight_loss_percentage: s.weightLossPercentage ?? null,
    tolerance_percentage: s.tolerancePercentage,
    status: s.status,
    inbound_date: s.inboundDate,
    inbound_operator: s.inboundOperator,
    seal_number_in: s.sealNumberIn,
    inbound_notes: s.inboundNotes,
    outbound_date: s.outboundDate ?? null,
    outbound_operator: s.outboundOperator ?? null,
    outbound_notes: s.outboundNotes ?? null,
    flagged_reason: s.flaggedReason ?? null,
    weight_in_photo_url: s.weightInPhotoUrl ?? null,
    weight_out_photo_url: s.weightOutPhotoUrl ?? null,
    metadata: {},
  };
}

// 1. Fetch all shipments from Supabase
export async function getShipmentsFromDb(): Promise<Shipment[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(mapDbToShipment);
  } catch (err) {
    console.error('getShipmentsFromDb exception:', err);
    return null;
  }
}

// 2. Insert new shipment to Supabase
export async function insertShipmentToDb(shipment: Shipment): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = mapShipmentToDb(shipment);
    const { error } = await supabase
      .from('shipments')
      .insert([payload]);

    if (error) {
      console.error('Supabase insert error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('insertShipmentToDb exception:', err);
    return false;
  }
}

// 3. Update existing shipment in Supabase
export async function updateShipmentInDb(shipment: Shipment): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = mapShipmentToDb(shipment);
    const { error } = await supabase
      .from('shipments')
      .update(payload)
      .eq('id', shipment.id);

    if (error) {
      console.error('Supabase update error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('updateShipmentInDb exception:', err);
    return false;
  }
}

// 4. Fetch User Accounts
export async function getUserAccountsFromDb(): Promise<UserAccount[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('user_accounts')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase user_accounts fetch error:', error);
      return null;
    }

    if (!data || data.length === 0) {
      // Seed default accounts
      await seedAccountsIfEmpty();
      return INITIAL_USER_ACCOUNTS;
    }

    return data.map((row: any) => ({
      id: row.id,
      username: row.username,
      name: row.name,
      password: row.password,
      role: row.role as 'admin' | 'user',
      permissions: row.permissions,
      createdAt: row.created_at?.slice(0, 10),
    }));
  } catch (err) {
    console.error('getUserAccountsFromDb exception:', err);
    return null;
  }
}

// 5. Upsert User Account in Supabase
export async function upsertUserAccountInDb(acc: UserAccount): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('user_accounts')
      .upsert({
        id: acc.id,
        username: acc.username.toLowerCase(),
        name: acc.name,
        password: acc.password,
        role: acc.role,
        permissions: acc.permissions,
      });

    if (error) {
      console.error('Supabase upsert account error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('upsertUserAccountInDb exception:', err);
    return false;
  }
}

// 6. Delete User Account from Supabase
export async function deleteUserAccountFromDb(id: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('user_accounts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete account error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('deleteUserAccountFromDb exception:', err);
    return false;
  }
}

// Helper: Seed initial accounts if table is completely empty
async function seedAccountsIfEmpty() {
  if (!supabase) return;
  try {
    const payloads = INITIAL_USER_ACCOUNTS.map(a => ({
      id: a.id,
      username: a.username.toLowerCase(),
      name: a.name,
      password: a.password,
      role: a.role,
      permissions: a.permissions,
    }));
    await supabase.from('user_accounts').insert(payloads);
  } catch (e) {
    // ignore
  }
}
