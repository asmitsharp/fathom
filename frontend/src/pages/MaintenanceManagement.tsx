import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export const MaintenanceManagement = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', ship_id: '', due_date: '' });

  const { data: tasks = [] } = useQuery({
    queryKey: ['admin-tasks'],
    queryFn: async () => {
      const res = await api.get('/tasks');
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
    mutationFn: async (task: typeof newTask) => {
      await api.post('/tasks', task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      setShowModal(false);
      setNewTask({ title: '', description: '', ship_id: '', due_date: '' });
    }
  });

  const shipMap: Record<string, string> = {};
  ships.forEach((s: any) => { shipMap[s.id] = s.name; });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Maintenance Management</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>Create Task</button>
      </div>

      <div className="glass-panel overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Ship</th>
              <th>Status</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t: any) => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td className="text-marine-muted">{shipMap[t.ship_id] || '—'}</td>
                <td>
                  <span className={`status-badge status-${t.status.toLowerCase().replace(' ', '-')}`}>
                    {t.status}
                  </span>
                </td>
                <td>{new Date(t.due_date).toLocaleDateString()}</td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-marine-muted py-6">No tasks found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="glass-panel p-8 w-full max-w-md">
            <h2 className="mb-6 text-xl text-white font-medium">New Task</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-marine-muted text-sm mb-1 block">Title</label>
                <input
                  placeholder="e.g. Engine oil change"
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-marine-muted text-sm mb-1 block">Ship</label>
                <select
                  onChange={e => setNewTask({...newTask, ship_id: e.target.value})}
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
                <label className="text-marine-muted text-sm mb-1 block">Due Date</label>
                <input
                  type="date"
                  onChange={e => setNewTask({...newTask, due_date: e.target.value + 'T00:00:00Z'})}
                  className="input-field"
                />
              </div>
              <div className="flex gap-4 mt-2">
                <button
                  className="btn-primary"
                  onClick={() => createMutation.mutate(newTask)}
                  disabled={createMutation.isPending || !newTask.ship_id || !newTask.title}
                >
                  {createMutation.isPending ? 'Saving...' : 'Create Task'}
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
