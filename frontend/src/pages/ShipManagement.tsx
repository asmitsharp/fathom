import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ship, Plus, Trash2 } from 'lucide-react';
import api from '../api/axios';

export const ShipManagement = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [newShip, setNewShip] = useState({ name: '', imo_number: '' });

  const { data: ships = [], isLoading } = useQuery({
    queryKey: ['ships'],
    queryFn: async () => {
      const res = await api.get('/ships');
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (ship: typeof newShip) => {
      await api.post('/ships', ship);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ships'] });
      setShowModal(false);
      setNewShip({ name: '', imo_number: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/ships/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ships'] });
    }
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Ship Management</h1>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Ship
        </button>
      </div>

      {isLoading ? (
        <div className="text-marine-muted">Loading ships...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ships.map((ship: any) => (
            <div key={ship.id} className="glass-panel p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-marine-cyan/10">
                    <Ship className="text-marine-cyan" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{ship.name}</h3>
                    <p className="text-marine-muted text-sm">{ship.imo_number}</p>
                  </div>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(ship.id)}
                  className="text-marine-muted hover:text-red-400 transition-colors bg-transparent p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="border-t border-white/5 pt-4">
                <p className="text-marine-muted text-xs uppercase tracking-wider">Ship ID</p>
                <p className="text-marine-text text-sm font-mono mt-1 truncate">{ship.id}</p>
              </div>
            </div>
          ))}

          {ships.length === 0 && (
            <div className="col-span-3 glass-panel p-12 text-center text-marine-muted">
              <Ship className="mx-auto mb-4 opacity-30" size={48} />
              <p>No ships registered. Add your first ship to get started.</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="glass-panel p-8 w-full max-w-md">
            <h2 className="mb-6 text-xl text-white font-medium">Register New Ship</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-marine-muted text-sm mb-1 block">Ship Name</label>
                <input
                  placeholder="e.g. SS Enterprise"
                  value={newShip.name}
                  onChange={e => setNewShip({...newShip, name: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-marine-muted text-sm mb-1 block">IMO Number</label>
                <input
                  placeholder="e.g. IMO1234567"
                  value={newShip.imo_number}
                  onChange={e => setNewShip({...newShip, imo_number: e.target.value})}
                  className="input-field"
                />
              </div>
              <div className="flex gap-4 mt-2">
                <button
                  className="btn-primary"
                  onClick={() => createMutation.mutate(newShip)}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Saving...' : 'Register Ship'}
                </button>
                <button onClick={() => setShowModal(false)} className="bg-transparent text-marine-muted hover:text-white transition-colors">Cancel</button>
              </div>
              {createMutation.isError && (
                <p className="text-red-400 text-sm">Failed to create ship. Try again.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
