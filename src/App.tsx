import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoginPage from '@/pages/LoginPage';
import PlaceholderPage from '@/pages/PlaceholderPage';
import DashboardHomePage from '@/pages/DashboardHomePage';
import TournamentsPage from '@/pages/TournamentsPage';
import TeamsPage from '@/pages/TeamsPage';
import PlayersPage from '@/pages/PlayersPage';
import FixturesPage from '@/pages/FixturesPage';
import ScorecardsPage from '@/pages/ScorecardsPage';
import PointsPage from '@/pages/PointsPage';
import PostsPage from '@/pages/PostsPage';
import SponsorsPage from '@/pages/SponsorsPage';
import BoundaryLabelsPage from '@/pages/BoundaryLabelsPage';
import VerificationPage from '@/pages/VerificationPage';
import TransfersPage from '@/pages/TransfersPage';
import UsersPage from '@/pages/UsersPage';
import TenantsPage from '@/pages/TenantsPage';
import SettingsPage from '@/pages/SettingsPage';

const placeholderRoutes = [
  'teams/new',
  'teams/:id',
  'tournaments/new',
  'tournaments/:id',
  'players/new',
  'players/:id',
  'players/:id/stats',
  'fixtures/new',
  'fixtures/new/bulk',
  'fixtures/:id',
  'scorecards/:id',
  'posts/new',
  'posts/:id',
  'sponsors/new',
  'sponsors/:id',
  'voting',
  'voting/new',
  'voting/:id',
];

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
          <Route path="teams" element={<TeamsPage />} />
          <Route path="players" element={<PlayersPage />} />
          <Route path="fixtures" element={<FixturesPage />} />
          <Route path="scorecards" element={<ScorecardsPage />} />
          <Route path="points" element={<PointsPage />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="sponsors" element={<SponsorsPage />} />
          <Route path="boundary-labels" element={<BoundaryLabelsPage />} />
          <Route path="verification" element={<VerificationPage />} />
          <Route path="transfers" element={<TransfersPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="tenants" element={<TenantsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          {placeholderRoutes.map((path) => (
            <Route key={path} path={path} element={<PlaceholderPage />} />
          ))}
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}
