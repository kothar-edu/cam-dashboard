"use client";

import { useState, useEffect } from "react";
import { useData } from "../../contexts/DataContext";
import { useToast } from "../../hooks/use-toast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function GroupModal({
  isOpen,
  onClose,
  tournamentId,
  groupToEdit = null,
}) {
  const { toast } = useToast();
  const { teams, createGroup, getTournamentName, updateGroup } = useData();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    opponents: [],
  });

  // Form validation state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data if editing an existing group
  useEffect(() => {
    if (groupToEdit) {
      setFormData({
        name: groupToEdit.name,
        opponents: groupToEdit.opponents.map((id) => id.toString()),
      });
    } else {
      // Reset form for new group
      setFormData({
        name: "",
        opponents: [],
      });
    }
    // Clear errors when modal opens/closes
    setErrors({});
  }, [groupToEdit, isOpen]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Handle team selection
  const handleTeamSelect = (teamId) => {
    // Convert to string for comparison
    const teamIdStr = teamId.toString();

    setFormData((prev) => {
      // Check if team is already selected
      if (prev.opponents.includes(teamIdStr)) {
        return prev;
      }

      return {
        ...prev,
        opponents: [...prev.opponents, teamIdStr],
      };
    });

    // Clear error when teams are added
    if (errors.opponents) {
      setErrors((prev) => ({
        ...prev,
        opponents: null,
      }));
    }
  };

  // Remove a team from selection
  const handleRemoveTeam = (teamId) => {
    setFormData((prev) => ({
      ...prev,
      opponents: prev.opponents.filter((id) => id !== teamId.toString()),
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Group name is required";
    }

    if (formData.opponents.length === 0) {
      newErrors.opponents = "At least one team must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert opponent IDs to numbers for API
      const formattedData = {
        ...formData,
        opponents: formData.opponents.map((id) => Number.parseInt(id)),
      };

      if (groupToEdit) {
        // Update existing group
        await updateGroup(
          Number.parseInt(tournamentId),
          groupToEdit.id,
          formattedData
        );
        toast({
          title: "Success",
          description: `Group "${formData.name}" has been updated successfully`,
        });
      } else {
        // Create new group
        await createGroup(Number.parseInt(tournamentId), formattedData);
        toast({
          title: "Success",
          description: `Group "${formData.name}" has been created successfully`,
        });
      }

      // Close the modal
      onClose(true); // Pass true to indicate successful submission
    } catch (error) {
      console.error("Error saving group:", error);
      toast({
        title: "Error",
        description: "Failed to save group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {groupToEdit ? "Edit Group" : "Create Group"} -{" "}
            {getTournamentName(tournamentId)}
          </DialogTitle>
          <DialogDescription>
            {groupToEdit
              ? "Update the group details and team assignments."
              : "Create a new group and assign teams to it."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter group name (e.g. Group A)"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="teams">Select Teams</Label>
            <Select onValueChange={handleTeamSelect}>
              <SelectTrigger
                className={errors.opponents ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select teams to add to this group" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem
                    key={team.id}
                    value={team.id.toString()}
                    disabled={formData.opponents.includes(team.id.toString())}
                  >
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.opponents && (
              <p className="text-red-500 text-sm">{errors.opponents}</p>
            )}
          </div>

          {/* Selected teams */}
          {formData.opponents.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Teams</Label>
              <div className="flex flex-wrap gap-2">
                {formData.opponents.map((teamId) => {
                  const team = teams.find((t) => t.id.toString() === teamId);
                  return (
                    <Badge
                      key={teamId}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {team?.name || `Team ${teamId}`}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-red-500"
                        onClick={() => handleRemoveTeam(teamId)}
                      />
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : groupToEdit
                ? "Update Group"
                : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
