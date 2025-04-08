"use client"

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { ChangePasswordForm } from "./change-password-form"
import { CreateAdminForm } from "./create-admin-form"
import { ResetPasswordForm } from "./reset-password-form"

export function SettingsTabs({ defaultTab = "change-password" }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Update active tab when URL changes
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = (value) => {
    setActiveTab(value)
    navigate(`/dashboard/settings?tab=${value}`, { replace: true })
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="change-password">Change Password</TabsTrigger>
        <TabsTrigger value="create-admin">Create Admin</TabsTrigger>
        <TabsTrigger value="reset-password">Reset Password</TabsTrigger>
      </TabsList>
      <TabsContent value="change-password">
        <ChangePasswordForm />
      </TabsContent>
      <TabsContent value="create-admin">
        <CreateAdminForm />
      </TabsContent>
      <TabsContent value="reset-password">
        <ResetPasswordForm />
      </TabsContent>
    </Tabs>
  )
}

