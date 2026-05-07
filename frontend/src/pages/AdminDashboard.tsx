import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import api from "../api/axios"
import { ComplianceCharts } from "../components/ComplianceCharts"
import { Link } from "react-router-dom"
import { ShieldAlert, Wrench } from "lucide-react"

export const AdminDashboard = () => {
  const [selectedShip, setSelectedShip] = useState("")

  const { data: ships = [], isLoading: shipsLoading } = useQuery({
    queryKey: ["ships"],
    queryFn: async () => {
      const res = await api.get("/ships")
      return res.data
    },
  })

  useEffect(() => {
    if (!selectedShip && ships.length > 0) {
      setSelectedShip(ships[0].id)
    }
  }, [ships, selectedShip])

  const { data: report, isLoading: reportLoading } = useQuery({
    queryKey: ["compliance", selectedShip],
    queryFn: async () => {
      const res = await api.get(`/compliance?ship_id=${selectedShip}`)
      return res.data
    },
    enabled: !!selectedShip,
  })

  if (shipsLoading) {
    return <div className="text-marine-text">Loading dashboard...</div>
  }

  if (ships.length === 0) {
    return (
      <div className="glass-panel p-8 text-center text-marine-muted">
        No ships configured in the system.
      </div>
    )
  }

  if (reportLoading || !selectedShip) {
    return <div className="text-marine-text">Loading dashboard...</div>
  }

  const selectedShipData = ships.find((ship: any) => ship.id === selectedShip)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Fleet Overview</h1>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <label className="text-marine-muted">Ship:</label>
            <select
              className="input-field max-w-xs"
              value={selectedShip}
              onChange={(e) => setSelectedShip(e.target.value)}
            >
              {ships.map((ship: any) => (
                <option key={ship.id} value={ship.id}>
                  {ship.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-4">
            <Link
              to="/admin/maintenance"
              className="btn-primary flex items-center gap-2"
            >
              <Wrench size={18} /> Manage Tasks
            </Link>
            <Link
              to="/admin/drills"
              className="btn-primary flex items-center gap-2"
            >
              <ShieldAlert size={18} /> Schedule Drills
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-xl mb-4 text-marine-cyan">
          {selectedShipData?.name || "Selected Ship"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 text-center flex flex-col justify-center">
            <div className="text-4xl font-bold text-emerald-500">
              {report?.overall_score?.toFixed(1) ?? 0}%
            </div>
            <div className="text-marine-muted mt-2">Overall Compliance</div>
          </div>
          <div className="glass-panel p-6">
            <h3 className="text-red-500 mb-2 font-medium">Overdue Tasks</h3>
            <ul className="pl-5 text-marine-text list-disc">
              {report?.overdue_tasks?.map((t: any) => (
                <li key={t.id}>{t.title}</li>
              ))}
              {report?.overdue_tasks?.length === 0 && (
                <li className="text-marine-muted list-none -ml-5">None</li>
              )}
            </ul>
          </div>
          <div className="glass-panel p-6">
            <h3 className="text-red-500 mb-2 font-medium">Missed Drills</h3>
            <ul className="pl-5 text-marine-text list-disc">
              {report?.missed_drills?.map((d: any) => (
                <li key={d.id}>{d.title}</li>
              ))}
              {report?.missed_drills?.length === 0 && (
                <li className="text-marine-muted list-none -ml-5">None</li>
              )}
            </ul>
          </div>
        </div>
        <ComplianceCharts
          maintenanceScore={report?.maintenance_score ?? 0}
          drillScore={report?.drill_score ?? 0}
          attendedDrillCount={report?.attended_drill_count ?? 0}
          missedDrillCount={report?.missed_drill_count ?? 0}
        />
      </div>
    </div>
  )
}
