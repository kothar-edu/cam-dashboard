import { Link, useLocation } from "react-router-dom"
import {
  BarChart,
  Users,
  Trophy,
  Calendar,
  FileText,
  DollarSign,
  Vote,
  UserCheck,
  RefreshCw,
  Clipboard,
  BarChart2,
  Settings,
} from "lucide-react"

export function DashboardNav() {
  const location = useLocation()

  const routes = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: BarChart,
    },
    {
      title: "Teams",
      href: "/dashboard/teams",
      icon: Users,
    },
    {
      title: "Tournaments",
      href: "/dashboard/tournaments",
      icon: Trophy,
    },
    {
      title: "Players",
      href: "/dashboard/players",
      icon: Users,
    },
    {
      title: "Fixtures",
      href: "/dashboard/fixtures",
      icon: Calendar,
    },
    {
      title: "Posts",
      href: "/dashboard/posts",
      icon: FileText,
    },
    {
      title: "Sponsors",
      href: "/dashboard/sponsors",
      icon: DollarSign,
    },
    {
      title: "Voting Polls",
      href: "/dashboard/voting",
      icon: Vote,
    },
    {
      title: "Player Verification",
      href: "/dashboard/verification",
      icon: UserCheck,
    },
    {
      title: "Player Transfers",
      href: "/dashboard/transfers",
      icon: RefreshCw,
    },
    {
      title: "Scorecards",
      href: "/dashboard/scorecards",
      icon: Clipboard,
    },
    {
      title: "Points Table",
      href: "/dashboard/points",
      icon: BarChart2,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="w-full">
      <nav className="space-y-1">
        {routes.map((route) => {
          const isActive = location.pathname === route.href
          return (
            <Link
              key={route.href}
              to={route.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <route.icon className="h-4 w-4 mr-3" />
              <span>{route.title}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

