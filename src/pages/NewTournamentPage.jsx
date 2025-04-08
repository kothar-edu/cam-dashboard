import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { TournamentForm } from "../components/tournaments/tournament-form";

function NewTournamentPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Create Tournament"
        text="Add a new tournament to your cricket league."
      />
      <div className="grid gap-8">
        <TournamentForm />
      </div>
    </div>
  );
}

export default NewTournamentPage;
