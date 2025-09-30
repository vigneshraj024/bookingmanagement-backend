import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Booking, Sport, TimeSlot } from '@/types/booking';
import { bookingService } from '@/lib/bookings';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Clock, DollarSign } from 'lucide-react';
import { BookingModal } from './BookingModal';
import { useToast } from '@/hooks/use-toast';

interface CalendarViewProps {
  onBookingUpdate: () => void;
}

export function CalendarView({ onBookingUpdate }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSport, setSelectedSport] = useState<Sport | 'all'>('all');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [searchDate, setSearchDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [monthlyBookings, setMonthlyBookings] = useState<number>(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const { toast } = useToast();

  const sports: Sport[] = ['Cricket', 'Football', 'Pickleball', 'Gaming'];
  const timeSlots = [
    '00:00','01:00','02:00','03:00','04:00','05:00',
    '06:00','07:00','08:00','09:00','10:00','11:00',
    '12:00','13:00','14:00','15:00','16:00','17:00',
    '18:00','19:00','20:00','21:00','22:00','23:00'
  ];

  // Helper to display time in 12-hour format with AM/PM
  const formatTo12Hour = (time: string) => {
    const [hStr, mStr] = time.split(':');
    let hours = parseInt(hStr, 10);
    const suffix = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    if (mStr === '00') return `${hours}${suffix}`;
    return `${hours}:${mStr}${suffix}`;
  };

  useEffect(() => {
    loadBookings();
  }, [selectedDate, selectedSport]);

  // Keep the date input in sync when selectedDate changes via arrows
  useEffect(() => {
    setSearchDate(format(selectedDate, 'yyyy-MM-dd'));
  }, [selectedDate]);

  // Load monthly aggregates for the month of selectedDate and current sport filter
  useEffect(() => {
    const loadMonthly = async () => {
      try {
        const monthStr = format(selectedDate, 'yyyy-MM');
        const data = await bookingService.getBookingStats({ month: monthStr, sport: selectedSport });
        setMonthlyBookings(data.total_bookings);
        setMonthlyRevenue(data.total_revenue);
      } catch (e) {
        // ignore silently in calendar
      }
    };
    loadMonthly();
  }, [selectedDate, selectedSport]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const prevDateStr = format(subDays(selectedDate, 1), 'yyyy-MM-dd');
      const sportFilter = selectedSport === 'all' ? undefined : selectedSport;
      const [curr, prev] = await Promise.all([
        bookingService.getBookings(dateStr, sportFilter),
        bookingService.getBookings(prevDateStr, sportFilter),
      ]);
      // Merge bookings from selected day and previous day (for overnight display)
      setBookings([...(curr || []), ...(prev || [])]);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSportColor = (sport: Sport): string => {
    const colors = {
      Cricket: 'bg-sports-cricket',
      Football: 'bg-sports-football',
      Pickleball: 'bg-sports-pickleball',
      Gaming: 'bg-sports-gaming',
    };
    return colors[sport];
  };

  const getSportIcon = (sport: Sport): string => {
    const icons = {
      Cricket: '🏏',
      Football: '⚽',
      Pickleball: '🏓',
      Gaming: '🎮',
    };
    return icons[sport];
  };

  const getBookingForTimeSlot = (time: string): Booking | undefined => {
    const selectedStr = format(selectedDate, 'yyyy-MM-dd');
    const prevStr = format(subDays(selectedDate, 1), 'yyyy-MM-dd');
    return bookings.find(booking => {
      const bookingStart = booking.start_time.slice(0, 5);
      const bookingEnd = booking.end_time.slice(0, 5);
      const isOvernight = bookingEnd < bookingStart;

      if (!isOvernight) {
        // Show only on its own date
        if (booking.date !== selectedStr) return false;
        return time >= bookingStart && time < bookingEnd;
      }

      // Overnight booking
      if (booking.date === selectedStr) {
        // Start-day view: only show from start until midnight (not the after-midnight part)
        return time >= bookingStart; // e.g., 23:00 shows on the start day
      }

      if (booking.date === prevStr) {
        // Next-day view: show early morning portion until bookingEnd
        return time < bookingEnd; // e.g., 00:00–02:00 on the next day
      }

      return false;
    });
  };

  const handleTimeSlotClick = (time: string) => {
    const booking = getBookingForTimeSlot(time);
    if (!booking) {
      setSelectedTimeSlot(time);
      setShowBookingModal(true);
    }
  };

  const handleUnlock = async (bookingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setLoading(true);
      await bookingService.deleteBooking(bookingId);
      toast({ title: 'Slot unlocked', description: 'The booking was removed successfully.' });
      await loadBookings();
    } catch (error: any) {
      toast({ title: 'Failed to unlock', description: error?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    onBookingUpdate();
    loadBookings();
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="booking-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>Booking Calendar</span>
            </CardTitle>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="w-[160px]"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    // If invalid date string, ignore
                    if (!searchDate) return;
                    const parts = searchDate.split('-');
                    if (parts.length === 3) {
                      const d = new Date(searchDate + 'T00:00:00');
                      if (!isNaN(d.getTime())) {
                        setSelectedDate(d);
                      }
                    }
                  }}
                >
                  Search
                </Button>
              </div>
              <Select value={selectedSport} onValueChange={(value: Sport | 'all') => setSelectedSport(value)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  {sports.map((sport) => (
                    <SelectItem key={sport} value={sport}>
                      {getSportIcon(sport)} {sport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={() => setShowBookingModal(true)}
                className="bg-primary hover:bg-primary-hover"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Booking
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Monthly summary for current month and sport filter */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="stats-card">
          <CardHeader className="py-2">
            <CardTitle className="text-xs text-muted-foreground">This Month Bookings</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-lg font-semibold text-primary">{monthlyBookings}</div>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardHeader className="py-2">
            <CardTitle className="text-xs text-muted-foreground">This Month Revenue</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-lg font-semibold text-status-success">₹{monthlyRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Date Navigation */}
      <Card className="booking-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary">
                {format(selectedDate, 'EEEE')}
              </h2>
              <p className="text-muted-foreground">
                {format(selectedDate, 'MMMM d, yyyy')}
              </p>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Time Slots Grid */}
      <Card className="booking-card">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
            {timeSlots.map((time) => {
              const booking = getBookingForTimeSlot(time);
              const isOccupied = !!booking;
              
              return (
                <div
                  key={time}
                  className={`booking-slot ${isOccupied ? 'occupied' : ''} min-h-[72px] sm:min-h-[84px]`}
                  onClick={() => handleTimeSlotClick(time)}
                >
                  <div className="font-medium text-sm mb-2">{formatTo12Hour(time)}</div>
                  {isOccupied && booking ? (
                    <div className="space-y-1">
                      <Badge className={`text-xs ${getSportColor(booking.sport)} hover:${getSportColor(booking.sport)}`}>
                        {getSportIcon(booking.sport)} {booking.sport}
                      </Badge>
                      <div className="flex justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-[10px]"
                          onClick={(e) => handleUnlock(booking.id, e)}
                          disabled={loading}
                          aria-label="Unlock slot"
                        >
                          Unlock
                        </Button>
                      </div>
                      <div className="text-xs flex items-center justify-center space-x-1">
                        <DollarSign className="h-3 w-3" />
                        <span>₹{booking.amount}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTo12Hour(booking.start_time.slice(0, 5))} - {formatTo12Hour(booking.end_time.slice(0, 5))}
                        {booking.end_time.slice(0, 5) < booking.start_time.slice(0, 5) ? ' (next day)' : ''}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs">Available</div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onSuccess={handleBookingSuccess}
        defaultDate={format(selectedDate, 'yyyy-MM-dd')}
        defaultStartTime={selectedTimeSlot}
      />
    </div>
  );
}