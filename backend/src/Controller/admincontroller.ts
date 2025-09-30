import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../lib/supabase.js';
import { logAudit } from '../lib/audit.js';

export const createAdmin = async (req: Request, res: Response) => {
  const { name, email, password } = req.body as { name: string; email: string; password: string };
  if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password required' });
  const hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('Admins')
    .insert([{ Name: name, Email: email, PasswordHash: hash }])
    .select('Id, Name, Email, CreatedAt')
    .single();
  if (error) return res.status(500).json({ error: error.message });

  const actor = (req as any).user as { sub?: number | string; email?: string } | undefined;
  await logAudit({ action: 'ADMIN_CREATE', entity: 'Admin', entityId: data.Id, actorId: actor?.sub ?? null, actorEmail: actor?.email ?? null, meta: { name, email } });
  res.status(201).json(data);
};

export const updateAdmin = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name, email, password } = req.body as { name?: string; email?: string; password?: string };
  const update: any = {};
  if (name) update.Name = name;
  if (email) update.Email = email;
  if (password) update.PasswordHash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('Admins')
    .update(update)
    .eq('Id', id)
    .select('Id, Name, Email, CreatedAt')
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Admin not found' });

  const actor = (req as any).user as { sub?: number | string; email?: string } | undefined;
  await logAudit({ action: 'ADMIN_UPDATE', entity: 'Admin', entityId: id, actorId: actor?.sub ?? null, actorEmail: actor?.email ?? null, meta: { name, email } });
  res.json(data);
};

export const deleteAdmin = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { data, error } = await supabase
    .from('Admins')
    .delete()
    .eq('Id', id)
    .select('Id')
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Admin not found' });

  const actor = (req as any).user as { sub?: number | string; email?: string } | undefined;
  await logAudit({ action: 'ADMIN_DELETE', entity: 'Admin', entityId: id, actorId: actor?.sub ?? null, actorEmail: actor?.email ?? null });
  res.json({ message: 'Admin deleted' });
};

export const listAdmins = async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('Admins')
    .select('Id, Name, Email, CreatedAt')
    .order('Id', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const getAdminById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { data, error } = await supabase
    .from('Admins')
    .select('Id, Name, Email, CreatedAt')
    .eq('Id', id)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Admin not found' });
  res.json(data);
};
