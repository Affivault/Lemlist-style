import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Inbox,
  BarChart3,
  Settings,
  HelpCircle,
  Shield,
  Bot,
  Layers,
  Code2,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Inbox', href: '/inbox', icon: Inbox },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

const tools = [
  { name: 'SARA', href: '/sara', icon: Bot },
  { name: 'SSE', href: '/sse', icon: Shield },
  { name: 'Assets', href: '/assets', icon: Layers },
  { name: 'Developer', href: '/developer', icon: Code2 },
];

const footer = [
  { name: 'SMTP Guide', href: '/smtp-accounts/guide', icon: HelpCircle },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-app border-r border-subtle">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 px-5">
        <div className="h-2 w-2 rounded-full bg-brand" />
        <span className="text-[15px] font-medium text-primary">SkySend</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-4 pb-4 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/dashboard'}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors',
                  isActive
                    ? 'text-primary bg-active border-l-2 border-brand ml-0 pl-[10px]'
                    : 'text-secondary hover:text-primary hover:bg-hover border-l-2 border-transparent ml-0 pl-[10px]'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'h-4 w-4 flex-shrink-0 transition-colors',
                      isActive ? 'text-primary' : 'text-secondary group-hover:text-primary'
                    )}
                    strokeWidth={1.5}
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Tools section */}
        <div className="mt-8">
          <p className="px-3 mb-2 text-[11px] font-medium text-tertiary uppercase tracking-wider">
            Tools
          </p>
          <div className="space-y-1">
            {tools.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors',
                    isActive
                      ? 'text-primary bg-active border-l-2 border-brand ml-0 pl-[10px]'
                      : 'text-secondary hover:text-primary hover:bg-hover border-l-2 border-transparent ml-0 pl-[10px]'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={cn(
                        'h-4 w-4 flex-shrink-0 transition-colors',
                        isActive ? 'text-primary' : 'text-secondary group-hover:text-primary'
                      )}
                      strokeWidth={1.5}
                    />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-subtle px-3 py-3 space-y-1">
        {footer.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors',
                isActive
                  ? 'text-secondary'
                  : 'text-tertiary hover:text-secondary'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'h-4 w-4 flex-shrink-0 transition-colors',
                    isActive ? 'text-secondary' : 'text-tertiary group-hover:text-secondary'
                  )}
                  strokeWidth={1.5}
                />
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
