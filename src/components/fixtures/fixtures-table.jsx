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
import { MoreHorizontal, Pencil, Trash, FileText } from "lucide-react";
import { useFixtures } from "../../hooks/use-fixtures";
import { LoadingSpinner } from "../ui/loading-spinner";
import { Badge } from "../ui/badge";
import { useGet } from "../../hooks/useApi";

export function FixturesTable() {
  const navigate = useNavigate();
  // const { fixtures, isLoading } = useFixtures();
  const [isDeleting, setIsDeleting] = useState(null);
  const { data: fixtures, loading } = useGet("/game/match/");

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this fixture?")) {
      setIsDeleting(id);
      // Simulate delete API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsDeleting(null);
      // In a real app, you would call an API to delete the fixture
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const fixturesList = Array.isArray(fixtures?.results)
    ? fixtures?.results
    : [];

  if (!fixturesList?.length) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          No fixtures found. Create one to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Match</TableHead>
            <TableHead>Tournament</TableHead> <TableHead>Round</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="hidden md:table-cell">Date & Time</TableHead>
            <TableHead className="hidden md:table-cell">Venue</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fixturesList?.map((fixture) => (
            <TableRow key={fixture.id}>
              <TableCell>
                <div className="font-medium">
                  {fixture?.opponent_a?.team_name} vs{" "}
                  {fixture?.opponent_b?.team_name}
                </div>
              </TableCell>{" "}
              <TableCell>{fixture?.tournament?.name || "-"}</TableCell>{" "}
              <TableCell>{fixture?.round || "-"}</TableCell>{" "}
              <TableCell>{fixture.status}</TableCell>{" "}
              <TableCell>
                <Badge variant={fixture?.status?.toLowerCase()}>
                  {fixture.status}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {new Date(fixture.time).toLocaleDateString()} at{" "}
                {new Date(fixture.time)?.toLocaleTimeString()}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {fixture.ground}
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
                        navigate(`/dashboard/fixtures/${fixture.id}`)
                      }
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        navigate(`/dashboard/scorecards/${fixture.id}`)
                      }
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Scorecard
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(fixture.id)}
                      disabled={isDeleting === fixture.id}
                    >
                      {isDeleting === fixture.id ? (
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
