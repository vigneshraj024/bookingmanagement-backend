"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReport = exports.deleteBooking = exports.getBookings = exports.createBooking = void 0;
const supabase_1 = require("../lib/supabase");
const createBooking = async (req, res) => {
    const { sport, date, startTime, endTime, amount, createdBy } = req.body;
    const parsedDateMs = Date.parse(String(date));
    if (Number.isNaN(parsedDateMs))
        return res.status(400).json({ error: 'Invalid date' });
    const toHHMM = (t) => parseInt(String(t).replace(':', ''), 10); // "10:00" -> 1000
    const payload = { Sports: sport, Date: date, StartTime: startTime, EndTime: endTime, Amount: Number(amount), CreatedBy: createdBy };
    const { data, error } = await supabase_1.supabase.from('Booking').insert([payload]).select().single();
    if (error)
        return res.status(500).json({ error: error.message });
    res.status(201).json(data);
};
exports.createBooking = createBooking;
const getBookings = async (req, res) => {
    const { date, sport } = req.query;
    let q = supabase_1.supabase.from('Booking').select('*');
    if (date)
        q = q.eq('Date', String(date)); // no epoch conversion
    if (sport)
        q = q.ilike('Sports', String(sport)); // case-insensitive match
    const { data, error } = await q;
    if (error)
        return res.status(500).json({ error: error.message });
    res.json(data);
};
exports.getBookings = getBookings;
const deleteBooking = async (req, res) => {
    const idNum = Number(req.params.id);
    const { data, error } = await supabase_1.supabase
        .from('Booking')
        .delete()
        .eq('Id', idNum)
        .select(); // returns deleted rows
    if (error)
        return res.status(500).json({ error: error.message });
    if (!data || data.length === 0)
        return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking deleted' });
};
exports.deleteBooking = deleteBooking;
const getReport = async (req, res) => {
    try {
        // Optional filters: month (YYYY-MM), from (YYYY-MM-DD), to (YYYY-MM-DD), sport
        const { month, from, to, sport } = req.query;
        let fromDate;
        let toDate;
        if (month) {
            // Compute first and last day of month
            const [y, m] = month.split('-').map(Number);
            if (!y || !m)
                return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
            const first = new Date(y, m - 1, 1);
            const last = new Date(y, m, 0); // last day of month
            const pad = (n) => String(n).padStart(2, '0');
            fromDate = `${first.getFullYear()}-${pad(first.getMonth() + 1)}-${pad(first.getDate())}`;
            toDate = `${last.getFullYear()}-${pad(last.getMonth() + 1)}-${pad(last.getDate())}`;
        }
        else {
            fromDate = from;
            toDate = to;
        }
        // Base query with filters
        let q = supabase_1.supabase.from('Booking').select('*');
        if (fromDate)
            q = q.gte('Date', fromDate);
        if (toDate)
            q = q.lte('Date', toDate);
        if (sport)
            q = q.ilike('Sports', sport);
        const { data: rows, error } = await q;
        if (error)
            return res.status(500).json({ error: error.message });
        const totalBookings = rows?.length ?? 0;
        const totalRevenue = (rows ?? []).reduce((sum, r) => sum + Number(r.Amount ?? 0), 0);
        // Aggregations by sport
        const sports = ['Cricket', 'Football', 'Pickleball', 'Gaming'];
        const bookings_by_sport = { Cricket: 0, Football: 0, Pickleball: 0, Gaming: 0 };
        const revenue_by_sport = { Cricket: 0, Football: 0, Pickleball: 0, Gaming: 0 };
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
    }
    catch (e) {
        res.status(500).json({ error: e?.message || 'Failed to generate report' });
    }
};
exports.getReport = getReport;
