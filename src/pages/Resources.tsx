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

  const filtered = resources.filter(
    (r) => r.shelterName.toLowerCase().includes(search.toLowerCase()) || r.resourceType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Resources</h1>
          <p className="text-sm text-muted-foreground">Monitor shelter resources and supplies</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchFilter value={search} onChange={setSearch} placeholder="Search resources..." />
          <button onClick={loadData} className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
            <RefreshCw className="h-4 w-4" /> Load Resources
          </button>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="glass-card overflow-x-auto animate-fade-in">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border/50">
                <th className="px-5 py-3">Shelter Name</th>
                <th className="px-5 py-3">Resource Type</th>
                <th className="px-5 py-3">Quantity</th>
                <th className="px-5 py-3 min-w-[200px]">Level</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const pct = Math.round((r.quantity / r.maxQuantity) * 100);
                const isLow = pct < 25;
                const barColor = isLow ? "bg-destructive" : pct < 50 ? "bg-warning" : "bg-success";
                return (
                  <tr key={r.id + i} className="border-t border-border/30 transition-colors hover:bg-secondary/50">
                    <td className="px-5 py-3 font-medium">{r.shelterName}</td>
                    <td className="px-5 py-3 text-muted-foreground">{r.resourceType}</td>
                    <td className={`px-5 py-3 font-semibold ${isLow ? "text-destructive" : "text-foreground"}`}>
                      {r.quantity} / {r.maxQuantity}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 flex-1 rounded-full bg-secondary">
                          <div
                            className={`h-2 rounded-full ${barColor} transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${isLow ? "text-destructive" : "text-muted-foreground"}`}>{pct}%</span>
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
  );
}
