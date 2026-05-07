import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from './layout/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/AdminDashboard';
import { ShipManagement } from './pages/ShipManagement';
import { MaintenanceManagement } from './pages/MaintenanceManagement';
import { DrillManagement } from './pages/DrillManagement';
import { CrewDashboard } from './pages/CrewDashboard';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/ships" element={<ShipManagement />} />
                  <Route path="/admin/maintenance" element={<MaintenanceManagement />} />
                  <Route path="/admin/drills" element={<DrillManagement />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['crew']} />}>
                  <Route path="/crew/dashboard" element={<CrewDashboard />} />
                </Route>
              </Route>
            </Route>
            
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
