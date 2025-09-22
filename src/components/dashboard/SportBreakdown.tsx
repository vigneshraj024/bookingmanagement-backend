import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingStats, Sport } from '@/types/booking';
import { Progress } from '@/components/ui/progress';

interface SportBreakdownProps {
  stats: BookingStats;
}

const sportIcons: Record<Sport, string> = {
  Cricket: '🏏',
  Football: '⚽',
  Pickleball: '🏓',
  Gaming: '🎮',
};

const sportColors: Record<Sport, string> = {
  Cricket: 'bg-sports-cricket',
  Football: 'bg-sports-football',
  Pickleball: 'bg-sports-pickleball',
  Gaming: 'bg-sports-gaming',
};

export function SportBreakdown({ stats }: SportBreakdownProps) {
  const maxBookings = Math.max(...Object.values(stats.bookings_by_sport));
  const maxRevenue = Math.max(...Object.values(stats.revenue_by_sport));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="stats-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Bookings by Sport</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(stats.bookings_by_sport).map(([sport, count]) => (
            <div key={sport} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{sportIcons[sport as Sport]}</span>
                  <span className="font-medium">{sport}</span>
                </div>
                <span className="text-sm font-semibold">{count} bookings</span>
              </div>
              <Progress 
                value={(count / maxBookings) * 100} 
                className="h-2"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="stats-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Revenue by Sport</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(stats.revenue_by_sport).map(([sport, revenue]) => (
            <div key={sport} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{sportIcons[sport as Sport]}</span>
                  <span className="font-medium">{sport}</span>
                </div>
                <span className="text-sm font-semibold">₹{revenue.toLocaleString()}</span>
              </div>
              <Progress 
                value={(revenue / maxRevenue) * 100} 
                className="h-2"
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}