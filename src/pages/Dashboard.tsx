import { useState, useEffect } from 'react';
import { Admin, BookingStats } from '@/types/booking';
import { Header } from '@/components/layout/Header';
import { Navigation } from '@/components/layout/Navigation';
import { StatsCards } from '@/components/dashboard/StatsCards';
import MonthlyRevenueChart from '@/components/dashboard/MonthlyRevenueChart';
import SportPieChartPanel from '@/components/dashboard/SportPieChartPanel';
import { SportBreakdown } from '@/components/dashboard/SportBreakdown';
import { CalendarView } from '@/components/calendar/CalendarView';
import { bookingService } from '@/lib/bookings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Clock, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { PriceMasterPage } from '@/pages/PriceMaster';
import { AuditLogsPage } from '@/pages/AuditLogs';
import TodoPanel from '@/components/todo/TodoPanel';

interface DashboardProps {
  admin: Admin;
  onSignOut: () => void;
}

export function Dashboard({ admin, onSignOut }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  // Report filters
  const [reportMonth, setReportMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [reportFrom, setReportFrom] = useState<string>('');
  const [reportTo, setReportTo] = useState<string>('');
  const [reportSport, setReportSport] = useState<'all' | 'Cricket' | 'Football' | 'Pickleball' | 'Gaming'>('all');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async (override?: { month?: string; from?: string; to?: string; sport?: 'all' | 'Cricket' | 'Football' | 'Pickleball' | 'Gaming' }) => {
    try {
      const params = override ?? (reportMonth
        ? { month: reportMonth, sport: reportSport }
        : { from: reportFrom || undefined, to: reportTo || undefined, sport: reportSport });
      const data = await bookingService.getBookingStats(params);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingUpdate = () => {
    loadStats(); // Refresh stats when bookings are updated
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'calendar':
        return <CalendarView onBookingUpdate={handleBookingUpdate} />;
      case 'reports':
        return (
          <div className="space-y-6">
            {/* Report Filters */}
            <Card className="stats-card">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-end">
                  <div className="flex flex-col">
                    <label className="text-xs text-muted-foreground mb-1">Month</label>
                    <Input type="month" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} />
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">or</div>
                  <div className="flex gap-3">
                    <div className="flex flex-col">
                      <label className="text-xs text-muted-foreground mb-1">From</label>
                      <Input type="date" value={reportFrom} onChange={(e) => { setReportFrom(e.target.value); setReportMonth(''); }} />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs text-muted-foreground mb-1">To</label>
                      <Input type="date" value={reportTo} onChange={(e) => { setReportTo(e.target.value); setReportMonth(''); }} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs text-muted-foreground mb-1">Sport</label>
                    <Select value={reportSport} onValueChange={(v) => setReportSport(v as any)}>
                      <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Sports" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sports</SelectItem>
                        <SelectItem value="Cricket">Cricket</SelectItem>
                        <SelectItem value="Football">Football</SelectItem>
                        <SelectItem value="Pickleball">Pickleball</SelectItem>
                        <SelectItem value="Gaming">Gaming</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => loadStats()}
                    >
                      Apply
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setReportMonth(format(new Date(), 'yyyy-MM'));
                        setReportFrom('');
                        setReportTo('');
                        setReportSport('all');
                        loadStats({ month: format(new Date(), 'yyyy-MM'), sport: 'all' });
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            {stats && (
              <>
                <StatsCards stats={stats} />
                <SportBreakdown stats={stats} />
                <Card className="stats-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <span>Performance Insights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4">
                        <div className="text-2xl font-bold text-primary mb-2">
                          {Math.round((stats.total_bookings / 30))}
                        </div>
                        <p className="text-sm text-muted-foreground">Avg. bookings per day</p>
                      </div>
                      <div className="text-center p-4">
                        <div className="text-2xl font-bold text-secondary mb-2">
                          ₹{Math.round(stats.total_revenue / 30).toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground">Avg. daily revenue</p>
                      </div>
                      <div className="text-center p-4">
                        <div className="text-2xl font-bold text-status-warning mb-2">
                          {Object.keys(stats.bookings_by_sport).length}
                        </div>
                        <p className="text-sm text-muted-foreground">Active sports</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        );
      case 'price-master':
        return (
          <div className="space-y-6">
            <Card className="stats-card">
              <CardHeader>
                <CardTitle>Price Master</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4">Configure hourly prices for each sport.</div>
                <PriceMasterPage />
              </CardContent>
            </Card>
          </div>
        );
      case 'audit-logs':
        return (
          <div className="space-y-6">
            <Card className="stats-card">
              <CardHeader>
                <CardTitle>Audit Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <AuditLogsPage />
              </CardContent>
            </Card>
          </div>
        );
      case 'todo':
        return (
          <div className="space-y-6">
            <TodoPanel />
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h2 className="text-3xl font-bold text-primary mb-4">
                Welcome to Sports Booking Management
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Streamline your sports facility operations with our comprehensive booking platform. 
                Track bookings, manage schedules, and monitor revenue all in one place.
              </p>
            </div>

            {stats && <StatsCards stats={stats} />}

            {/* Monthly revenue chart */}
            <MonthlyRevenueChart sport={reportSport} />

            {/* Pie charts with month selector */}
            <SportPieChartPanel />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="stats-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div 
                    className="p-4 border border-border/50 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => setActiveTab('calendar')}
                  >
                    <h3 className="font-semibold text-primary mb-2">Create New Booking</h3>
                    <p className="text-sm text-muted-foreground">Add a new sports booking to the calendar</p>
                  </div>
                  <div 
                    className="p-4 border border-border/50 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => setActiveTab('calendar')}
                  >
                    <h3 className="font-semibold text-secondary mb-2">View Calendar</h3>
                    <p className="text-sm text-muted-foreground">Check today's bookings and schedule</p>
                  </div>
                  <div 
                    className="p-4 border border-border/50 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => setActiveTab('reports')}
                  >
                    <h3 className="font-semibold text-status-success mb-2">Generate Reports</h3>
                    <p className="text-sm text-muted-foreground">Analyze revenue and booking patterns</p>
                  </div>
                </CardContent>
              </Card>

              {stats && (
                <Card className="stats-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span>Sport Activity Overview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(stats.bookings_by_sport).map(([sport, count]) => (
                        <div key={sport} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">
                              {sport === 'Cricket' ? '🏏' : sport === 'Football' ? '⚽' : sport === 'Pickleball' ? '🏓' : '🎮'}
                            </span>
                            <span className="font-medium">{sport}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{count} bookings</div>
                            <div className="text-sm text-muted-foreground">
                              ₹{stats.revenue_by_sport[sport as keyof typeof stats.revenue_by_sport]?.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header admin={admin} onSignOut={onSignOut} />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {renderActiveTab()}
        </div>
      </main>
    </div>
  );
}