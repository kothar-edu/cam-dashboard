import { QueryClient } from "@tanstack/react-query";

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time in milliseconds that data remains fresh
      staleTime: 1000 * 60 * 5, // 5 minutes

      // Time in milliseconds that unused/inactive cache data remains in memory
      cacheTime: 1000 * 60 * 30, // 30 minutes

      // Retry failed requests
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },

      // Refetch on window focus
      refetchOnWindowFocus: false,

      // Refetch on reconnect
      refetchOnReconnect: true,

      // Retry delay
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry failed mutations
      retry: 1,

      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
});

// Query Keys - Centralized for consistency
export const queryKeys = {
  // Users
  users: ["users"],
  user: (id) => ["users", id],

  // Players
  players: ["players"],
  player: (id) => ["players", id],

  // Teams
  teams: ["teams"],
  team: (id) => ["teams", id],

  // Tournaments
  tournaments: ["tournaments"],
  tournament: (id) => ["tournaments", id],

  // Fixtures
  fixtures: ["fixtures"],
  fixture: (id) => ["fixtures", id],

  // Sponsors
  sponsors: ["sponsors"],
  sponsor: (id) => ["sponsors", id],

  // Posts
  posts: ["posts"],
  post: (id) => ["posts", id],

  // Voting
  voting: ["voting"],
  vote: (id) => ["voting", id],

  // Scorecards
  scorecards: ["scorecards"],
  scorecard: (id) => ["scorecards", id],

  // Points
  points: ["points"],

  // Transfers
  transfers: ["transfers"],

  // Verification
  verification: ["verification"],
};

// API Base Configuration
export const API_CONFIG = {
  baseURL: "https://devapi.cam-youth.com/api",
  timeout: 10000,
};
