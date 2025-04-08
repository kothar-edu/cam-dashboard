import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
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

function App() {
  return (
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
              <Route index element={<DashboardPage />} />
              <Route path="teams" element={<TeamsPage />} />
              <Route path="teams/new" element={<NewTeamPage />} />
              <Route path="teams/:id" element={<EditTeamPage />} />
              <Route path="tournaments" element={<TournamentsPage />} />
              <Route path="tournaments/new" element={<NewTournamentPage />} />
              <Route path="tournaments/:id" element={<EditTournamentPage />} />
              <Route path="players" element={<PlayersPage />} />
              <Route path="players/new" element={<NewPlayerPage />} />
              <Route path="players/:id" element={<EditPlayerPage />} />
              <Route path="players/:id/stats" element={<PlayerStatsPage />} />
              <Route path="fixtures" element={<FixturesPage />} />
              <Route path="fixtures/new" element={<NewFixturePage />} />
              <Route path="fixtures/:id" element={<EditFixturePage />} />
              <Route path="scorecards" element={<ScorecardsPage />} />
              <Route path="scorecards/:id" element={<EditScorecardPage />} />
              <Route path="posts" element={<PostsPage />} />
              <Route path="posts/new" element={<NewPostPage />} />
              <Route path="posts/:id" element={<EditPostPage />} />
              <Route path="sponsors" element={<SponsorsPage />} />
              <Route path="sponsors/new" element={<NewSponsorPage />} />
              <Route path="sponsors/:id" element={<EditSponsorPage />} />
              <Route path="voting" element={<VotingPage />} />
              <Route path="voting/new" element={<NewVotingPage />} />
              <Route path="voting/:id" element={<EditVotingPage />} />
              <Route path="verification" element={<VerificationPage />} />
              <Route path="transfers" element={<TransfersPage />} />
              <Route path="points" element={<PointsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
