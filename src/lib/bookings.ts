import { Booking, BookingStats, Sport } from '@/types/booking';

const API_BASE_URL = 'http://localhost:3000/api/bookings';
// Report endpoint is nested under the bookings router: /api/bookings/report
const REPORT_API_URL = 'http://localhost:3000/api/bookings/report';

function mapApiToBooking(row: any): Booking {
  // Backend returns Supabase row with PascalCase columns
  // Frontend expects camel/snake case per Booking type
  const toHHMM = (v: any): string => {
    const s = String(v ?? '').trim();
    if (!s) return '';
    if (s.includes(':')) {
      // already in HH:MM
      const [hh, mm] = s.split(':');
      return `${hh.padStart(2, '0')}:${(mm ?? '00').padStart(2, '0')}`;
    }
    // numeric like 900, 1000, '930'
    const digits = s.padStart(4, '0');
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
  };
  return {
    id: String(row.Id ?? row.id ?? ''),
    sport: row.Sports,
    date: row.Date,
    start_time: toHHMM(row.StartTime),
    end_time: toHHMM(row.EndTime),
    amount: Number(row.Amount),
    created_by: row.CreatedBy ?? 'unknown',
    created_at: row.CreatedAt ?? new Date().toISOString(),
    updated_at: row.UpdatedAt ?? new Date().toISOString(),
  } as Booking;
}

// Mock data service - replace with actual API calls to your backend
export const bookingService = {
  async getBookings(date?: string, sport?: Sport): Promise<Booking[]> {
    const token = localStorage.getItem('token');
    if (!token) return [];

    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (sport) params.append('sport', sport);

    const res = await fetch(`${API_BASE_URL}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || data?.message || 'Failed to fetch bookings');
    }
    return Array.isArray(data) ? data.map(mapApiToBooking) : [];
  },

  async createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking> {
    // Real API call to backend
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    // Backend expects: { sport, date, startTime, endTime, amount, createdBy }
    const payload = {
      sport: booking.sport,
      date: booking.date, // in YYYY-MM-DD
      startTime: booking.start_time, // "HH:MM"
      endTime: booking.end_time,     // "HH:MM"
      amount: booking.amount,
      createdBy: booking.created_by,
    };

    const res = await fetch(`${API_BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || data?.message || 'Failed to create booking');
    }

    // Supabase insert with .select().single() returns the inserted row
    return mapApiToBooking(data);
  },

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
    // Mock implementation - replace with actual API call
    const booking = await this.getBookingById(id);
    return {
      ...booking,
      ...updates,
      updated_at: new Date().toISOString(),
    };
  },

  async deleteBooking(id: string): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_BASE_URL}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      let message = 'Failed to delete booking';
      try {
        const data = await res.json();
        message = data?.error || data?.message || message;
      } catch (_) {
        // ignore parse errors
      }
      throw new Error(message);
    }
  },

  async getBookingById(id: string): Promise<Booking> {
    // Mock implementation - replace with actual API call
    const bookings = await this.getBookings();
    const booking = bookings.find(b => b.id === id);
    if (!booking) throw new Error('Booking not found');
    return booking;
  },

  async getBookingStats(params?: { month?: string; from?: string; to?: string; sport?: Sport | 'all' }): Promise<BookingStats> {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const qs = new URLSearchParams();
    if (params?.month) qs.append('month', params.month);
    if (params?.from) qs.append('from', params.from);
    if (params?.to) qs.append('to', params.to);
    if (params?.sport && params.sport !== 'all') qs.append('sport', params.sport);

    const url = qs.toString() ? `${REPORT_API_URL}?${qs.toString()}` : REPORT_API_URL;

    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || data?.message || 'Failed to fetch report');
    }

    // Expecting backend to return keys compatible with BookingStats
    // If keys differ, map them here accordingly.
    const stats: BookingStats = {
      total_bookings: Number(data.total_bookings ?? data.totalBookings ?? 0),
      total_revenue: Number(data.total_revenue ?? data.totalRevenue ?? 0),
      bookings_by_sport: data.bookings_by_sport ?? data.bookingsBySport ?? { Cricket: 0, Football: 0, Pickleball: 0, Gaming: 0 },
      revenue_by_sport: data.revenue_by_sport ?? data.revenueBySport ?? { Cricket: 0, Football: 0, Pickleball: 0, Gaming: 0 },
    };

    return stats;
  },
};