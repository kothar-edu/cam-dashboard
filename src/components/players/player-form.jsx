"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { usePlayers } from "@/hooks/use-players";
import { useTeams } from "@/hooks/use-teams";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/components/ui/file-upload";

export function PlayerForm({ id }) {
  const navigate = useNavigate();
  const router = useRouter();
  const { getPlayer, createPlayer, updatePlayer } = usePlayers();
  const { teams } = useTeams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!id);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    profilePicture: "",
    gender: "male",
    phoneNumber: "",
    dateOfBirth: "",
    nationality: "",
    visaType: "N/A",
    identityVerified: false,
    paymentVerified: false,
    teamId: "",
    identityDocument: "",
    paymentDocument: "",
  });

  useEffect(() => {
    const fetchPlayer = async () => {
      if (id) {
        try {
          const player = await getPlayer(id);
          if (player) {
            setFormData({
              fullName: player.fullName,
              email: player.email,
              profilePicture: player.profilePicture || "",
              gender: player.gender,
              phoneNumber: player.phoneNumber,
              dateOfBirth: player.dateOfBirth,
              nationality: player.nationality,
              visaType: player.visaType,
              identityVerified: player.identityVerified,
              paymentVerified: player.paymentVerified,
              teamId: player.teamId,
              identityDocument: player.identityDocument || "",
              paymentDocument: player.paymentDocument || "",
            });
          }
        } catch (error) {
          console.error("Error fetching player:", error);
        } finally {
          setIsFetching(false);
        }
      }
    };

    fetchPlayer();
  }, [id, getPlayer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (url) => {
    setFormData((prev) => ({ ...prev, profilePicture: url }));
  };

  const handleFileUpload = (name, url) => {
    setFormData((prev) => ({ ...prev, [name]: url }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (id) {
        await updatePlayer(id, formData);
      } else {
        await createPlayer(formData);
      }
      navigate("/dashboard/players");
    } catch (error) {
      console.error("Error saving player:", error);
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
        <Tabs defaultValue="basic">
          <TabsList className="mb-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter player's full name"
                required
              />

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <FormField
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />

              <FormField
                label="Nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                placeholder="Enter nationality"
                required
              />

              <FormField
                label="Visa Type"
                name="visaType"
                value={formData.visaType}
                onChange={handleChange}
                placeholder="Enter visa type (if applicable)"
              />

              <div className="space-y-2">
                <Label htmlFor="teamId">Team</Label>
                <Select
                  value={formData.teamId}
                  onValueChange={(value) => handleSelectChange("teamId", value)}
                >
                  <SelectTrigger id="teamId">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Profile Picture
                </label>
                <ImageUpload
                  value={formData.profilePicture}
                  onChange={handleImageUpload}
                  placeholder="Upload profile picture"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
              />

              <FormField
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
              />
            </div>
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Identity Verification</Label>
                <div className="flex items-center gap-2">
                  <FileUpload
                    value={formData.identityDocument}
                    onChange={(url) =>
                      handleFileUpload("identityDocument", url)
                    }
                    placeholder="Upload identity document"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Verification</Label>
                <div className="flex items-center gap-2">
                  <FileUpload
                    value={formData.paymentDocument}
                    onChange={(url) => handleFileUpload("paymentDocument", url)}
                    placeholder="Upload payment proof"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard/players")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <LoadingSpinner className="mr-2 h-4 w-4" />
                {id ? "Updating..." : "Creating..."}
              </>
            ) : id ? (
              "Update Player"
            ) : (
              "Create Player"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
