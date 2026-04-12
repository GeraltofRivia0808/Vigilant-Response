import { useEffect, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { AlertStatusBadge } from "@/components/SeverityBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import SearchFilter from "@/components/SearchFilter";
import { fetchAlerts, type Alert } from "@/lib/mock-data";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setAlerts(await fetchAlerts());
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = alerts.filter(
    (a) => a.message.toLowerCase().includes(search.toLowerCase()) || a.region.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
          <p className="text-sm text-muted-foreground">{alerts.length} total alert records</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchFilter value={search} onChange={setSearch} placeholder="Search alerts..." />
          <button onClick={loadData} className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
            <RefreshCw className="h-4 w-4" /> Load Alerts
          </button>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a, i) => (
            <div key={a.id + i} className="glass-card-hover p-5 space-y-3 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
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
      )}
    </div>
  );
}
