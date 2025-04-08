"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTeams } from "../../hooks/use-teams"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { FormField } from "../ui/form-field"
import { LoadingSpinner } from "../ui/loading-spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Label } from "../ui/label"

export function FixtureForm({ id }) {
  const navigate = useNavigate()
  const { teams, isLoading: teamsLoading } = useTeams()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(!!id)

  const [formData, setFormData] = useState({
    matchType: "T20",
    teamA: "",
    teamB: "",
    date: new Date().toISOString().split("T")[0],
    time: "14:00",
    venue: "",
  })

  useEffect(() => {
    const fetchFixture = async () => {
      if (id) {
        try {
          setIsFetching(true)
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // Mock fixture data
          setFormData({
            matchType: "T20",
            teamA: "1",
            teamB: "2",
            date: "2025-04-10",
            time: "14:00",
            venue: "Central Stadium",
          })
        } catch (error) {
          console.error("Error fetching fixture:", error)
        } finally {
          setIsFetching(false)
        }
      }
    }

    fetchFixture()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate form
      if (formData.teamA === formData.teamB) {
        throw new Error("Team A and Team B cannot be the same")
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      navigate("/dashboard/fixtures")
    } catch (error) {
      console.error("Error saving fixture:", error)
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching || teamsLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="matchType">Match Type</Label>
              <Select value={formData.matchType} onValueChange={(value) => handleSelectChange("matchType", value)}>
                <SelectTrigger id="matchType">
                  <SelectValue placeholder="Select match type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="T20">T20</SelectItem>
                  <SelectItem value="ODI">ODI</SelectItem>
                  <SelectItem value="Test">Test</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamA">Team A</Label>
              <Select value={formData.teamA} onValueChange={(value) => handleSelectChange("teamA", value)}>
                <SelectTrigger id="teamA">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamB">Team B</Label>
              <Select value={formData.teamB} onValueChange={(value) => handleSelectChange("teamB", value)}>
                <SelectTrigger id="teamB">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <FormField label="Date" name="date" type="date" value={formData.date} onChange={handleChange} required />

            <FormField label="Time" name="time" type="time" value={formData.time} onChange={handleChange} required />

            <FormField
              label="Venue"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="Enter venue"
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/fixtures")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  {id ? "Updating..." : "Creating..."}
                </>
              ) : id ? (
                "Update Fixture"
              ) : (
                "Create Fixture"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

