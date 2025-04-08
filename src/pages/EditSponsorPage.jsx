"use client";
import { useParams } from "react-router-dom";
import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { SponsorForm } from "../components/sponsors/sponsor-form";

function EditSponsorPage() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Edit Sponsor"
        text="Update your sponsor information."
      />
      <div className="grid gap-8">
        <SponsorForm id={id} />
      </div>
    </div>
  );
}

export default EditSponsorPage;
