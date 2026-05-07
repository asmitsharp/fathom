import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ChartProps {
  maintenanceScore: number;
  drillScore: number;
}

export const ComplianceCharts = ({ maintenanceScore, drillScore }: ChartProps) => {
  const barData = [
    { name: 'Completed', value: maintenanceScore },
    { name: 'Pending', value: Math.max(0, 100 - maintenanceScore) }
  ];

  const pieData = [
    { name: 'Attended', value: drillScore },
    { name: 'Missed', value: Math.max(0, 100 - drillScore) }
  ];

  const COLORS = ['#10B981', '#EF4444'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
      <div className="glass-panel p-8">
        <h3 className="mb-4 text-marine-muted font-medium">Maintenance Compliance</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip contentStyle={{ background: '#1A365D', border: 'none', borderRadius: '8px', color: 'white' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
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
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1A365D', border: 'none', borderRadius: '8px', color: 'white' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
