import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ThemeProvider } from '../../context/ThemeContext';

export function AppLayout() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[var(--bg-app)]">
        <Sidebar />
        <div className="pl-60">
          <Header />
          <main className="px-8 py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
