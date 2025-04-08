import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { ScorecardsTable } from "../components/scorecards/scorecards-table";

function ScorecardsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Scorecards"
        text="Manage match scorecards and player statistics."
      />
      <ScorecardsTable />
    </div>
  );
}

export default ScorecardsPage;
