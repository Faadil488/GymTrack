import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Plus, Trash2, Dumbbell, Save, ArrowLeft } from 'lucide-react';

const CreateWorkout = () => {
  const [date, setDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  
  const [exercises, setExercises] = useState([
    { name: '', sets: 3, reps: 10, weight: 40.00 }
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddExercise = () => {
    setExercises([...exercises, { name: '', sets: 3, reps: 10, weight: 0 }]);
  };

  const handleRemoveExercise = (index) => {
    if (exercises.length === 1) {
      setError("A workout session must contain at least one exercise.");
      return;
    }
    const newExercises = [...exercises];
    newExercises.splice(index, 1);
    setExercises(newExercises);
  };

  const handleExerciseChange = (index, field, value) => {
    setError('');
    const newExercises = [...exercises];
    
    if (field === 'sets' || field === 'reps') {
      newExercises[index][field] = value === '' ? '' : Math.max(1, parseInt(value) || 0);
    } else if (field === 'weight') {
      newExercises[index][field] = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
    } else {
      newExercises[index][field] = value;
    }
    
    setExercises(newExercises);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!date) {
      setError('Workout session date is required.');
      setLoading(false);
      return;
    }

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      if (!ex.name.trim()) {
        setError(`Exercise #${i + 1} must have a name.`);
        setLoading(false);
        return;
      }
      if (ex.sets === '' || ex.sets <= 0) {
        setError(`Exercise #${i + 1} ("${ex.name || 'Unnamed'}") must have at least 1 set.`);
        setLoading(false);
        return;
      }
      if (ex.reps === '' || ex.reps <= 0) {
        setError(`Exercise #${i + 1} ("${ex.name || 'Unnamed'}") must have at least 1 rep.`);
        setLoading(false);
        return;
      }
      if (ex.weight === '' || ex.weight < 0) {
        setError(`Exercise #${i + 1} ("${ex.name || 'Unnamed'}") must have non-negative weight.`);
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        date,
        exercises: exercises.map(ex => ({
          name: ex.name.trim(),
          sets: parseInt(ex.sets),
          reps: parseInt(ex.reps),
          weight: parseFloat(ex.weight)
        }))
      };
      
      const response = await api.post('/workouts/', payload);
      navigate(`/workouts/${response.data.id}`, { state: { showSuccessInsight: true } });
    } catch (err) {
      console.error('Error saving workout:', err);
      const detail = err.response?.data?.detail || 'Unable to save workout session. Verify your input fields.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Background glow flare */}
      <div className="absolute top-[10%] left-[-10%] w-[35%] h-[35%] bg-lime-500/2 rounded-full blur-[100px] pointer-events-none"></div>

      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative z-10">
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-4 py-2 border border-slate-900 bg-slate-900/30 backdrop-blur rounded-full text-slate-400 hover:text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Go Back</span>
        </button>

        {/* Heading */}
        <div className="border-b border-slate-900 pb-4">
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Log Workout</h1>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">Specify date and movements completed</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selector */}
          <div className="bg-slate-900/30 backdrop-blur-md border border-slate-900 p-5 rounded-2xl space-y-2 shadow-md">
            <label htmlFor="date" className="block text-xxs font-bold text-slate-450 uppercase tracking-wider">
              Workout Date
            </label>
            <input
              id="date"
              type="date"
              required
              className="w-full sm:w-64 px-4 py-2 bg-slate-950 border border-slate-855 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400 transition-all cursor-pointer font-bold"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Exercises Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-lime-400 animate-pulse" />
              <span>Exercises</span>
            </h2>
            <button
              type="button"
              onClick={handleAddExercise}
              className="flex items-center gap-1 py-2 px-4 bg-slate-900/40 border border-slate-850 hover:border-slate-800 text-lime-400 hover:text-lime-300 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Add Exercise</span>
            </button>
          </div>

          {/* Exercises Inputs */}
          <div className="space-y-4">
            {exercises.map((exercise, index) => (
              <div 
                key={index} 
                className="bg-slate-900/30 backdrop-blur-md border border-slate-900 p-5 rounded-2xl relative shadow-md space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xxs font-black text-lime-400 bg-lime-400/10 border border-lime-400/20 py-1 px-3 rounded-full uppercase tracking-wider">
                    Exercise #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveExercise(index)}
                    className="text-slate-500 hover:text-red-400 p-2 hover:bg-slate-950 border border-slate-900 rounded-full transition-all cursor-pointer"
                    title="Remove Exercise"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Name */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider">Exercise Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bench Press, Squat"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-855 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400 transition-all placeholder-slate-655"
                      value={exercise.name}
                      onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                    />
                  </div>

                  {/* Sets, Reps, Weight row */}
                  <div className="grid grid-cols-3 gap-2 md:col-span-2">
                    <div className="space-y-1.5">
                      <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider text-center">Sets</label>
                      <input
                        type="number"
                        min="1"
                        required
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-855 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400 transition-all text-center font-bold"
                        value={exercise.sets}
                        onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider text-center">Reps</label>
                      <input
                        type="number"
                        min="1"
                        required
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-855 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400 transition-all text-center font-bold"
                        value={exercise.reps}
                        onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xxs font-bold text-slate-500 uppercase tracking-wider text-center">Weight (kg)</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        required
                        className="w-full px-3 py-2.5 bg-slate-950 border border-slate-855 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400 transition-all text-center font-bold"
                        value={exercise.weight}
                        onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Action */}
          <div className="flex justify-end gap-3 border-t border-slate-900 pt-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 border border-slate-900 bg-slate-900/30 hover:border-slate-800 text-slate-400 hover:text-white rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider text-slate-950 bg-lime-400 hover:bg-lime-300 transition-colors disabled:opacity-50 min-w-32 cursor-pointer shadow-lg shadow-lime-400/10"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Session</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateWorkout;
