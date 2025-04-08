"use client"

// Update imports to use React hooks
import { useState, useEffect, useCallback } from "react"
import { useToast } from "../contexts/ToastContext"

export function useVoting() {
  const { toast } = useToast()
  const [polls, setPolls] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Mock data for development
  const mockPolls = [
    {
      id: "1",
      title: "Player of the Month",
      description: "Vote for the best player of the month",
      startDate: "2025-03-01",
      endDate: "2025-03-15",
      nominees: ["1", "2", "3"], // Player IDs
      votes: {
        1: 24,
        2: 18,
        3: 32,
      },
      createdAt: "2023-01-15T00:00:00.000Z",
    },
    {
      id: "2",
      title: "Best Team",
      description: "Vote for the best team of the season",
      startDate: "2025-03-20",
      endDate: "2025-04-05",
      nominees: ["1", "2", "3"], // Team IDs
      votes: {
        1: 45,
        2: 38,
        3: 27,
      },
      createdAt: "2023-02-10T00:00:00.000Z",
    },
    {
      id: "3",
      title: "Best Bowler",
      description: "Vote for the best bowler of the tournament",
      startDate: "2025-04-10",
      endDate: "2025-04-25",
      nominees: ["4", "5"], // Player IDs
      votes: {
        4: 56,
        5: 42,
      },
      createdAt: "2023-03-05T00:00:00.000Z",
    },
    {
      id: "4",
      title: "Best Batsman",
      description: "Vote for the best batsman of the tournament",
      startDate: "2025-05-01",
      endDate: "2025-05-15",
      nominees: ["1", "2", "3"], // Player IDs
      votes: {
        1: 67,
        2: 54,
        3: 48,
      },
      createdAt: "2023-04-12T00:00:00.000Z",
    },
    {
      id: "5",
      title: "Most Promising Team",
      description: "Vote for the most promising team for next season",
      startDate: "2025-05-20",
      endDate: "2025-06-05",
      nominees: ["3", "4", "5"], // Team IDs
      votes: {
        3: 35,
        4: 42,
        5: 28,
      },
      createdAt: "2023-05-20T00:00:00.000Z",
    },
  ]

  const fetchPolls = useCallback(async () => {
    setIsLoading(true)
    try {
      // For now, always use mock data instead of making API calls
      await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API delay
      setPolls(mockPolls)
    } catch (error) {
      console.error("Error fetching polls:", error)
      setError(error.message)
      // Fall back to mock data
      setPolls(mockPolls)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initialize with data
  useEffect(() => {
    fetchPolls()
  }, [fetchPolls])

  const getPoll = async (id) => {
    setIsLoading(true)
    try {
      // For now, always use mock data instead of making API calls
      await new Promise((resolve) => setTimeout(resolve, 300)) // Simulate API delay
      const poll = mockPolls.find((poll) => poll.id === id)
      return poll || mockPolls[0] // Return first mock poll if ID not found
    } catch (error) {
      console.error("Error fetching poll:", error)
      // Fall back to mock data
      return mockPolls.find((poll) => poll.id === id) || mockPolls[0]
    } finally {
      setIsLoading(false)
    }
  }

  const createPoll = async (data) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newPoll = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        votes: data.nominees.reduce((acc, id) => {
          acc[id] = 0
          return acc
        }, {}),
      }

      setPolls((prev) => [...prev, newPoll])

      toast({
        title: "Success",
        description: "Poll created successfully",
      })

      return newPoll
    } catch (error) {
      console.error("Error creating poll:", error)
      toast({
        title: "Error",
        description: "Failed to create poll",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updatePoll = async (id, data) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedPoll = {
        ...polls.find((poll) => poll.id === id),
        ...data,
        updatedAt: new Date().toISOString(),
      }

      setPolls((prev) => prev.map((poll) => (poll.id === id ? updatedPoll : poll)))

      toast({
        title: "Success",
        description: "Poll updated successfully",
      })

      return updatedPoll
    } catch (error) {
      console.error("Error updating poll:", error)
      toast({
        title: "Error",
        description: "Failed to update poll",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const deletePoll = async (id) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setPolls((prev) => prev.filter((poll) => poll.id !== id))

      toast({
        title: "Success",
        description: "Poll deleted successfully",
      })

      return true
    } catch (error) {
      console.error("Error deleting poll:", error)
      toast({
        title: "Error",
        description: "Failed to delete poll",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const vote = async (pollId, nomineeId, userId) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const poll = polls.find((p) => p.id === pollId)
      if (!poll) {
        throw new Error("Poll not found")
      }

      if (!poll.nominees.includes(nomineeId)) {
        throw new Error("Invalid nominee")
      }

      const votes = { ...poll.votes }
      votes[nomineeId] = (votes[nomineeId] || 0) + 1

      const updatedPoll = {
        ...poll,
        votes,
      }

      setPolls((prev) => prev.map((p) => (p.id === pollId ? updatedPoll : p)))

      toast({
        title: "Success",
        description: "Vote recorded successfully",
      })

      return updatedPoll
    } catch (error) {
      console.error("Error voting:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to record vote",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    polls,
    isLoading,
    error,
    getPoll,
    createPoll,
    updatePoll,
    deletePoll,
    vote,
    fetchPolls,
  }
}

