import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Search,
  Sun,
  Moon,
  Bell,
  Settings,
  User,
  ChevronDown,
  Command,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

export function Header() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-xl px-8">
      {/* Search */}
      <div className="flex items-center gap-3 flex-1">
        <div className="relative flex items-center h-9 w-72 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 hover:border-[var(--border-default)] transition-colors">
          <Search className="h-4 w-4 text-[var(--text-tertiary)] ml-3" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-full bg-transparent px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none"
          />
          <div className="flex items-center gap-0.5 mr-2.5 px-1.5 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-tertiary)] font-medium">
            <Command className="h-2.5 w-2.5" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1.5">
        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-200">
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--brand)] ring-2 ring-[var(--bg-surface)]" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-200"
        >
          {theme === 'light' ? (
            <Moon className="h-[18px] w-[18px]" strokeWidth={1.5} />
          ) : (
            <Sun className="h-[18px] w-[18px]" strokeWidth={1.5} />
          )}
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-[var(--border-subtle)] mx-1.5" />

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 h-9 pl-1.5 pr-2.5 rounded-lg hover:bg-[var(--bg-hover)] transition-all duration-200"
          >
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-[11px] font-semibold text-white shadow-sm">
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
            <ChevronDown className={cn(
              "h-3.5 w-3.5 text-[var(--text-tertiary)] transition-transform duration-200",
              menuOpen && "rotate-180"
            )} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1.5 shadow-xl animate-slide-up">
                <div className="px-3 py-2.5 border-b border-[var(--border-subtle)] mb-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>

                <button
                  onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>

                <button
                  onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>

                <div className="border-t border-[var(--border-subtle)] mt-1 pt-1">
                  <button
                    onClick={() => { setMenuOpen(false); signOut(); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--error)] hover:bg-[var(--error-bg)] transition-colors"
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
