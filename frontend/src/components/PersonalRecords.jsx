import { Trophy } from 'lucide-react';
import { formatDateShort } from '../utils/workoutCalculations';

const PersonalRecords = ({ records }) => {
  if (!records || records.length === 0) {
    return (
      <div className="bg-slate-900/30 backdrop-blur-md border border-slate-900 rounded-2xl p-6 text-center">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
          Complete a session to log records.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/30 backdrop-blur-md border border-slate-900 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-lime-400" />
        <h3 className="font-black text-white text-base uppercase tracking-wider">Personal Records</h3>
      </div>
      
      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
        {records.map((rec, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3.5 bg-slate-950/40 rounded-xl border border-slate-900/60 hover:border-slate-850 transition-all"
          >
            <div>
              <span className="font-bold text-white block text-sm">{rec.name}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Logged {formatDateShort(rec.date)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-lime-400 font-black text-base">
                {rec.weight} <span className="text-xxs font-bold text-slate-500 uppercase">kg</span>
              </span>
              <span className="block text-xxs font-bold text-slate-500 uppercase tracking-wider">{rec.reps} reps</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonalRecords;
