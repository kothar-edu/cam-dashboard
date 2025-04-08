"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useTeams } from "../../hooks/use-teams";
import { LoadingSpinner } from "../ui/loading-spinner";
import { useGet } from "../../hooks/useApi";

export function TeamsTable() {
  const navigate = useNavigate();
  // const { teams, isLoading, deleteTeam } = useTeams()
  const [isDeleting, setIsDeleting] = useState(null);
  const { data: teams, loading } = useGet("/game/teams/");

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      setIsDeleting(id);
      await deleteTeam(id);
      setIsDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Make sure teams is an array before trying to map over it
  const teamsList = Array.isArray(teams) ? teams : [];

  if (!teamsList.length) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          No teams found. Create one to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team</TableHead>
            <TableHead>Abbreviation</TableHead>
            <TableHead className="hidden md:table-cell">Players</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teamsList.map((team) => (
            <TableRow key={team.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={team.logo || "/assets/placeholder.svg"}
                      alt={team.code}
                    />
                    <AvatarFallback>{team.abbreviation}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{team.name}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{team.code}</TableCell>
              <TableCell className="hidden md:table-cell">
                {team.total_players || 0}
              </TableCell>

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => navigate(`/dashboard/teams/${team.id}`)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(team.id)}
                      disabled={isDeleting === team.id}
                    >
                      {isDeleting === team.id ? (
                        <>
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
