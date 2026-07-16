import { Link } from "react-router-dom";
import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { TournamentsTable } from "../components/tournaments/tournaments-table";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";

function TournamentsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader heading="Tournaments" text="Manage your tournaments.">
        <Link to="/dashboard/tournaments/new">
          <Button variant="secondary">
            <Plus className="mr-2 h-4 w-4" />
            Add Tournament
          </Button>
        </Link>
      </DashboardHeader>
      <TournamentsTable />
    </div>
  );
}

export default TournamentsPage;
