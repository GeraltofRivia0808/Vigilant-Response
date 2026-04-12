import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, CloudLightning, Package, Users, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import SummaryCard from "@/components/SummaryCard";
import { SeverityBadge, AlertStatusBadge } from "@/components/SeverityBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import SearchFilter from "@/components/SearchFilter";
import { fetchDisasters, fetchAlerts, type Disaster, type Alert } from "@/lib/mock-data";

export default function Dashboard() {
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    const [d, a] = await Promise.all([fetchDisasters(), fetchAlerts()]);
    setDisasters(d);
    setAlerts(a);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh every 15s
  useEffect(() => {
    const interval = setInterval(async () => {
      const [d, a] = await Promise.all([fetchDisasters(), fetchAlerts()]);
      setDisasters(d);
      setAlerts(a);
      toast.warning("New disaster data received", { duration: 2000 });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredDisasters = disasters.filter(
    (d) =>
      d.type.toLowerCase().includes(search.toLowerCase()) ||
      d.severity.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase())
  );

  const criticalCount = disasters.filter((d) => d.severity === "CRITICAL" || d.severity === "HIGH").length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Total Disasters" value={disasters.length} icon={CloudLightning} variant="danger" delay={0} />
        <SummaryCard title="Active Alerts" value={alerts.length} icon={AlertTriangle} variant="warning" delay={100} />
        <SummaryCard title="Available Resources" value={142} icon={Package} variant="accent" delay={200} />
        <SummaryCard title="Volunteers Available" value={38} icon={Users} variant="success" delay={300} />
      </div>

      {/* Disaster Feed */}
      <div className="glass-card animate-fade-in">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Disaster Feed</h2>
            <p className="text-xs text-muted-foreground">{criticalCount} critical/high severity events</p>
          </div>
          <div className="flex items-center gap-3">
            <SearchFilter value={search} onChange={setSearch} placeholder="Search disasters..." />
            <button
              onClick={loadData}
              className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-border/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3">Event ID</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3">Magnitude</th>
                  <th className="px-5 py-3">Severity</th>
                  <th className="px-5 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredDisasters.map((d, i) => (
                  <tr
                    key={d.id + i}
                    className="border-t border-border/30 transition-colors hover:bg-secondary/50"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{d.id}</td>
                    <td className="px-5 py-3 font-medium">{d.type}</td>
                    <td className="px-5 py-3 text-muted-foreground">{d.location}</td>
                    <td className="px-5 py-3 font-semibold">{d.magnitude}</td>
                    <td className="px-5 py-3"><SeverityBadge severity={d.severity} /></td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{d.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Alerts Section */}
      <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Alerts</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {alerts.slice(0, 6).map((a, i) => (
            <div
              key={a.id + i}
              className="glass-card-hover p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">{a.id}</span>
                <AlertStatusBadge status={a.status} />
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">{a.message}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{a.region}</span>
                <span>{a.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
