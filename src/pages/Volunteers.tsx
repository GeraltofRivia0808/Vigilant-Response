import { useEffect, useState, useCallback } from "react";
import { RefreshCw, User } from "lucide-react";
import { VolunteerStatusBadge } from "@/components/SeverityBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import SearchFilter from "@/components/SearchFilter";
import { fetchVolunteers, type Volunteer } from "@/lib/mock-data";

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setVolunteers(await fetchVolunteers());
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = volunteers.filter(
    (v) => v.name.toLowerCase().includes(search.toLowerCase()) || v.region.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Volunteers</h1>
          <p className="text-sm text-muted-foreground">{volunteers.filter(v => v.status === "Available").length} currently available</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchFilter value={search} onChange={setSearch} placeholder="Search volunteers..." />
          <button onClick={loadData} className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
            <RefreshCw className="h-4 w-4" /> Load Volunteers
          </button>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((v, i) => (
            <div key={v.id + i} className="glass-card-hover p-5 space-y-4 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{v.name}</p>
                    <p className="text-xs text-muted-foreground">{v.region}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground border border-border/50 rounded-md px-2 py-1">{v.skills}</span>
                <VolunteerStatusBadge status={v.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
