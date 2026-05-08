import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface ChartProps {
  maintenanceScore: number
  drillScore: number
  attendedDrillCount: number
  missedDrillCount: number
}

export const ComplianceCharts = ({
  maintenanceScore,
  drillScore,
  attendedDrillCount,
  missedDrillCount,
}: ChartProps) => {
  const barData = [
    { name: "Completed", value: maintenanceScore },
    { name: "Pending", value: Math.max(0, 100 - maintenanceScore) },
  ]

  const totalDrills = attendedDrillCount + missedDrillCount
  const pieData =
    totalDrills > 0
      ? [
          {
            name: `Attended (${attendedDrillCount})`,
            value: attendedDrillCount,
          },
          { name: `Missed (${missedDrillCount})`, value: missedDrillCount },
        ]
      : [{ name: "No drills", value: 1 }]

  const COLORS = ["#10B981", "#EF4444"]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      <div className="glass-panel p-8">
        <h3 className="mb-4 text-marine-muted font-medium">
          Maintenance Compliance
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip
                contentStyle={{
                  background: "#1A365D",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                }}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />
              <Bar dataKey="value" fill="#00B4D8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel p-8">
        <h3 className="mb-4 text-marine-muted font-medium">Drill Attendance</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [
                  value,
                  totalDrills > 0 ? "Drills" : "No drills",
                ]}
                contentStyle={{
                  background: "#1A365D",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-marine-muted">
          {totalDrills > 0 ? (
            <p>
              {attendedDrillCount} drills attended, {missedDrillCount} missed (
              {drillScore.toFixed(1)}%)
            </p>
          ) : (
            <p>No drills scheduled yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
