import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import type { Disaster, Resource, Volunteer } from "@/lib/mock-data";

interface Props {
  disasters: Disaster[];
  resources: Resource[];
  volunteers: Volunteer[];
}

const COLORS = {
  LOW: "#22c55e",
  MEDIUM: "#eab308",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
  Available: "#22c55e",
  Assigned: "#f97316",
  Unavailable: "#ef4444",
};

const tooltipStyle = {
  contentStyle: { background: "hsl(222 25% 8%)", border: "1px solid hsl(222 15% 16%)", borderRadius: "4px", fontSize: "11px" },
  labelStyle: { color: "hsl(210 15% 85%)" },
};

export default function AnalyticsPanel({ disasters, resources, volunteers }: Props) {
  // Severity distribution
  const severityData = ["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((s) => ({
    name: s,
    count: disasters.filter((d) => d.severity === s).length,
    fill: COLORS[s as keyof typeof COLORS],
  }));

  // Resource by shelter (top 6)
  const resourceData = resources.slice(0, 6).map((r) => ({
    name: r.shelterName.length > 12 ? r.shelterName.slice(0, 12) + "…" : r.shelterName,
    quantity: r.quantity,
    fill: r.quantity < r.maxQuantity * 0.25 ? "#ef4444" : r.quantity < r.maxQuantity * 0.5 ? "#eab308" : "#22c55e",
  }));

  // Volunteer status
  const volData = (["Available", "Assigned", "Unavailable"] as const).map((s) => ({
    name: s,
    value: volunteers.filter((v) => v.status === s).length,
    fill: COLORS[s],
  }));

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
      {/* Severity Distribution */}
      <div className="eoc-panel">
        <div className="eoc-panel-header">
          <span>Severity Distribution</span>
        </div>
        <div className="p-3 h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={severityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 15% 14%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(215 10% 45%)" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215 10% 45%)" }} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                {severityData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resource Availability */}
      <div className="eoc-panel">
        <div className="eoc-panel-header">
          <span>Resource Levels</span>
        </div>
        <div className="p-3 h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={resourceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 15% 14%)" />
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(215 10% 45%)" }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: "hsl(215 10% 45%)" }} width={80} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="quantity" radius={[0, 2, 2, 0]}>
                {resourceData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Volunteer Status */}
      <div className="eoc-panel">
        <div className="eoc-panel-header">
          <span>Volunteer Status</span>
        </div>
        <div className="p-3 h-[180px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={volData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value" stroke="none">
                {volData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 ml-2">
            {volData.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-[10px]">
                <span className="h-2 w-2 rounded-full" style={{ background: d.fill }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="mono font-semibold text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
