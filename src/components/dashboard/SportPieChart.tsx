import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingStats, Sport } from '@/types/booking';

interface Props {
  stats: BookingStats;
  metric?: 'bookings' | 'revenue'; // pie by bookings count or total revenue
  title?: string;
}

const COLORS: Record<Sport, string> = {
  Cricket: 'hsl(var(--sports-cricket, var(--primary)))',
  Football: 'hsl(var(--sports-football, var(--secondary)))',
  Pickleball: 'hsl(var(--sports-pickleball, 180 60% 45%))',
  Gaming: 'hsl(var(--sports-gaming, 260 70% 55%))',
};

function toSegments(stats: BookingStats, metric: 'bookings' | 'revenue') {
  const entries: [Sport, number][] = (Object.keys(stats.bookings_by_sport) as Sport[]).map((s) => [
    s,
    metric === 'bookings' ? stats.bookings_by_sport[s] : stats.revenue_by_sport[s],
  ]);
  const total = entries.reduce((acc, [, v]) => acc + Number(v || 0), 0) || 1;
  return { entries, total };
}

export default function SportPieChart({ stats, metric = 'bookings', title }: Props) {
  const { entries, total } = toSegments(stats, metric);

  // SVG donut dimensions
  const size = 220;
  const radius = 90;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <Card className="stats-card">
      <CardHeader>
        <CardTitle>{title ?? (metric === 'bookings' ? 'Bookings Share by Sport' : 'Revenue Share by Sport')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
            {/* background ring */}
            <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={20} />
            {entries.map(([sport, val], idx) => {
              const frac = total === 0 ? 0 : (Number(val || 0) / total);
              const len = frac * circ;
              const dashArray = `${len} ${circ - len}`;
              const dashOffset = -offset;
              offset += len;
              return (
                <circle
                  key={sport}
                  cx={cx}
                  cy={cy}
                  r={radius}
                  fill="none"
                  stroke={COLORS[sport]}
                  strokeWidth={20}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  transform={`rotate(-90 ${cx} ${cy})`}
                />
              );
            })}
            {/* center text */}
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" className="fill-current" fontSize="14">
              {metric === 'bookings' ? 'Bookings' : 'Revenue'}\n({total === 1 ? 0 : total.toLocaleString()})
            </text>
          </svg>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-3">
            {entries.map(([sport, val]) => (
              <div key={sport} className="flex items-center gap-2 text-sm">
                <span className="inline-block w-3 h-3 rounded" style={{ background: COLORS[sport] }} />
                <span className="font-medium">{sport}</span>
                <span className="text-muted-foreground">- {Number(val || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
