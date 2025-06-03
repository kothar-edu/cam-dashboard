"use client";

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart2,
  Users,
  Trophy,
  Calendar,
  FileText,
  DollarSign,
  VoteIcon,
  UserCheck,
  RefreshCw,
  Clipboard,
  BarChart,
  Settings,
  BirdIcon as CricketBall,
  LogOut,
  ChevronDown,
  Layers,
} from "lucide-react";

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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "./ui/sidebar";
import { useAuth } from "../contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { ApiStatusIndicator } from "./ui/api-status-indicator";
import { useData } from "../contexts/DataContext";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

export function CricketSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { tournaments, tournamentGroups } = useData();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [openTournaments, setOpenTournaments] = useState({});

  const routes = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: BarChart2,
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
      icon: VoteIcon,
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
      icon: BarChart,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by the auth system
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleTournament = (tournamentId) => {
    setOpenTournaments((prev) => ({
      ...prev,
      [tournamentId]: !prev[tournamentId],
    }));
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar variant="inset" className="border-r">
        <SidebarHeader className="border-b py-4">
          <div className="flex items-center gap-2 px-4">
            <CricketBall className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Cricket Manager</span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {routes.map((route) => (
                  <SidebarMenuItem key={route.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(route.href)}
                      tooltip={route.title}
                    >
                      <Link to={route.href} className="flex items-center">
                        <route.icon className="mr-3 h-5 w-5" />
                        <span>{route.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Tournament Groups Section */}
          <SidebarGroup>
            <SidebarGroupLabel>Tournament Groups</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {tournaments.map((tournament) => (
                  <Collapsible
                    key={tournament.id}
                    open={openTournaments[tournament.id]}
                    onOpenChange={() => toggleTournament(tournament.id)}
                    className="w-full"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="w-full justify-between">
                          <div className="flex items-center">
                            <Trophy className="mr-3 h-5 w-5" />
                            <span>{tournament.name}</span>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              openTournaments[tournament.id] ? "rotate-180" : ""
                            }`}
                          />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                    </SidebarMenuItem>

                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {/* Link to manage groups for this tournament */}
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild>
                            <Link
                              to={`/dashboard/tournaments/${tournament.id}/groups`}
                              className="flex items-center"
                            >
                              <Layers className="mr-2 h-4 w-4" />
                              <span>Manage Groups</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        {/* List of groups for this tournament */}
                        {tournamentGroups[tournament.id]?.map((group) => (
                          <SidebarMenuSubItem key={group.id}>
                            <SidebarMenuSubButton asChild>
                              <Link
                                to={`/dashboard/tournaments/${tournament.id}/groups/${group.id}`}
                              >
                                {group.name}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}

                        {/* Show message if no groups */}
                        {!tournamentGroups[tournament.id] ||
                          (tournamentGroups[tournament.id].length === 0 && (
                            <SidebarMenuSubItem>
                              <div className="px-2 py-1 text-xs text-muted-foreground">
                                No groups created
                              </div>
                            </SidebarMenuSubItem>
                          ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/assets/placeholder-user.jpg" alt="User" />
                  <AvatarFallback>
                    {user?.name?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {user?.name || "Admin User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || "admin@example.com"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsLogoutConfirmOpen((prev) => !prev)}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            {isLogoutConfirmOpen && (
              <div className="p-2 border rounded-md bg-card shadow-sm">
                <p className="text-xs text-center mb-2">
                  Are you sure you want to log out?
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsLogoutConfirmOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 py-2">
              <ThemeToggle />
              <ApiStatusIndicator />
            </div>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  );
}
