import type { Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';

// Query audit logs with optional filters: action, entity, actorId, actorEmail, from, to
export const listAuditLogs = async (req: Request, res: Response) => {
  const { action, entity, actorId, actorEmail, from, to } = req.query as Record<string, string | undefined>;

  let q = supabase.from('AuditLogs').select('*').order('Id', { ascending: false });

  if (action) q = q.eq('Action', action);
  if (entity) q = q.eq('Entity', entity);
  if (actorId) q = q.eq('ActorId', actorId);
  if (actorEmail) q = q.ilike('ActorEmail', actorEmail);
  if (from) q = q.gte('CreatedAt', from);
  if (to) q = q.lte('CreatedAt', to);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};
