import { useEffect, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { AlertStatusBadge } from "@/components/SeverityBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { fetchAlerts } from "@/lib/api";
import type { Alert } from "@/lib/types";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setAlerts(await fetchAlerts());
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load alerts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    const i = setInterval(async () => {
      try {
        setAlerts(await fetchAlerts());
      } catch (fetchError) {
        console.error(fetchError);
        setError(fetchError instanceof Error ? fetchError.message : "Failed to refresh alerts.");
      }
    }, 5000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="space-y-2">
      <div className="eoc-panel">
        <div className="eoc-panel-header">
          <span>Alert Records — {alerts.length} total</span>
          <div className="flex items-center gap-2">
            <button onClick={loadData} className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold uppercase text-primary hover:bg-primary/10 transition-colors">
              <RefreshCw className="h-3 w-3" /> Reload
            </button>
          </div>
        </div>

        {loading ? <LoadingSpinner /> : error ? (
          <div className="border-t border-border p-4 text-sm text-destructive">{error}</div>
        ) : (
          <div className="overflow-auto">
            <table className="eoc-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Disaster Type</th>
                  <th>Region Name</th>
                  <th>Alert Message</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {alerts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted-foreground py-4">No data available</td>
                  </tr>
                ) : (
                  alerts.map((a, i) => (
                      <tr key={`${a.alert_id}-${i}`}>
                      <td className="mono text-muted-foreground">{a.alert_id}</td>
                      <td className="font-medium">{a.disaster_type}</td>
                      <td className="text-muted-foreground">{a.region_name}</td>
                      <td className="text-foreground/80 max-w-xs truncate">{a.alert_message}</td>
                      <td><AlertStatusBadge status={a.status} /></td>
                      <td className="mono text-muted-foreground text-[10px]">{a.alert_time}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <details className="eoc-panel p-3 text-xs">
        <summary className="cursor-pointer select-none text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Debug view
        </summary>
        <p className="mt-3 text-[11px] text-muted-foreground">Total Alerts: {alerts.length}</p>
        <pre className="mt-3 max-h-80 overflow-auto rounded border border-border bg-background p-3 text-[11px] leading-relaxed text-muted-foreground">
{JSON.stringify(alerts, null, 2)}
        </pre>
      </details>
    </div>
  );
}
