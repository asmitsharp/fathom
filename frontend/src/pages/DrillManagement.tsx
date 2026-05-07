import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

const DRILL_TYPES = ['Fire Drill', 'Abandon Ship', 'Man Overboard', 'Oil Spill', 'Flooding', 'Medical Emergency'];

export const DrillManagement = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [newDrill, setNewDrill] = useState({ title: '', drill_type: '', ship_id: '', scheduled_date: '' });

  const { data: drills = [] } = useQuery({
    queryKey: ['admin-drills'],
    queryFn: async () => {
      const res = await api.get('/drills');
      return res.data;
    }
  });

  const { data: ships = [] } = useQuery({
    queryKey: ['ships'],
    queryFn: async () => {
      const res = await api.get('/ships');
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (drill: typeof newDrill) => {
      await api.post('/drills', drill);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-drills'] });
      setShowModal(false);
      setNewDrill({ title: '', drill_type: '', ship_id: '', scheduled_date: '' });
    }
  });

  const shipMap: Record<string, string> = {};
  ships.forEach((s: any) => { shipMap[s.id] = s.name; });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Safety Drills</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>Schedule Drill</button>
      </div>

      <div className="glass-panel overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Ship</th>
              <th>Scheduled For</th>
            </tr>
          </thead>
          <tbody>
            {drills.map((d: any) => (
              <tr key={d.id}>
                <td>{d.title}</td>
                <td>{d.drill_type}</td>
                <td className="text-marine-muted">{shipMap[d.ship_id] || '—'}</td>
                <td>{new Date(d.scheduled_date).toLocaleDateString()}</td>
              </tr>
            ))}
            {drills.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-marine-muted py-6">No drills found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="glass-panel p-8 w-full max-w-md">
            <h2 className="mb-6 text-xl text-white font-medium">Schedule Drill</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-marine-muted text-sm mb-1 block">Title</label>
                <input
                  placeholder="e.g. Monthly Fire Drill"
                  onChange={e => setNewDrill({...newDrill, title: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-marine-muted text-sm mb-1 block">Drill Type</label>
                <select
                  onChange={e => setNewDrill({...newDrill, drill_type: e.target.value})}
                  className="input-field"
                  defaultValue=""
                >
                  <option value="" disabled>Select drill type...</option>
                  {DRILL_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-marine-muted text-sm mb-1 block">Ship</label>
                <select
                  onChange={e => setNewDrill({...newDrill, ship_id: e.target.value})}
                  className="input-field"
                  defaultValue=""
                >
                  <option value="" disabled>Select a ship...</option>
                  {ships.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {ships.length === 0 && (
                  <p className="text-amber-500/80 text-xs mt-1">No ships found. Register a ship first.</p>
                )}
              </div>
              <div>
                <label className="text-marine-muted text-sm mb-1 block">Scheduled Date</label>
                <input
                  type="date"
                  onChange={e => setNewDrill({...newDrill, scheduled_date: e.target.value + 'T00:00:00Z'})}
                  className="input-field"
                />
              </div>
              <div className="flex gap-4 mt-2">
                <button
                  className="btn-primary"
                  onClick={() => createMutation.mutate(newDrill)}
                  disabled={createMutation.isPending || !newDrill.ship_id || !newDrill.title || !newDrill.drill_type}
                >
                  {createMutation.isPending ? 'Saving...' : 'Schedule Drill'}
                </button>
                <button onClick={() => setShowModal(false)} className="bg-transparent text-marine-muted hover:text-white transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
