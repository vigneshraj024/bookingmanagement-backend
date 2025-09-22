import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { loginAdmin } from '@/api/authservies';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trophy, Calendar, Users, BarChart3 } from 'lucide-react';
interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginAdmin(email, password);

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      // Call onSuccess to update the app's authentication state
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="text-center lg:text-left space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start space-x-3">
              <div className="bg-primary rounded-xl p-3">
                <Trophy className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Sports Booking
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-md">
              Streamline your sports facility management with our comprehensive booking platform
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-4">
              <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Smart Scheduling</h3>
              <p className="text-sm text-muted-foreground">Efficient time slot management</p>
            </div>
            <div className="text-center p-4">
              <Users className="h-8 w-8 text-secondary mx-auto mb-2" />
              <h3 className="font-semibold">Multi-Sport Support</h3>
              <p className="text-sm text-muted-foreground">Cricket, Football, Pickleball & Gaming</p>
            </div>
            <div className="text-center p-4">
              <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="font-semibold">Revenue Tracking</h3>
              <p className="text-sm text-muted-foreground">Real-time financial insights</p>
            </div>
            <div className="text-center p-4">
              <Trophy className="h-8 w-8 text-secondary mx-auto mb-2" />
              <h3 className="font-semibold">Admin Control</h3>
              <p className="text-sm text-muted-foreground">Complete booking management</p>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex justify-center lg:justify-end">
          <Card className="w-full max-w-md booking-card hover-lift">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Admin Login</CardTitle>
              <CardDescription>
                Enter your credentials to access the booking management dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary-hover"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Demo credentials:</strong><br />
                  Email: admin@sportsbooking.com<br />
                  Password: admin123
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
