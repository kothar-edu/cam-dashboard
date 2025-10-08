"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { LoadingSpinner } from "../ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import EditableGrid from "../ui/EditableGrid";

export function ScorecardEditor({ id }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("team-a");

  // Mock scorecard data
  const [scorecard, setScorecard] = useState({
    matchId: id,
    matchDetails: {
      teamA: "Royal Challengers",
      teamB: "Super Kings",
      date: "2025-04-10",
      venue: "Central Stadium",
      matchType: "T20",
      tossWonBy: "Royal Challengers",
      tossDecision: "bat",
    },
    teamAScore: {
      runs: 186,
      wickets: 4,
      overs: 20,
      extras: 12,
      batsmen: [
        {
          id: "1",
          name: "Virat Kohli",
          runs: 82,
          balls: 49,
          fours: 7,
          sixes: 4,
          howOut: "caught",
          bowler: "Jadeja",
        },
        {
          id: "2",
          name: "Faf du Plessis",
          runs: 45,
          balls: 32,
          fours: 5,
          sixes: 2,
          howOut: "bowled",
          bowler: "Chahar",
        },
        {
          id: "3",
          name: "Glenn Maxwell",
          runs: 35,
          balls: 18,
          fours: 2,
          sixes: 3,
          howOut: "not out",
          bowler: "",
        },
        {
          id: "4",
          name: "Dinesh Karthik",
          runs: 12,
          balls: 8,
          fours: 1,
          sixes: 1,
          howOut: "not out",
          bowler: "",
        },
      ],
      bowlers: [
        {
          id: "1",
          name: "Deepak Chahar",
          overs: 4,
          maidens: 0,
          runs: 42,
          wickets: 1,
        },
        {
          id: "2",
          name: "Ravindra Jadeja",
          overs: 4,
          maidens: 0,
          runs: 38,
          wickets: 1,
        },
        {
          id: "3",
          name: "Dwayne Bravo",
          overs: 4,
          maidens: 0,
          runs: 35,
          wickets: 0,
        },
        {
          id: "4",
          name: "Shardul Thakur",
          overs: 4,
          maidens: 0,
          runs: 45,
          wickets: 1,
        },
      ],
    },
    teamBScore: {
      runs: 184,
      wickets: 8,
      overs: 20,
      extras: 8,
      batsmen: [
        {
          id: "1",
          name: "Ruturaj Gaikwad",
          runs: 65,
          balls: 42,
          fours: 6,
          sixes: 3,
          howOut: "caught",
          bowler: "Siraj",
        },
        {
          id: "2",
          name: "Devon Conway",
          runs: 32,
          balls: 25,
          fours: 3,
          sixes: 1,
          howOut: "lbw",
          bowler: "Hazlewood",
        },
        {
          id: "3",
          name: "Moeen Ali",
          runs: 28,
          balls: 20,
          fours: 2,
          sixes: 2,
          howOut: "caught",
          bowler: "Harshal",
        },
        {
          id: "4",
          name: "MS Dhoni",
          runs: 18,
          balls: 12,
          fours: 1,
          sixes: 1,
          howOut: "run out",
          bowler: "",
        },
      ],
      bowlers: [
        {
          id: "1",
          name: "Mohammed Siraj",
          overs: 4,
          maidens: 0,
          runs: 38,
          wickets: 2,
        },
        {
          id: "2",
          name: "Josh Hazlewood",
          overs: 4,
          maidens: 0,
          runs: 32,
          wickets: 1,
        },
        {
          id: "3",
          name: "Harshal Patel",
          overs: 4,
          maidens: 0,
          runs: 42,
          wickets: 3,
        },
        {
          id: "4",
          name: "Wanindu Hasaranga",
          overs: 4,
          maidens: 0,
          runs: 36,
          wickets: 1,
        },
      ],
    },
    result: "Royal Challengers won by 2 runs",
  });

  useEffect(() => {
    const fetchScorecard = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        // Data is already set in the state
      } catch (error) {
        console.error("Error fetching scorecard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScorecard();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      navigate("/dashboard/scorecards");
    } catch (error) {
      console.error("Error saving scorecard:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBatsmanChange = (teamKey, index, field, value) => {
    setScorecard((prev) => {
      const newScorecard = { ...prev };
      newScorecard[teamKey].batsmen[index][field] = value;
      return newScorecard;
    });
  };

  const handleBowlerChange = (teamKey, index, field, value) => {
    setScorecard((prev) => {
      const newScorecard = { ...prev };
      newScorecard[teamKey].bowlers[index][field] = value;
      return newScorecard;
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Match Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Match</Label>
              <p className="text-sm font-medium mt-1">
                {scorecard.matchDetails.teamA} vs {scorecard.matchDetails.teamB}
              </p>
            </div>
            <div>
              <Label>Date & Venue</Label>
              <p className="text-sm font-medium mt-1">
                {new Date(scorecard.matchDetails.date).toLocaleDateString()} at{" "}
                {scorecard.matchDetails.venue}
              </p>
            </div>
            <div>
              <Label>Toss</Label>
              <p className="text-sm font-medium mt-1">
                {scorecard.matchDetails.tossWonBy} won the toss and elected to{" "}
                {scorecard.matchDetails.tossDecision}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <Label>Result</Label>
            <Input
              value={scorecard.result}
              onChange={(e) =>
                setScorecard((prev) => ({ ...prev, result: e.target.value }))
              }
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="team-a">
            {scorecard.matchDetails.teamA}
          </TabsTrigger>
          <TabsTrigger value="team-b">
            {scorecard.matchDetails.teamB}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="team-a" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Batting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>Total Runs</Label>
                  <Input
                    type="number"
                    value={scorecard.teamAScore.runs}
                    onChange={(e) =>
                      setScorecard((prev) => ({
                        ...prev,
                        teamAScore: {
                          ...prev.teamAScore,
                          runs: Number.parseInt(e.target.value),
                        },
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Wickets</Label>
                  <Input
                    type="number"
                    value={scorecard.teamAScore.wickets}
                    onChange={(e) =>
                      setScorecard((prev) => ({
                        ...prev,
                        teamAScore: {
                          ...prev.teamAScore,
                          wickets: Number.parseInt(e.target.value),
                        },
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <EditableGrid
                columns={[
                  { key: "name", header: "Batsman", width: 200 },
                  { key: "runs", header: "Runs", type: "number", width: 80 },
                  { key: "balls", header: "Balls", type: "number", width: 80 },
                  { key: "fours", header: "4s", type: "number", width: 60 },
                  { key: "sixes", header: "6s", type: "number", width: 60 },
                  {
                    key: "howOut",
                    header: "How Out",
                    type: "select",
                    options: [
                      "caught",
                      "bowled",
                      "lbw",
                      "run out",
                      "stumped",
                      "not out",
                    ],
                    width: 140,
                  },
                  { key: "bowler", header: "Bowler", width: 160 },
                ]}
                rows={scorecard.teamAScore.batsmen}
                onChange={(nextRows) =>
                  setScorecard((prev) => ({
                    ...prev,
                    teamAScore: { ...prev.teamAScore, batsmen: nextRows },
                  }))
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bowling</CardTitle>
            </CardHeader>
            <CardContent>
              <EditableGrid
                columns={[
                  { key: "name", header: "Bowler", width: 200 },
                  { key: "overs", header: "Overs", type: "number", width: 80 },
                  {
                    key: "maidens",
                    header: "Maidens",
                    type: "number",
                    width: 90,
                  },
                  { key: "runs", header: "Runs", type: "number", width: 80 },
                  {
                    key: "wickets",
                    header: "Wickets",
                    type: "number",
                    width: 90,
                  },
                ]}
                rows={scorecard.teamBScore.bowlers}
                onChange={(nextRows) =>
                  setScorecard((prev) => ({
                    ...prev,
                    teamBScore: { ...prev.teamBScore, bowlers: nextRows },
                  }))
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team-b" className="space-y-4">
          {/* Similar content for Team B, omitted for brevity */}
          <Card>
            <CardHeader>
              <CardTitle>Batting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>Total Runs</Label>
                  <Input
                    type="number"
                    value={scorecard.teamBScore.runs}
                    onChange={(e) =>
                      setScorecard((prev) => ({
                        ...prev,
                        teamBScore: {
                          ...prev.teamBScore,
                          runs: Number.parseInt(e.target.value),
                        },
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Wickets</Label>
                  <Input
                    type="number"
                    value={scorecard.teamBScore.wickets}
                    onChange={(e) =>
                      setScorecard((prev) => ({
                        ...prev,
                        teamBScore: {
                          ...prev.teamBScore,
                          wickets: Number.parseInt(e.target.value),
                        },
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <EditableGrid
                columns={[
                  { key: "name", header: "Batsman", width: 200 },
                  { key: "runs", header: "Runs", type: "number", width: 80 },
                  { key: "balls", header: "Balls", type: "number", width: 80 },
                  { key: "fours", header: "4s", type: "number", width: 60 },
                  { key: "sixes", header: "6s", type: "number", width: 60 },
                  {
                    key: "howOut",
                    header: "How Out",
                    type: "select",
                    options: [
                      "caught",
                      "bowled",
                      "lbw",
                      "run out",
                      "stumped",
                      "not out",
                    ],
                    width: 140,
                  },
                  { key: "bowler", header: "Bowler", width: 160 },
                ]}
                rows={scorecard.teamBScore.batsmen}
                onChange={(nextRows) =>
                  setScorecard((prev) => ({
                    ...prev,
                    teamBScore: { ...prev.teamBScore, batsmen: nextRows },
                  }))
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bowling</CardTitle>
            </CardHeader>
            <CardContent>
              <EditableGrid
                columns={[
                  { key: "name", header: "Bowler", width: 200 },
                  { key: "overs", header: "Overs", type: "number", width: 80 },
                  {
                    key: "maidens",
                    header: "Maidens",
                    type: "number",
                    width: 90,
                  },
                  { key: "runs", header: "Runs", type: "number", width: 80 },
                  {
                    key: "wickets",
                    header: "Wickets",
                    type: "number",
                    width: 90,
                  },
                ]}
                rows={scorecard.teamAScore.bowlers}
                onChange={(nextRows) =>
                  setScorecard((prev) => ({
                    ...prev,
                    teamAScore: { ...prev.teamAScore, bowlers: nextRows },
                  }))
                }
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/scorecards")}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <LoadingSpinner className="mr-2 h-4 w-4" />
              Saving...
            </>
          ) : (
            "Save Scorecard"
          )}
        </Button>
      </div>
    </div>
  );
}
