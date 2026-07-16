import { Link, useLocation } from 'react-router-dom';
import {
  BarChart2,
  BarChart,
  Calendar,
  Clipboard,
  DollarSign,
  FileText,
  RefreshCw,
  Settings,
  Trophy,
  UserCheck,
  Users,
  VoteIcon,
  LogOut,
  BirdIcon as CricketBall,
  Tag,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { Button } from '@/components/ui/button';

const routes = [
  { title: 'Dashboard', href: '/dashboard', icon: BarChart2 },
  { title: 'Teams', href: '/dashboard/teams', icon: Users },
  { title: 'Tournaments', href: '/dashboard/tournaments', icon: Trophy },
  { title: 'Players', href: '/dashboard/players', icon: Users },
  { title: 'Users', href: '/dashboard/users', icon: Users },
  { title: 'Fixtures', href: '/dashboard/fixtures', icon: Calendar },
  { title: 'Posts', href: '/dashboard/posts', icon: FileText },
  { title: 'Sponsors', href: '/dashboard/sponsors', icon: DollarSign },
  { title: 'Boundary Labels', href: '/dashboard/boundary-labels', icon: Tag },
  { title: 'Voting Polls', href: '/dashboard/voting', icon: VoteIcon },
  { title: 'Player Verification', href: '/dashboard/verification', icon: UserCheck },
  { title: 'Player Transfers', href: '/dashboard/transfers', icon: RefreshCw },
  { title: 'Scorecards', href: '/dashboard/scorecards', icon: Clipboard },
  { title: 'Points Table', href: '/dashboard/points', icon: BarChart },
  { title: 'Settings', href: '/dashboard/settings', icon: Settings },
];

function isActive(pathname: string, path: string) {
  if (path === '/dashboard') {
    return pathname === '/dashboard';
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function ShellSidebar() {
  const location = useLocation();
  const { user, logout, canManageTenants } = useAuth();
  const { activeTenant } = useTenant();

  const navRoutes = canManageTenants
    ? [
        ...routes.slice(0, 5),
        { title: 'Tenants', href: '/dashboard/tenants', icon: Building2 },
        ...routes.slice(5),
      ]
    : routes;

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-[#12233D] text-white">
      <div className="border-b border-white/10 px-4 py-5">
        <div className="flex items-center gap-2">
          <CricketBall className="h-6 w-6 text-[#E8A93B]" />
          <div>
            <p className="font-bold">CAM Cricket</p>
            {activeTenant ? (
              <p className="text-xs text-white/70">{activeTenant.name}</p>
            ) : null}
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-1">
          {navRoutes.map((route) => {
            const Icon = route.icon;
            const active = isActive(location.pathname, route.href);
            return (
              <li key={route.href}>
                <Link
                  to={route.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                    active
                      ? 'bg-[#E8A93B] text-[#12233D] font-medium'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{route.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3">
          <p className="text-sm font-medium">{user?.full_name ?? 'Admin'}</p>
          <p className="text-xs text-white/70">{user?.email}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full border-white/20 bg-transparent text-white hover:bg-white/10"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </aside>
  );
}
