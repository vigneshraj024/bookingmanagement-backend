import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingStats } from '@/types/booking';
import { Trophy, DollarSign, Calendar, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  stats: BookingStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="stats-card hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          <Calendar className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{stats.total_bookings}</div>
          <p className="text-xs text-muted-foreground">Active bookings managed</p>
        </CardContent>
      </Card>

      <Card className="stats-card hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-status-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-status-success">
            ₹{stats.total_revenue.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Revenue collected</p>
        </CardContent>
      </Card>

      <Card className="stats-card hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Sport</CardTitle>
          <Trophy className="h-4 w-4 text-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-secondary">
            {Object.entries(stats.bookings_by_sport)
              .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">Most popular sport</p>
        </CardContent>
      </Card>

      <Card className="stats-card hover-lift">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Booking Value</CardTitle>
          <TrendingUp className="h-4 w-4 text-status-warning" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-status-warning">
            ₹{Math.round(stats.total_revenue / stats.total_bookings).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Per booking average</p>
        </CardContent>
      </Card>
    </div>
  );
}