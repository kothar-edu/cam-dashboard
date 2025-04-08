"use client"

import { useState, useEffect } from "react"
import { useToast } from "./use-toast"

export function useFixtures() {
  const toast = useToast()
  const [fixtures, setFixtures] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Mock data for development
  const mockFixtures = [
    {
      id: "1",
      matchType: "T20",
      teamA: "Royal Challengers",
      teamB: "Super Kings",
      date: "2025-04-10",
      time: "14:00",
      venue: "Central Stadium",
      createdAt: "2023-01-15T00:00:00.000Z",
    },
    {
      id: "2",
      matchType: "ODI",
      teamA: "Super Kings",
      teamB: "Knight Riders",
      date: "2025-04-12",
      time: "15:30",
      venue: "East End Ground",
      createdAt: "2023-02-10T00:00:00.000Z",
    },
    {
      id: "3",
      matchType: "T20",
      teamA: "Royal Challengers",
      teamB: "Knight Riders",
      date: "2025-04-15",
      time: "10:00",
      venue: "North Park",
      createdAt: "2023-03-05T00:00:00.000Z",
    },
  ]

  useEffect(() => {
    // Simulate API call
    const fetchFixtures = async () => {
      try {
        setIsLoading(true)
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setFixtures(mockFixtures)
      } catch (error) {
        setError("Failed to fetch fixtures")
        toast.error("Failed to fetch fixtures")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFixtures()
  }, [])

  return {
    fixtures,
    isLoading,
    error,
  }
}

