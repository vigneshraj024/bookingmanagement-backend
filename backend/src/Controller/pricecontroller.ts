import type { Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';
import { logAudit } from '../lib/audit.js';

// Table: PriceMaster (Id, Sport, Price, CreatedAt, UpdatedAt)
// Optionally add: CreatedBy, UpdatedBy in DB; we still capture actor in audit logs.

export const listPrices = async (_req: Request, res: Response) => {
  console.log("listPrices");
  
  const { data, error } = await supabase
    .from('PriceMaster')
    .select('Id, Sport, Price, CreatedAt, UpdatedAt')
    .order('Sport');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const getPriceById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { data, error } = await supabase
    .from('PriceMaster')
    .select('Id, Sport, Price, CreatedAt, UpdatedAt')
    .eq('Id', id)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Price config not found' });
  res.json(data);
};

export const getPriceBySport = async (req: Request, res: Response) => {
  const sport = String(req.params.sport);
  const { data, error } = await supabase
    .from('PriceMaster')
    .select('Id, Sport, Price, CreatedAt, UpdatedAt')
    .ilike('Sport', sport)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Price config not found' });
  res.json(data);
};

export const createPrice = async (req: Request, res: Response) => {
  const { sport, price } = req.body as { sport: string; price: number };
  if (!sport || typeof price !== 'number') return res.status(400).json({ error: 'sport and price required' });

  const { data, error } = await supabase
    .from('PriceMaster')
    .insert([{ Sport: sport, Price: price }])
    .select('Id, Sport, Price, CreatedAt, UpdatedAt')
    .single();
  if (error) return res.status(500).json({ error: error.message });

  const actor = (req as any).user as { sub?: number | string; email?: string } | undefined;
  await logAudit({ action: 'PRICE_CREATE', entity: 'PriceMaster', entityId: data.Id, actorId: actor?.sub ?? null, actorEmail: actor?.email ?? null, meta: { sport, price } });
  res.status(201).json(data);
};

export const updatePrice = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { sport, price } = req.body as { sport?: string; price?: number };
  const update: any = {};
  if (sport) update.Sport = sport;
  if (typeof price === 'number') update.Price = price;

  const { data, error } = await supabase
    .from('PriceMaster')
    .update(update)
    .eq('Id', id)
    .select('Id, Sport, Price, CreatedAt, UpdatedAt')
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Price config not found' });

  const actor = (req as any).user as { sub?: number | string; email?: string } | undefined;
  await logAudit({ action: 'PRICE_UPDATE', entity: 'PriceMaster', entityId: id, actorId: actor?.sub ?? null, actorEmail: actor?.email ?? null, meta: { sport, price } });
  res.json(data);
};

export const deletePrice = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { data, error } = await supabase
    .from('PriceMaster')
    .delete()
    .eq('Id', id)
    .select('Id')
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Price config not found' });

  const actor = (req as any).user as { sub?: number | string; email?: string } | undefined;
  await logAudit({ action: 'PRICE_DELETE', entity: 'PriceMaster', entityId: id, actorId: actor?.sub ?? null, actorEmail: actor?.email ?? null });
  res.json({ message: 'Price config deleted' });
};
