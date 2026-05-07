import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

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

  const createMutation = useMutation({
    mutationFn: async (drill: typeof newDrill) => {
      await api.post('/drills', drill);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-drills'] });
      setShowModal(false);
    }
  });

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
              <th>Scheduled For</th>
            </tr>
          </thead>
          <tbody>
            {drills.map((d: any) => (
              <tr key={d.id}>
                <td>{d.title}</td>
                <td>{d.drill_type}</td>
                <td>{new Date(d.scheduled_date).toLocaleDateString()}</td>
              </tr>
            ))}
            {drills.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center text-marine-muted py-6">No drills found.</td>
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
              <input placeholder="Title" onChange={e => setNewDrill({...newDrill, title: e.target.value})} className="input-field" />
              <input placeholder="Type (e.g. Fire, Abandon Ship)" onChange={e => setNewDrill({...newDrill, drill_type: e.target.value})} className="input-field" />
              <input placeholder="Ship ID (UUID)" onChange={e => setNewDrill({...newDrill, ship_id: e.target.value})} className="input-field" />
              <input type="date" onChange={e => setNewDrill({...newDrill, scheduled_date: e.target.value + 'T00:00:00Z'})} className="input-field" />
              <div className="flex gap-4 mt-4">
                <button className="btn-primary" onClick={() => createMutation.mutate(newDrill)}>Save</button>
                <button onClick={() => setShowModal(false)} className="bg-transparent text-marine-muted hover:text-white transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
