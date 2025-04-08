import { Link } from "react-router-dom";
import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { FixturesTable } from "../components/fixtures/fixtures-table";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";

function FixturesPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader heading="Fixtures" text="Manage your match fixtures.">
        <Link to="/dashboard/fixtures/new">
          <Button variant="secondary">
            <Plus className="mr-2 h-4 w-4" />
            Add Fixture
          </Button>
        </Link>
      </DashboardHeader>
      <FixturesTable />
    </div>
  );
}

export default FixturesPage;
