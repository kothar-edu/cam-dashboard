"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "../hooks/use-toast";
import useApiCrud from "../hooks/useApiCrud";

// Create context
const DataContext = createContext(null);

// Custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export function DataProvider({ children }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for all shared data
  const [teams, setTeams] = useState([]);
  const [grounds, setGrounds] = useState([]);
  const [officials, setOfficials] = useState([]);
  const [series, setSeries] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [tournamentGroups, setTournamentGroups] = useState({});
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
      { id: 1, name: "Mumbai Indians", abbreviation: "MI" },
      { id: 2, name: "Chennai Super Kings", abbreviation: "CSK" },
      { id: 3, name: "Royal Challengers Bangalore", abbreviation: "RCB" },
      { id: 4, name: "Delhi Capitals", abbreviation: "DC" },
      { id: 5, name: "Kolkata Knight Riders", abbreviation: "KKR" },
    ],
    loadOnMount: true,
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
    loadOnMount: true,
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
    loadOnMount: true,
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
    loadOnMount: true,
  });

  const tournamentsApi = useApiCrud({
    baseUrl: process.env.REACT_APP_API_URL,
    endpoint: "tournaments",
    useMockData: true,
    mockData: [
      {
        id: 1,
        name: "IPL 2024",
        startDate: "2024-03-15",
        endDate: "2024-05-30",
        matchType: "t20",
      },
      {
        id: 2,
        name: "World Cup 2023",
        startDate: "2023-10-05",
        endDate: "2023-11-19",
        matchType: "odi",
      },
      {
        id: 3,
        name: "The Ashes 2023",
        startDate: "2023-06-16",
        endDate: "2023-07-31",
        matchType: "test",
      },
    ],
    loadOnMount: true,
  });

  const tournamentGroupsApi = useApiCrud({
    baseUrl: process.env.REACT_APP_API_URL,
    endpoint: "tournament-groups",
    useMockData: true,
    mockData: {
      1: [
        // Tournament ID 1 (IPL 2024)
        {
          id: 1,
          name: "Group A",
          tournamentId: 1,
          opponents: [1, 2, 3], // Team IDs
        },
        {
          id: 2,
          name: "Group B",
          tournamentId: 1,
          opponents: [4, 5], // Team IDs
        },
      ],
      2: [
        // Tournament ID 2 (World Cup 2023)
        {
          id: 3,
          name: "Group 1",
          tournamentId: 2,
          opponents: [1, 3, 5], // Team IDs
        },
        {
          id: 4,
          name: "Group 2",
          tournamentId: 2,
          opponents: [2, 4], // Team IDs
        },
      ],
    },
    loadOnMount: true,
  });

  // Load all data on mount
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Wait for all data to load
        await Promise.all([
          teamsApi.getAll(),
          groundsApi.getAll(),
          officialsApi.getAll(),
          seriesApi.getAll(),
          tournamentsApi.getAll(),
          tournamentGroupsApi.getAll(),
        ]);

        // Set data from APIs
        setTeams(teamsApi.data);
        setGrounds(groundsApi.data);
        setOfficials(officialsApi.data);
        setSeries(seriesApi.data);
        setTournaments(tournamentsApi.data);
        setTournamentGroups(tournamentGroupsApi.data);

        setIsLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err);
        setIsLoading(false);

        toast({
          title: "Error loading data",
          description: "Failed to load some data. Using fallback data instead.",
          variant: "destructive",
        });
      }
    };

    loadAllData();
  }, []);

  // Helper functions for working with data
  const getDisplayName = (array, value) => {
    if (!value) return "";
    const item = array.find(
      (item) => item.id?.toString() === value?.toString()
    );
    return item ? item.name : "";
  };

  const getTeamName = (id) => getDisplayName(teams, id);
  const getGroundName = (id) => getDisplayName(grounds, id);
  const getOfficialName = (id) => getDisplayName(officials, id);
  const getSeriesName = (id) => getDisplayName(series, id);
  const getTournamentName = (id) => getDisplayName(tournaments, id);

  const getMatchTypeName = (id) => {
    const matchType = matchTypes.find((type) => type.id === id);
    return matchType ? matchType.name : "";
  };

  // Get groups for a specific tournament
  const getGroupsByTournament = (tournamentId) => {
    return tournamentGroups[tournamentId] || [];
  };

  // Create a new group for a tournament
  const createGroup = async (tournamentId, groupData) => {
    try {
      // In a real app, you would call the API here
      // For now, we'll just update the local state
      const newGroup = {
        id: Date.now(), // Generate a temporary ID
        tournamentId,
        ...groupData,
      };

      // Update the local state
      setTournamentGroups((prev) => ({
        ...prev,
        [tournamentId]: [...(prev[tournamentId] || []), newGroup],
      }));

      return newGroup;
    } catch (error) {
      console.error("Error creating group:", error);
      throw error;
    }
  };

  // Update an existing group
  const updateGroup = async (tournamentId, groupId, groupData) => {
    try {
      // In a real app, you would call the API here
      // For now, we'll just update the local state
      const updatedGroup = {
        id: groupId,
        tournamentId,
        ...groupData,
      };

      // Update the local state
      setTournamentGroups((prev) => {
        const tournamentGroups = prev[tournamentId] || [];
        const updatedGroups = tournamentGroups.map((group) =>
          group.id === groupId ? updatedGroup : group
        );

        return {
          ...prev,
          [tournamentId]: updatedGroups,
        };
      });

      return updatedGroup;
    } catch (error) {
      console.error("Error updating group:", error);
      throw error;
    }
  };

  // Delete a group
  const deleteGroup = async (tournamentId, groupId) => {
    try {
      // In a real app, you would call the API here
      // For now, we'll just update the local state

      // Update the local state
      setTournamentGroups((prev) => {
        const tournamentGroups = prev[tournamentId] || [];
        const updatedGroups = tournamentGroups.filter(
          (group) => group.id !== groupId
        );

        return {
          ...prev,
          [tournamentId]: updatedGroups,
        };
      });

      return true;
    } catch (error) {
      console.error("Error deleting group:", error);
      throw error;
    }
  };

  // Refresh data functions
  const refreshTeams = () => teamsApi.getAll();
  const refreshGrounds = () => groundsApi.getAll();
  const refreshOfficials = () => officialsApi.getAll();
  const refreshSeries = () => seriesApi.getAll();
  const refreshTournaments = () => tournamentsApi.getAll();
  const refreshTournamentGroups = () => tournamentGroupsApi.getAll();

  const refreshAll = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        refreshTeams(),
        refreshGrounds(),
        refreshOfficials(),
        refreshSeries(),
        refreshTournaments(),
        refreshTournamentGroups(),
      ]);
      setIsLoading(false);
    } catch (err) {
      setError(err);
      setIsLoading(false);
      toast({
        title: "Error refreshing data",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Value to be provided by the context
  const value = {
    // Data
    teams,
    grounds,
    officials,
    series,
    tournaments,
    tournamentGroups,
    matchTypes,

    // Status
    isLoading,
    error,

    // Helper functions
    getTeamName,
    getGroundName,
    getOfficialName,
    getSeriesName,
    getTournamentName,
    getMatchTypeName,
    getGroupsByTournament,
    createGroup,
    updateGroup,
    deleteGroup,

    // Refresh functions
    refreshTeams,
    refreshGrounds,
    refreshOfficials,
    refreshSeries,
    refreshTournaments,
    refreshTournamentGroups,
    refreshAll,

    // API instances (in case direct access is needed)
    teamsApi,
    groundsApi,
    officialsApi,
    seriesApi,
    tournamentsApi,
    tournamentGroupsApi,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
