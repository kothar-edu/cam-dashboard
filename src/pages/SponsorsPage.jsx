import { Link } from "react-router-dom";
import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { SponsorsTable } from "../components/sponsors/sponsors-table";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";

function SponsorsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader heading="Sponsors" text="Manage your sponsors.">
        <Link to="/dashboard/sponsors/new">
          <Button variant="secondary">
            <Plus className="mr-2 h-4 w-4" />
            Add Sponsor
          </Button>
        </Link>
      </DashboardHeader>
      <SponsorsTable />
    </div>
  );
}

export default SponsorsPage;
