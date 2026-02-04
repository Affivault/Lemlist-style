import { useState } from 'react';
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
  ChevronDown,
  Bell,
  Webhook,
  Eye,
  Link2,
  CreditCard,
  FileText,
  Send,
  ExternalLink,
  Activity,
  Zap,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

// Main navigation items
const mainNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
  { name: 'Contacts', href: '/contacts', icon: Users },
];

// Integrations section
const integrations = [
  { name: 'SARA AI', href: '/sara', icon: Bot },
  { name: 'Smart Email', href: '/sse', icon: Shield },
  { name: 'Webhooks', href: '/developer', icon: Webhook },
];

// Networking section
const networking = [
  { name: 'SMTP Accounts', href: '/smtp-accounts', icon: Send },
  { name: 'Assets', href: '/assets', icon: Layers },
];

// Workspace section
const workspace = [
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Inbox', href: '/inbox', icon: Inbox },
  { name: 'Settings', href: '/settings', icon: Settings },
];

// Footer links
const footerLinks = [
  { name: 'Documentation', href: '/smtp-accounts/guide', icon: FileText },
  { name: 'Contact support', href: '#', icon: ExternalLink },
];

function NavSection({
  title,
  items
}: {
  title?: string;
  items: Array<{ name: string; href: string; icon: React.ElementType }>
}) {
  return (
    <div className="mb-6">
      {title && (
        <p className="px-3 mb-2 text-[11px] font-medium text-tertiary uppercase tracking-wider">
          {title}
        </p>
      )}
      <div className="space-y-0.5">
        {items.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/dashboard'}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 px-3 py-2 text-[13px] font-medium rounded-md transition-colors',
                isActive
                  ? 'text-brand bg-active'
                  : 'text-secondary hover:text-primary hover:bg-hover'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    'h-[18px] w-[18px] flex-shrink-0',
                    isActive ? 'text-brand' : 'text-secondary group-hover:text-primary'
                  )}
                  strokeWidth={1.75}
                />
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export function Sidebar() {
  const { user } = useAuth();
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  const workspaceName = user?.email?.split('@')[0] || 'My Workspace';
  const workspaceInitial = workspaceName[0].toUpperCase();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col bg-app border-r border-subtle">
      {/* Workspace Selector - Render style */}
      <div className="flex items-center h-14 px-4 border-b border-subtle">
        <button
          onClick={() => setWorkspaceOpen(!workspaceOpen)}
          className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-md hover:bg-hover transition-colors"
        >
          {/* Workspace Avatar */}
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand/10 text-brand text-sm font-semibold">
            {workspaceInitial}
          </div>
          <span className="flex-1 text-left text-[13px] font-medium text-primary truncate">
            {workspaceName}
          </span>
          <ChevronDown className={cn(
            "h-4 w-4 text-tertiary transition-transform",
            workspaceOpen && "rotate-180"
          )} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {/* Main nav - no section title like Render */}
        <NavSection items={mainNav} />

        {/* Integrations */}
        <NavSection title="Integrations" items={integrations} />

        {/* Networking */}
        <NavSection title="Networking" items={networking} />

        {/* Workspace */}
        <NavSection title="Workspace" items={workspace} />
      </nav>

      {/* Footer */}
      <div className="border-t border-subtle px-3 py-3">
        {footerLinks.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-tertiary rounded-md transition-colors hover:text-secondary hover:bg-hover"
          >
            <item.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
            <span>{item.name}</span>
          </NavLink>
        ))}

        {/* Status indicator like Render */}
        <div className="flex items-center gap-3 px-3 py-2 mt-1">
          <div className="flex items-center gap-2">
            <Activity className="h-[18px] w-[18px] text-tertiary" strokeWidth={1.75} />
            <span className="text-[13px] font-medium text-tertiary">Status</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
            <span className="text-[11px] text-brand font-medium">Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
