"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTeams } from "../../hooks/use-teams";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { FormField } from "../ui/form-field";
import { LoadingSpinner } from "../ui/loading-spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { useGet, usePost } from "../../hooks/useApi";
import { Autocomplete, TextField } from "@mui/material";
import StyledAutocomplete from "../ui/StyledAutoComplete";

export function FixtureForm({ id }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);
  const { data: teams, loading: teamsLoading } = useGet("/game/teams/");
  const { post, loading, error } = usePost();
  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    team_a: "",
    team_b: "",
    time: "",
    ground: "",
  });

  console.log(formData);

  // useEffect(() => {
  //   const fetchFixture = async () => {
  //     if (id) {
  //       try {
  //         setIsFetching(true);
  //         // Simulate API call
  //         await new Promise((resolve) => setTimeout(resolve, 1000));

  //         // Mock fixture data
  //         setFormData({
  //           team_a: "1",
  //           team_b: "2",
  //           date: "2025-04-10",
  //           time: "14:00",
  //           ground: "Central Stadium",
  //         });
  //       } catch (error) {
  //         console.error("Error fetching fixture:", error);
  //       } finally {
  //         setIsFetching(false);
  //       }
  //     }
  //   };

  //   fetchFixture();
  // }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    console.log(value);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  console.log(teams);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form
      if (formData.team_a === formData.team_b) {
        throw new Error("Team A and Team B cannot be the same");
      }
      const payload = {
        name: formData?.name,
        logo: "http://devapi.cam-youth.com/images/cricket_team/logo/image_picker_416BFE44-C38C-44DA-A56E-FD7A3FB2B25F-16265-00000D5_tNXjiOy.jpg",
        team_a: formData?.team_a,
        team_b: formData?.team_b,
        time: new Date(`${formData?.date}T${formData?.time}:00Z`).toISOString(),
        ground: formData?.ground,
        code: "ASS",
      };

      await post("/game/teams/", payload).then((res) => {
        console.log("success");
      }); // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      navigate("/dashboard/fixtures");
    } catch (error) {
      console.error("Error saving fixture:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching || teamsLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Tournament</Label>

              <Select
                value={formData.name}
                onValueChange={(value) => handleSelectChange("name", value)}
              >
                <SelectTrigger id="name">
                  <SelectValue placeholder="Select tournament" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="T20">T20</SelectItem>
                  <SelectItem value="ODI">ODI</SelectItem>
                  <SelectItem value="Test">Test</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team_a">Team A</Label>
              <Select
                value={formData.team_a}
                onValueChange={(value) => handleSelectChange("team_a", value)}
              >
                <SelectTrigger id="team_a">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams?.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="team_b">Team B</Label>
              <Select
                value={formData.team_b}
                onValueChange={(value) => handleSelectChange("team_b", value)}
              >
                <SelectTrigger id="team_b">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams?.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <FormField
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
            />

            <FormField
              label="Time"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleChange}
            />

            <FormField
              label="Ground"
              name="ground"
              value={formData.ground}
              onChange={handleChange}
              placeholder="Enter Ground"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/fixtures")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  {id ? "Updating..." : "Creating..."}
                </>
              ) : id ? (
                "Update Fixture"
              ) : (
                "Create Fixture"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
