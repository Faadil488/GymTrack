import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WorkoutHistory from './pages/WorkoutHistory';
import CreateWorkout from './pages/CreateWorkout';
import WorkoutDetails from './pages/WorkoutDetails';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
