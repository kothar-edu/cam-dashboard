import { Link } from "react-router-dom";
import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { TeamsTable } from "../components/teams/teams-table";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";

function TeamsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader heading="Teams" text="Manage your cricket teams.">
        <Link to="/dashboard/teams/new">
          <Button variant="secondary">
            <Plus className="mr-2 h-4 w-4" />
            Add Team
          </Button>
        </Link>
      </DashboardHeader>
      <TeamsTable />
    </div>
  );
}

export default TeamsPage;
