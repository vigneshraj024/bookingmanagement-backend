const logoUrl = '/turf-logo.png';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Admin } from '@/types/booking';
import { User, Settings, LogOut } from 'lucide-react';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  admin: Admin;
  onSignOut: () => void;
}

export function Header({ admin, onSignOut }: HeaderProps) {
  const { toast } = useToast();
  // Using direct logo import

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
      onSignOut();
    } catch (error) {
      toast({
        title: 'Sign Out Failed',
        description: 'Unable to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="bg-card border-b border-border/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            {/* Use fallback logo since the image file is corrupted */}
            <div className="h-12 w-auto flex items-center">
              <div className="h-10 w-10 bg-gradient-to-br from-green-600 to-green-800 text-white rounded-md flex items-center justify-center font-bold text-xl mr-3">
                T50
              </div>
              <span className="text-xl font-bold">TURF 50</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">Welcome back,</p>
            <p className="text-sm text-muted-foreground">{admin.name}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {admin.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{admin.name}</p>
                  <p className="text-xs text-muted-foreground">{admin.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}