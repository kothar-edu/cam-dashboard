import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { VerificationTable } from "../components/verification/verification-table";

function VerificationPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Player Verification"
        text="Verify player registrations and payments."
      />
      <VerificationTable />
    </div>
  );
}

export default VerificationPage;
