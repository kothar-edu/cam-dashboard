"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "../ui/button"
import { LoadingSpinner } from "../ui/loading-spinner"
import { Label } from "../ui/label"
import { Edit2 } from "lucide-react"

export function PointsTable() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTournament, setSelectedTournament] = useState("")
  const [tournaments, setTournaments] = useState([])
  const [pointsData, setPointsData] = useState([])
  const [isEditing, setIsEditing] = useState(false)

  // Mock tournaments data
  const mockTournaments = [
    { id: "1", name: "Premier League 2025" },
    { id: "2", name: "T20 Championship" },
    { id: "3", name: "Test Series 2025" },
  ]

  // Mock points data
  const mockPointsData = [
    { id: "1", team: "Royal Challengers", played: 10, won: 7, lost: 2, tied: 1, points: 15, nrr: "+1.234" },
    { id: "2", team: "Super Kings", played: 10, won: 6, lost: 3, tied: 1, points: 13, nrr: "+0.987" },
    { id: "3", team: "Knight Riders", played: 10, won: 5, lost: 4, tied: 1, points: 11, nrr: "+0.456" },
    { id: "4", team: "Mumbai Indians", played: 10, won: 4, lost: 5, tied: 1, points: 9, nrr: "-0.123" },
    { id: "5", team: "Delhi Capitals", played: 10, won: 3, lost: 6, tied: 1, points: 7, nrr: "-0.567" },
  ]

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setTournaments(mockTournaments)
        if (mockTournaments.length > 0) {
          setSelectedTournament(mockTournaments[0].id)
          setPointsData(mockPointsData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleTournamentChange = async (value) => {
    setSelectedTournament(value)
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800))

      // In a real app, you would fetch points data for the selected tournament
      setPointsData(mockPointsData)
    } catch (error) {
      console.error("Error fetching points data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveChanges = async () => {
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsEditing(false)
      // In a real app, you would save the updated points data
    } catch (error) {
      console.error("Error saving points data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Points Table</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="w-64">
            <Label htmlFor="tournament" className="sr-only">
              Select Tournament
            </Label>
            <Select value={selectedTournament} onValueChange={handleTournamentChange} disabled={isLoading}>
              <SelectTrigger id="tournament">
                <SelectValue placeholder="Select tournament" />
              </SelectTrigger>
              <SelectContent>
                {tournaments.map((tournament) => (
                  <SelectItem key={tournament.id} value={tournament.id}>
                    {tournament.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => (isEditing ? handleSaveChanges() : setIsEditing(true))}
            disabled={isLoading}
          >
            {isEditing ? (
              isLoading ? (
                "Saving..."
              ) : (
                "Save Changes"
              )
            ) : (
              <>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead className="text-center">Played</TableHead>
                <TableHead className="text-center">Won</TableHead>
                <TableHead className="text-center">Lost</TableHead>
                <TableHead className="text-center">Tied</TableHead>
                <TableHead className="text-center">Points</TableHead>
                <TableHead className="text-center">NRR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pointsData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.team}</TableCell>
                  <TableCell className="text-center">{row.played}</TableCell>
                  <TableCell className="text-center">{row.won}</TableCell>
                  <TableCell className="text-center">{row.lost}</TableCell>
                  <TableCell className="text-center">{row.tied}</TableCell>
                  <TableCell className="text-center font-bold">{row.points}</TableCell>
                  <TableCell className="text-center">{row.nrr}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

