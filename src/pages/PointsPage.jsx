import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { PointsTable } from "../components/points/points-table";

function PointsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Points Table"
        text="Manage tournament points table."
      />
      <PointsTable />
    </div>
  );
}

export default PointsPage;
