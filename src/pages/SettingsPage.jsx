"use client";
import { useSearchParams } from "react-router-dom";
import { DashboardHeader } from "../components/dashboard/dashboard-header";
import { SettingsTabs } from "../components/settings/settings-tabs";

function SettingsPage() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "change-password";

  return (
    <div className="space-y-6">
      <DashboardHeader
        heading="Settings"
        text="Manage your account settings and preferences."
      />
      <div className="grid gap-8">
        <SettingsTabs defaultTab={activeTab} />
      </div>
    </div>
  );
}

export default SettingsPage;
