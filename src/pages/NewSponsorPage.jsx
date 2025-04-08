import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { SponsorForm } from "../components/sponsors/sponsor-form";

function NewSponsorPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader heading="Create Sponsor" text="Add a new sponsor." />
      <div className="grid gap-8">
        <SponsorForm />
      </div>
    </div>
  );
}

export default NewSponsorPage;
