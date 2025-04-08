"use client";
import { useParams } from "react-router-dom";
import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { TournamentForm } from "../components/tournaments/tournament-form";

function EditTournamentPage() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Edit Tournament"
        text="Update your tournament's information."
      />
      <div className="grid gap-8">
        <TournamentForm id={id} />
      </div>
    </div>
  );
}

export default EditTournamentPage;
