"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useVoting } from "../../hooks/use-voting"
import { usePlayers } from "../../hooks/use-players"
import { useTeams } from "../../hooks/use-teams"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { FormField } from "../ui/form-field"
import { LoadingSpinner } from "../ui/loading-spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import { Checkbox } from "../ui/checkbox"
import { ScrollArea } from "../ui/scroll-area"

export function VotingForm({ id: propId }) {
  const navigate = useNavigate()
  const { id: urlId } = useParams()
  const id = propId || urlId

  const { getPoll, createPoll, updatePoll } = useVoting()
  const { players } = usePlayers()
  const { teams } = useTeams()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(!!id)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    nominees: [],
    nomineeType: "player", // "player" or "team"
  })

  const [selectedNominees, setSelectedNominees] = useState([])

  useEffect(() => {
    const fetchPoll = async () => {
      if (id) {
        try {
          const poll = await getPoll(id)
          if (poll) {
            // Determine nominee type based on the first nominee
            const isPlayerNominee = players.some((p) => p.id === poll.nominees[0])

            setFormData({
              title: poll.title,
              description: poll.description,
              startDate: poll.startDate,
              endDate: poll.endDate,
              nominees: poll.nominees,
              nomineeType: isPlayerNominee ? "player" : "team",
            })

            setSelectedNominees(poll.nominees)
          }
        } catch (error) {
          console.error("Error fetching poll:", error)
        } finally {
          setIsFetching(false)
        }
      }
    }

    fetchPoll()
  }, [id, getPoll, players])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNomineeTypeChange = (value) => {
    setFormData((prev) => ({ ...prev, nomineeType: value, nominees: [] }))
    setSelectedNominees([])
  }

  const handleNomineeToggle = (nomineeId) => {
    setSelectedNominees((prev) => {
      if (prev.includes(nomineeId)) {
        return prev.filter((id) => id !== nomineeId)
      } else {
        return [...prev, nomineeId]
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const pollData = {
        ...formData,
        nominees: selectedNominees,
      }

      if (id) {
        await updatePoll(id, pollData)
      } else {
        await createPoll(pollData)
      }
      navigate("/dashboard/voting")
    } catch (error) {
      console.error("Error saving poll:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
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
            <FormField
              label="Poll Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter poll title"
              required
              className="md:col-span-2"
            />

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter poll description"
                required
                className="min-h-20"
              />
            </div>

            <FormField
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
            />

            <FormField
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              required
            />

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nomineeType">Nominee Type</Label>
              <Select value={formData.nomineeType} onValueChange={handleNomineeTypeChange}>
                <SelectTrigger id="nomineeType">
                  <SelectValue placeholder="Select nominee type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="player">Players</SelectItem>
                  <SelectItem value="team">Teams</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Select Nominees</Label>
              <Card className="border">
                <ScrollArea className="h-72 p-4">
                  <div className="space-y-2">
                    {formData.nomineeType === "player"
                      ? players.map((player) => (
                          <div key={player.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`nominee-${player.id}`}
                              checked={selectedNominees.includes(player.id)}
                              onCheckedChange={() => handleNomineeToggle(player.id)}
                            />
                            <Label htmlFor={`nominee-${player.id}`} className="flex-1 cursor-pointer">
                              {player.fullName}
                            </Label>
                          </div>
                        ))
                      : teams.map((team) => (
                          <div key={team.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`nominee-${team.id}`}
                              checked={selectedNominees.includes(team.id)}
                              onCheckedChange={() => handleNomineeToggle(team.id)}
                            />
                            <Label htmlFor={`nominee-${team.id}`} className="flex-1 cursor-pointer">
                              {team.name}
                            </Label>
                          </div>
                        ))}
                  </div>
                </ScrollArea>
              </Card>
              {selectedNominees.length === 0 && (
                <p className="text-xs text-destructive">Please select at least one nominee</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => navigate("/dashboard/voting")} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || selectedNominees.length === 0}>
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  {id ? "Updating..." : "Creating..."}
                </>
              ) : id ? (
                "Update Poll"
              ) : (
                "Create Poll"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

