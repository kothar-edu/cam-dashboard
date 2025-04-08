import { Link } from "react-router-dom";
import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { VotingTable } from "../components/voting/voting-table";
import { Button } from "../components/ui/button";
import { Plus } from "lucide-react";

function VotingPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader heading="Voting Polls" text="Manage your voting polls.">
        <Link to="/dashboard/voting/new">
          <Button variant="secondary">
            <Plus className="mr-2 h-4 w-4" />
            Create Poll
          </Button>
        </Link>
      </DashboardHeader>
      <VotingTable />
    </div>
  );
}

export default VotingPage;
