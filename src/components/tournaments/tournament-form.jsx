"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTournaments } from "../../hooks/use-tournaments";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { FormField } from "../ui/form-field";
import { LoadingSpinner } from "../ui/loading-spinner";
import { ImageUpload } from "../ui/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import { useEdit, useGet, usePost } from "src/hooks/useApi";

export function TournamentForm({ id: propId }) {
  const navigate = useNavigate();
  const { id: urlId } = useParams();
  const id = propId || urlId;

  const { getTournament, createTournament, updateTournament } =
    useTournaments();
  const { post, loading, error } = usePost();
  const { edit } = useEdit();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);

  const [formData, setFormData] = useState({
    name: "",
    start: "2025-04-09T06:16:30.360Z",
    end: "2025-04-09T06:16:30.360Z",
    team_size: 0,
    teams: null,
    logo: "",
  });

  useEffect(() => {
    const fetchTournament = async () => {
      if (id) {
        try {
          const tournament = await getTournament(id);
          if (tournament) {
            setFormData({
              name: tournament.name,
              logo: tournament.logo || "",
              startDate: tournament.startDate,
              endDate: tournament.endDate,
              time: tournament.time || "",
              matchType: tournament.matchType,
              totalPlayers: tournament.totalPlayers.toString(),
              ballType: tournament.ballType,
              pitchType: tournament.pitchType,
            });
          }
        } catch (error) {
          console.error("Error fetching tournament:", error);
        } finally {
          setIsFetching(false);
        }
      }
    };

    fetchTournament();
  }, [id, getTournament]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (url) => {
    setFormData((prev) => ({ ...prev, logo: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (id) {
        await edit("/game/tournament/", formData);
      } else {
        await post("/game/tournament/", formData);
      }
      navigate("/dashboard/tournaments");
    } catch (error) {
      console.error("Error saving tournament:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
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
            <FormField
              label="Tournament Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter tournament name"
              required
            />

            <div className="space-y-2">
              <Label htmlFor="matchType">Match Type</Label>
              <Select
                value={formData.matchType}
                onValueChange={(value) =>
                  handleSelectChange("matchType", value)
                }
              >
                <SelectTrigger id="matchType">
                  <SelectValue placeholder="Select match type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="limited over">Limited Over</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
                  {/* <SelectItem value="t20">T20</SelectItem>
                  <SelectItem value="odi">ODI</SelectItem> */}
                </SelectContent>
              </Select>
            </div>

            <FormField
              label="Start Date"
              name="start"
              type="date"
              value={formData.start}
              onChange={handleChange}
              required
            />

            <FormField
              label="End Date"
              name="end"
              type="date"
              value={formData.end}
              onChange={handleChange}
              required
            />

            <FormField
              label="Time"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleChange}
            />

            <div className="space-y-2">
              <FormField
                label="Team Size"
                name="team_size"
                type="number"
                value={formData.team_size}
                onChange={handleChange}
                placeholder="Team Size"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ballType">Ball Type</Label>
              <Select
                value={formData.ballType}
                onValueChange={(value) => handleSelectChange("ballType", value)}
              >
                <SelectTrigger id="ballType">
                  <SelectValue placeholder="Select ball type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leather">Leather</SelectItem>
                  <SelectItem value="tennis">Tennis</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pitchType">Pitch Type</Label>
              <Select
                value={formData.pitchType}
                onValueChange={(value) =>
                  handleSelectChange("pitchType", value)
                }
              >
                <SelectTrigger id="pitchType">
                  <SelectValue placeholder="Select pitch type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="turf">Turf</SelectItem>
                  <SelectItem value="cement">Cement</SelectItem>
                  <SelectItem value="matting">Matting</SelectItem>
                  <SelectItem value="rough">Rough</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Tournament Logo
              </label>
              <ImageUpload
                value={formData.logo}
                onChange={handleImageUpload}
                placeholder="Upload tournament logo"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/tournaments")}
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
                "Update Tournament"
              ) : (
                "Create Tournament"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
