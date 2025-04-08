import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { TeamForm } from "../components/teams/team-form";

function NewTeamPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Create Team"
        text="Add a new team to your cricket league."
      />
      <div className="grid gap-8">
        <TeamForm />
      </div>
    </div>
  );
}

export default NewTeamPage;
