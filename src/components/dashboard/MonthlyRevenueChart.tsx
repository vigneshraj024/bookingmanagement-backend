import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bookingService } from '@/lib/bookings';
import { format } from 'date-fns';

interface Props {
  sport?: 'all' | 'Cricket' | 'Football' | 'Pickleball' | 'Gaming';
  year?: number; // default current year
}

type MonthData = { month: string; revenue: number };

// Simple responsive SVG bar/line chart without external deps
export default function MonthlyRevenueChart({ sport = 'all', year = new Date().getFullYear() }: Props) {
  const [yearState, setYearState] = useState<number>(year);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MonthData[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const months = Array.from({ length: 12 }, (_, i) => `${yearState}-${String(i + 1).padStart(2, '0')}`);
        const results = await Promise.all(
          months.map(async (m) => {
            const stats = await bookingService.getBookingStats({ month: m, sport });
            return { month: m, revenue: Number(stats.total_revenue || 0) } as MonthData;
          })
        );
        setData(results);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sport, yearState]);

  const maxVal = useMemo(() => Math.max(1, ...data.map((d) => d.revenue)), [data]);
  const monthsShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <Card className="stats-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Monthly Revenue</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={String(yearState)} onValueChange={(v) => setYearState(Number(v))}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="Year" /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading chart…</div>
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[700px]">
              <svg viewBox="0 0 700 300" className="w-full h-[240px] sm:h-[280px] md:h-[320px]">
                {/* Axes */}
                <line x1="40" y1="10" x2="40" y2="260" stroke="#e2e8f0" />
                <line x1="40" y1="260" x2="690" y2="260" stroke="#e2e8f0" />

                {/* Y ticks */}
                {Array.from({ length: 5 }, (_, i) => i).map((i) => {
                  const y = 260 - (i * 50);
                  const val = Math.round((maxVal * (i / 5)));
                  return (
                    <g key={i}>
                      <line x1="35" y1={y} x2="690" y2={y} stroke="#f1f5f9" />
                      <text x="10" y={y + 4} fontSize="10" fill="#64748b">₹{val.toLocaleString()}</text>
                    </g>
                  );
                })}

                {/* Bars and line */}
                {data.map((d, idx) => {
                  const x = 50 + idx * 54;
                  const h = Math.max(2, (d.revenue / maxVal) * 200);
                  const y = 260 - h;
                  return (
                    <g key={d.month}>
                      <rect x={x} y={y} width={30} height={h} fill="hsl(var(--primary))" opacity="0.2" />
                      <circle cx={x + 15} cy={y} r={3} fill="hsl(var(--primary))" />
                    </g>
                  );
                })}

                {/* Line path */}
                <path
                  d={data.map((d, idx) => {
                    const x = 50 + idx * 54 + 15;
                    const h = Math.max(2, (d.revenue / maxVal) * 200);
                    const y = 260 - h;
                    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                />

                {/* X labels */}
                {data.map((d, idx) => (
                  <text key={d.month} x={50 + idx * 54 + 15} y={280} fontSize="10" textAnchor="middle" fill="#64748b">
                    {monthsShort[idx]}
                  </text>
                ))}
              </svg>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
