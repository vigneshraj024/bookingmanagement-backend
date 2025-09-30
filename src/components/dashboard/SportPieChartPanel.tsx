import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { bookingService } from '@/lib/bookings';
import { BookingStats } from '@/types/booking';
import SportPieChart from './SportPieChart';
import { format } from 'date-fns';

export default function SportPieChartPanel() {
  const [month, setMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<BookingStats | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const s = await bookingService.getBookingStats({ month, sport: 'all' });
      setStats(s);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  return (
    <Card className="stats-card">
      <CardHeader>
        <CardTitle>Pie Charts by Month</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground mb-1">Month</label>
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-[160px]" />
          </div>
        </div>

        {loading && (
          <div className="mt-4 text-sm text-muted-foreground">Loading…</div>
        )}

        {stats && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SportPieChart stats={stats} metric="bookings" title="Bookings Share by Sport" />
            <SportPieChart stats={stats} metric="revenue" title="Revenue Share by Sport" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
