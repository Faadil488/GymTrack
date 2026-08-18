import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import WorkoutCard from '../components/WorkoutCard';
import WorkoutInsight from '../components/WorkoutInsight';
import PersonalRecords from '../components/PersonalRecords';
import ProgressChart from '../components/ProgressChart';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { 
  Dumbbell, 
  Flame, 
  Trophy, 
  Plus, 
  CalendarDays, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { 
  calculateTotalExercises, 
  calculateHeaviestWeight, 
  calculatePersonalRecords, 
  calculateWorkoutStreak 
} from '../utils/workoutCalculations';

const Dashboard = () => {
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
      setError('Unable to load dashboard metrics. Please reload process.');
    } finally {
      setLoading(false);
    }
  };

  const totalWorkouts = workouts.length;
  const totalExercises = calculateTotalExercises(workouts);
  const streak = calculateWorkoutStreak(workouts);
  const heaviest = calculateHeaviestWeight(workouts);
  const personalRecords = calculatePersonalRecords(workouts);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Background glow flares */}
      <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] bg-lime-500/2 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/2 rounded-full blur-[120px] pointer-events-none"></div>

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase leading-none">
              Welcome Back 👋
            </h1>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1.5">
              Ready for your next workout session?
            </p>
          </div>
          <Link
            to="/workouts/new"
            className="flex items-center gap-2 px-6 py-3 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black rounded-full text-xs tracking-wider uppercase transition-all shadow-lg hover:shadow-lime-400/20 active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5 stroke-[3]" />
            <span>Start Workout</span>
          </Link>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <div className="flex-1 text-sm font-medium">{error}</div>
            <button 
              onClick={fetchWorkouts} 
              className="text-xs bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider hover:bg-slate-850 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <LoadingState message="Compiling your dashboard..." />
        ) : totalWorkouts === 0 ? (
          <EmptyState 
            title="Start Your Fitness Journey" 
            message="You haven't logged any workouts yet. Create your first session to see stats, progression charts, and personal records!" 
          />
        ) : (
          <>
            {/* Stats Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Workouts"
                value={totalWorkouts}
                icon={CalendarDays}
                description="Total logged sessions"
              />
              <StatCard
                title="Total Exercises"
                value={totalExercises}
                icon={Dumbbell}
                description="Unique movements logged"
              />
              <StatCard
                title="Workout Streak"
                value={streak}
                unit={streak === 1 ? "day" : "days"}
                icon={Flame}
                description={streak > 0 ? "Keep the fire burning!" : "Log a workout to start"}
              />
              <StatCard
                title="Heaviest Lift"
                value={heaviest.weight}
                unit="kg"
                icon={Trophy}
                description={`On ${heaviest.exerciseName}`}
              />
            </div>

            {/* Insights Section */}
            <WorkoutInsight workouts={workouts} />

            {/* Visuals & Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart (spans 2 columns on large screens) */}
              <div className="lg:col-span-2">
                <ProgressChart workouts={workouts} />
              </div>
              
              {/* Personal Records */}
              <div>
                <PersonalRecords records={personalRecords} />
              </div>
            </div>

            {/* Recent Workouts List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <h3 className="text-lg font-black uppercase tracking-wider text-white">Recent Workouts</h3>
                <Link
                  to="/workouts"
                  className="flex items-center gap-1 text-xs text-lime-450 font-bold uppercase tracking-wider hover:text-lime-300 transition-colors"
                >
                  <span>View History</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {workouts.slice(0, 3).map((workout) => (
                  <WorkoutCard key={workout.id} workout={workout} />
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
