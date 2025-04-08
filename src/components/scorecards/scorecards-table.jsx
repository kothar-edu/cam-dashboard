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
import { MoreHorizontal, Pencil, FileText } from "lucide-react";
import { useFixtures } from "../../hooks/use-fixtures";
import { LoadingSpinner } from "../ui/loading-spinner";
import { Badge } from "../ui/badge";

export function ScorecardsTable() {
  const navigate = useNavigate();
  const { fixtures, isLoading } = useFixtures();
  const [isProcessing, setIsProcessing] = useState(null);

  // Filter fixtures that have been played (for this demo, we'll just use the first two)
  const playedFixtures = fixtures.slice(0, 2);

  const handleGenerateScorecard = async (id) => {
    setIsProcessing(id);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(null);
    navigate(`/dashboard/scorecards/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!playedFixtures.length) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          No completed matches found.
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
            <TableHead>Type</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
            <TableHead className="hidden md:table-cell">Venue</TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {playedFixtures.map((fixture) => (
            <TableRow key={fixture.id}>
              <TableCell>
                <div className="font-medium">
                  {fixture.teamA} vs {fixture.teamB}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{fixture.matchType}</Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {new Date(fixture.date).toLocaleDateString()}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {fixture.venue}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="success">Completed</Badge>
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
                        navigate(`/dashboard/scorecards/${fixture.id}`)
                      }
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Scorecard
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleGenerateScorecard(fixture.id)}
                      disabled={isProcessing === fixture.id}
                    >
                      {isProcessing === fixture.id ? (
                        <>
                          <LoadingSpinner className="mr-2 h-4 w-4" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Generate PDF
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
