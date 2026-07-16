import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoginPage from '@/pages/LoginPage';
import PlaceholderPage from '@/pages/PlaceholderPage';
import DashboardHomePage from '@/pages/DashboardHomePage';

const placeholderRoutes = [
  'teams',
  'teams/new',
  'teams/:id',
  'tournaments',
  'tournaments/new',
  'tournaments/:id',
  'players',
  'players/new',
  'players/:id',
  'players/:id/stats',
  'users',
  'fixtures',
  'fixtures/new',
  'fixtures/new/bulk',
  'fixtures/:id',
  'scorecards',
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
  'points',
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
          {placeholderRoutes.map((path) => (
            <Route key={path} path={path} element={<PlaceholderPage />} />
          ))}
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}
