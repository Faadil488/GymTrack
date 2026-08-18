import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, LayoutDashboard, History, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-black/80 backdrop-blur-md border-b border-slate-900 text-white sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-lime-400 text-slate-950 font-black transition-transform group-hover:scale-105">
              <Dumbbell className="h-5 w-5" />
            </div>
            <span className="font-black tracking-tight text-lg sm:text-xl uppercase">
              Gym<span className="text-lime-450">Track</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden sm:flex items-center gap-4">
            <Link
              to="/dashboard"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                isActive('/dashboard')
                  ? 'bg-slate-900 text-lime-400 border border-slate-800/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/workouts"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                isActive('/workouts') || isActive('/workouts/new') || location.pathname.startsWith('/workouts/')
                  ? 'bg-slate-900 text-lime-400 border border-slate-800/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="h-4 w-4" />
              Workouts
            </Link>
          </div>

          {/* User & Logout */}
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-xs text-slate-400 font-bold uppercase tracking-wider">
              Athlete: <span className="text-lime-400 font-black">{user?.username}</span>
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="sm:hidden flex items-center justify-around py-2 border-t border-slate-950">
          <Link
            to="/dashboard"
            className={`flex flex-col items-center gap-1 py-1 px-3 text-xxs font-black uppercase tracking-wider transition-colors ${
              isActive('/dashboard') ? 'text-lime-400' : 'text-slate-450'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            to="/workouts"
            className={`flex flex-col items-center gap-1 py-1 px-3 text-xxs font-black uppercase tracking-wider transition-colors ${
              isActive('/workouts') || isActive('/workouts/new') || location.pathname.startsWith('/workouts/')
                ? 'text-lime-400' : 'text-slate-450'
            }`}
          >
            <History className="h-4 w-4" />
            Workouts
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
