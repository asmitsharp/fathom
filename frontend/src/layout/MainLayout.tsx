import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Anchor, LogOut, Ship, Wrench, ShieldAlert, LayoutDashboard } from 'lucide-react';

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
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Anchor className="text-marine-cyan" size={24} />
            <span className="text-lg font-semibold text-white">FATHOM</span>
          </div>

          {user?.role === 'admin' && (
            <nav className="flex items-center gap-1">
              <Link to="/admin/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-marine-muted hover:text-white hover:bg-white/5 transition-colors text-sm">
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <Link to="/admin/ships" className="flex items-center gap-2 px-3 py-2 rounded-lg text-marine-muted hover:text-white hover:bg-white/5 transition-colors text-sm">
                <Ship size={15} /> Ships
              </Link>
              <Link to="/admin/maintenance" className="flex items-center gap-2 px-3 py-2 rounded-lg text-marine-muted hover:text-white hover:bg-white/5 transition-colors text-sm">
                <Wrench size={15} /> Maintenance
              </Link>
              <Link to="/admin/drills" className="flex items-center gap-2 px-3 py-2 rounded-lg text-marine-muted hover:text-white hover:bg-white/5 transition-colors text-sm">
                <ShieldAlert size={15} /> Drills
              </Link>
            </nav>
          )}
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
