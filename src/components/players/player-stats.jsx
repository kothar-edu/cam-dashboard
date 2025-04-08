"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { FullScreenLoader } from "../ui/loading-spinner";
import axios from "axios";
import { useToast } from "../ui/use-toast";

export function PlayerStats({ playerId }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [playerData, setPlayerData] = useState(null);
  const [battingStats, setBattingStats] = useState(null);
  const [bowlingStats, setBowlingStats] = useState(null);

  useEffect(() => {
    const fetchPlayerStats = async () => {
      setIsLoading(true);
      try {
        // Fetch player basic info
        const playerResponse = await axios.get(`/api/players/${playerId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("cricket_token")}`,
          },
        });

        // Fetch batting stats
        const battingResponse = await axios.get(
          `/api/players/${playerId}/batting`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("cricket_token")}`,
            },
          }
        );

        // Fetch bowling stats
        const bowlingResponse = await axios.get(
          `/api/players/${playerId}/bowling`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("cricket_token")}`,
            },
          }
        );

        setPlayerData(playerResponse.data);
        setBattingStats(battingResponse.data);
        setBowlingStats(bowlingResponse.data);
      } catch (error) {
        console.error("Error fetching player stats:", error);
        toast({
          title: "Error",
          description: "Failed to load player statistics",
          variant: "destructive",
        });

        // Set mock data for demonstration
        setPlayerData({
          fullName: "Shreyas Iyer",
          nationality: "India",
          dateOfBirth: "1994-12-06",
          role: "Batsman",
          battingStyle: "Right Handed Bat",
          bowlingStyle: "Right-arm legbreak",
        });

        setBattingStats({
          formats: [
            {
              format: "Test",
              matches: 14,
              innings: 24,
              runs: 811,
              ballsFaced: 1287,
              highestScore: 105,
              average: 36.86,
              strikeRate: 63.02,
              notOuts: 2,
              fours: 94,
              sixes: 16,
              fifties: 5,
              hundreds: 1,
              ducks: 0,
            },
            {
              format: "ODI",
              matches: 70,
              innings: 65,
              runs: 2845,
              ballsFaced: 2845,
              highestScore: 128,
              average: 48.22,
              strikeRate: 100.0,
              notOuts: 6,
              fours: 262,
              sixes: 72,
              fifties: 22,
              hundreds: 5,
              ducks: 0,
            },
            {
              format: "T20",
              matches: 51,
              innings: 47,
              runs: 1104,
              ballsFaced: 811,
              highestScore: 74,
              average: 30.67,
              strikeRate: 136.13,
              notOuts: 11,
              fours: 90,
              sixes: 44,
              fifties: 8,
              hundreds: 0,
              ducks: 0,
            },
            {
              format: "IPL",
              matches: 116,
              innings: 116,
              runs: 3224,
              ballsFaced: 2495,
              highestScore: 97,
              average: 33.24,
              strikeRate: 129.22,
              notOuts: 19,
              fours: 276,
              sixes: 122,
              fifties: 22,
              hundreds: 0,
              ducks: 0,
            },
          ],
        });

        setBowlingStats({
          formats: [
            {
              format: "Test",
              matches: 14,
              innings: 1,
              balls: 6,
              runs: 2,
              wickets: 0,
              average: 0.0,
              economy: 2.0,
              strikeRate: 0.0,
              bestBowlingInnings: "0/2",
              bestBowlingMatch: "0/2",
              fiveWickets: 0,
              tenWickets: 0,
            },
            {
              format: "ODI",
              matches: 70,
              innings: 5,
              balls: 37,
              runs: 39,
              wickets: 0,
              average: 0.0,
              economy: 6.32,
              strikeRate: 0.0,
              bestBowlingInnings: "0/1",
              bestBowlingMatch: "0/1",
              fiveWickets: 0,
              tenWickets: 0,
            },
            {
              format: "T20",
              matches: 51,
              innings: 1,
              balls: 2,
              runs: 2,
              wickets: 0,
              average: 0.0,
              economy: 0.0,
              strikeRate: 0.0,
              bestBowlingInnings: "0/2",
              bestBowlingMatch: "0/2",
              fiveWickets: 0,
              tenWickets: 0,
            },
            {
              format: "IPL",
              matches: 116,
              innings: 1,
              balls: 6,
              runs: 7,
              wickets: 0,
              average: 0.0,
              economy: 7.0,
              strikeRate: 0.0,
              bestBowlingInnings: "0/7",
              bestBowlingMatch: "0/7",
              fiveWickets: 0,
              tenWickets: 0,
            },
          ],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayerStats();
  }, [playerId, toast]);

  if (isLoading) {
    return <FullScreenLoader />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{playerData.fullName}</CardTitle>
          <CardDescription>{playerData.nationality}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Born
              </h4>
              <p>{new Date(playerData.dateOfBirth).toLocaleDateString()}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Role
              </h4>
              <p>{playerData.role}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Batting Style
              </h4>
              <p>{playerData.battingStyle}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Bowling Style
              </h4>
              <p>{playerData.bowlingStyle}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="batting">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="batting">Batting Career</TabsTrigger>
          <TabsTrigger value="bowling">Bowling Career</TabsTrigger>
        </TabsList>

        <TabsContent value="batting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Batting Career Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Format</TableHead>
                      <TableHead>M</TableHead>
                      <TableHead>Inn</TableHead>
                      <TableHead>Runs</TableHead>
                      <TableHead>BF</TableHead>
                      <TableHead>HS</TableHead>
                      <TableHead>Avg</TableHead>
                      <TableHead>SR</TableHead>
                      <TableHead>NO</TableHead>
                      <TableHead>4s</TableHead>
                      <TableHead>6s</TableHead>
                      <TableHead>50</TableHead>
                      <TableHead>100</TableHead>
                      <TableHead>0</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {battingStats.formats.map((format) => (
                      <TableRow key={format.format}>
                        <TableCell className="font-medium">
                          {format.format}
                        </TableCell>
                        <TableCell>{format.matches}</TableCell>
                        <TableCell>{format.innings}</TableCell>
                        <TableCell>{format.runs}</TableCell>
                        <TableCell>{format.ballsFaced}</TableCell>
                        <TableCell>{format.highestScore}</TableCell>
                        <TableCell>{format.average}</TableCell>
                        <TableCell>{format.strikeRate}</TableCell>
                        <TableCell>{format.notOuts}</TableCell>
                        <TableCell>{format.fours}</TableCell>
                        <TableCell>{format.sixes}</TableCell>
                        <TableCell>{format.fifties}</TableCell>
                        <TableCell>{format.hundreds}</TableCell>
                        <TableCell>{format.ducks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bowling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bowling Career Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Format</TableHead>
                      <TableHead>M</TableHead>
                      <TableHead>Inn</TableHead>
                      <TableHead>B</TableHead>
                      <TableHead>Runs</TableHead>
                      <TableHead>Wkts</TableHead>
                      <TableHead>Avg</TableHead>
                      <TableHead>Econ</TableHead>
                      <TableHead>SR</TableHead>
                      <TableHead>BBI</TableHead>
                      <TableHead>BBM</TableHead>
                      <TableHead>5w</TableHead>
                      <TableHead>10w</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bowlingStats.formats.map((format) => (
                      <TableRow key={format.format}>
                        <TableCell className="font-medium">
                          {format.format}
                        </TableCell>
                        <TableCell>{format.matches}</TableCell>
                        <TableCell>{format.innings}</TableCell>
                        <TableCell>{format.balls}</TableCell>
                        <TableCell>{format.runs}</TableCell>
                        <TableCell>{format.wickets}</TableCell>
                        <TableCell>{format.average}</TableCell>
                        <TableCell>{format.economy}</TableCell>
                        <TableCell>{format.strikeRate}</TableCell>
                        <TableCell>{format.bestBowlingInnings}</TableCell>
                        <TableCell>{format.bestBowlingMatch}</TableCell>
                        <TableCell>{format.fiveWickets}</TableCell>
                        <TableCell>{format.tenWickets}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
