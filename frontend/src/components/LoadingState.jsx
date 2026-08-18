const LoadingState = ({ message = "Loading data..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-900/20 backdrop-blur border border-slate-900 rounded-2xl">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-lime-400 mb-4"></div>
      <p className="text-slate-500 text-xxs font-bold uppercase tracking-wider">{message}</p>
    </div>
  );
};

export default LoadingState;
