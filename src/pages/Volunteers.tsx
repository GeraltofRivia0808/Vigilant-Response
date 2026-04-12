import { useEffect, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
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
  useEffect(() => {
    const i = setInterval(() => fetchVolunteers().then(setVolunteers), 5000);
    return () => clearInterval(i);
  }, []);

  const filtered = volunteers.filter(
    (v) => v.name.toLowerCase().includes(search.toLowerCase()) || v.region.toLowerCase().includes(search.toLowerCase()) || v.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <div className="eoc-panel">
        <div className="eoc-panel-header">
          <span>Volunteer Roster — {volunteers.filter(v => v.status === "Available").length} available</span>
          <div className="flex items-center gap-2">
            <SearchFilter value={search} onChange={setSearch} placeholder="Filter volunteers..." />
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
                  <th>Name</th>
                  <th>Region</th>
                  <th>Skills</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v, i) => (
                  <tr key={v.id + i}>
                    <td className="font-medium">{v.name}</td>
                    <td className="text-muted-foreground">{v.region}</td>
                    <td className="text-muted-foreground">{v.skills}</td>
                    <td><VolunteerStatusBadge status={v.status} /></td>
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
