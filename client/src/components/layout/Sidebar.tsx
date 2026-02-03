import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Inbox,
  BarChart3,
  Settings,
  Sparkles,
  HelpCircle,
  Shield,
  Bot,
  Layers,
  Code2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { SkySendLogoMark } from '../SkySendLogo';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Inbox', href: '/inbox', icon: Inbox },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'SARA', href: '/sara', icon: Bot },
  { name: 'SSE', href: '/sse', icon: Shield },
  { name: 'Assets', href: '/assets', icon: Layers },
  { name: 'Developer', href: '/developer', icon: Code2 },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-[#0c0c14] border-r border-slate-800/40">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-400">
          <SkySendLogoMark className="h-4 w-4 text-white" />
        </div>
        <span className="text-[15px] font-semibold text-white tracking-tight">
          SkySend
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-2 pb-4 overflow-y-auto space-y-0.5">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/dashboard'}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-md px-3 py-[7px] text-[13px] font-medium transition-colors duration-150',
                isActive
                  ? 'bg-slate-800/50 text-white border-l-2 border-indigo-500 pl-[10px]'
                  : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200 border-l-2 border-transparent pl-[10px]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'h-[18px] w-[18px] flex-shrink-0 transition-colors duration-150',
                    isActive
                      ? 'text-indigo-400'
                      : 'text-slate-500 group-hover:text-slate-300'
                  )}
                  strokeWidth={isActive ? 2 : 1.75}
                />
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Pro Upgrade Banner */}
      <div className="mx-3 mb-3">
        <div className="rounded-lg bg-slate-900/80 border border-slate-800/60 p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-xs font-medium text-slate-200">Pro Features</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500 mb-2.5">
            Unlock unlimited campaigns and advanced analytics
          </p>
          <button className="w-full py-1.5 px-3 text-[11px] font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition-colors duration-150">
            Upgrade Now
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800/40 px-3 py-2 space-y-0.5">
        <NavLink
          to="/smtp-accounts/guide"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-[7px] text-[13px] font-medium transition-colors duration-150',
              isActive
                ? 'text-slate-200'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
            )
          }
        >
          <HelpCircle className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={1.75} />
          SMTP Guide
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-[7px] text-[13px] font-medium transition-colors duration-150',
              isActive
                ? 'text-slate-200'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
            )
          }
        >
          <Settings className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={1.75} />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
