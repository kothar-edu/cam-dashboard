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
import { MoreHorizontal, Pencil, Trash, BarChart } from "lucide-react";
import { useVoting } from "../../hooks/use-voting";
import { LoadingSpinner } from "../ui/loading-spinner";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { usePlayers } from "../../hooks/use-players";
import { useTeams } from "../../hooks/use-teams";
import { useGet } from "src/hooks/useApi";

export function VotingTable() {
  const navigate = useNavigate();
  const { polls, isLoading, deletePoll } = useVoting();
  const { players } = usePlayers();
  const { teams } = useTeams();
  const [isDeleting, setIsDeleting] = useState(null);
  const [selectedPoll, setSelectedPoll] = useState(null);

  const { data, loading } = useGet("/game/voting/");
  console.log(data);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this poll?")) {
      setIsDeleting(id);
      await deletePoll(id);
      setIsDeleting(null);
    }
  };

  const getPlayerName = (playerId) => {
    const player = players.find((p) => p.id === playerId);
    return player ? player.fullName : "Unknown Player";
  };

  const getTeamName = (teamId) => {
    const team = teams.find((t) => t.id === teamId);
    return team ? team.name : "Unknown Team";
  };

  const getNomineeName = (poll, nomineeId) => {
    if (!poll) return "Unknown";

    // Check if it's a player poll or team poll
    const isPlayerPoll = players.some((p) => poll.nominees.includes(p.id));

    return isPlayerPoll ? getPlayerName(nomineeId) : getTeamName(nomineeId);
  };

  const getTotalVotes = (poll) => {
    if (!poll || !poll.votes) return 0;
    return Object.values(poll.votes).reduce((sum, count) => sum + count, 0);
  };

  const getVotePercentage = (poll, nomineeId) => {
    if (!poll || !poll.votes) return 0;
    const totalVotes = getTotalVotes(poll);
    if (totalVotes === 0) return 0;
    return Math.round(((poll.votes[nomineeId] || 0) / totalVotes) * 100);
  };

  const isPollActive = (poll) => {
    const now = new Date();
    const endDate = new Date(poll.endDate);
    return endDate >= now;
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Make sure polls is an array before trying to map over it
  const pollsList = Array.isArray(polls) ? polls : [];

  if (!pollsList.length) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          No voting polls found. Create one to get started.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Poll</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Dates</TableHead>
              <TableHead className="hidden md:table-cell">Votes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pollsList.map((poll) => (
              <TableRow key={poll.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{poll.title}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {poll.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={isPollActive(poll) ? "secondary" : "outline"}>
                    {isPollActive(poll) ? "Active" : "Ended"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="text-sm">
                    {new Date(poll.startDate).toLocaleDateString()} -{" "}
                    {new Date(poll.endDate).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {getTotalVotes(poll)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => setSelectedPoll(poll)}
                        >
                          <BarChart className="h-4 w-4" />
                          Results
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Poll Results</DialogTitle>
                        </DialogHeader>
                        {selectedPoll && (
                          <div className="space-y-4 py-4">
                            <h3 className="font-medium">
                              {selectedPoll.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {selectedPoll.description}
                            </p>

                            <div className="space-y-4 mt-4">
                              {selectedPoll.nominees.map((nomineeId) => {
                                const voteCount =
                                  selectedPoll.votes[nomineeId] || 0;
                                const percentage = getVotePercentage(
                                  selectedPoll,
                                  nomineeId
                                );

                                return (
                                  <div key={nomineeId} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span>
                                        {getNomineeName(
                                          selectedPoll,
                                          nomineeId
                                        )}
                                      </span>
                                      <span>
                                        {voteCount} votes ({percentage}%)
                                      </span>
                                    </div>
                                    <Progress
                                      value={percentage}
                                      className="h-2"
                                    />
                                  </div>
                                );
                              })}
                            </div>

                            <div className="text-sm text-muted-foreground mt-4">
                              Total votes: {getTotalVotes(selectedPoll)}
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

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
                            navigate(`/dashboard/voting/${poll.id}`)
                          }
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(poll.id)}
                          disabled={isDeleting === poll.id}
                        >
                          {isDeleting === poll.id ? (
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
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
