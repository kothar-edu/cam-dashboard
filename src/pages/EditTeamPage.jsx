"use client";
import { useParams } from "react-router-dom";
import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { TeamForm } from "../components/teams/team-form";

function EditTeamPage() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Edit Team"
        text="Update your team's information."
      />
      <div className="grid gap-8">
        <TeamForm id={id} />
      </div>
    </div>
  );
}

export default EditTeamPage;
