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
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6">
      {/* Search */}
      <div className="flex items-center gap-3 flex-1">
        <div className="relative flex items-center h-9 w-64 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)]">
          <Search className="h-4 w-4 text-[var(--text-tertiary)] ml-3" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-full bg-transparent px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none"
          />
          <div className="flex items-center gap-0.5 mr-2 px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] text-xs text-[var(--text-tertiary)]">
            <span>⌘K</span>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
          <Bell className="h-4 w-4" strokeWidth={1.5} />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <Sun className="h-4 w-4" strokeWidth={1.5} />
          )}
        </button>

        {/* User menu */}
        <div className="relative ml-2">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-md hover:bg-[var(--bg-hover)] transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-xs font-medium text-[var(--text-primary)]">
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
            <ChevronDown className={cn(
              "h-3.5 w-3.5 text-[var(--text-tertiary)] transition-transform",
              menuOpen && "rotate-180"
            )} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1 shadow-lg">
                <div className="px-3 py-2 border-b border-[var(--border-subtle)] mb-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] truncate">
                    {user?.email}
                  </p>
                </div>

                <button
                  onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>

                <button
                  onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>

                <div className="border-t border-[var(--border-subtle)] mt-1 pt-1">
                  <button
                    onClick={() => { setMenuOpen(false); signOut(); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[var(--error)] hover:bg-[var(--error-bg)] transition-colors"
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
