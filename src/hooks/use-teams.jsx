"use client";

import { useCrud } from "./use-crud";
import { useToast } from "./use-toast";

export function useTeams() {
  const toast = useToast();

  const {
    data: teams,
    totalItems,
    currentPage,
    isLoading,
    error,
    selectedItem: selectedTeam,
    setSelectedItem: setSelectedTeam,
    fetchData: fetchTeams,
    getById: getTeamById,
    create: createTeamBase,
    update: updateTeamBase,
    remove: removeTeamBase,
    handlePageChange,
    handleFilter,
    resetFilters,
  } = useCrud("/game/teams/", {
    pagination: true,
    pageSize: 10,
    sortField: "name",
    sortDirection: "asc",
  });

  // Enhanced create function with validation
  const createTeam = async (teamData) => {
    try {
      // Validate required fields
      if (!teamData.name) {
        toast.error("Team name is required");
        return null;
      }

      // Create the team
      const result = await createTeamBase(teamData);

      if (result) {
        toast.success(`Team "${result.name}" created successfully`);
      }

      return result;
    } catch (error) {
      toast.error(`Failed to create team: ${error.message}`);
      return null;
    }
  };

  // Enhanced update function with validation
  const updateTeam = async (id, teamData) => {
    try {
      // Validate required fields
      if (!teamData.name) {
        toast.error("Team name is required");
        return null;
      }

      // Update the team
      const result = await updateTeamBase(id, teamData);

      if (result) {
        toast.success(`Team "${result.name}" updated successfully`);
      }

      return result;
    } catch (error) {
      toast.error(`Failed to update team: ${error.message}`);
      return null;
    }
  };

  // Enhanced remove function with confirmation
  const removeTeam = async (id, teamName) => {
    try {
      // Remove the team
      const result = await removeTeamBase(id);

      if (result) {
        toast.success(`Team "${teamName}" deleted successfully`);
      }

      return result;
    } catch (error) {
      toast.error(`Failed to delete team: ${error.message}`);
      return false;
    }
  };

  return {
    teams,
    totalItems,
    currentPage,
    isLoading,
    error,
    selectedTeam,
    setSelectedTeam,
    fetchTeams,
    getTeamById,
    createTeam,
    updateTeam,
    removeTeam,
    handlePageChange,
    handleFilter,
    resetFilters,
  };
}
