import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Inbox,
  BarChart3,
  Settings,
  Shield,
  Bot,
  Layers,
  Webhook,
  Send,
  ChevronDown,
  Sparkles,
  Zap,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

// Navigation structure
const mainNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Inbox', href: '/inbox', icon: Inbox },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

const toolsNav = [
  { name: 'SARA AI', href: '/sara', icon: Bot, badge: 'New' },
  { name: 'Smart Email', href: '/sse', icon: Shield },
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
  item: { name: string; href: string; icon: React.ElementType; badge?: string };
  isActive: boolean;
}) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.href}
      className={cn(
        'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200',
        isActive
          ? 'text-white bg-gradient-to-r from-violet-500/20 to-pink-500/10 border border-violet-500/30'
          : 'text-secondary hover:text-primary hover:bg-surface'
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-violet-500 to-pink-500 rounded-full" />
      )}
      <Icon
        className={cn(
          'h-[18px] w-[18px] transition-colors',
          isActive ? 'text-violet-400' : 'text-tertiary group-hover:text-secondary'
        )}
        strokeWidth={1.75}
      />
      <span className="flex-1">{item.name}</span>
      {item.badge && (
        <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-gradient-to-r from-violet-500 to-pink-500 text-white">
          {item.badge}
        </span>
      )}
    </NavLink>
  );
}

function NavSection({
  title,
  items,
}: {
  title?: string;
  items: Array<{ name: string; href: string; icon: React.ElementType; badge?: string }>;
}) {
  const location = useLocation();

  return (
    <div className="mb-6">
      {title && (
        <div className="flex items-center gap-2 px-3 mb-3">
          <span className="text-[10px] font-semibold text-tertiary uppercase tracking-widest">{title}</span>
          <div className="flex-1 h-px bg-subtle" />
        </div>
      )}
      <div className="space-y-1">
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
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const workspaceName = user?.email?.split('@')[0] || 'Workspace';
  const workspaceInitial = workspaceName[0].toUpperCase();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col bg-app border-r border-subtle">
      {/* Logo & Workspace */}
      <div className="flex items-center h-16 px-4 border-b border-subtle">
        <div className="flex items-center gap-3 flex-1">
          {/* Logo */}
          <div className="relative">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 blur-lg opacity-30" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-primary">SkySend</div>
            <div className="text-[11px] text-tertiary truncate">{workspaceName}</div>
          </div>
        </div>
        <button className="p-1.5 rounded-lg text-tertiary hover:text-secondary hover:bg-surface transition-colors">
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <NavSection items={mainNav} />
        <NavSection title="Tools" items={toolsNav} />
        <NavSection title="Settings" items={settingsNav} />
      </nav>

      {/* Upgrade Banner */}
      <div className="px-3 pb-4">
        <div className="relative rounded-xl p-4 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-pink-500/10 to-transparent" />
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/30 rounded-full blur-2xl" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span className="text-xs font-semibold text-violet-400">Pro Plan</span>
            </div>
            <p className="text-[12px] text-secondary mb-3">
              Unlock unlimited contacts & advanced analytics
            </p>
            <button className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-violet-500 to-pink-500 text-white text-[12px] font-semibold transition-all hover:opacity-90">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>

      {/* User */}
      <div className="border-t border-subtle px-3 py-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-surface transition-colors cursor-pointer">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/30 flex items-center justify-center text-xs font-semibold text-violet-400">
            {workspaceInitial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-primary truncate">{workspaceName}</div>
            <div className="text-[11px] text-tertiary truncate">{user?.email}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
