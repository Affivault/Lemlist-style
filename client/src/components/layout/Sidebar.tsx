import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Inbox,
  BarChart3,
  Settings,
  Bot,
  Layers,
  Webhook,
  Send,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { SkySendLogo, SkySendLogoMark } from '../SkySendLogo';

const mainNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Inbox', href: '/inbox', icon: Inbox },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

const toolsNav = [
  { name: 'SARA AI', href: '/sara', icon: Bot },
  { name: 'Webhooks', href: '/developer', icon: Webhook },
];

const settingsNav = [
  { name: 'SMTP Accounts', href: '/smtp-accounts', icon: Send },
  { name: 'Assets', href: '/assets', icon: Layers },
  { name: 'Settings', href: '/settings', icon: Settings },
];

function NavItem({
  item,
  isActive,
  collapsed,
}: {
  item: { name: string; href: string; icon: React.ElementType };
  isActive: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.href}
      title={collapsed ? item.name : undefined}
      className={cn(
        'flex items-center gap-3 py-2 text-[13px] font-medium rounded-lg transition-colors duration-150',
        collapsed ? 'justify-center px-2' : 'px-3',
        isActive
          ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
      )}
    >
      <Icon className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={1.5} />
      {!collapsed && <span>{item.name}</span>}
    </NavLink>
  );
}

function NavSection({
  title,
  items,
  collapsed,
}: {
  title?: string;
  items: Array<{ name: string; href: string; icon: React.ElementType }>;
  collapsed: boolean;
}) {
  const location = useLocation();

  return (
    <div className="mb-6">
      {title && !collapsed && (
        <div className="px-3 mb-2">
          <span className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-widest">
            {title}
          </span>
        </div>
      )}
      {title && collapsed && (
        <div className="mb-2 mx-auto w-4 h-px bg-[var(--border-subtle)]" />
      )}
      <div className="space-y-0.5">
        {items.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={location.pathname === item.href || location.pathname.startsWith(item.href + '/')}
            collapsed={collapsed}
          />
        ))}
      </div>
    </div>
  );
}

export function Sidebar() {
  const { user, signOut: logout } = useAuth();
  const { collapsed, toggle } = useSidebar();
  const workspaceName = user?.email?.split('@')[0] || 'Workspace';

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] transition-[width] duration-200',
        collapsed ? 'w-[64px]' : 'w-[260px]'
      )}
    >
      {/* Logo + collapse toggle */}
      <div className={cn(
        'flex items-center h-14 border-b border-[var(--border-subtle)]',
        collapsed ? 'justify-center px-2' : 'justify-between px-4'
      )}>
        <div className="flex items-center gap-2.5 overflow-hidden">
          {collapsed ? (
            <SkySendLogoMark className="h-7 w-7 flex-shrink-0" />
          ) : (
            <span className="text-[17px]"><SkySendLogo /></span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={toggle}
            className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="flex justify-center py-2">
          <button
            onClick={toggle}
            className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn('flex-1 py-3 overflow-y-auto', collapsed ? 'px-2' : 'px-3')}>
        <NavSection items={mainNav} collapsed={collapsed} />
        <NavSection title="Tools" items={toolsNav} collapsed={collapsed} />
        <NavSection title="Configure" items={settingsNav} collapsed={collapsed} />
      </nav>

      {/* User section */}
      <div className="border-t border-[var(--border-subtle)] p-2">
        <div className={cn(
          'flex items-center gap-3 py-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer group',
          collapsed ? 'justify-center px-1' : 'px-3'
        )}>
          <div className="h-7 w-7 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-semibold text-[var(--text-primary)]">
              {workspaceName[0].toUpperCase()}
            </span>
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {workspaceName}
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)] truncate">
                  {user?.email}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                }}
                className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] opacity-0 group-hover:opacity-100 transition-all"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
