import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { VotingForm } from "../components/voting/voting-form";

function NewVotingPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Create Voting Poll"
        text="Create a new voting poll."
      />
      <div className="grid gap-8">
        <VotingForm />
      </div>
    </div>
  );
}

export default NewVotingPage;
