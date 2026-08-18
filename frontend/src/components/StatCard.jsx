const StatCard = ({ title, value, unit = "", icon: Icon, description = "" }) => {
  return (
    <div className="bg-slate-900/30 backdrop-blur-md border border-slate-900 hover:border-slate-800 hover:shadow-[0_0_30px_rgba(163,230,53,0.02)] transition-all duration-300 rounded-2xl p-6 flex items-start justify-between">
      <div className="space-y-1">
        <span className="text-slate-500 text-xxs font-black tracking-widest uppercase block">{title}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-white tracking-tight leading-none">{value}</span>
          {unit && <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{unit}</span>}
        </div>
        {description && <p className="text-slate-500 text-xxs mt-2 font-medium">{description}</p>}
      </div>
      
      {Icon && (
        <div className="flex items-center justify-center p-3 rounded-xl bg-lime-450/5 border border-lime-450/10 text-lime-400">
          <Icon className="h-5.5 w-5.5" />
        </div>
      )}
    </div>
  );
};

export default StatCard;
