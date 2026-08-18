import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingState from './components/LoadingState';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const WorkoutHistory = lazy(() => import('./pages/WorkoutHistory'));
const CreateWorkout = lazy(() => import('./pages/CreateWorkout'));
const WorkoutDetails = lazy(() => import('./pages/WorkoutDetails'));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={
          <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <LoadingState message="Loading GymTrack..." />
          </div>
        }>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/workouts" element={<WorkoutHistory />} />
              <Route path="/workouts/new" element={<CreateWorkout />} />
              <Route path="/workouts/:id" element={<WorkoutDetails />} />
            </Route>

            {/* Fallback route - Redirect to Dashboard if logged in, otherwise ProtectedRoute redirects to Login */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

