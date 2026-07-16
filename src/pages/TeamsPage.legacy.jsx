import { Link } from "react-router-dom";
import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { TeamsTable } from "../components/teams/teams-table";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import { useGet } from "src/hooks/useApi";

function TeamsPage() {
  const { data: teams, loading } = useGet("/game/teams/");

  if (loading) {
    return <div>Loading...</div>;
  }

  const teamsList = Array.isArray(teams) ? teams : [];

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Teams"
        text="Manage your cricket teams."
        count={teamsList.length}
      >
        <Link to="/dashboard/teams/new">
          <Button variant="secondary">
            <Plus className="mr-2 h-4 w-4" />
            Add Team
          </Button>
        </Link>
      </DashboardHeader>
      <TeamsTable teams={teamsList} loading={loading} />
    </div>
  );
}

export default TeamsPage;
