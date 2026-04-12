import { useEffect, useState, useCallback, useRef } from "react";
import { AlertTriangle, CloudLightning, Package, Users, RefreshCw, Zap } from "lucide-react";
import { toast } from "sonner";
import { SeverityBadge, AlertStatusBadge } from "@/components/SeverityBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import SearchFilter from "@/components/SearchFilter";
import AnalyticsPanel from "@/components/AnalyticsPanel";
import { fetchDisasters, fetchAlerts, fetchResources, fetchVolunteers, type Disaster, type Alert, type Resource, type Volunteer } from "@/lib/mock-data";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  const colorMap: Record<string, string> = {
    red: "text-destructive border-destructive/20",
    orange: "text-accent border-accent/20",
    yellow: "text-warning border-warning/20",
    green: "text-success border-success/20",
  };
  return (
    <div className={`stat-card border-l-2 ${colorMap[color]}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <p className="mt-1 text-2xl font-bold mono">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const prevIdsRef = useRef<Set<string>>(new Set());

  const loadData = useCallback(async (showToast = false) => {
    const [d, a, r, v] = await Promise.all([fetchDisasters(), fetchAlerts(), fetchResources(), fetchVolunteers()]);

    // Detect new disasters
    const currentIds = new Set(d.map(x => x.id));
    const fresh = new Set<string>();
    if (prevIdsRef.current.size > 0) {
      d.forEach(x => {
        if (!prevIdsRef.current.has(x.id)) fresh.add(x.id);
      });
      if (fresh.size > 0 && showToast) {
        toast.error(`⚠ ${fresh.size} new disaster event(s) detected`, { duration: 3000 });
      }
    }
    prevIdsRef.current = currentIds;
    setNewIds(fresh);
    setTimeout(() => setNewIds(new Set()), 1500);

    setDisasters(d);
    setAlerts(a);
    setResources(r);
    setVolunteers(v);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-refresh every 5s
  useEffect(() => {
    const interval = setInterval(() => loadData(true), 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  const filteredDisasters = disasters.filter(
    (d) => d.type.toLowerCase().includes(search.toLowerCase()) || d.severity.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase())
  );

  const availableVolunteers = volunteers.filter(v => v.status === "Available").length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-2">
      {/* Main Grid: stats | feed | alerts */}
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-[200px_1fr_300px]">

        {/* LEFT: Quick Stats */}
        <div className="flex flex-row gap-2 lg:flex-col">
          <StatCard label="Disasters" value={disasters.length} icon={CloudLightning} color="red" />
          <StatCard label="Crit. Alerts" value={alerts.filter(a => a.status === "PENDING").length} icon={AlertTriangle} color="orange" />
          <StatCard label="Resources" value={resources.reduce((s, r) => s + r.quantity, 0)} icon={Package} color="yellow" />
          <StatCard label="Volunteers" value={availableVolunteers} icon={Users} color="green" />
        </div>

        {/* CENTER: Disaster Feed */}
        <div className="eoc-panel flex flex-col">
          <div className="eoc-panel-header">
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3 text-primary" />
              <span>Live Disaster Feed</span>
            </div>
            <div className="flex items-center gap-2">
              <SearchFilter value={search} onChange={setSearch} placeholder="Filter events..." />
              <button onClick={() => loadData()} className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold uppercase text-primary hover:bg-primary/10 transition-colors">
                <RefreshCw className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="eoc-table">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Type</th>
                  <th>Mag</th>
                  <th>Severity</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredDisasters.map((d) => (
                  <tr key={d.id} className={newIds.has(d.id) ? "flash-new" : ""}>
                    <td className="mono text-muted-foreground">{d.id}</td>
                    <td className="font-medium">{d.type}</td>
                    <td className="mono font-semibold">{d.magnitude}</td>
                    <td><SeverityBadge severity={d.severity} /></td>
                    <td className="text-muted-foreground mono text-[10px]">{d.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: Alerts Feed */}
        <div className="eoc-panel flex flex-col">
          <div className="eoc-panel-header">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3 w-3 text-accent" />
              <span>Alerts Feed</span>
            </div>
            <span className="text-[10px] text-muted-foreground">{alerts.length} total</span>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-1.5 max-h-[400px]">
            {alerts.map((a, i) => (
              <div key={a.id + i} className="rounded border border-border bg-secondary/30 p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="mono text-[10px] text-muted-foreground">{a.id}</span>
                  <AlertStatusBadge status={a.status} />
                </div>
                <p className="text-[11px] text-foreground/80 leading-relaxed">{a.message}</p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{a.region}</span>
                  <span className="mono">{a.time.split(" ")[1]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM: Analytics */}
      <AnalyticsPanel disasters={disasters} resources={resources} volunteers={volunteers} />
    </div>
  );
}
