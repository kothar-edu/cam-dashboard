"use client";
import { useParams, Link } from "react-router-dom";
import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { PlayerStats } from "../components/players/player-stats";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";

function PlayerStatsPage() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Player Statistics"
        text="View detailed player performance statistics."
      >
        <Link to={`/dashboard/players/${id}`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Player
          </Button>
        </Link>
      </DashboardHeader>
      <div className="grid gap-8">
        <PlayerStats playerId={id} />
      </div>
    </div>
  );
}

export default PlayerStatsPage;
