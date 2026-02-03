import { useState } from 'react';
import { LogOut, User, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Header() {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-subtle bg-app px-6">
      {/* Search */}
      <div className="flex items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tertiary" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-64 rounded-md border border-subtle bg-transparent pl-10 pr-4 text-sm text-white placeholder:text-tertiary focus:border-default focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-secondary hover:text-white transition-colors"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-secondary">
            <User className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline text-[13px]">
            {user?.email?.split('@')[0]}
          </span>
          <ChevronDown className={`h-4 w-4 text-tertiary transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 mt-2 w-56 rounded-md border border-subtle bg-surface py-1 shadow-lg animate-fade-in">
              <div className="px-3 py-2 border-b border-subtle">
                <p className="text-sm font-medium text-white">{user?.email?.split('@')[0]}</p>
                <p className="text-xs text-tertiary truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-secondary hover:text-white hover:bg-hover transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
