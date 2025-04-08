"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { LoadingSpinner } from "../ui/loading-spinner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Label } from "../ui/label"
import { Badge } from "../ui/badge"
import { useToast } from "../../hooks/use-toast"

export function TransfersTable() {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isTransferring, setIsTransferring] = useState(false)
  const [players, setPlayers] = useState([])
  const [teams, setTeams] = useState([])
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Mock players data
  const mockPlayers = [
    {
      id: "1",
      fullName: "Virat Kohli",
      teamId: "1",
      teamName: "Royal Challengers",
      transferHistory: [{ fromTeam: "Delhi Capitals", toTeam: "Royal Challengers", date: "2020-01-15" }],
    },
    {
      id: "2",
      fullName: "MS Dhoni",
      teamId: "2",
      teamName: "Super Kings",
      transferHistory: [],
    },
    {
      id: "3",
      fullName: "Rohit Sharma",
      teamId: "3",
      teamName: "Mumbai Indians",
      transferHistory: [{ fromTeam: "Deccan Chargers", toTeam: "Mumbai Indians", date: "2018-05-20" }],
    },
    {
      id: "4",
      fullName: "KL Rahul",
      teamId: "4",
      teamName: "Punjab Kings",
      transferHistory: [{ fromTeam: "Royal Challengers", toTeam: "Punjab Kings", date: "2021-03-10" }],
    },
  ]

  // Mock teams data
  const mockTeams = [
    { id: "1", name: "Royal Challengers" },
    { id: "2", name: "Super Kings" },
    { id: "3", name: "Mumbai Indians" },
    { id: "4", name: "Punjab Kings" },
    { id: "5", name: "Delhi Capitals" },
  ]

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setPlayers(mockPlayers)
        setTeams(mockTeams)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleTransferPlayer = async () => {
    if (!selectedPlayer || !selectedTeam) {
      toast.error("Please select both player and team")
      return
    }

    if (selectedPlayer.teamId === selectedTeam) {
      toast.error("Player already belongs to this team")
      return
    }

    setIsTransferring(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update local state
      const fromTeamName = selectedPlayer.teamName
      const toTeamName = teams.find((team) => team.id === selectedTeam)?.name || "Unknown Team"

      setPlayers((prev) =>
        prev.map((player) => {
          if (player.id === selectedPlayer.id) {
            return {
              ...player,
              teamId: selectedTeam,
              teamName: toTeamName,
              transferHistory: [
                { fromTeam: fromTeamName, toTeam: toTeamName, date: new Date().toISOString().split("T")[0] },
                ...player.transferHistory,
              ],
            }
          }
          return player
        }),
      )

      toast.success(`${selectedPlayer.fullName} transferred to ${toTeamName}`)
      setIsDialogOpen(false)
      setSelectedPlayer(null)
      setSelectedTeam("")
    } catch (error) {
      console.error("Error transferring player:", error)
      toast.error("Failed to transfer player")
    } finally {
      setIsTransferring(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Player Transfers</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Transfer Player</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transfer Player</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="player">Select Player</Label>
                <Select
                  value={selectedPlayer?.id || ""}
                  onValueChange={(value) => setSelectedPlayer(players.find((p) => p.id === value))}
                >
                  <SelectTrigger id="player">
                    <SelectValue placeholder="Select player" />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.fullName} ({player.teamName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPlayer && (
                <div className="space-y-2">
                  <Label htmlFor="team">Select New Team</Label>
                  <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                    <SelectTrigger id="team">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams
                        .filter((team) => team.id !== selectedPlayer.teamId)
                        .map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isTransferring}>
                  Cancel
                </Button>
                <Button onClick={handleTransferPlayer} disabled={!selectedPlayer || !selectedTeam || isTransferring}>
                  {isTransferring ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Transferring...
                    </>
                  ) : (
                    "Transfer Player"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Current Team</TableHead>
              <TableHead className="hidden md:table-cell">Transfer History</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player) => (
              <TableRow key={player.id}>
                <TableCell className="font-medium">{player.fullName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{player.teamName}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {player.transferHistory.length > 0 ? (
                    <div className="space-y-1">
                      {player.transferHistory.map((transfer, index) => (
                        <div key={index} className="text-sm">
                          <span className="text-muted-foreground">
                            {new Date(transfer.date).toLocaleDateString()}:{" "}
                          </span>
                          {transfer.fromTeam} → {transfer.toTeam}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No transfer history</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

