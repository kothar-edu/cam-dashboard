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

const placeholderRoutes = [
  'teams/new',
  'teams/:id',
  'tournaments/new',
  'tournaments/:id',
  'players/new',
  'players/:id',
  'players/:id/stats',
  'users',
  'fixtures/new',
  'fixtures/new/bulk',
  'fixtures/:id',
  'scorecards/:id',
  'posts',
  'posts/new',
  'posts/:id',
  'sponsors',
  'sponsors/new',
  'sponsors/:id',
  'voting',
  'voting/new',
  'voting/:id',
  'verification',
  'transfers',
  'settings',
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
          {placeholderRoutes.map((path) => (
            <Route key={path} path={path} element={<PlaceholderPage />} />
          ))}
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}
