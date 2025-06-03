"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useToast } from "../../hooks/use-toast";
import useApiCrud from "../../hooks/useApiCrud";

export default function BulkFixtureUpload() {
  const { toast } = useToast();
  const [seriesName, setSeriesName] = useState("CAM PREMIER LEAGUE- 2024");
  const [rowCount, setRowCount] = useState(25);
  const [additionalRows, setAdditionalRows] = useState(40);
  const [fixtures, setFixtures] = useState([]);
  const [isChangingSeries, setIsChangingSeries] = useState(false);
  const [availableSeries, setAvailableSeries] = useState([]);
  const [teams, setTeams] = useState([]);
  const [grounds, setGrounds] = useState([]);
  const [officials, setOfficials] = useState([]);
  const [matchTypes, setMatchTypes] = useState([
    { id: "t20", name: "T20" },
    { id: "odi", name: "ODI" },
    { id: "test", name: "Test" },
    { id: "t10", name: "T10" },
  ]);

  // API hooks
  const teamsApi = useApiCrud({
    baseUrl: process.env.REACT_APP_API_URL,
    endpoint: "teams",
    useMockData: true,
    mockData: [
      { id: 1, name: "Mumbai Indians" },
      { id: 2, name: "Chennai Super Kings" },
      { id: 3, name: "Royal Challengers Bangalore" },
      { id: 4, name: "Delhi Capitals" },
      { id: 5, name: "Kolkata Knight Riders" },
    ],
  });

  const groundsApi = useApiCrud({
    baseUrl: process.env.REACT_APP_API_URL,
    endpoint: "grounds",
    useMockData: true,
    mockData: [
      { id: 1, name: "Wankhede Stadium" },
      { id: 2, name: "Eden Gardens" },
      { id: 3, name: "M. Chinnaswamy Stadium" },
      { id: 4, name: "Arun Jaitley Stadium" },
      { id: 5, name: "MA Chidambaram Stadium" },
    ],
  });

  const officialsApi = useApiCrud({
    baseUrl: process.env.REACT_APP_API_URL,
    endpoint: "officials",
    useMockData: true,
    mockData: [
      { id: 1, name: "Kumar Dharmasena" },
      { id: 2, name: "Aleem Dar" },
      { id: 3, name: "Richard Kettleborough" },
      { id: 4, name: "Marais Erasmus" },
      { id: 5, name: "Rod Tucker" },
    ],
  });

  const seriesApi = useApiCrud({
    baseUrl: process.env.REACT_APP_API_URL,
    endpoint: "series",
    useMockData: true,
    mockData: [
      { id: 1, name: "CAM PREMIER LEAGUE- 2024" },
      { id: 2, name: "National T20 Cup 2024" },
      { id: 3, name: "Regional Championship 2024" },
    ],
  });

  // Initialize fixtures with empty rows
  useEffect(() => {
    const initialFixtures = Array(rowCount)
      .fill(null)
      .map((_, index) => ({
        id: index + 1,
        matchType: "",
        date: "",
        time: "",
        team1: "",
        team2: "",
        ground: "",
        umpire1: "",
        umpire2: "",
        scorer: "",
        comments: "",
      }));
    setFixtures(initialFixtures);
  }, [rowCount]);

  // Load data from APIs
  useEffect(() => {
    const loadData = async () => {
      try {
        setTeams(teamsApi.data);
        setGrounds(groundsApi.data);
        setOfficials(officialsApi.data);
        setAvailableSeries(seriesApi.data);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Failed to load required data. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, [
    teamsApi.data,
    groundsApi.data,
    officialsApi.data,
    seriesApi.data,
    toast,
  ]);

  // Handle input change for a specific field in a fixture
  const handleInputChange = (index, field, value) => {
    const updatedFixtures = [...fixtures];
    updatedFixtures[index] = {
      ...updatedFixtures[index],
      [field]: value,
    };
    setFixtures(updatedFixtures);
  };

  // Add more rows to the table
  const handleAddRows = () => {
    const currentLength = fixtures.length;
    const newRows = Array(additionalRows)
      .fill(null)
      .map((_, index) => ({
        id: currentLength + index + 1,
        matchType: "",
        date: "",
        time: "",
        team1: "",
        team2: "",
        ground: "",
        umpire1: "",
        umpire2: "",
        scorer: "",
        comments: "",
      }));

    setFixtures([...fixtures, ...newRows]);
    setRowCount(currentLength + additionalRows);
  };

  // Validate fixtures before submission
  const validateFixtures = () => {
    // Filter out empty rows
    const filledFixtures = fixtures.filter(
      (fixture) =>
        fixture.matchType || fixture.date || fixture.team1 || fixture.team2
    );

    // Basic validation
    const errors = [];
    filledFixtures.forEach((fixture, index) => {
      if (!fixture.matchType)
        errors.push(`Row ${fixture.id}: Match Type is required`);
      if (!fixture.date) errors.push(`Row ${fixture.id}: Date is required`);
      if (!fixture.time) errors.push(`Row ${fixture.id}: Time is required`);
      if (!fixture.team1) errors.push(`Row ${fixture.id}: Team 1 is required`);
      if (!fixture.team2) errors.push(`Row ${fixture.id}: Team 2 is required`);
      if (fixture.team1 === fixture.team2)
        errors.push(`Row ${fixture.id}: Team 1 and Team 2 cannot be the same`);
      if (!fixture.ground) errors.push(`Row ${fixture.id}: Ground is required`);
    });

    if (errors.length > 0) {
      toast({
        title: "Validation Errors",
        description: (
          <div className="max-h-[200px] overflow-y-auto">
            <ul className="list-disc pl-4">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        ),
        variant: "destructive",
      });
      return false;
    }

    // If validation passes
    toast({
      title: "Validation Successful",
      description: `${filledFixtures.length} fixtures are ready to be uploaded.`,
      variant: "success",
    });
    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (validateFixtures()) {
      // Filter out empty rows
      const filledFixtures = fixtures.filter(
        (fixture) =>
          fixture.matchType || fixture.date || fixture.team1 || fixture.team2
      );

      // Here you would typically send the data to your API
      console.log("Submitting fixtures:", filledFixtures);
      toast({
        title: "Success",
        description: `${filledFixtures.length} fixtures have been uploaded.`,
        variant: "success",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-primary text-2xl">Upload Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div>
              <span className="font-medium">Series Name:</span>{" "}
              {isChangingSeries ? (
                <Select
                  value={seriesName}
                  onValueChange={(value) => {
                    setSeriesName(value);
                    setIsChangingSeries(false);
                  }}
                >
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Select Series" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSeries.map((series) => (
                      <SelectItem key={series.id} value={series.name}>
                        {series.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="font-bold">{seriesName}</span>
              )}
            </div>
            <Button variant="outline" onClick={() => setIsChangingSeries(true)}>
              Change Series
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-left">#</th>
                <th className="border p-2 text-left">Match Type*</th>
                <th className="border p-2 text-left">Date (12/31/2014)*</th>
                <th className="border p-2 text-left">Time (10:00 AM)*</th>
                <th className="border p-2 text-left">Team 1*</th>
                <th className="border p-2 text-left">Team 2*</th>
                <th className="border p-2 text-left">Ground</th>
                <th className="border p-2 text-left">Umpire 1</th>
                <th className="border p-2 text-left">Umpire 2</th>
                <th className="border p-2 text-left">Scorer</th>
              </tr>
            </thead>
            <tbody>
              {fixtures.map((fixture, index) => (
                <tr
                  key={fixture.id}
                  className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}
                >
                  <td className="border p-2">{fixture.id}</td>
                  <td className="border p-2">
                    <Select
                      value={fixture.matchType}
                      onValueChange={(value) =>
                        handleInputChange(index, "matchType", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        {matchTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="border p-2 w-[50px]">
                    <Input
                      type="date"
                      value={fixture.date}
                      onChange={(e) =>
                        handleInputChange(index, "date", e.target.value)
                      }
                      className="w-[full]"
                    />
                  </td>
                  <td className="border p-2 w-[100px]">
                    <Input
                      type="time"
                      value={fixture.time}
                      onChange={(e) =>
                        handleInputChange(index, "time", e.target.value)
                      }
                    />
                  </td>
                  <td className="border p-2 w-[300px]">
                    <Select
                      value={fixture.team1}
                      onValueChange={(value) =>
                        handleInputChange(index, "team1", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="border p-2 w-[300px]">
                    <Select
                      value={fixture.team2}
                      onValueChange={(value) =>
                        handleInputChange(index, "team2", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="border p-2">
                    <Select
                      value={fixture.ground}
                      onValueChange={(value) =>
                        handleInputChange(index, "ground", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        {grounds.map((ground) => (
                          <SelectItem
                            key={ground.id}
                            value={ground.id.toString()}
                          >
                            {ground.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="border p-2">
                    <Select
                      value={fixture.umpire1}
                      onValueChange={(value) =>
                        handleInputChange(index, "umpire1", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        {officials.map((official) => (
                          <SelectItem
                            key={official.id}
                            value={official.id.toString()}
                          >
                            {official.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="border p-2">
                    <Select
                      value={fixture.umpire2}
                      onValueChange={(value) =>
                        handleInputChange(index, "umpire2", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        {officials.map((official) => (
                          <SelectItem
                            key={official.id}
                            value={official.id.toString()}
                          >
                            {official.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="border p-2">
                    <Select
                      value={fixture.scorer}
                      onValueChange={(value) =>
                        handleInputChange(index, "scorer", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="" />
                      </SelectTrigger>
                      <SelectContent>
                        {officials.map((official) => (
                          <SelectItem
                            key={official.id}
                            value={official.id.toString()}
                          >
                            {official.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span>Add</span>
            <Input
              type="number"
              value={additionalRows}
              onChange={(e) =>
                setAdditionalRows(Number.parseInt(e.target.value) || 1)
              }
              className="w-20"
              min="1"
            />
            <span>more rows</span>
          </div>
          <Button variant="secondary" onClick={handleAddRows}>
            Add Rows
          </Button>
        </div>

        <div className="mt-6 flex justify-center">
          <Button size="lg" onClick={handleSubmit} className="px-8">
            Validate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
