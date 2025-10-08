import { Link } from "react-router-dom";
import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { PlayersTable } from "../components/players/players-table";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import { useGet } from "src/hooks/useApi";

function PlayersPage() {
  const { data: players, loading: isLoading } = useGet("/game/player/");

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Players"
        text="Manage your players."
        count={players?.count}
      >
        <Link to="/dashboard/players/new">
          <Button variant="secondary">
            <Plus className="mr-2 h-4 w-4" />
            Add Player
          </Button>
        </Link>
      </DashboardHeader>
      <PlayersTable players={players} loading={isLoading} />
    </div>
  );
}

export default PlayersPage;
