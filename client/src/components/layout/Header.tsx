import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LogOut,
  Search,
  Sun,
  Moon,
  Plus,
  Bell,
  Command,
  Settings,
  User,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

// Route configuration
const routeConfig: Record<string, { name: string; description?: string }> = {
  '/dashboard': { name: 'Dashboard', description: 'Overview of your outreach performance' },
  '/campaigns': { name: 'Campaigns', description: 'Manage your email sequences' },
  '/campaigns/new': { name: 'New Campaign', description: 'Create a new email sequence' },
  '/contacts': { name: 'Contacts', description: 'Manage your contact lists' },
  '/inbox': { name: 'Inbox', description: 'View and respond to replies' },
  '/analytics': { name: 'Analytics', description: 'Track your campaign performance' },
  '/sara': { name: 'SARA AI', description: 'AI-powered email assistant' },
  '/sse': { name: 'Smart Email', description: 'Intelligent email optimization' },
  '/assets': { name: 'Assets', description: 'Manage your media files' },
  '/developer': { name: 'Developer', description: 'API and webhooks' },
  '/settings': { name: 'Settings', description: 'Configure your account' },
  '/smtp-accounts': { name: 'SMTP Accounts', description: 'Manage email senders' },
  '/smtp-accounts/guide': { name: 'Setup Guide', description: 'SMTP configuration guide' },
};

export function Header() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;
  const pageConfig = routeConfig[currentPath] || { name: 'Page' };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-subtle bg-app/80 backdrop-blur-xl px-6">
      {/* Left side - Page title */}
      <div>
        <h1 className="text-lg font-semibold text-primary">{pageConfig.name}</h1>
        {pageConfig.description && (
          <p className="text-[12px] text-tertiary">{pageConfig.description}</p>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className={cn(
          "relative flex items-center h-9 rounded-lg border transition-all duration-200",
          searchFocused
            ? "border-violet-500/50 bg-surface ring-2 ring-violet-500/20"
            : "border-subtle bg-surface/50 hover:border-default"
        )}>
          <Search className="h-4 w-4 text-tertiary ml-3" />
          <input
            type="text"
            placeholder="Search..."
            className="w-48 h-full bg-transparent px-3 text-[13px] text-primary placeholder:text-tertiary focus:outline-none"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <div className="flex items-center gap-0.5 mr-3 px-1.5 py-0.5 rounded bg-elevated text-[10px] text-tertiary font-medium">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        </div>

        {/* Create button */}
        <button
          onClick={() => navigate('/campaigns/new')}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 text-white text-[13px] font-medium transition-all hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create</span>
        </button>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-subtle bg-surface/50 text-secondary hover:text-primary hover:border-default transition-colors">
          <Bell className="h-4 w-4" strokeWidth={1.75} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-violet-500" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-subtle bg-surface/50 text-secondary hover:text-primary hover:border-default transition-colors"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <Sun className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-lg border border-subtle bg-surface/50 hover:border-default transition-colors"
          >
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/30 flex items-center justify-center text-[11px] font-semibold text-violet-400">
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
            <ChevronDown className={cn(
              "h-3.5 w-3.5 text-tertiary transition-transform",
              menuOpen && "rotate-180"
            )} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-subtle bg-surface p-1.5 shadow-lg animate-fade-in">
                <div className="px-3 py-2.5 border-b border-subtle mb-1.5">
                  <p className="text-[13px] font-medium text-primary">{user?.email?.split('@')[0]}</p>
                  <p className="text-[11px] text-tertiary truncate mt-0.5">{user?.email}</p>
                </div>

                <button
                  onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-secondary hover:text-primary hover:bg-hover transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>

                <button
                  onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-secondary hover:text-primary hover:bg-hover transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>

                <div className="border-t border-subtle mt-1.5 pt-1.5">
                  <button
                    onClick={() => { setMenuOpen(false); signOut(); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-red-400 hover:bg-red-500/10 transition-colors"
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
