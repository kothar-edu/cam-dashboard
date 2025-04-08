"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "../contexts/ToastContext"

export function useTournaments() {
  const { toast } = useToast()
  const [tournaments, setTournaments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Mock data for development
  const mockTournaments = [
    {
      id: "1",
      name: "Premier League 2025",
      logo: "/assets/placeholder.svg",
      startDate: "2025-03-01",
      endDate: "2025-04-30",
      matchType: "limited over",
      totalPlayers: 11,
      ballType: "leather",
      pitchType: "turf",
      createdAt: "2023-01-15T00:00:00.000Z",
    },
    {
      id: "2",
      name: "T20 Championship",
      logo: "/assets/placeholder.svg",
      startDate: "2025-05-15",
      endDate: "2025-06-20",
      matchType: "limited over",
      totalPlayers: 11,
      ballType: "leather",
      pitchType: "turf",
      createdAt: "2023-02-10T00:00:00.000Z",
    },
    {
      id: "3",
      name: "Test Series 2025",
      logo: "/assets/placeholder.svg",
      startDate: "2025-07-10",
      endDate: "2025-08-15",
      matchType: "test",
      totalPlayers: 11,
      ballType: "leather",
      pitchType: "turf",
      createdAt: "2023-03-05T00:00:00.000Z",
    },
    {
      id: "4",
      name: "ODI World Cup 2025",
      logo: "/assets/placeholder.svg",
      startDate: "2025-09-01",
      endDate: "2025-10-15",
      matchType: "limited over",
      totalPlayers: 15,
      ballType: "leather",
      pitchType: "turf",
      createdAt: "2023-04-12T00:00:00.000Z",
    },
    {
      id: "5",
      name: "Winter League 2025",
      logo: "/assets/placeholder.svg",
      startDate: "2025-11-10",
      endDate: "2025-12-20",
      matchType: "limited over",
      totalPlayers: 11,
      ballType: "leather",
      pitchType: "matting",
      createdAt: "2023-05-20T00:00:00.000Z",
    },
  ]

  const fetchTournaments = useCallback(async () => {
    setIsLoading(true)
    try {
      // For now, always use mock data instead of making API calls
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API delay
      setTournaments(mockTournaments)
    } catch (error) {
      console.error("Error fetching tournaments:", error)
      setError(error.message)
      // Fall back to mock data
      setTournaments(mockTournaments)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initialize with data
  useEffect(() => {
    fetchTournaments()
  }, [fetchTournaments])

  const getTournament = async (id) => {
    setIsLoading(true)
    try {
      // For now, always use mock data instead of making API calls
      await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate API delay
      const tournament = mockTournaments.find((tournament) => tournament.id === id)
      return tournament || mockTournaments[0] // Return first mock tournament if ID not found
    } catch (error) {
      console.error("Error fetching tournament:", error)
      // Fall back to mock data
      return mockTournaments.find((tournament) => tournament.id === id) || mockTournaments[0]
    } finally {
      setIsLoading(false)
    }
  }

  const createTournament = async (data) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newTournament = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }

      setTournaments((prev) => [...prev, newTournament])

      toast({
        title: "Success",
        description: "Tournament created successfully",
      })

      return newTournament
    } catch (error) {
      console.error("Error creating tournament:", error)
      toast({
        title: "Error",
        description: "Failed to create tournament",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateTournament = async (id, data) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedTournament = {
        ...tournaments.find((tournament) => tournament.id === id),
        ...data,
        updatedAt: new Date().toISOString(),
      }

      setTournaments((prev) => prev.map((tournament) => (tournament.id === id ? updatedTournament : tournament)))

      toast({
        title: "Success",
        description: "Tournament updated successfully",
      })

      return updatedTournament
    } catch (error) {
      console.error("Error updating tournament:", error)
      toast({
        title: "Error",
        description: "Failed to update tournament",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTournament = async (id) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setTournaments((prev) => prev.filter((tournament) => tournament.id !== id))

      toast({
        title: "Success",
        description: "Tournament deleted successfully",
      })

      return true
    } catch (error) {
      console.error("Error deleting tournament:", error)
      toast({
        title: "Error",
        description: "Failed to delete tournament",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    tournaments,
    isLoading,
    error,
    getTournament,
    createTournament,
    updateTournament,
    deleteTournament,
    fetchTournaments,
  }
}

