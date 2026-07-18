import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardHomePage from '@/pages/DashboardHomePage';
import TournamentsPage from '@/pages/TournamentsPage';
import TournamentFormPage from '@/pages/TournamentFormPage';
import TeamsPage from '@/pages/TeamsPage';
import TeamFormPage from '@/pages/TeamFormPage';
import TeamDetailPage from '@/pages/TeamDetailPage';
import PlayersPage from '@/pages/PlayersPage';
import PlayerFormPage from '@/pages/PlayerFormPage';
import PlayerStatsPage from '@/pages/PlayerStatsPage';
import FixturesPage from '@/pages/FixturesPage';
import FixtureFormPage from '@/pages/FixtureFormPage';
import BulkFixtureFormPage from '@/pages/BulkFixtureFormPage';
import ScorecardsPage from '@/pages/ScorecardsPage';
import ScorecardDetailPage from '@/pages/ScorecardDetailPage';
import PointsPage from '@/pages/PointsPage';
import PostsPage from '@/pages/PostsPage';
import PostFormPage from '@/pages/PostFormPage';
import SponsorsPage from '@/pages/SponsorsPage';
import SponsorFormPage from '@/pages/SponsorFormPage';
import BoundaryLabelsPage from '@/pages/BoundaryLabelsPage';
import VerificationPage from '@/pages/VerificationPage';
import TransfersPage from '@/pages/TransfersPage';
import UsersPage from '@/pages/UsersPage';
import UserFormPage from '@/pages/UserFormPage';
import TenantsPage from '@/pages/TenantsPage';
import SettingsPage from '@/pages/SettingsPage';
import GameSettingsPage from '@/pages/GameSettingsPage';
import PaymentSettingsPage from '@/pages/PaymentSettingsPage';
import VotingListPage from '@/pages/VotingListPage';
import VotingFormPage from '@/pages/VotingFormPage';

export default function App() {
  return (
    <>
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
          <Route index element={<DashboardHomePage />} />
          <Route path="tournaments" element={<TournamentsPage />} />
          <Route path="tournaments/new" element={<TournamentFormPage />} />
          <Route path="tournaments/:id" element={<TournamentFormPage />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="teams/new" element={<TeamFormPage />} />
          <Route path="teams/:id" element={<TeamDetailPage />} />
          <Route path="players" element={<PlayersPage />} />
          <Route path="players/new" element={<PlayerFormPage />} />
          <Route path="players/:id/stats" element={<PlayerStatsPage />} />
          <Route path="players/:id" element={<PlayerFormPage />} />
          <Route path="fixtures" element={<FixturesPage />} />
          <Route path="fixtures/new/bulk" element={<BulkFixtureFormPage />} />
          <Route path="fixtures/new" element={<FixtureFormPage />} />
          <Route path="fixtures/:id" element={<FixtureFormPage />} />
          <Route path="scorecards" element={<ScorecardsPage />} />
          <Route path="scorecards/:id" element={<ScorecardDetailPage />} />
          <Route path="points" element={<PointsPage />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="posts/new" element={<PostFormPage />} />
          <Route path="posts/:id" element={<PostFormPage />} />
          <Route path="sponsors" element={<SponsorsPage />} />
          <Route path="sponsors/new" element={<SponsorFormPage />} />
          <Route path="sponsors/:id" element={<SponsorFormPage />} />
          <Route path="boundary-labels" element={<BoundaryLabelsPage />} />
          <Route path="game-settings" element={<GameSettingsPage />} />
          <Route path="payment-settings" element={<PaymentSettingsPage />} />
          <Route path="verification" element={<VerificationPage />} />
          <Route path="transfers" element={<TransfersPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:id" element={<UserFormPage />} />
          <Route path="tenants" element={<TenantsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="voting" element={<VotingListPage />} />
          <Route path="voting/new" element={<VotingFormPage />} />
          <Route path="voting/:id" element={<VotingFormPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}
