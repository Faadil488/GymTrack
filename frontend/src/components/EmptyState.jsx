import { Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({ 
  title = "No Workouts Yet", 
  message = "Ready to hit the gym? Start logging your workouts to see insights.",
  actionText = "Log First Workout",
  actionPath = "/workouts/new"
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-900/20 backdrop-blur border border-slate-900 rounded-2xl relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-lime-500/1 rounded-full blur-xl pointer-events-none"></div>

      <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-slate-950 border border-slate-900 text-lime-400 mb-6 relative z-10">
        <Dumbbell className="h-7 w-7 animate-pulse" />
      </div>
      <h3 className="text-lg font-black uppercase tracking-wider text-white mb-2 relative z-10">{title}</h3>
      <p className="text-slate-450 text-xs font-semibold uppercase tracking-wide max-w-sm mb-6 relative z-10 leading-relaxed">{message}</p>
      {actionText && actionPath && (
        <Link
          to={actionPath}
          className="inline-flex items-center justify-center px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider text-slate-950 bg-lime-400 hover:bg-lime-300 transition-colors relative z-10 cursor-pointer shadow-lg shadow-lime-400/10"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
