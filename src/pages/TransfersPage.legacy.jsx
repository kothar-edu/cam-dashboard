import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { TransfersTable } from "../components/transfers/transfers-table";

function TransfersPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Player Transfers"
        text="Transfer players between teams."
      />
      <TransfersTable />
    </div>
  );
}

export default TransfersPage;
