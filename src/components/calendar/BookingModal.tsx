import { useState, useEffect } from 'react';
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
  import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { bookingService } from '@/lib/bookings';
import { Sport } from '@/types/booking';
import { CalendarDays, Clock, DollarSign, Trophy } from 'lucide-react';
import { priceService } from '@/lib/prices';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultDate?: string;
  defaultStartTime?: string;
}

export function BookingModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  defaultDate = '',
  defaultStartTime = '' 
}: BookingModalProps) {
  const [formData, setFormData] = useState({
    sport: '' as Sport | '',
    date: defaultDate,
    end_date: defaultDate,
    start_time: defaultStartTime,
    end_time: '',
    amount: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // When the modal opens (e.g., from clicking a time slot), sync defaults into the form
  // so clicking 6pm pre-fills start time to 6pm and date to the selected day
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        date: defaultDate || prev.date,
        end_date: defaultDate || prev.end_date || defaultDate,
        start_time: defaultStartTime || prev.start_time,
      }));
    }
  }, [isOpen, defaultDate, defaultStartTime]);

  const sports: Sport[] = ['Cricket', 'Football', 'Pickleball', 'Gaming'];
  
  // Generate 30-minute increment time slots from 00:00 to 23:30
  const timeSlots: string[] = Array.from({ length: 24 * 2 }, (_, i) => {
    const h = Math.floor(i / 2);
    const m = i % 2 === 0 ? '00' : '30';
    return `${String(h).padStart(2, '0')}:${m}`;
  });

  // Helper to display time in 12-hour format with AM/PM
  const formatTo12Hour = (time: string) => {
    const [hStr, mStr] = time.split(':');
    let hours = parseInt(hStr, 10);
    const suffix = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    // If minutes are 00, omit them and the colon
    if (mStr === '00') return `${hours}${suffix}`;
    return `${hours}:${mStr}${suffix}`;
  };

  const getSportIcon = (sport: Sport): string => {
    const icons = {
      Cricket: '🏏',
      Football: '⚽',
      Pickleball: '🏓',
      Gaming: '🎮',
    } as const;
    return icons[sport];
  };

  // Compute decimal hours between start and end using dates when available
  const diffHours = (startDate: string | undefined, start: string, endDate: string | undefined, end: string) => {
    if (startDate && endDate) {
      const s = new Date(`${startDate}T${start}:00`);
      let e = new Date(`${endDate}T${end}:00`);
      if (e <= s) {
        // ensure end is after start; if not, add 1 day
        e = new Date(e.getTime() + 24 * 60 * 60 * 1000);
      }
      const minutes = (e.getTime() - s.getTime()) / 60000;
      return Math.max(0, minutes / 60);
    }
    // Fallback to time-only logic (wrap across midnight)
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const s = sh * 60 + sm;
    const e = eh * 60 + em;
    let minutes = e - s;
    if (minutes <= 0) minutes = (24 * 60 - s) + e;
    return minutes / 60;
  };

  const autoFillAmount = async (sport: Sport | '', startDate: string, start: string, endDate: string, end: string) => {
    if (!sport || !start || !end) return;
    try {
      const rate = await priceService.getRatePerHour(sport as Sport);
      const hours = diffHours(startDate, start, endDate, end);
      const amount = Math.max(0, Math.round(rate * hours));
      setFormData(prev => ({ ...prev, amount: String(amount) }));
    } catch {
      // ignore and leave as-is
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sport || !formData.date || !formData.start_time || !formData.end_time || !formData.amount) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    // Allow overnight bookings: if end_time is before start_time, it means next-day end.
    if (formData.start_time === formData.end_time) {
      toast({
        title: 'Invalid Time Range',
        description: 'End time cannot be the same as start time.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const storedAdmin = localStorage.getItem('currentAdmin');
      const admin = storedAdmin ? JSON.parse(storedAdmin) as { id: string; name: string; email: string } : null;
      await bookingService.createBooking({
        sport: formData.sport,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        amount: parseFloat(formData.amount),
        created_by: admin?.email || admin?.name || 'unknown',
      });

      toast({
        title: 'Booking Created',
        description: `${formData.sport} booking successfully created for ${formData.date}`,
      });

      // Reset form
      setFormData({
        sport: '',
        date: '',
        end_date: '',
        start_time: '',
        end_time: '',
        amount: '',
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Booking Failed',
        description: error?.message || 'Unable to create booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      // Reset form when closing
      setFormData({
        sport: '',
        date: defaultDate,
        end_date: defaultDate,
        start_time: defaultStartTime,
        end_time: '',
        amount: '',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span>Create New Booking</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="sport">Sport</Label>
            <Select 
              value={formData.sport} 
              onValueChange={async (value: Sport) => {
                setFormData(prev => ({ ...prev, sport: value }));
                await autoFillAmount(value, formData.date, formData.start_time, formData.end_date, formData.end_time);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a sport" />
              </SelectTrigger>
              <SelectContent>
                {sports.map((sport) => (
                  <SelectItem key={sport} value={sport}>
                    <span className="flex items-center space-x-2">
                      <span>{getSportIcon(sport)}</span>
                      <span>{sport}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
  
          <div className="space-y-2">
            <Label htmlFor="start_date" className="flex items-center space-x-1">
              <CalendarDays className="h-4 w-4" />
              <span>Start Date</span>
            </Label>
            <Input
              id="start_date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value, end_date: prev.end_date || e.target.value }))}
              required
            />
          </div>

          {/* End Date selector (like Start Date) */}
          <div className="space-y-2">
            <Label htmlFor="end_date" className="flex items-center space-x-1">
              <CalendarDays className="h-4 w-4" />
              <span>End Date</span>
            </Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={async (e) => {
                const val = e.target.value;
                setFormData(prev => ({ ...prev, end_date: val }));
                await autoFillAmount(formData.sport, formData.date, formData.start_time, val, formData.end_time);
              }}
              required
            />
          </div>
  
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time" className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Start Time</span>
              </Label>
              <Select
                value={formData.start_time}
                onValueChange={async (value) => {
                  setFormData(prev => ({ ...prev, start_time: value }));
                  await autoFillAmount(formData.sport, formData.date, value, formData.end_date, formData.end_time);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Start" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {formatTo12Hour(time)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time" className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>End Time</span>
              </Label>
              <Select
                value={formData.end_time}
                onValueChange={async (value) => {
                  setFormData(prev => ({ ...prev, end_time: value }));
                  await autoFillAmount(formData.sport, formData.date, formData.start_time, formData.end_date, value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="End" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {formatTo12Hour(time)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4" />
              <span>Amount (₹)</span>
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter booking amount"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary-hover"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}