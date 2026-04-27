import { useEffect, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { fetchVolunteers, updateVolunteerStatus } from "@/lib/api";
import type { Volunteer } from "@/lib/types";
import { toast } from "sonner";

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVolunteerId, setActiveVolunteerId] = useState<string | number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setVolunteers(await fetchVolunteers());
    } catch (fetchError) {
      console.error(fetchError);
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load volunteers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    const i = setInterval(async () => {
      try {
        setVolunteers(await fetchVolunteers());
      } catch (fetchError) {
        console.error(fetchError);
        setError(fetchError instanceof Error ? fetchError.message : "Failed to refresh volunteers.");
      }
    }, 5000);
    return () => clearInterval(i);
  }, []);

  const handleStatusChange = async (volunteer: Volunteer, nextStatus: Volunteer["availability_status"]) => {
    if (nextStatus === volunteer.availability_status) {
      return;
    }

    try {
      setActiveVolunteerId(volunteer.id);
      const response = await updateVolunteerStatus({
        volunteer_id: Number(volunteer.id),
        availability_status: nextStatus,
      });

      toast.success(response.message);
      await loadData();
    } catch (updateError) {
      toast.error(updateError instanceof Error ? updateError.message : "Volunteer status update failed.");
    } finally {
      setActiveVolunteerId(null);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">Total Volunteers: {volunteers.length}</p>

      <div className="eoc-panel">
        <div className="eoc-panel-header">
          <span>Volunteer Roster — {volunteers.length} total</span>
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
                  <th>name</th>
                  <th>email</th>
                  <th>skills</th>
                  <th>availability_status</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted-foreground py-4">No data available</td>
                  </tr>
                ) : (
                  volunteers.map((v, i) => (
                    <tr key={`${v.id}-${i}`}>
                      <td className="font-medium">{v.name}</td>
                      <td className="text-muted-foreground">{v.email || "N/A"}</td>
                      <td className="text-foreground/85">{v.skills || "N/A"}</td>
                      <td>
                        <select
                          value={v.availability_status}
                          onChange={(event) => handleStatusChange(v, event.target.value as Volunteer["availability_status"])}
                          disabled={activeVolunteerId === v.id}
                          className="h-7 rounded border border-input bg-background px-2 text-xs text-foreground disabled:opacity-50"
                        >
                          <option value="Available">Available</option>
                          <option value="Assigned">Assigned</option>
                          <option value="Unavailable">Unavailable</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
