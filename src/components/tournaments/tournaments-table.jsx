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
import { Eye, MoreHorizontal, Pencil, Trash, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useTournaments } from "../../hooks/use-tournaments";
import { LoadingSpinner } from "../ui/loading-spinner";
import { Badge } from "../ui/badge";
import { useGet } from "../../hooks/useApi";
import { ViewGroupsModal } from "./view-groups-modal";

export function TournamentsTable() {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(null);
  const { data: tournaments, loading } = useGet("/game/tournament/");
  const [viewingGroupsForTournament, setViewingGroupsForTournament] =
    useState(null);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this tournament?")) {
      setIsDeleting(id);
      await deleteTournament(id);
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

  const tournamentGroups = [];

  // Make sure tournaments is an array before trying to map over it
  const tournamentsList = Array.isArray(tournaments?.results)
    ? tournaments?.results
    : [];

  if (!tournamentsList.length) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          No tournaments found. Create one to get started.
        </div>
      </div>
    );
  }

  const handleViewGroups = (e, tournamentId) => {
    e.stopPropagation(); // Prevent row click
    setViewingGroupsForTournament(tournamentId);
  };

  // Get group count for a tournament
  const getGroupCount = (tournamentId) => {
    return tournamentGroups[tournamentId]?.length || 0;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tournament</TableHead>
            <TableHead>Total Teams</TableHead>
            <TableHead>Match Type</TableHead>
            <TableHead className="hidden md:table-cell">Dates</TableHead>{" "}
            <TableHead>Groups</TableHead>
            <TableHead className="hidden md:table-cell">Ball Type</TableHead>
            <TableHead className="hidden md:table-cell">Pitch Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tournamentsList.map((tournament) => (
            <TableRow key={tournament.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={tournament.logo || "/assets/placeholder.svg"}
                      alt={tournament.name}
                    />
                    <AvatarFallback>
                      {tournament.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{tournament.name}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{tournament.total_teams}</TableCell>
              <TableCell>
                <Badge variant="outline">{tournament.matchType}</Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {new Date(tournament.start).toLocaleDateString()} -{" "}
                {new Date(tournament.end).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {" "}
                <div className="flex items-center">
                  <Badge variant="secondary" className="mr-2">
                    <Users className="h-3 w-3 mr-1" />
                    {getGroupCount(tournament.id)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={(e) => handleViewGroups(e, tournament.id)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {tournament.ballType}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {tournament.pitchType}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon">
                      <MoreHorizontal className="h-4 w-4 " />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        navigate(`/dashboard/tournaments/${tournament.id}`)
                      }
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(tournament.id)}
                      disabled={isDeleting === tournament.id}
                    >
                      {isDeleting === tournament.id ? (
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
      {viewingGroupsForTournament && (
        <ViewGroupsModal
          isOpen={!!viewingGroupsForTournament}
          onClose={() => setViewingGroupsForTournament(null)}
          tournamentId={viewingGroupsForTournament}
        />
      )}
    </div>
  );
}
