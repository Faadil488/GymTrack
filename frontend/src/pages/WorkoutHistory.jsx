import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import WorkoutCard from '../components/WorkoutCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { Plus, ShieldAlert, History } from 'lucide-react';

const WorkoutHistory = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/workouts/');
      setWorkouts(response.data);
    } catch (err) {
      console.error('Error fetching workouts:', err);
      setError('Unable to load workout history. Please reload.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Background glow flare */}
      <div className="absolute bottom-[10%] right-[-10%] w-[35%] h-[35%] bg-lime-500/2 rounded-full blur-[100px] pointer-events-none"></div>

      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight flex items-center gap-2">
              <History className="h-7 w-7 text-lime-400" />
              <span>Workout History</span>
            </h1>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">Review all your previous training sessions</p>
          </div>
          <Link
            to="/workouts/new"
            className="flex items-center gap-1.5 px-5 py-2.5 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black rounded-full text-xs tracking-wider uppercase transition-all shadow-lg shadow-lime-400/10 cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Log Session</span>
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <div className="flex-1 text-sm font-semibold">{error}</div>
            <button 
              onClick={fetchWorkouts} 
              className="text-xs bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider hover:bg-slate-850 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <LoadingState message="Fetching your training log..." />
        ) : workouts.length === 0 ? (
          <EmptyState 
            title="No Sessions Recorded" 
            message="Your history is currently empty. Start logging your workouts to see them listed here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkoutHistory;
