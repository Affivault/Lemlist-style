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
  Sparkles,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

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
}: {
  item: { name: string; href: string; icon: React.ElementType };
  isActive: boolean;
}) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 text-[13px] font-medium rounded-lg transition-all duration-200',
        isActive
          ? 'bg-[var(--brand-subtle)] text-[var(--brand)] shadow-sm'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
      )}
    >
      <Icon className={cn('h-[18px] w-[18px]', isActive ? 'text-[var(--brand)]' : '')} strokeWidth={1.5} />
      <span>{item.name}</span>
    </NavLink>
  );
}

function NavSection({
  title,
  items,
}: {
  title?: string;
  items: Array<{ name: string; href: string; icon: React.ElementType }>;
}) {
  const location = useLocation();

  return (
    <div className="mb-6">
      {title && (
        <div className="px-3 mb-2">
          <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest">
            {title}
          </span>
        </div>
      )}
      <div className="space-y-0.5">
        {items.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={location.pathname === item.href || location.pathname.startsWith(item.href + '/')}
          />
        ))}
      </div>
    </div>
  );
}

export function Sidebar() {
  const { user, signOut: logout } = useAuth();
  const workspaceName = user?.email?.split('@')[0] || 'Workspace';

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col bg-[var(--bg-surface)] border-r border-[var(--border-subtle)]">
      {/* Logo */}
      <div className="flex items-center h-16 px-5 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Send className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <span className="text-base font-semibold text-[var(--text-primary)] tracking-tight">SkySend</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 overflow-y-auto">
        <NavSection items={mainNav} />
        <NavSection title="Tools" items={toolsNav} />
        <NavSection title="Configure" items={settingsNav} />
      </nav>

      {/* Upgrade card */}
      <div className="px-3 pb-3">
        <div className="rounded-xl bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-purple-500/10 border border-[var(--brand)]/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-[var(--brand)]" />
            <span className="text-xs font-semibold text-[var(--text-primary)]">Upgrade to Pro</span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mb-3">
            Unlock SARA AI, advanced analytics, and unlimited contacts.
          </p>
          <button className="w-full text-xs font-medium py-1.5 rounded-lg bg-[var(--brand)] text-white hover:bg-[var(--brand-hover)] transition-colors">
            Upgrade
          </button>
        </div>
      </div>

      {/* User section */}
      <div className="border-t border-[var(--border-subtle)] p-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer group">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-sm">
            <span className="text-xs font-semibold text-white">
              {workspaceName[0].toUpperCase()}
            </span>
          </div>
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
        </div>
      </div>
    </aside>
  );
}
