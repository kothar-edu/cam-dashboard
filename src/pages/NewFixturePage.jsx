import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { FixtureForm } from "../components/fixtures/fixture-form";

function NewFixturePage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Create Fixture"
        text="Add a new match fixture to your cricket league."
      />
      <div className="grid gap-8">
        <FixtureForm />
      </div>
    </div>
  );
}

export default NewFixturePage;
