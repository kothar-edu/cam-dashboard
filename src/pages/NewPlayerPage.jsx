import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { PlayerForm } from "../components/players/player-form";

function NewPlayerPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Create Player"
        text="Add a new player to your cricket league."
      />
      <div className="grid gap-8">
        <PlayerForm />
      </div>
    </div>
  );
}

export default NewPlayerPage;
