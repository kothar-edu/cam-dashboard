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
  BirdIcon as Cricket,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "./ui/sidebar"

export function CricketSidebar() {
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
    <SidebarProvider>
      <Sidebar className="bg-gray-50 border-r">
        <SidebarHeader className="py-4">
          <div className="flex items-center gap-2 px-4">
            <Cricket className="h-6 w-6" />
            <span className="font-bold text-xl">Cricket Manager</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="px-4 text-gray-500">Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {routes.map((route) => {
                  const isActive = location.pathname === route.href
                  return (
                    <SidebarMenuItem key={route.href}>
                      <SidebarMenuButton asChild isActive={isActive} className="px-4 py-2">
                        <Link to={route.href}>
                          <route.icon className="h-5 w-5 mr-3" />
                          <span>{route.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="py-2">
          <div className="px-4 text-xs text-gray-500">© 2025 CAM Youth Association</div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  )
}

