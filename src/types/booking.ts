export type Sport = 'Cricket' | 'Football' | 'Pickleball' | 'Gaming';

export interface Booking {
  id: string;
  sport: Sport;
  date: string;
  start_time: string;
  end_time: string;
  amount: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BookingStats {
  total_bookings: number;
  total_revenue: number;
  bookings_by_sport: Record<Sport, number>;
  revenue_by_sport: Record<Sport, number>;
}

export interface TimeSlot {
  time: string;
  booking?: Booking;
  available: boolean;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
}