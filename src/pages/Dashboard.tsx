import { useEffect, useState, useCallback, useRef } from "react";
import { AlertTriangle, CloudLightning, Package, Users, RefreshCw, Zap } from "lucide-react";
import { toast } from "sonner";
import { AlertStatusBadge, SeverityBadge } from "@/components/SeverityBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import AnalyticsPanel from "@/components/AnalyticsPanel";
import IndiaMap from "@/components/IndiaMap";
import { fetchDisasters, fetchAlerts, fetchResources, fetchVolunteers } from "@/lib/api";
import type { Alert, Disaster, Resource, Volunteer } from "@/lib/types";

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

const getMagnitudeDisplay = (disaster: Disaster): string => {
  if (!disaster.type.toLowerCase().includes("earthquake")) {
    return "-";
  }

  return Number.isFinite(disaster.magnitude) && disaster.magnitude > 0
    ? `Magnitude ${disaster.magnitude}`
    : "Magnitude N/A";
};

export default function Dashboard() {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const prevIdsRef = useRef<Set<string>>(new Set());

  const loadData = useCallback(async (showToast = false, showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const [d, a, r, v] = await Promise.all([fetchDisasters(), fetchAlerts(), fetchResources(), fetchVolunteers()]);

      // Detect new disasters
      const currentIds = new Set(d.map((x) => String(x.event_id)));
      const fresh = new Set<string>();
      if (prevIdsRef.current.size > 0) {
        d.forEach((x) => {
          const eventId = String(x.event_id);
          if (!prevIdsRef.current.has(eventId)) fresh.add(eventId);
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
    } catch (fetchError) {
      console.error(fetchError);
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-refresh every 5s
  useEffect(() => {
    const interval = setInterval(() => loadData(true, false), 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  const pendingAlerts = alerts.reduce((count, alert) => count + (alert.status === "PENDING" ? 1 : 0), 0);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="eoc-panel border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Main Grid: stats | feed | alerts */}
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-[200px_1fr_300px]">

        {/* LEFT: Quick Stats */}
        <div className="flex flex-row gap-2 lg:flex-col">
          <StatCard label="Disasters" value={disasters.length} icon={CloudLightning} color="red" />
          <StatCard label="Crit. Alerts" value={pendingAlerts} icon={AlertTriangle} color="orange" />
          <StatCard label="Resources" value={resources.length} icon={Package} color="yellow" />
          <StatCard label="Volunteers" value={volunteers.length} icon={Users} color="green" />
        </div>

        {/* CENTER: Disaster Feed */}
        <div className="eoc-panel flex flex-col">
          <div className="eoc-panel-header">
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3 text-primary" />
              <span>Live Disaster Feed</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => loadData(false, true)} className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold uppercase text-primary hover:bg-primary/10 transition-colors">
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
                  <th>Severity</th>
                  <th>Magnitude</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {disasters.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted-foreground py-4">No data available</td>
                  </tr>
                ) : (
                  disasters.map((d) => (
                    <tr key={d.event_id} className={newIds.has(String(d.event_id)) ? "flash-new" : ""}>
                      <td className="mono text-muted-foreground">{d.event_id}</td>
                      <td className="font-medium">{d.type}</td>
                      <td><SeverityBadge severity={d.severity_level} /></td>
                      <td className="text-foreground/80">{getMagnitudeDisplay(d)}</td>
                      <td className="text-muted-foreground mono text-[10px]">{d.event_time}</td>
                    </tr>
                  ))
                )}
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
            {alerts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No data available</div>
            ) : (
              alerts.map((a, i) => (
                  <div key={`${a.alert_id}-${i}`} className="rounded border border-border bg-secondary/30 p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                      <span className="mono text-[10px] text-muted-foreground">{a.alert_id}</span>
                    <AlertStatusBadge status={a.status} />
                  </div>
                  <p className="text-[11px] text-foreground/80 leading-relaxed">{a.alert_message}</p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{a.disaster_type} · {a.region_name}</span>
                    <span className="mono">{a.alert_time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM: Analytics */}
      <AnalyticsPanel disasters={disasters} resources={resources} volunteers={volunteers} />

      {/* MAP: Region hover insights */}
      <IndiaMap disasters={disasters} resources={resources} volunteers={volunteers} />

      <details className="eoc-panel p-3 text-xs">
        <summary className="cursor-pointer select-none text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Debug view
        </summary>
        <p className="mt-3 text-[11px] text-muted-foreground">Total Disasters: {disasters.length}</p>
        <pre className="mt-3 max-h-80 overflow-auto rounded border border-border bg-background p-3 text-[11px] leading-relaxed text-muted-foreground">
{JSON.stringify(disasters, null, 2)}
        </pre>
      </details>
    </div>
  );
}
