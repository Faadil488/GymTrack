import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, Dumbbell } from 'lucide-react';
import { formatDateDisplay } from '../utils/workoutCalculations';

const WorkoutCard = ({ workout }) => {
  const { id, date, exercises = [] } = workout;
  
  const exerciseSummary = exercises.map(ex => ex.name);
  const exercisePreview = exerciseSummary.slice(0, 3).join(', ');
  const remainingCount = exerciseSummary.length - 3;

  return (
    <div className="bg-slate-900/30 backdrop-blur-md border border-slate-900 hover:border-slate-800 hover:shadow-[0_0_30px_rgba(163,230,53,0.02)] transition-all duration-300 rounded-2xl p-5 flex items-center justify-between group">
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Calendar className="h-4 w-4 text-lime-400" />
          <span className="text-xxs font-black uppercase tracking-wider">
            {formatDateDisplay(date, { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-white font-black text-sm uppercase tracking-wide">
            <Dumbbell className="h-4 w-4 text-slate-500" />
            <span>{exercises.length} {exercises.length === 1 ? 'Exercise' : 'Exercises'}</span>
          </div>
          {exercises.length > 0 ? (
            <p className="text-xs text-slate-400 font-medium">
              {exercisePreview}
              {remainingCount > 0 && ` +${remainingCount} more`}
            </p>
          ) : (
            <p className="text-xxs text-slate-600 font-bold uppercase tracking-widest italic">No movements logged.</p>
          )}
        </div>
      </div>

      <Link
        to={`/workouts/${id}`}
        className="flex items-center justify-center h-9 w-9 rounded-xl bg-slate-950 border border-slate-900 text-slate-400 group-hover:bg-lime-400 group-hover:text-slate-950 group-hover:border-transparent transition-all duration-300"
      >
        <ChevronRight className="h-4.5 w-4.5" />
      </Link>
    </div>
  );
};

export default WorkoutCard;
