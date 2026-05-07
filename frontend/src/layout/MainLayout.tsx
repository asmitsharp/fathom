import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Anchor, LogOut } from 'lucide-react';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex justify-between items-center py-4 px-8 bg-marine-panel/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Anchor className="text-marine-cyan" size={28} />
          <h1 className="text-xl font-semibold m-0 text-white">FATHOM</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <span className="text-marine-muted text-sm">
            Logged in as <strong className="text-white capitalize font-medium">{user?.role}</strong>
          </span>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-transparent text-marine-muted hover:text-white transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};
