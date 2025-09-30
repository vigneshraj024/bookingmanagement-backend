// src/Controller/authcontroller.ts
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabase } from '../lib/supabase.js';
import { logAudit } from '../lib/audit.js';
import 'dotenv/config';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.from('Admins').select('Id, Name, Email, PasswordHash').eq('Email', email).maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, data.PasswordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ sub: data.Id, email: data.Email, name: data.Name }, process.env.JWT_SECRET!, { expiresIn: '1d' });
  await logAudit({ action: 'LOGIN', entity: 'Admin', entityId: data.Id, actorId: data.Id, actorEmail: data.Email });
  res.json({ token });
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

export const logout = async (req: Request, res: Response) => {
  const user = (req as any).user as { sub?: number | string; email?: string } | undefined;
  await logAudit({ action: 'LOGOUT', entity: 'Admin', entityId: user?.sub ?? null, actorId: user?.sub ?? null, actorEmail: user?.email ?? null });
  res.json({ ok: true });
};
