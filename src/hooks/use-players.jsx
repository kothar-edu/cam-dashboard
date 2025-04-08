"use client"

import { useState, useEffect } from "react"
import { useToast } from "./use-toast"

export function usePlayers() {
  const toast = useToast()
  const [players, setPlayers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Mock data for development
  const mockPlayers = [
    {
      id: "1",
      fullName: "Virat Kohli",
      email: "virat@example.com",
      profilePicture: "/placeholder.svg",
      gender: "male",
      phoneNumber: "+91 9876543210",
      dateOfBirth: "1988-11-05",
      nationality: "Indian",
      visaType: "N/A",
      identityVerified: true,
      paymentVerified: true,
      teamId: "1",
      createdAt: "2023-01-15T00:00:00.000Z",
    },
    {
      id: "2",
      fullName: "MS Dhoni",
      email: "dhoni@example.com",
      profilePicture: "/placeholder.svg",
      gender: "male",
      phoneNumber: "+91 9876543211",
      dateOfBirth: "1981-07-07",
      nationality: "Indian",
      visaType: "N/A",
      identityVerified: true,
      paymentVerified: true,
      teamId: "2",
      createdAt: "2023-02-10T00:00:00.000Z",
    },
    {
      id: "3",
      fullName: "Rohit Sharma",
      email: "rohit@example.com",
      profilePicture: "/placeholder.svg",
      gender: "male",
      phoneNumber: "+91 9876543212",
      dateOfBirth: "1987-04-30",
      nationality: "Indian",
      visaType: "N/A",
      identityVerified: false,
      paymentVerified: true,
      teamId: "3",
      createdAt: "2023-03-05T00:00:00.000Z",
    },
  ]

  useEffect(() => {
    // Simulate API call
    const fetchPlayers = async () => {
      try {
        setIsLoading(true)
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setPlayers(mockPlayers)
      } catch (error) {
        setError("Failed to fetch players")
        toast.error("Failed to fetch players")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlayers()
  }, [])

  return {
    players,
    isLoading,
    error,
  }
}

