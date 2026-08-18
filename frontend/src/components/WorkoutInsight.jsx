import { Lightbulb, Flame, Award, Hash, Zap } from 'lucide-react';
import { formatDateShort, calculateWorkoutStreak } from '../utils/workoutCalculations';

const WorkoutInsight = ({ workouts }) => {
  if (!workouts || workouts.length === 0) {
    return (
      <div className="bg-slate-900/30 backdrop-blur-md border border-slate-900 rounded-2xl p-6 text-center shadow-lg">
        <div className="flex items-center gap-2 mb-3 justify-center sm:justify-start">
          <Lightbulb className="h-5 w-5 text-lime-400" />
          <h3 className="font-black text-white text-base uppercase tracking-wider">Workout Insight</h3>
        </div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
          Complete a workout to view insights.
        </p>
      </div>
    );
  }

  // Get the most recent workout
  const latestWorkout = workouts[0];
  const previousWorkouts = workouts.slice(1);

  const exercises = latestWorkout.exercises || [];
  const exerciseCount = exercises.length;
  
  const totalSets = exercises.reduce((acc, curr) => acc + (parseInt(curr.sets) || 0), 0);
  const totalReps = exercises.reduce((acc, curr) => acc + ((parseInt(curr.sets) || 0) * (parseInt(curr.reps) || 0)), 0);

  // Find heaviest lift in latest workout
  let strongestLift = null;
  exercises.forEach(ex => {
    const wt = parseFloat(ex.weight) || 0;
    if (!strongestLift || wt > strongestLift.weight) {
      strongestLift = { name: ex.name, weight: wt, reps: ex.reps };
    }
  });

  // Calculate if there are any new Personal Records in this workout
  const newPRs = [];
  exercises.forEach(ex => {
    const nameClean = ex.name.toLowerCase().trim();
    const currentWeight = parseFloat(ex.weight) || 0;

    let maxPreviousWeight = 0;
    previousWorkouts.forEach(pw => {
      pw.exercises?.forEach(pex => {
        if (pex.name.toLowerCase().trim() === nameClean) {
          const pwt = parseFloat(pex.weight) || 0;
          if (pwt > maxPreviousWeight) {
            maxPreviousWeight = pwt;
          }
        }
      });
    });

    if (currentWeight > 0 && (maxPreviousWeight === 0 || currentWeight > maxPreviousWeight)) {
      newPRs.push({ name: ex.name, weight: currentWeight, reps: ex.reps });
    }
  });

  const streak = calculateWorkoutStreak(workouts);

  return (
    <div className="bg-slate-900/30 backdrop-blur-md border border-slate-900 rounded-2xl p-6 shadow-lg relative overflow-hidden">
      {/* Accent color glow in top-right */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-lime-500/5 rounded-full blur-xl pointer-events-none"></div>

      <div className="flex items-center gap-2 mb-6 justify-between border-b border-slate-900 pb-3 relative z-10">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-lime-400" />
          <h3 className="font-black text-white text-base uppercase tracking-wider">Latest Workout Insight</h3>
        </div>
        <span className="text-xxs bg-slate-950 border border-slate-900 text-slate-400 py-1 px-3 rounded-full font-bold uppercase tracking-wider">
          Completed {formatDateShort(latestWorkout.date)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {/* Quick Stats list */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950/40 border border-slate-900/60 p-4 rounded-xl flex flex-col justify-between">
            <span className="text-slate-500 text-xxs font-bold uppercase tracking-wider block">Logged Exercises</span>
            <span className="text-xl font-black text-white mt-1">{exerciseCount}</span>
          </div>
          <div className="bg-slate-950/40 border border-slate-900/60 p-4 rounded-xl flex flex-col justify-between">
            <span className="text-slate-500 text-xxs font-bold uppercase tracking-wider block">Total Sets (Reps)</span>
            <span className="text-xl font-black text-white mt-1">
              {totalSets} <span className="text-xs text-slate-500">({totalReps})</span>
            </span>
          </div>
          {strongestLift && (
            <div className="col-span-2 bg-slate-950/40 border border-slate-900/60 p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-slate-500 text-xxs font-bold uppercase tracking-wider block">Strongest Lift</span>
                <span className="text-sm font-bold text-white mt-0.5 block">{strongestLift.name}</span>
              </div>
              <span className="text-lime-400 font-black text-lg">
                {strongestLift.weight} <span className="text-xxs text-slate-500 uppercase font-semibold">kg</span>
              </span>
            </div>
          )}
        </div>

        {/* Highlight Insights */}
        <div className="flex flex-col justify-center bg-lime-450/[0.02] p-5 rounded-xl border border-lime-400/10">
          {newPRs.length > 0 ? (
            <div className="space-y-2">
              <span className="text-xxs text-lime-450 font-black uppercase tracking-wider block">🎉 New Personal Record!</span>
              {newPRs.map((pr, idx) => (
                <p key={idx} className="text-sm text-white font-bold leading-tight">
                  {pr.name} &mdash; <span className="text-lime-400 font-black">{pr.weight} kg</span> &times; {pr.reps} reps
                </p>
              ))}
            </div>
          ) : strongestLift ? (
            <div className="space-y-1.5">
              <span className="text-xxs text-lime-400 font-black uppercase tracking-wider block">💡 Athlete Tip</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                You pushed hard on <span className="text-white font-bold">{strongestLift.name}</span>. Add 2.5 kg on your next workout to keep progression active!
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Great effort on your workout session today!</p>
          )}

          {streak > 0 && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-900 text-xs text-lime-400 font-black uppercase tracking-wider">
              <Flame className="h-4.5 w-4.5 fill-lime-400 text-lime-400 animate-pulse" />
              <span>{streak} DAY TRAINING STREAK ACTIVE!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkoutInsight;
