import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LogOut,
  User,
  Search,
  ChevronDown,
  Sun,
  Moon,
  Plus,
  Sparkles,
  HelpCircle,
  Command,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

// Map routes to display names and icons
const routeConfig: Record<string, { name: string; icon?: React.ElementType }> = {
  '/dashboard': { name: 'Dashboard' },
  '/campaigns': { name: 'Campaigns' },
  '/campaigns/new': { name: 'New Campaign' },
  '/contacts': { name: 'Contacts' },
  '/inbox': { name: 'Inbox' },
  '/analytics': { name: 'Analytics' },
  '/sara': { name: 'SARA AI' },
  '/sse': { name: 'Smart Email' },
  '/assets': { name: 'Assets' },
  '/developer': { name: 'Developer' },
  '/settings': { name: 'Settings' },
  '/smtp-accounts': { name: 'SMTP Accounts' },
  '/smtp-accounts/guide': { name: 'Setup Guide' },
};

export function Header() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Get current page name
  const currentPath = location.pathname;
  const pageConfig = routeConfig[currentPath] || { name: 'Page' };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-subtle bg-app px-6">
      {/* Left side - Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-[13px] text-secondary">
          <span className="font-medium text-primary">{pageConfig.name}</span>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2">
        {/* Search button - Render style */}
        <button className="flex items-center gap-2 h-8 px-3 text-[13px] text-tertiary border border-subtle rounded-md hover:border-default hover:text-secondary transition-colors">
          <Search className="h-3.5 w-3.5" />
          <span>Search</span>
          <div className="flex items-center gap-0.5 ml-2 text-[11px] text-tertiary">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        </button>

        {/* New button - Render style */}
        <button
          onClick={() => navigate('/campaigns/new')}
          className="flex items-center gap-1.5 h-8 px-3 text-[13px] font-medium border border-subtle rounded-md hover:bg-hover transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New</span>
        </button>

        {/* Upgrade button - Render style */}
        <button className="flex items-center gap-1.5 h-8 px-3 text-[13px] font-medium border border-subtle rounded-md hover:bg-hover transition-colors">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Upgrade</span>
        </button>

        {/* Help */}
        <button className="flex h-8 w-8 items-center justify-center rounded-md text-tertiary hover:text-secondary hover:bg-hover transition-colors">
          <HelpCircle className="h-4 w-4" strokeWidth={1.75} />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-md text-tertiary hover:text-secondary hover:bg-hover transition-colors"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <Sun className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>

        {/* User avatar - Render style */}
        <div className="relative ml-1">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 border border-subtle text-[13px] font-medium text-primary hover:border-default transition-colors"
          >
            {user?.email?.[0].toUpperCase() || 'U'}
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-md border border-subtle bg-app py-1 shadow-lg animate-fade-in">
                <div className="px-3 py-2.5 border-b border-subtle">
                  <p className="text-[13px] font-medium text-primary">{user?.email?.split('@')[0]}</p>
                  <p className="text-[12px] text-tertiary truncate mt-0.5">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    signOut();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-secondary hover:text-primary hover:bg-hover transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
