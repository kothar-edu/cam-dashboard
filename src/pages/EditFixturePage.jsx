"use client";
import { useParams } from "react-router-dom";
import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { FixtureForm } from "../components/fixtures/fixture-form";

function EditFixturePage() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Edit Fixture"
        text="Update your match fixture information."
      />
      <div className="grid gap-8">
        <FixtureForm id={id} />
      </div>
    </div>
  );
}

export default EditFixturePage;
