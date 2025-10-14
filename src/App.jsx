import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import TeamsPage from "./pages/TeamsPage";
import NewTeamPage from "./pages/NewTeamPage";
import EditTeamPage from "./pages/EditTeamPage";
import TournamentsPage from "./pages/TournamentsPage";
import NewTournamentPage from "./pages/NewTournamentPage";
import EditTournamentPage from "./pages/EditTournamentPage";
import PlayersPage from "./pages/PlayersPage";
import NewPlayerPage from "./pages/NewPlayerPage";
import EditPlayerPage from "./pages/EditPlayerPage";
import PlayerStatsPage from "./pages/PlayerStatsPage";
import UsersPage from "./pages/UsersPage";
import FixturesPage from "./pages/FixturesPage";
import NewFixturePage from "./pages/NewFixturePage";
import EditFixturePage from "./pages/EditFixturePage";
import ScorecardsPage from "./pages/ScorecardsPage";
import EditScorecardPage from "./pages/EditScorecardPage";
import PostsPage from "./pages/PostsPage";
import NewPostPage from "./pages/NewPostPage";
import EditPostPage from "./pages/EditPostPage";
import SponsorsPage from "./pages/SponsorsPage";
import NewSponsorPage from "./pages/NewSponsorPage";
import EditSponsorPage from "./pages/EditSponsorPage";
import VotingPage from "./pages/VotingPage";
import NewVotingPage from "./pages/NewVotingPage";
import EditVotingPage from "./pages/EditVotingPage";
import VerificationPage from "./pages/VerificationPage";
import TransfersPage from "./pages/TransfersPage";
import PointsPage from "./pages/PointsPage";
import SettingsPage from "./pages/SettingsPage";
import "./index.css";
import BulkFixtureUploadPage from "./pages/NewBulkFixtureForm";
import { DataProvider } from "./contexts/DataContext";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <Toaster position="top-right" />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route
                  index
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="teams"
                  element={
                    <ProtectedRoute>
                      <TeamsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="teams/new"
                  element={
                    <ProtectedRoute>
                      <NewTeamPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="teams/:id"
                  element={
                    <ProtectedRoute>
                      <EditTeamPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="tournaments"
                  element={
                    <ProtectedRoute>
                      <TournamentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="tournaments/new"
                  element={
                    <ProtectedRoute>
                      <NewTournamentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="tournaments/:id"
                  element={
                    <ProtectedRoute>
                      <EditTournamentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="players"
                  element={
                    <ProtectedRoute>
                      <PlayersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="players/new"
                  element={
                    <ProtectedRoute>
                      <NewPlayerPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="players/:id"
                  element={
                    <ProtectedRoute>
                      <EditPlayerPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="players/:id/stats"
                  element={
                    <ProtectedRoute>
                      <PlayerStatsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="users"
                  element={
                    <ProtectedRoute>
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="fixtures"
                  element={
                    <ProtectedRoute>
                      <FixturesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="fixtures/new"
                  element={
                    <ProtectedRoute>
                      <NewFixturePage />
                    </ProtectedRoute>
                  }
                />{" "}
                <Route
                  path="fixtures/new/bulk"
                  element={
                    <ProtectedRoute>
                      <BulkFixtureUploadPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="fixtures/:id"
                  element={
                    <ProtectedRoute>
                      <EditFixturePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="scorecards"
                  element={
                    <ProtectedRoute>
                      <ScorecardsPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="scorecards/:id" element={<EditScorecardPage />} />
                <Route
                  path="posts"
                  element={
                    <ProtectedRoute>
                      <PostsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="posts/new"
                  element={
                    <ProtectedRoute>
                      <NewPostPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="posts/:id"
                  element={
                    <ProtectedRoute>
                      <EditPostPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="sponsors"
                  element={
                    <ProtectedRoute>
                      <SponsorsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="sponsors/new"
                  element={
                    <ProtectedRoute>
                      <NewSponsorPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="sponsors/:id" element={<EditSponsorPage />} />
                <Route
                  path="voting"
                  element={
                    <ProtectedRoute>
                      <VotingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="voting/new"
                  element={
                    <ProtectedRoute>
                      <NewVotingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="voting/:id"
                  element={
                    <ProtectedRoute>
                      <EditVotingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="verification"
                  element={
                    <ProtectedRoute>
                      <VerificationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="transfers"
                  element={
                    <ProtectedRoute>
                      <TransfersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="points"
                  element={
                    <ProtectedRoute>
                      <PointsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
