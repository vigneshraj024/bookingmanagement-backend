import { supabase } from './supabase.js';

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'BOOKING_CREATE'
  | 'BOOKING_DELETE'
  | 'BOOKING_UPDATE'
  | 'BOOKING_UNLOCK'
  | 'ADMIN_CREATE'
  | 'ADMIN_UPDATE'
  | 'ADMIN_DELETE'
  | 'PRICE_CREATE'
  | 'PRICE_UPDATE'
  | 'PRICE_DELETE';

export interface AuditPayload {
  action: AuditAction;
  entity?: string; // e.g., 'Booking', 'Admin', 'PriceMaster'
  entityId?: number | string | null;
  actorId?: number | string | null;
  actorEmail?: string | null;
  meta?: Record<string, any> | null;
}

export async function logAudit(payload: AuditPayload) {
  try {
    const { action, entity, entityId, actorId, actorEmail, meta } = payload;
    await supabase.from('AuditLogs').insert([
      {
        Action: action,
        Entity: entity ?? null,
        EntityId: entityId ?? null,
        ActorId: actorId ?? null,
        ActorEmail: actorEmail ?? null,
        Meta: meta ? JSON.stringify(meta) : null,
      },
    ]);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to write audit log', e);
  }
}
