"use client";
import { useParams } from "react-router-dom";
import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { ScorecardEditor } from "../components/scorecards/scorecard-editor";

function EditScorecardPage() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Edit Scorecard"
        text="Update match scorecard and player statistics."
      />
      <div className="grid gap-8">
        <ScorecardEditor id={id} />
      </div>
    </div>
  );
}

export default EditScorecardPage;
