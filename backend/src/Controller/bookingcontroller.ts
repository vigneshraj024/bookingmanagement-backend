import type { Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';
import { logAudit } from '../lib/audit.js';

export const createBooking = async (req: Request, res: Response) => {
  const { sport, date, startTime, endTime, amount, createdBy } = req.body;
//test v3
  const parsedDateMs = Date.parse(String(date));
  if (Number.isNaN(parsedDateMs)) return res.status(400).json({ error: 'Invalid date' });

  const toHHMM = (t: string) => parseInt(String(t).replace(':', ''), 10); // "10:00" -> 1000

  const jwtUser = (req as any).user as { sub?: number | string; email?: string } | undefined;
  const actorId = jwtUser?.sub ?? createdBy ?? null;
  const actorEmail = jwtUser?.email ?? null;

  const payload = { Sports: sport, Date: date, StartTime: startTime, EndTime: endTime, Amount: Number(amount), CreatedBy: actorId };

  const { data, error } = await supabase.from('Booking').insert([payload]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  await logAudit({
    action: 'BOOKING_CREATE',
    entity: 'Booking',
    entityId: (data as any)?.Id ?? null,
    actorId,
    actorEmail,
    meta: { sport, date, startTime, endTime, amount },
  });
  res.status(201).json(data);
};

export const getBookings = async (req: Request, res: Response) => {
  const { date, sport } = req.query;
  
  console.log("getBookings");
  let q = supabase.from('Booking').select('*');

  if (date) q = q.eq('Date', String(date));      // no epoch conversion
  if (sport) q = q.ilike('Sports', String(sport)); // case-insensitive match

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const deleteBooking = async (req: Request, res: Response) => {
  const idNum = Number(req.params.id);
  const { data, error } = await supabase
    .from('Booking')
    .delete()
    .eq('Id', idNum)
    .select(); // returns deleted rows

  if (error) return res.status(500).json({ error: error.message });
  if (!data || data.length === 0) return res.status(404).json({ error: 'Booking not found' });
  const jwtUser = (req as any).user as { sub?: number | string; email?: string } | undefined;
  await logAudit({
    action: 'BOOKING_DELETE',
    entity: 'Booking',
    entityId: idNum,
    actorId: jwtUser?.sub ?? null,
    actorEmail: jwtUser?.email ?? null,
  });
  res.json({ message: 'Booking deleted' });
};

export const getReport = async (req: Request, res: Response) => {
  try {
    // Optional filters: month (YYYY-MM), from (YYYY-MM-DD), to (YYYY-MM-DD), sport
    const { month, from, to, sport } = req.query as Record<string, string | undefined>;

    let fromDate: string | undefined;
    let toDate: string | undefined;

    if (month) {
      // Compute first and last day of month
      const [y, m] = month.split('-').map(Number);
      if (!y || !m) return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
      const first = new Date(y, m - 1, 1);
      const last = new Date(y, m, 0); // last day of month
      const pad = (n: number) => String(n).padStart(2, '0');
      fromDate = `${first.getFullYear()}-${pad(first.getMonth() + 1)}-${pad(first.getDate())}`;
      toDate = `${last.getFullYear()}-${pad(last.getMonth() + 1)}-${pad(last.getDate())}`;
    } else {
      fromDate = from;
      toDate = to;
    }

    // Base query with filters
    let q = supabase.from('Booking').select('*');
    if (fromDate) q = q.gte('Date', fromDate);
    if (toDate) q = q.lte('Date', toDate);
    if (sport) q = q.ilike('Sports', sport);

    const { data: rows, error } = await q;
    if (error) return res.status(500).json({ error: error.message });

    const totalBookings = rows?.length ?? 0;
    const totalRevenue = (rows ?? []).reduce((sum, r: any) => sum + Number(r.Amount ?? 0), 0);

    // Aggregations by sport
    const sports = ['Cricket', 'Football', 'Pickleball', 'Gaming'] as const;
    const bookings_by_sport: Record<string, number> = { Cricket: 0, Football: 0, Pickleball: 0, Gaming: 0 };
    const revenue_by_sport: Record<string, number> = { Cricket: 0, Football: 0, Pickleball: 0, Gaming: 0 };
    for (const r of rows ?? []) {
      const s = String(r.Sports);
      if (s in bookings_by_sport) {
        bookings_by_sport[s] += 1;
        revenue_by_sport[s] += Number(r.Amount ?? 0);
      }
    }

    res.json({
      total_bookings: totalBookings,
      total_revenue: totalRevenue,
      bookings_by_sport,
      revenue_by_sport,
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to generate report' });
  }
};

// PATCH /api/bookings/:id/unlock
export const unlockBooking = async (req: Request, res: Response) => {
  try {
    const idNum = Number(req.params.id);
    const { reason, note } = req.body as { reason?: string; note?: string };

    // Fetch booking details to include in audit meta
    const { data: booking, error: fetchErr } = await supabase
      .from('Booking')
      .select('Id, Sports, Date, StartTime, EndTime, Amount')
      .eq('Id', idNum)
      .maybeSingle();
    if (fetchErr) return res.status(500).json({ error: fetchErr.message });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const jwtUser = (req as any).user as { sub?: number | string; email?: string } | undefined;
    await logAudit({
      action: 'BOOKING_UNLOCK',
      entity: 'Booking',
      entityId: idNum,
      actorId: jwtUser?.sub ?? null,
      actorEmail: jwtUser?.email ?? null,
      meta: {
        sport: booking.Sports,
        date: booking.Date,
        startTime: booking.StartTime,
        endTime: booking.EndTime,
        amount: booking.Amount,
        reason: reason ?? null,
        note: note ?? null,
      },
    });

    // Business logic: For now, just audit. If later you add columns like IsLocked/UnlockedAt, update them here.
    res.json({ ok: true, message: 'Booking unlocked (audited)', id: idNum });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Failed to unlock booking' });
  }
};
