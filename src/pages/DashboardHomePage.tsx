import { BarChart2, CalendarClock, ShieldCheck, Trophy, Users } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { DashboardMatchesPanel } from '@/components/dashboard/DashboardMatchesPanel';
import { PageHeader } from '@/components/forms/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { roleSummaryLabel } from '@/lib/roles';

export default function DashboardHomePage() {
  const { activeTenant } = useTenant();
  const { user, roles } = useAuth();
  const { data, isLoading, isError } = useDashboardStats();

  if (!activeTenant) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-[#12233D]">Select an organization</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a tenant from the header to load dashboard statistics.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        Unable to load dashboard statistics. Check your API connection and tenant access.
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Teams',
      value: data.teamCount,
      icon: Users,
    },
    {
      label: 'Total Players',
      value: data.playerCount,
      icon: BarChart2,
    },
    {
      label: 'Tournaments',
      value: data.tournamentCount,
      icon: Trophy,
    },
    {
      label: 'Live & Upcoming',
      value: data.liveAndUpcomingCount,
      icon: CalendarClock,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`${activeTenant.name} · tenant-scoped cricket overview`}
      />

      <div className="flex flex-col items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[#12233D]">
            Signed in as {user?.full_name ?? 'you'}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#12233D]/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#12233D]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#E8A93B]" />
          {roleSummaryLabel(roles)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-[#12233D]/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className="h-4 w-4 shrink-0 text-[#E8A93B]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#12233D]">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DashboardMatchesPanel />
    </div>
  );
}
