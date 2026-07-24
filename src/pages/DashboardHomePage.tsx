import { BarChart2, Calendar, Trophy, Users } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useTenant } from '@/contexts/TenantContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

function formatFixtureDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function DashboardHomePage() {
  const { activeTenant } = useTenant();
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
      label: 'Upcoming Matches',
      value: data.upcomingFixtures.length,
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#12233D]">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {activeTenant.name} · tenant-scoped cricket overview
          </p>
        </div>
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

      {data.upcomingFixtures.length > 0 ? (
        <Card className="border-[#12233D]/10">
          <CardHeader>
            <CardTitle className="text-[#12233D]">Upcoming Matches</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.upcomingFixtures.map((fixture) => (
              <div
                key={fixture.id}
                className="flex flex-col gap-1 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
              >
                <div className="min-w-0">
                  <p className="break-words font-medium text-[#12233D]">
                    {fixture.opponent_a.team_name} vs {fixture.opponent_b.team_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatFixtureDate(fixture.time)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-[#12233D]/10">
          <CardHeader>
            <CardTitle className="text-[#12233D]">Upcoming Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No scheduled fixtures found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
