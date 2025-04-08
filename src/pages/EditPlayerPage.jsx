"use client";
import { useParams } from "react-router-dom";
import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { PlayerForm } from "../components/players/player-form";

function EditPlayerPage() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Edit Player"
        text="Update your player's information."
      />
      <div className="grid gap-8">
        <PlayerForm id={id} />
      </div>
    </div>
  );
}

export default EditPlayerPage;
