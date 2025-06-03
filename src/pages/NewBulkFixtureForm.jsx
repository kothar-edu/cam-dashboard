import { DashboardHeader } from "src/components/dashboard/dashboard-header";
import BulkFixtureUpload from "src/components/fixtures/bulk-fixture-upload";

export default function BulkFixtureUploadPage() {
  return (
    <>
      <DashboardHeader
        heading="Create Fixture"
        text="Add a new match fixture to your cricket league."
      />

      <div className="mx-auto py-6">
        <BulkFixtureUpload />
      </div>
    </>
  );
}
