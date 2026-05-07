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

  const createMutation = useMutation({
    mutationFn: async (task: typeof newTask) => {
      await api.post('/tasks', task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      setShowModal(false);
    }
  });

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
              <th>Status</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t: any) => (
              <tr key={t.id}>
                <td>{t.title}</td>
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
                <td colSpan={3} className="text-center text-marine-muted py-6">No tasks found.</td>
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
              <input placeholder="Title" onChange={e => setNewTask({...newTask, title: e.target.value})} className="input-field" />
              <input placeholder="Ship ID (UUID)" onChange={e => setNewTask({...newTask, ship_id: e.target.value})} className="input-field" />
              <input type="date" onChange={e => setNewTask({...newTask, due_date: e.target.value + 'T00:00:00Z'})} className="input-field" />
              <div className="flex gap-4 mt-4">
                <button className="btn-primary" onClick={() => createMutation.mutate(newTask)}>Save</button>
                <button onClick={() => setShowModal(false)} className="bg-transparent text-marine-muted hover:text-white transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
