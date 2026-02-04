import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ThemeProvider } from '../../context/ThemeContext';

export function AppLayout() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-app">
        <Sidebar />
        <div className="pl-[260px]">
          <Header />
          <main className="px-10 py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
