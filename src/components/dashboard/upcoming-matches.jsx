import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"

export function UpcomingMatches({ className, ...props }) {
  const matches = [
    {
      id: 1,
      teamA: "Royal Challengers",
      teamB: "Super Kings",
      date: "2025-04-10",
      time: "14:00",
      venue: "Central Stadium",
      type: "T20",
    },
    {
      id: 2,
      teamA: "Knight Riders",
      teamB: "Mumbai Indians",
      date: "2025-04-12",
      time: "15:30",
      venue: "East End Ground",
      type: "ODI",
    },
    {
      id: 3,
      teamA: "Delhi Capitals",
      teamB: "Royal Challengers",
      date: "2025-04-15",
      time: "10:00",
      venue: "North Park",
      type: "T20",
    },
    {
      id: 4,
      teamA: "Mumbai Indians",
      teamB: "Super Kings",
      date: "2025-04-18",
      time: "18:00",
      venue: "South Stadium",
      type: "T20",
    },
    {
      id: 5,
      teamA: "Knight Riders",
      teamB: "Delhi Capitals",
      date: "2025-04-20",
      time: "14:30",
      venue: "Central Stadium",
      type: "ODI",
    },
  ]

  return (
    <Card className={className} {...props}>
      <CardHeader>
        <CardTitle>Upcoming Matches</CardTitle>
        <CardDescription>Next scheduled fixtures</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  {match.teamA} vs {match.teamB}
                </div>
                <Badge variant="outline">{match.type}</Badge>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {new Date(match.date).toLocaleDateString()} at {match.time}
              </div>
              <div className="text-sm text-muted-foreground">{match.venue}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

