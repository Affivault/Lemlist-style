import { useState } from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Header() {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div />

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <User className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline">{user?.email}</span>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <div className="border-b border-gray-100 px-4 py-2">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
