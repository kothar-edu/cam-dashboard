import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

export function RecentActivity({ className, ...props }) {
  const activities = [
    {
      id: 1,
      action: "Player registered",
      user: "Rahul Sharma",
      time: new Date(Date.now() - 1 * 3600000).toLocaleString(),
      avatar: "/assets/placeholder.svg",
    },
    {
      id: 2,
      action: "Team updated",
      user: "Admin",
      time: new Date(Date.now() - 3 * 3600000).toLocaleString(),
      avatar: "/assets/placeholder.svg",
    },
    {
      id: 3,
      action: "Match result added",
      user: "Scorekeeper",
      time: new Date(Date.now() - 5 * 3600000).toLocaleString(),
      avatar: "/assets/placeholder.svg",
    },
    {
      id: 4,
      action: "Tournament created",
      user: "Admin",
      time: new Date(Date.now() - 8 * 3600000).toLocaleString(),
      avatar: "/assets/placeholder.svg",
    },
    {
      id: 5,
      action: "Player transferred",
      user: "Manager",
      time: new Date(Date.now() - 12 * 3600000).toLocaleString(),
      avatar: "/assets/placeholder.svg",
    },
    {
      id: 6,
      action: "New sponsor added",
      user: "Admin",
      time: new Date(Date.now() - 24 * 3600000).toLocaleString(),
      avatar: "/assets/placeholder.svg",
    },
    {
      id: 7,
      action: "Voting poll created",
      user: "Admin",
      time: new Date(Date.now() - 36 * 3600000).toLocaleString(),
      avatar: "/assets/placeholder.svg",
    },
  ]

  return (
    <Card className={className} {...props}>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.avatar} />
                <AvatarFallback>{activity.user.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{activity.action}</p>
                <p className="text-xs text-muted-foreground">
                  {activity.user} • {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

