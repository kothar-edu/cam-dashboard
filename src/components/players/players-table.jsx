"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Pencil,
  Trash,
  CheckCircle,
  XCircle,
  BarChart,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

import { usePlayers } from "@/hooks/use-players";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { useGet } from "../../hooks/useApi";

export function PlayersTable({ players, loading }) {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(null);
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this player?")) {
      setIsDeleting(id);
      await deletePlayer(id);
      setIsDeleting(null);
    }
  };

  // const { data: players, loading } = useGet("/game/player/");

  // Update the PlayersTable component to ensure players is always an array before mapping

  // First, let's add a check to ensure players is an array before mapping
  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Make sure players is an array before trying to map over it
  const playersList = Array.isArray(players?.results) ? players?.results : [];
  if (!playersList.length) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          No players found. Create one to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead className="hidden md:table-cell">Team</TableHead>
            <TableHead className="hidden md:table-cell">
              Jersey Number
            </TableHead>
            <TableHead className="hidden md:table-cell">Nationality</TableHead>
            <TableHead>Verification</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {playersList?.map((player) => (
            <TableRow key={player.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={player.user?.picture || "/placeholder.svg"}
                      alt={player.user?.full_name}
                    />
                    <AvatarFallback>
                      {player?.full_name?.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{player.full_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {player.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {player.team_name}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {player.jersey_no}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {player?.user?.nationality ?? "-"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      player?.user?.identityVerified ? "success" : "destructive"
                    }
                    className="flex items-center gap-1"
                  >
                    {player.identityVerified ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        <span>ID</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        <span>ID</span>
                      </>
                    )}
                  </Badge>
                  <Badge
                    variant={player.paymentVerified ? "success" : "destructive"}
                    className="flex items-center gap-1"
                  >
                    {player.paymentVerified ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        <span>Payment</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        <span>Payment</span>
                      </>
                    )}
                  </Badge>
                </div>
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
                      onClick={() =>
                        navigate(`/dashboard/players/${player.id}`)
                      }
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        navigate(`/dashboard/verification/${player.id}`)
                      }
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Verify
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        navigate(`/dashboard/transfers/${player.id}`)
                      }
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Transfer
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        navigate(`/dashboard/players/${player.id}/stats`)
                      }
                    >
                      <BarChart className="mr-2 h-4 w-4" />
                      View Stats
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(player.id)}
                      disabled={isDeleting === player.id}
                    >
                      {isDeleting === player.id ? (
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
