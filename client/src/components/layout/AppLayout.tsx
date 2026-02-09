import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ThemeProvider } from '../../context/ThemeContext';
import { SidebarProvider, useSidebar } from '../../context/SidebarContext';
import { cn } from '../../lib/utils';

function AppContent() {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-[var(--bg-app)]">
      <Sidebar />
      <div className={cn(
        'transition-[padding] duration-200',
        collapsed ? 'pl-[64px]' : 'pl-[260px]'
      )}>
        <Header />
        <main className="px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AppLayout() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <AppContent />
      </SidebarProvider>
    </ThemeProvider>
  );
}
