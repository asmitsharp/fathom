import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { ComplianceCharts } from '../components/ComplianceCharts';
import { Link } from 'react-router-dom';
import { ShieldAlert, Wrench } from 'lucide-react';

export const AdminDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['compliance-summary'],
    queryFn: async () => {
      const res = await api.get('/compliance/summary');
      return res.data;
    }
  });

  if (isLoading) return <div className="text-marine-text">Loading dashboard...</div>;

  const ships = Object.keys(data || {});

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Fleet Overview</h1>
        <div className="flex gap-4">
          <Link to="/admin/maintenance" className="btn-primary flex items-center gap-2">
            <Wrench size={18} /> Manage Tasks
          </Link>
          <Link to="/admin/drills" className="btn-primary flex items-center gap-2">
            <ShieldAlert size={18} /> Schedule Drills
          </Link>
        </div>
      </div>

      {ships.length === 0 && <div className="glass-panel p-8 text-center text-marine-muted">No ships configured in the system.</div>}

      {ships.map(shipName => {
        const report = data[shipName];
        return (
          <div key={shipName} className="mb-16">
            <h2 className="text-xl mb-4 text-marine-cyan">{shipName}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 text-center flex flex-col justify-center">
                <div className="text-4xl font-bold text-emerald-500">
                  {report.overall_score.toFixed(1)}%
                </div>
                <div className="text-marine-muted mt-2">Overall Compliance</div>
              </div>
              <div className="glass-panel p-6">
                <h3 className="text-red-500 mb-2 font-medium">Overdue Tasks</h3>
                <ul className="pl-5 text-marine-text list-disc">
                  {report.overdue_tasks.map((t: any) => <li key={t.id}>{t.title}</li>)}
                  {report.overdue_tasks.length === 0 && <li className="text-marine-muted list-none -ml-5">None</li>}
                </ul>
              </div>
              <div className="glass-panel p-6">
                <h3 className="text-red-500 mb-2 font-medium">Missed Drills</h3>
                <ul className="pl-5 text-marine-text list-disc">
                  {report.missed_drills.map((d: any) => <li key={d.id}>{d.title}</li>)}
                  {report.missed_drills.length === 0 && <li className="text-marine-muted list-none -ml-5">None</li>}
                </ul>
              </div>
            </div>
            <ComplianceCharts maintenanceScore={report.maintenance_score} drillScore={report.drill_score} />
          </div>
        );
      })}
    </div>
  );
};
