import { useEffect, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { fetchResources, useResource } from "@/lib/api";
import type { Resource } from "@/lib/types";

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shelterId, setShelterId] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [amount, setAmount] = useState("");
  const [updating, setUpdating] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setResources(await fetchResources());
    } catch (fetchError) {
      console.error(fetchError);
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load resources.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    const i = setInterval(async () => {
      try {
        setResources(await fetchResources());
      } catch (fetchError) {
        console.error(fetchError);
        setError(fetchError instanceof Error ? fetchError.message : "Failed to refresh resources.");
      }
    }, 5000);
    return () => clearInterval(i);
  }, []);

  const handleUseResource = async () => {
    if (!shelterId || !resourceType || !amount) {
      alert("Fill all fields");
      return;
    }

    try {
      setUpdating(true);
      console.log({
        shelter_id: shelterId,
        resource_type: resourceType,
        amount: amount,
      });

      const response = await useResource({
        shelter_id: Number(shelterId),
        resource_type: resourceType,
        amount: Number(amount),
      });

      if (response.success) {
        alert("Updated successfully");
      }

      setShelterId("");
      setResourceType("");
      setAmount("");
      await loadData();
    } catch (updateError) {
      alert(updateError instanceof Error ? updateError.message : "Resource update failed.");
    } finally {
      setUpdating(false);
    }
  };

  const resourceTypes = Array.from(new Set(resources.map((resource) => resource.resource_type)));

  return (
    <div className="space-y-2">
      <div className="eoc-panel">
        <div className="eoc-panel-header">
          <span>Resource Inventory</span>
          <div className="flex items-center gap-2">
            <button onClick={loadData} className="flex items-center gap-1 rounded px-2 py-1 text-[10px] font-semibold uppercase text-primary hover:bg-primary/10 transition-colors">
              <RefreshCw className="h-3 w-3" /> Reload
            </button>
          </div>
        </div>

        {loading ? <LoadingSpinner /> : error ? (
          <div className="border-t border-border p-4 text-sm text-destructive">{error}</div>
        ) : (
          <div className="space-y-3 p-3">
            <div className="grid gap-2 md:grid-cols-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Shelter ID</label>
                <input
                  type="number"
                  value={shelterId}
                  onChange={(event) => setShelterId(event.target.value)}
                  className="h-8 w-full rounded border border-input bg-background px-2 text-xs"
                  placeholder="Enter shelter_id"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Resource Type</label>
                <select
                  value={resourceType}
                  onChange={(event) => setResourceType(event.target.value)}
                  className="h-8 w-full rounded border border-input bg-background px-2 text-xs"
                >
                  <option value="">Select resource_type</option>
                  {resourceTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Amount</label>
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="h-8 w-full rounded border border-input bg-background px-2 text-xs"
                  placeholder="Enter amount"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleUseResource}
                  disabled={updating}
                  className="h-8 w-full rounded border border-border bg-secondary px-3 text-[10px] font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Use Resource"}
                </button>
              </div>
            </div>

            <div className="overflow-auto">
              <table className="eoc-table">
                <thead>
                  <tr>
                    <th>shelter_name</th>
                    <th>resource_type</th>
                    <th>quantity</th>
                    <th className="min-w-[160px]">Stock Level</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted-foreground py-4">No data available</td>
                    </tr>
                  ) : (
                    resources.map((r, i) => {
                      const pct = Math.round((r.quantity / r.max_quantity) * 100);
                      const isLow = pct < 25;
                      const barColor = isLow ? "bg-destructive" : pct < 50 ? "bg-warning" : "bg-success";
                      return (
                        <tr key={r.id + i}>
                          <td className="font-medium">{r.shelter_name}</td>
                          <td className="text-muted-foreground">{r.resource_type}</td>
                          <td className={`mono font-semibold ${isLow ? "text-destructive" : ""}`}>{r.quantity}/{r.max_quantity}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 flex-1 rounded-full bg-secondary">
                                <div className={`h-1.5 rounded-full ${barColor} transition-all duration-300`} style={{ width: `${pct}%` }} />
                              </div>
                              <span className={`mono text-[10px] ${isLow ? "text-destructive" : "text-muted-foreground"}`}>{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <details className="eoc-panel p-3 text-xs">
        <summary className="cursor-pointer select-none text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Debug view
        </summary>
        <p className="mt-3 text-[11px] text-muted-foreground">Total Resources: {resources.length}</p>
        <pre className="mt-3 max-h-80 overflow-auto rounded border border-border bg-background p-3 text-[11px] leading-relaxed text-muted-foreground">
{JSON.stringify(resources, null, 2)}
        </pre>
      </details>
    </div>
  );
}
