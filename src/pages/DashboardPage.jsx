"use client";

import { BarChart2, Calendar, TrendingUp, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useGet } from "src/hooks/useApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { LoadingSpinner } from "../components/ui/loading-spinner";

function DashboardPage() {
  const { data: teams, isLoading: teamsLoading } = useGet("/game/teams/");
  // const { teams, isLoading: teamsLoading } = useTeams();
  const { data: tournaments, isLoading: tournamentsLoading } =
    useGet("/game/tournament/");
  const { data: players, isLoading: playersLoading } = useGet("/game/players/");
  const { data: fixtures, isLoading: fixturesLoading } =
    useGet("/game/fixtures/");

  const [stats, setStats] = useState({
    totalTeams: 0,
    totalPlayers: 0,
    totalTournaments: 0,
    upcomingMatches: 0,
    recentActivity: [],
  });

  // useEffect(() => {
  //   // Update stats when data is loaded
  //   if (
  //     !teamsLoading &&
  //     !tournamentsLoading &&
  //     !playersLoading &&
  //     !fixturesLoading
  //   ) {
  //     setStats({
  //       totalTeams: teams.length,
  //       totalPlayers: players.length,
  //       totalTournaments: tournaments.length,
  //       upcomingMatches: fixtures.filter((f) => new Date(f.date) > new Date())
  //         .length,
  //       recentActivity: generateRecentActivity(),
  //     });
  //   }
  // }, [
  //   teams,
  //   tournaments,
  //   players,
  //   fixtures,
  //   teamsLoading,
  //   tournamentsLoading,
  //   playersLoading,
  //   fixturesLoading,
  // ]);

  // Generate mock recent activity
  const generateRecentActivity = () => {
    return [
      {
        id: 1,
        type: "player_added",
        message: "New player John Doe registered",
        time: "2 hours ago",
      },
      {
        id: 2,
        type: "match_completed",
        message: "Match completed: Team A vs Team B",
        time: "5 hours ago",
      },
      {
        id: 3,
        type: "tournament_created",
        message: "Summer Tournament 2023 created",
        time: "1 day ago",
      },
      {
        id: 4,
        type: "player_transfer",
        message: "Player transfer: Mike Smith from Team C to Team D",
        time: "2 days ago",
      },
      {
        id: 5,
        type: "payment_verified",
        message: "Payment verified for player David Johnson",
        time: "3 days ago",
      },
    ];
  };

  const isLoading =
    teamsLoading || tournamentsLoading || playersLoading || fixturesLoading;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Welcome back to your cricket management dashboard
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Teams
                </CardTitle>
                <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTeams}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  +2 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Players
                </CardTitle>
                <BarChart2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPlayers}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  +12 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Tournaments
                </CardTitle>
                <Trophy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalTournaments}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  +1 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Upcoming Matches
                </CardTitle>
                <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.upcomingMatches}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Next match in 2 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start">
                    <div className="mr-4 mt-0.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Matches */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fixtures?.results
                  .filter((f) => new Date(f.date) > new Date())
                  .slice(0, 3)
                  .map((fixture, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-md"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          {fixture.teamA?.abbreviation || "TA"}
                        </div>
                        <div className="text-sm font-medium">vs</div>
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          {fixture.teamB?.abbreviation || "TB"}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(fixture.date).toLocaleDateString()} at{" "}
                        {fixture.time}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default DashboardPage;
