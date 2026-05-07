import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export const CrewDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['crew-tasks', user?.ship_id],
    queryFn: async () => {
      const res = await api.get(`/tasks?ship_id=${user?.ship_id || ''}`);
      return res.data;
    }
  });

  const { data: drills = [] } = useQuery({
    queryKey: ['crew-drills', user?.ship_id],
    queryFn: async () => {
      const res = await api.get(`/drills?ship_id=${user?.ship_id || ''}`);
      return res.data;
    }
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await api.patch(`/tasks/${id}/status`, { status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crew-tasks'] })
  });

  const markAttendance = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/drills/${id}/attend`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crew-drills'] })
  });

  return (
    <div>
      <h1 className="page-title mb-8">My Assignments</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="mb-4 text-marine-cyan font-medium text-lg">Tasks</h2>
          <div className="flex flex-col gap-4">
            {tasks.map((t: any) => (
              <div key={t.id} className="glass-panel p-6">
                <div className="flex justify-between mb-4 items-center">
                  <h3 className="text-lg text-white font-medium">{t.title}</h3>
                  <span className={`status-badge status-${t.status.toLowerCase().replace(' ', '-')}`}>{t.status}</span>
                </div>
                {t.status !== 'Completed' && (
                  <button className="btn-success text-sm w-full" onClick={() => updateTaskStatus.mutate({ id: t.id, status: 'Completed' })}>
                    Mark Completed
                  </button>
                )}
              </div>
            ))}
            {tasks.length === 0 && <div className="text-marine-muted bg-marine-card/50 p-6 rounded-xl border border-white/5">No tasks assigned.</div>}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-marine-cyan font-medium text-lg">Upcoming Drills</h2>
          <div className="flex flex-col gap-4">
            {drills.map((d: any) => (
              <div key={d.id} className="glass-panel p-6">
                <div className="mb-4">
                  <h3 className="text-lg text-white font-medium">{d.title}</h3>
                  <div className="text-marine-muted text-sm mt-1">
                    {new Date(d.scheduled_date).toLocaleString()}
                  </div>
                </div>
                <button className="btn-primary w-full text-sm py-2" onClick={() => markAttendance.mutate(d.id)}>
                  Mark Attendance
                </button>
              </div>
            ))}
            {drills.length === 0 && <div className="text-marine-muted bg-marine-card/50 p-6 rounded-xl border border-white/5">No upcoming drills.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
