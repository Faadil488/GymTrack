import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, ShieldAlert, Activity, Award, Flame } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password || !passwordConfirm) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await register(username, email, password, passwordConfirm);
    setLoading(false);

    if (result.success) {
      navigate('/login', { state: { registered: true } });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex text-white relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-lime-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Left side: Premium Fitness Landing Screen (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-3/5 bg-slate-950/80 border-r border-slate-900 flex-col justify-between p-12 relative z-10">
        {/* Brand header */}
        <div className="flex items-center gap-2 group cursor-pointer w-fit">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-lime-400 text-slate-950 font-black">
            <Dumbbell className="h-5.5 w-5.5" />
          </div>
          <span className="font-black tracking-tight text-xl uppercase">
            Gym<span className="text-lime-400">Track</span>
          </span>
        </div>

        {/* Hero Marketing Section */}
        <div className="max-w-xl my-auto space-y-6">
          <div className="space-y-2">
            <span className="text-lime-400 text-xs font-black tracking-widest uppercase block">Personal Gym Logger</span>
            <h1 className="text-5xl font-black tracking-tight leading-[1.05] uppercase">
              Sculpt Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-400">Body</span>,<br />
              Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-450 to-lime-300">Spirit</span>.
            </h1>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
            GymTrack is a modern, private workspace designed to archive your lift logs and turn them into actionable progress insights. Simple to log, premium to track.
          </p>

          {/* Bullet metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-900">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-lime-400">
                <Activity className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-wider">Dynamic Logs</span>
              </div>
              <p className="text-slate-455 text-xxs">Record reps, sets, and weights inside a single transaction flow.</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-lime-400">
                <Award className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-wider">Personal Records</span>
              </div>
              <p className="text-slate-455 text-xxs">Tracks heaviest weight per exercise and updates your peaks on-the-fly.</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-lime-400">
                <Flame className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-wider">Workout Streaks</span>
              </div>
              <p className="text-slate-455 text-xxs">Analyzes logs consecutively to calculate training streaks.</p>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <div className="flex items-center border-t border-slate-900/60 pt-6">
          <span className="text-slate-500 text-xxs font-black uppercase tracking-widest block">Trusted By Athletes</span>
        </div>
      </div>

      {/* Right side: Register Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-900 rounded-3xl p-8 shadow-2xl flex flex-col space-y-5">
          {/* Logo displays on mobile header */}
          <div className="flex lg:hidden flex-col items-center mb-1">
            <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-lime-400 text-slate-950 font-black mb-3">
              <Dumbbell className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight">
              Gym<span className="text-lime-450">Track</span>
            </h2>
          </div>

          <div className="space-y-1 text-center lg:text-left">
            <h2 className="text-2xl font-black uppercase tracking-wide">Register Account</h2>
            <p className="text-slate-400 text-xs font-semibold">Join GymTrack to start archiving your lifts</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="username" className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">
                  Username *
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-855 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400 text-sm transition-all"
                  placeholder="Choose username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">
                  Email (Optional)
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-855 rounded-xl text-white placeholder-slate-655 focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400 text-sm transition-all"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-855 rounded-xl text-white placeholder-slate-655 focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400 text-sm transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="passwordConfirm" className="block text-xxs font-bold text-slate-400 uppercase tracking-wider">
                  Confirm Password *
                </label>
                <input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type="password"
                  required
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-855 rounded-xl text-white placeholder-slate-655 focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400 text-sm transition-all"
                  placeholder="••••••••"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black rounded-full uppercase tracking-wider text-xs active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-lime-400/10 flex justify-center items-center"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'CREATE ATHLETE PROFILE'
              )}
            </button>
          </form>

          <div className="text-center border-t border-slate-855 pt-4">
            <p className="text-xs text-slate-450 font-medium">
              Already registered?{' '}
              <Link to="/login" className="font-bold text-lime-450 hover:text-lime-300 transition-colors uppercase tracking-wider">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
