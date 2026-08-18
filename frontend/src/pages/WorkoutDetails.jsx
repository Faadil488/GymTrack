import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import LoadingState from '../components/LoadingState';
import { 
  Calendar, 
  Trash2, 
  Edit2, 
  Plus, 
  Check, 
  X, 
  ArrowLeft, 
  Dumbbell,
  AlertCircle,
  Sparkles,
  Flame
} from 'lucide-react';
import { calculateWorkoutStreak } from '../utils/workoutCalculations';

const WorkoutDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', sets: '', reps: '', weight: '' });
  const [editError, setEditError] = useState('');

  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', sets: '3', reps: '10', weight: '40' });
  const [addError, setAddError] = useState('');

  const [showInsight, setShowInsight] = useState(false);
  const [insightDetails, setInsightDetails] = useState(null);

  useEffect(() => {
    fetchWorkoutDetails();
    if (location.state?.showSuccessInsight) {
      setShowInsight(true);
      setSuccessMsg('Workout saved successfully! 🎉');
      window.history.replaceState({}, document.title);
    }
  }, [id, location.state]);

  const fetchWorkoutDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/workouts/${id}/`);
      setWorkout(response.data);
      
      if (location.state?.showSuccessInsight) {
        generateCreationInsight(response.data);
      }
    } catch (err) {
      console.error('Error fetching workout details:', err);
      setError('Unable to load session details. It may have been deleted.');
    } finally {
      setLoading(false);
    }
  };

  const generateCreationInsight = async (currentWorkout) => {
    try {
      const workoutsResponse = await api.get('/workouts/');
      const allWorkouts = workoutsResponse.data;
      
      const exercises = currentWorkout.exercises || [];
      const totalSets = exercises.reduce((acc, curr) => acc + (parseInt(curr.sets) || 0), 0);
      const totalReps = exercises.reduce((acc, curr) => acc + ((parseInt(curr.sets) || 0) * (parseInt(curr.reps) || 0)), 0);
      
      let strongestLift = null;
      exercises.forEach(ex => {
        const wt = parseFloat(ex.weight) || 0;
        if (!strongestLift || wt > strongestLift.weight) {
          strongestLift = { name: ex.name, weight: wt };
        }
      });

      const streak = calculateWorkoutStreak(allWorkouts);
      
      setInsightDetails({
        exerciseCount: exercises.length,
        totalSets,
        totalReps,
        strongestLift,
        streak
      });
    } catch (e) {
      console.error("Failed to compile success insights:", e);
    }
  };

  const handleDeleteWorkout = async () => {
    if (!window.confirm('Delete this entire workout session?')) {
      return;
    }
    
    try {
      await api.delete(`/workouts/${id}/`);
      navigate('/workouts', { state: { deleted: true } });
    } catch (err) {
      console.error('Error deleting workout:', err);
      setError('Failed to delete workout session.');
    }
  };

  const startEditExercise = (exercise) => {
    setEditingId(exercise.id);
    setEditForm({
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight
    });
    setEditError('');
  };

  const cancelEditExercise = () => {
    setEditingId(null);
    setEditForm({ name: '', sets: '', reps: '', weight: '' });
    setEditError('');
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditError('');

    if (!editForm.name.trim()) {
      setEditError('Name is required.');
      return;
    }
    if (editForm.sets <= 0 || editForm.reps <= 0) {
      setEditError('Sets and reps must be positive.');
      return;
    }
    if (editForm.weight < 0) {
      setEditError('Weight cannot be negative.');
      return;
    }

    try {
      const response = await api.put(`/exercises/${editingId}/`, {
        name: editForm.name.trim(),
        sets: parseInt(editForm.sets),
        reps: parseInt(editForm.reps),
        weight: parseFloat(editForm.weight)
      });

      setWorkout({
        ...workout,
        exercises: workout.exercises.map(ex => ex.id === editingId ? { ...ex, ...response.data } : ex)
      });
      setEditingId(null);
    } catch (err) {
      console.error('Error updating exercise:', err);
      setEditError('Failed to update exercise.');
    }
  };

  const handleDeleteExercise = async (exerciseId) => {
    if (!window.confirm('Delete this exercise entry?')) {
      return;
    }

    try {
      await api.delete(`/exercises/${exerciseId}/`);
      setWorkout({
        ...workout,
        exercises: workout.exercises.filter(ex => ex.id !== exerciseId)
      });
    } catch (err) {
      console.error('Error deleting exercise:', err);
      setError('Failed to delete exercise.');
    }
  };

  const handleAddExercise = async (e) => {
    e.preventDefault();
    setAddError('');

    if (!addForm.name.trim()) {
      setAddError('Name is required.');
      return;
    }
    if (addForm.sets <= 0 || addForm.reps <= 0) {
      setAddError('Sets and reps must be positive.');
      return;
    }
    if (addForm.weight < 0) {
      setAddError('Weight cannot be negative.');
      return;
    }

    try {
      const response = await api.post(`/workouts/${id}/exercises/`, {
        name: addForm.name.trim(),
        sets: parseInt(addForm.sets),
        reps: parseInt(addForm.reps),
        weight: parseFloat(addForm.weight)
      });

      setWorkout({
        ...workout,
        exercises: [...workout.exercises, response.data]
      });
      
      setIsAdding(false);
      setAddForm({ name: '', sets: '3', reps: '10', weight: '40' });
    } catch (err) {
      console.error('Error adding exercise:', err);
      setAddError('Failed to add exercise.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
          <LoadingState message="Fetching session details..." />
        </main>
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-4">
          <Link to="/workouts" className="flex items-center gap-1.5 px-4 py-2 border border-slate-900 bg-slate-900/30 backdrop-blur rounded-full text-slate-450 hover:text-white text-xs font-black uppercase tracking-wider transition-all w-fit">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to history</span>
          </Link>
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center space-y-3 shadow-lg">
            <AlertCircle className="h-8 w-8 mx-auto" />
            <h3 className="font-bold text-lg">Error Loading Session</h3>
            <p className="text-sm font-medium">{error || "Workout not found."}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Background glow flares */}
      <div className="absolute top-[10%] left-[-10%] w-[35%] h-[35%] bg-lime-500/2 rounded-full blur-[100px] pointer-events-none"></div>

      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-6 relative z-10">
        {/* Navigation back and deletion */}
        <div className="flex items-center justify-between">
          <Link to="/workouts" className="flex items-center gap-1.5 px-4 py-2 border border-slate-900 bg-slate-900/30 backdrop-blur rounded-full text-slate-400 hover:text-lime-400 text-xs font-black uppercase tracking-wider transition-all w-fit cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            <span>History</span>
          </Link>
          
          <button
            onClick={handleDeleteWorkout}
            className="flex items-center gap-1.5 px-4 py-2 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/30 text-red-400 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Workout</span>
          </button>
        </div>

        {/* Success Insight Banner */}
        {showInsight && insightDetails && (
          <div className="bg-slate-900/30 backdrop-blur-md border border-lime-400/20 p-6 rounded-2xl shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-lime-500/5 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5.5 w-5.5 text-lime-400" />
              <h2 className="text-lg font-black text-white uppercase tracking-wider">WORKOUT COMPLETE! 🎉</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-900/50">
                <span className="text-slate-500 text-xxs font-bold uppercase tracking-wider block">Exercises</span>
                <span className="text-lg font-black text-white">{insightDetails.exerciseCount}</span>
              </div>
              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-900/50">
                <span className="text-slate-500 text-xxs font-bold uppercase tracking-wider block">Total Sets</span>
                <span className="text-lg font-black text-white">{insightDetails.totalSets}</span>
              </div>
              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-900/50">
                <span className="text-slate-500 text-xxs font-bold uppercase tracking-wider block">Total Reps</span>
                <span className="text-lg font-black text-white">{insightDetails.totalReps}</span>
              </div>
              <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-900/50">
                <span className="text-slate-500 text-xxs font-bold uppercase tracking-wider block">Streak</span>
                <span className="text-lg font-black text-lime-400 flex items-center gap-1">
                  <Flame className="h-4.5 w-4.5 fill-lime-400" />
                  {insightDetails.streak}
                </span>
              </div>
            </div>
            {insightDetails.strongestLift && (
              <p className="text-xs text-slate-400 font-semibold pt-1">
                💪 Strongest movement this session: <span className="text-white font-bold">{insightDetails.strongestLift.name}</span> &mdash; <span className="text-lime-400 font-black">{insightDetails.strongestLift.weight} kg</span>
              </p>
            )}
          </div>
        )}

        {/* Workout Details Header */}
        <div className="bg-slate-900/30 backdrop-blur-md border border-slate-900 p-6 rounded-2xl shadow-md space-y-2">
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="h-5 w-5 text-lime-400" />
            <span className="text-base sm:text-lg font-black uppercase tracking-wide">
              {new Date(workout.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <p className="text-xxs text-slate-500 font-bold uppercase tracking-wider">Logged on {new Date(workout.created_at).toLocaleString()}</p>
        </div>

        {/* Exercises list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
            <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-lime-400" />
              <span>Exercises ({workout.exercises?.length || 0})</span>
            </h3>
            
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1 text-xs font-black text-lime-400 hover:text-lime-300 transition-colors uppercase tracking-wider cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
                <span>Add Exercise</span>
              </button>
            )}
          </div>

          {/* Add Exercise form */}
          {isAdding && (
            <form onSubmit={handleAddExercise} className="bg-slate-900/30 backdrop-blur-md border border-lime-400/20 p-5 rounded-2xl shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xxs font-black text-lime-450 uppercase tracking-widest">New Exercise Entry</span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-slate-500 hover:text-slate-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {addError && (
                <p className="text-red-400 text-xxs font-semibold bg-red-500/5 p-2.5 rounded-lg border border-red-500/10 text-center">{addError}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider">Exercise Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bench Press"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-855 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400 transition-all placeholder-slate-655"
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 md:col-span-2">
                  <div className="space-y-1.5">
                    <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider text-center">Sets</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-855 rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400 transition-all font-bold"
                      value={addForm.sets}
                      onChange={(e) => setAddForm({ ...addForm, sets: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider text-center">Reps</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-855 rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400 transition-all font-bold"
                      value={addForm.reps}
                      onChange={(e) => setAddForm({ ...addForm, reps: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider text-center">Weight</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-855 rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400 transition-all font-bold"
                      value={addForm.weight}
                      onChange={(e) => setAddForm({ ...addForm, weight: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 border border-slate-900 bg-slate-900/30 hover:border-slate-800 text-slate-450 hover:text-white rounded-full font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-lime-400 hover:bg-lime-300 text-slate-950 rounded-full font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-lime-400/10"
                >
                  Add Exercise
                </button>
              </div>
            </form>
          )}

          {/* Exercise items list */}
          <div className="space-y-3">
            {workout.exercises?.length === 0 ? (
              <p className="text-slate-550 text-xs font-semibold uppercase tracking-wider text-center py-6 bg-slate-905/30 border border-slate-900/50 rounded-2xl">
                No exercises recorded in this session.
              </p>
            ) : (
              workout.exercises.map((exercise) => (
                <div 
                  key={exercise.id}
                  className="bg-slate-900/30 backdrop-blur-md border border-slate-900 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                >
                  {editingId === exercise.id ? (
                    /* EDITING MODE ROW */
                    <form onSubmit={handleEditSave} className="w-full space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                        <span className="text-xxs font-black text-lime-450 uppercase tracking-wider">Edit Exercise</span>
                        {editError && <span className="text-red-400 text-xxs font-semibold">{editError}</span>}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider">Exercise Name</label>
                          <input
                            type="text"
                            required
                            className="w-full px-4 py-2 bg-slate-950 border border-slate-855 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400 transition-all font-semibold"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2 md:col-span-2">
                          <div className="space-y-1.5">
                            <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider text-center">Sets</label>
                            <input
                              type="number"
                              required
                              min="1"
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-855 rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400 transition-all font-bold"
                              value={editForm.sets}
                              onChange={(e) => setEditForm({ ...editForm, sets: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider text-center">Reps</label>
                            <input
                              type="number"
                              required
                              min="1"
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-855 rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400 transition-all font-bold"
                              value={editForm.reps}
                              onChange={(e) => setEditForm({ ...editForm, reps: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider text-center">Weight</label>
                            <input
                              type="number"
                              required
                              min="0"
                              step="any"
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-855 rounded-xl text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400 transition-all font-bold"
                              value={editForm.weight}
                              onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 text-xs pt-2">
                        <button
                          type="button"
                          onClick={cancelEditExercise}
                          className="flex items-center gap-1.5 px-4 py-2 border border-slate-900 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white rounded-full font-bold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Cancel</span>
                        </button>
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 px-4 py-2 bg-lime-400 hover:bg-lime-300 text-slate-950 rounded-full font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-lime-400/10"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Save</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* READING MODE ROW */
                    <>
                      <div className="space-y-1">
                        <span className="font-bold text-white text-base sm:text-lg block">{exercise.name}</span>
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider">
                          <span>{exercise.sets} <span className="text-slate-600 text-xxs font-semibold font-sans">sets</span></span>
                          <span className="text-slate-700">&bull;</span>
                          <span>{exercise.reps} <span className="text-slate-600 text-xxs font-semibold font-sans">reps</span></span>
                          <span className="text-slate-700">&bull;</span>
                          <span className="text-lime-400 font-extrabold">{exercise.weight} <span className="text-slate-500 text-xxs font-bold">kg</span></span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-2 md:mt-0">
                        <button
                          onClick={() => startEditExercise(exercise)}
                          className="flex items-center justify-center h-9 w-9 bg-slate-950 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-lime-400 rounded-xl transition-all cursor-pointer"
                          title="Edit Exercise"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteExercise(exercise.id)}
                          className="flex items-center justify-center h-9 w-9 bg-slate-950 border border-slate-900 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 text-slate-400 rounded-xl transition-all cursor-pointer"
                          title="Delete Exercise"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkoutDetails;
