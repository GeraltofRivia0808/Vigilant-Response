import { useEffect, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import SearchFilter from "@/components/SearchFilter";
import { fetchResources, type Resource } from "@/lib/mock-data";

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setResources(await fetchResources());
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    const i = setInterval(() => fetchResources().then(setResources), 5000);
    return () => clearInterval(i);
  }, []);

  const filtered = resources.filter(
    (r) => r.shelterName.toLowerCase().includes(search.toLowerCase()) || r.resourceType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="eoc-panel">
        <div className="eoc-panel-header">
          <span>Resource Inventory</span>
          <div className="flex items-center gap-2">
            <SearchFilter value={search} onChange={setSearch} placeholder="Filter resources..." />
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
                  <th>Shelter</th>
                  <th>Resource</th>
                  <th>Qty</th>
                  <th className="min-w-[160px]">Stock Level</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const pct = Math.round((r.quantity / r.maxQuantity) * 100);
                  const isLow = pct < 25;
                  const barColor = isLow ? "bg-destructive" : pct < 50 ? "bg-warning" : "bg-success";
                  return (
                    <tr key={r.id + i}>
                      <td className="font-medium">{r.shelterName}</td>
                      <td className="text-muted-foreground">{r.resourceType}</td>
                      <td className={`mono font-semibold ${isLow ? "text-destructive" : ""}`}>{r.quantity}/{r.maxQuantity}</td>
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
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
