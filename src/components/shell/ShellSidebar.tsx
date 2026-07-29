import { Link, useLocation } from 'react-router-dom';
import {
  Award,
  BarChart2,
  BarChart,
  Calendar,
  Clipboard,
  Newspaper,
  RefreshCw,
  Settings,
  Trophy,
  UserCheck,
  Users,
  VoteIcon,
  LogOut,
  BirdIcon as CricketBall,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const routes = [
  { title: 'Dashboard', href: '/dashboard', icon: BarChart2 },
  { title: 'Teams', href: '/dashboard/teams', icon: Users },
  { title: 'Tournaments', href: '/dashboard/tournaments', icon: Trophy },
  { title: 'Players', href: '/dashboard/players', icon: Users },
  { title: 'Users', href: '/dashboard/users', icon: Users },
  { title: 'Fixtures', href: '/dashboard/fixtures', icon: Calendar },
  { title: 'Voting Polls', href: '/dashboard/voting', icon: VoteIcon },
  { title: 'Player Verification', href: '/dashboard/verification', icon: UserCheck },
  { title: 'Player Transfers', href: '/dashboard/transfers', icon: RefreshCw },
  { title: 'Scorecards', href: '/dashboard/scorecards', icon: Clipboard },
  { title: 'Points Table', href: '/dashboard/points', icon: BarChart },
  { title: 'Posts', href: '/dashboard/posts', icon: Newspaper },
  { title: 'Sponsors', href: '/dashboard/sponsors', icon: Award },
  { title: 'Settings', href: '/dashboard/settings', icon: Settings },
];

function isActive(pathname: string, path: string) {
  if (path === '/dashboard') {
    return pathname === '/dashboard';
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

type ShellSidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

export function ShellSidebar({ className, onNavigate }: ShellSidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { activeTenant } = useTenant();

  return (
    <aside
      className={cn(
        'flex h-full w-64 shrink-0 flex-col border-r border-border bg-[#12233D] text-white',
        className
      )}
    >
      <div className="border-b border-white/10 px-4 py-5 pr-12">
        <div className="flex items-center gap-2">
          <CricketBall className="h-6 w-6 shrink-0 text-[#E8A93B]" />
          <div className="min-w-0">
            <p className="font-bold">CAM Cricket</p>
            {activeTenant ? (
              <p className="truncate text-xs text-white/70">{activeTenant.name}</p>
            ) : null}
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto overscroll-contain px-2 py-4">
        <ul className="space-y-1">
          {routes.map((route) => {
            const Icon = route.icon;
            const active = isActive(location.pathname, route.href);
            return (
              <li key={route.href}>
                <Link
                  to={route.href}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    active
                      ? 'bg-[#E8A93B] font-medium text-[#12233D]'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{route.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 min-w-0">
          <p className="truncate text-sm font-medium">{user?.full_name ?? 'Admin'}</p>
          <p className="truncate text-xs text-white/70">{user?.email}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full border-white/20 bg-transparent text-white hover:bg-white/10"
          onClick={() => {
            onNavigate?.();
            logout();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </aside>
  );
}
