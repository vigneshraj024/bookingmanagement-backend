import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { bookingService } from '@/lib/bookings';
import { Sport } from '@/types/booking';
import { CalendarDays, Clock, DollarSign, Trophy } from 'lucide-react';

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
    start_time: defaultStartTime,
    end_time: '',
    amount: '',
  });
  const [loading, setLoading] = useState(false);
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
    };
    return icons[sport];
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

    if (formData.start_time >= formData.end_time) {
      toast({
        title: 'Invalid Time Range',
        description: 'End time must be after start time.',
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
              onValueChange={(value: Sport) => setFormData(prev => ({ ...prev, sport: value }))}
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
            <Label htmlFor="date" className="flex items-center space-x-1">
              <CalendarDays className="h-4 w-4" />
              <span>Date</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
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
                onValueChange={(value) => setFormData(prev => ({ ...prev, start_time: value }))}
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
              <Label htmlFor="end_time">End Time</Label>
              <Select 
                value={formData.end_time} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, end_time: value }))}
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