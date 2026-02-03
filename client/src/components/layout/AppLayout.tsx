import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-app">
      <Sidebar />
      <div className="pl-60">
        <Header />
        <main className="px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
