"use client";
import { useParams } from "react-router-dom";
import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { VotingForm } from "../components/voting/voting-form";

function EditVotingPage() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Edit Voting Poll"
        text="Update your voting poll."
      />
      <div className="grid gap-8">
        <VotingForm id={id} />
      </div>
    </div>
  );
}

export default EditVotingPage;
