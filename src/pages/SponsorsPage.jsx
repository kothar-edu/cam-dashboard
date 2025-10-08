import { Link } from "react-router-dom";
import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { SponsorsTable } from "../components/sponsors/sponsors-table";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";
import { useGet } from "src/hooks/useApi";

function SponsorsPage() {
  const { data: sponsors = [], loading: isLoading } = useGet("/game/sponsor/");
  console.log(sponsors);

  return (
    <div className="space-y-6 h-full">
      <DashboardHeader
        heading="Sponsors"
        text="Manage your sponsors."
        count={sponsors?.count ?? 0}
      >
        <Link to="/dashboard/sponsors/new">
          <Button variant="secondary">
            <Plus className="mr-2 h-4 w-4" />
            Add Sponsor
          </Button>
        </Link>
      </DashboardHeader>
      <SponsorsTable sponsors={sponsors} loading={isLoading} />
    </div>
  );
}

export default SponsorsPage;
