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
  useEffect(() => {
    const i = setInterval(() => fetchAlerts().then(setAlerts), 5000);
    return () => clearInterval(i);
  }, []);

  const filtered = alerts.filter(
    (a) => a.message.toLowerCase().includes(search.toLowerCase()) || a.region.toLowerCase().includes(search.toLowerCase()) || a.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="eoc-panel">
        <div className="eoc-panel-header">
          <span>Alert Records — {alerts.length} total</span>
          <div className="flex items-center gap-2">
            <SearchFilter value={search} onChange={setSearch} placeholder="Filter alerts..." />
            <button onClick={loadData} className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold uppercase text-primary hover:bg-primary/10 transition-colors">
              <RefreshCw className="h-3 w-3" /> Reload
            </button>
          </div>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="overflow-auto">
            <table className="eoc-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Region</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <tr key={a.id + i}>
                    <td className="mono text-muted-foreground">{a.id}</td>
                    <td className="font-medium">{a.region}</td>
                    <td className="text-foreground/80 max-w-xs truncate">{a.message}</td>
                    <td><AlertStatusBadge status={a.status} /></td>
                    <td className="mono text-muted-foreground text-[10px]">{a.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
