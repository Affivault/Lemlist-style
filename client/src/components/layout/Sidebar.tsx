import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Send,
  Mail,
  BarChart3,
  Inbox,
  Settings,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { SkySendLogoMark } from '../SkySendLogo';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Campaigns', href: '/campaigns', icon: Send },
  { name: 'Inbox', href: '/inbox', icon: Inbox },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'SMTP Accounts', href: '/smtp-accounts', icon: Mail },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-primary-500 to-cyan-500 shadow-glow">
          <SkySendLogoMark className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          SkySend
        </span>
      </div>

      {/* Upgrade Banner */}
      <div className="mx-4 mb-4 mt-2 rounded-xl bg-gradient-to-r from-indigo-600/20 to-cyan-600/20 border border-indigo-500/20 p-3">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <span className="text-sm font-semibold text-white">Pro Features</span>
        </div>
        <p className="text-xs text-slate-400 mb-2">Unlock unlimited campaigns and advanced analytics</p>
        <button className="w-full py-1.5 px-3 text-xs font-medium rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:from-indigo-400 hover:to-cyan-400 transition-all duration-200 shadow-sm">
          Upgrade Now
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Main Menu
        </p>
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/dashboard'}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/30 to-indigo-600/10 text-white shadow-sm border border-indigo-500/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'bg-slate-800/50 text-slate-400 group-hover:bg-slate-700/50 group-hover:text-white'
                  )}
                >
                  <item.icon className="h-4.5 w-4.5" />
                </div>
                <span>{item.name}</span>
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-glow" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800/50 p-3 space-y-1">
        <NavLink
          to="/smtp-accounts/guide"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/50">
            <HelpCircle className="h-4.5 w-4.5" />
          </div>
          SMTP Guide
        </NavLink>
        <NavLink
          to="/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/50">
            <Settings className="h-4.5 w-4.5" />
          </div>
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
