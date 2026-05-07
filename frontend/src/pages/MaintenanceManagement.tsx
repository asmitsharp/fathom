import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../api/axios"

type Ship = {
  id: string
  name: string
}

type CrewUser = {
  id: string
  name: string
}

type Task = {
  id: string
  title: string
  ship_id: string
  assignee?: {
    name: string
  }
  status: string
  due_date: string
}

type NewTask = {
  title: string
  description: string
  ship_id: string
  due_date: string
  assigned_to: string
}

export const MaintenanceManagement = () => {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [newTask, setNewTask] = useState<NewTask>({
    title: "",
    description: "",
    ship_id: "",
    due_date: "",
    assigned_to: "",
  })

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["admin-tasks"],
    queryFn: async () => {
      const res = await api.get<Task[]>("/tasks")
      return res.data
    },
  })

  const { data: ships = [] } = useQuery<Ship[]>({
    queryKey: ["ships"],
    queryFn: async () => {
      const res = await api.get<Ship[]>("/ships")
      return res.data
    },
  })

  const { data: crew = [], isLoading: crewLoading } = useQuery<CrewUser[]>({
    queryKey: ["crew-users", newTask.ship_id],
    queryFn: async () => {
      const res = await api.get(`/users?ship_id=${newTask.ship_id}&role=crew`)
      return res.data
    },
    enabled: !!newTask.ship_id,
  })

  const { data: allCrew = [] } = useQuery<CrewUser[]>({
    queryKey: ["all-crew-users"],
    queryFn: async () => {
      const res = await api.get<CrewUser[]>("/users?role=crew")
      return res.data
    },
  })

  const availableCrew = crew.length > 0 ? crew : allCrew

  const createMutation = useMutation({
    mutationFn: async (task: NewTask) => {
      const payload: Partial<NewTask> = { ...task }
      if (!payload.assigned_to) {
        delete payload.assigned_to
      }
      await api.post("/tasks", payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] })
      setShowModal(false)
      setNewTask({
        title: "",
        description: "",
        ship_id: "",
        due_date: "",
        assigned_to: "",
      })
    },
  })

  const shipMap: Record<string, string> = {}
  ships.forEach((s: any) => {
    shipMap[s.id] = s.name
  })

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Maintenance Management</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          Create Task
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Ship</th>
              <th>Assigned Crew</th>
              <th>Status</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t: any) => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td className="text-marine-muted">
                  {shipMap[t.ship_id] || "—"}
                </td>
                <td className="text-marine-muted">
                  {t.assignee?.name || "Unassigned"}
                </td>
                <td>
                  <span
                    className={`status-badge status-${t.status.toLowerCase().replace(" ", "-")}`}
                  >
                    {t.status}
                  </span>
                </td>
                <td>{new Date(t.due_date).toLocaleDateString()}</td>
              </tr>
            ))}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-marine-muted py-6">
                  No tasks found.
                </td>
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
                <label className="text-marine-muted text-sm mb-1 block">
                  Title
                </label>
                <input
                  placeholder="e.g. Engine oil change"
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-marine-muted text-sm mb-1 block">
                  Ship
                </label>
                <select
                  value={newTask.ship_id}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      ship_id: e.target.value,
                      assigned_to: "",
                    })
                  }
                  className="input-field"
                >
                  <option value="" disabled>
                    Select a ship...
                  </option>
                  {ships.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {ships.length === 0 && (
                  <p className="text-amber-500/80 text-xs mt-1">
                    No ships found. Register a ship first.
                  </p>
                )}
              </div>
              <div>
                <label className="text-marine-muted text-sm mb-1 block">
                  Assign To
                </label>
                <select
                  value={newTask.assigned_to}
                  onChange={(e) =>
                    setNewTask({ ...newTask, assigned_to: e.target.value })
                  }
                  className="input-field"
                  disabled={!newTask.ship_id || crewLoading}
                >
                  <option value="">Unassigned</option>
                  {availableCrew.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {newTask.ship_id && crewLoading && (
                  <p className="text-marine-muted text-xs mt-1">
                    Loading crew members...
                  </p>
                )}
                {newTask.ship_id &&
                  !crewLoading &&
                  crew.length === 0 &&
                  allCrew.length > 0 && (
                    <p className="text-marine-muted text-xs mt-1">
                      No crew members are assigned to this ship yet. Showing all
                      available crew.
                    </p>
                  )}
                {newTask.ship_id &&
                  !crewLoading &&
                  availableCrew.length === 0 && (
                    <p className="text-amber-500/80 text-xs mt-1">
                      No crew members found. Create crew accounts first.
                    </p>
                  )}
              </div>
              <div>
                <label className="text-marine-muted text-sm mb-1 block">
                  Due Date
                </label>
                <input
                  type="date"
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      due_date: e.target.value + "T00:00:00Z",
                    })
                  }
                  className="input-field"
                />
              </div>
              <div className="flex gap-4 mt-2">
                <button
                  className="btn-primary"
                  onClick={() => createMutation.mutate(newTask)}
                  disabled={
                    createMutation.isPending ||
                    !newTask.ship_id ||
                    !newTask.title
                  }
                >
                  {createMutation.isPending ? "Saving..." : "Create Task"}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-transparent text-marine-muted hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
