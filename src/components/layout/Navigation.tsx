import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, BarChart3, Home, Clock, FileText, CheckSquare } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Home,
      description: 'Overview & statistics'
    },
    { 
      id: 'calendar', 
      label: 'Calendar', 
      icon: Calendar,
      description: 'Booking calendar view'
    },
    { 
      id: 'reports', 
      label: 'Reports', 
      icon: BarChart3,
      description: 'Revenue & analytics'
    },
  ];

  return (
    <nav className="bg-card border-b border-border/50 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? 'default' : 'ghost'}
                className={`flex items-center space-x-2 h-auto py-3 px-4 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground hover:bg-primary-hover' 
                    : 'hover:bg-muted'
                }`}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className={`text-xs ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <Badge variant="secondary" className="bg-white/20 text-primary-foreground text-xs">
                    Active
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          {(() => {
            const isActive = activeTab === 'price-master';
            return (
              <Button
                variant={isActive ? 'default' : 'outline'}
                className={`flex items-center space-x-2 ${isActive ? 'bg-primary text-primary-foreground hover:bg-primary-hover' : ''}`}
                onClick={() => onTabChange('price-master')}
                title="Configure Price Master"
              >
                <Clock className="h-4 w-4" />
                <span>Price Master</span>
                {isActive && (
                  <Badge variant="secondary" className="bg-white/20 text-primary-foreground text-xs">Active</Badge>
                )}
              </Button>
            );
          })()}

          {(() => {
            const isActive = activeTab === 'audit-logs';
            return (
              <Button
                variant={isActive ? 'default' : 'outline'}
                className={`flex items-center space-x-2 ${isActive ? 'bg-primary text-primary-foreground hover:bg-primary-hover' : ''}`}
                onClick={() => onTabChange('audit-logs')}
                title="View Audit Logs"
              >
                <FileText className="h-4 w-4" />
                <span>Audit Logs</span>
                {isActive && (
                  <Badge variant="secondary" className="bg-white/20 text-primary-foreground text-xs">Active</Badge>
                )}
              </Button>
            );
          })()}

          {(() => {
            const isActive = activeTab === 'todo';
            return (
              <Button
                variant={isActive ? 'default' : 'outline'}
                className={`flex items-center space-x-2 ${isActive ? 'bg-primary text-primary-foreground hover:bg-primary-hover' : ''}`}
                onClick={() => onTabChange('todo')}
                title="Open To-Do"
              >
                <CheckSquare className="h-4 w-4" />
                <span>To-Do</span>
                {isActive && (
                  <Badge variant="secondary" className="bg-white/20 text-primary-foreground text-xs">Active</Badge>
                )}
              </Button>
            );
          })()}
        </div>
      </div>
    </nav>
  );
}