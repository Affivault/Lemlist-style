import { useState } from 'react';
import { LogOut, User, Search, Bell, ChevronDown, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Header() {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800/50 bg-surface-600/80 backdrop-blur-xl px-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search campaigns, contacts..."
            className="h-10 w-64 rounded-xl border border-slate-700 bg-slate-800 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 bg-slate-700/60 border border-slate-600/50 rounded">
            <span>⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        {/* Usage indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
          <Zap className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-medium text-slate-400">
            850 / 1,000 emails
          </span>
        </div>

        {/* Notifications */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/50 bg-slate-800/40 text-slate-400 hover:bg-slate-700/50 hover:text-white transition-all duration-200">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">
            3
          </span>
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-800/40 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700/50 hover:text-white hover:border-slate-600 transition-all duration-200"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-sm shadow-indigo-500/20">
              <User className="h-4 w-4" />
            </div>
            <span className="hidden sm:inline max-w-[120px] truncate">{user?.email?.split('@')[0]}</span>
            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-surface-50 p-2 shadow-xl shadow-black/30 animate-fade-in">
                <div className="px-3 py-3 mb-1 rounded-lg bg-slate-800/50">
                  <p className="text-sm font-semibold text-white">{user?.email?.split('@')[0]}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <div className="border-t border-slate-800 pt-1">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      signOut();
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
