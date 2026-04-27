import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import type { Disaster, Resource, Volunteer } from "@/lib/types";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

interface Props {
  disasters: Disaster[];
  resources: Resource[];
  volunteers: Volunteer[];
}

const COLORS = {
  LOW: "#22c55e",
  MEDIUM: "#eab308",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
  Available: "#22c55e",
  Assigned: "#f97316",
  Unavailable: "#ef4444",
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "hsl(210 15% 75%)",
        font: {
          size: 10,
        },
      },
    },
    tooltip: {
      backgroundColor: "hsl(222 25% 8%)",
      borderColor: "hsl(222 15% 16%)",
      borderWidth: 1,
      titleColor: "hsl(210 15% 90%)",
      bodyColor: "hsl(210 15% 85%)",
    },
  },
  scales: {
    x: {
      ticks: {
        color: "hsl(215 10% 55%)",
        font: {
          size: 10,
        },
      },
      grid: {
        color: "hsl(222 15% 14%)",
      },
    },
    y: {
      ticks: {
        color: "hsl(215 10% 55%)",
        font: {
          size: 10,
        },
      },
      grid: {
        color: "hsl(222 15% 14%)",
      },
      beginAtZero: true,
    },
  },
};

export default function AnalyticsPanel({ disasters, resources, volunteers }: Props) {
  const severityLabels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
  const severityCounts = severityLabels.map((severity) =>
    disasters.reduce((count, disaster) => count + (disaster.severity_level === severity ? 1 : 0), 0)
  );

  const resourceLabels = resources.map((resource) => resource.shelter_name);
  const resourceQuantities = resources.map((resource) => resource.quantity);
  const resourceColors = resources.map((resource) =>
    resource.quantity < resource.max_quantity * 0.25 ? "#ef4444" : resource.quantity < resource.max_quantity * 0.5 ? "#eab308" : "#22c55e"
  );

  const volunteerLabels = ["Available", "Assigned", "Unavailable"] as const;
  const volunteerCounts = volunteerLabels.map((status) =>
    volunteers.reduce((count, volunteer) => count + (volunteer.availability_status === status ? 1 : 0), 0)
  );

  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
      <div className="eoc-panel">
        <div className="eoc-panel-header">
          <span>Severity Level Distribution</span>
        </div>
        <div className="h-[220px] p-3">
          <Bar
            data={{
              labels: severityLabels,
              datasets: [
                {
                  label: "Events",
                  data: severityCounts,
                  backgroundColor: severityLabels.map((severity) => COLORS[severity]),
                  borderRadius: 6,
                },
              ],
            }}
            options={{
              ...chartOptions,
              indexAxis: "y",
              plugins: {
                ...chartOptions.plugins,
                legend: { display: false },
              },
              scales: {
                x: {
                  ticks: {
                    color: "hsl(215 10% 55%)",
                    font: {
                      size: 10,
                    },
                  },
                  grid: {
                    color: "hsl(222 15% 14%)",
                  },
                  beginAtZero: true,
                },
                y: {
                  ticks: {
                    color: "hsl(215 10% 55%)",
                    font: {
                      size: 10,
                    },
                  },
                  grid: {
                    display: false,
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="eoc-panel">
        <div className="eoc-panel-header">
          <span>Resource Quantities</span>
        </div>
        <div className="h-[220px] p-3">
          <Bar
            data={{
              labels: resourceLabels,
              datasets: [
                {
                  label: "Quantity",
                  data: resourceQuantities,
                  backgroundColor: resourceColors,
                  borderRadius: 6,
                },
              ],
            }}
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: { display: false },
              },
            }}
          />
        </div>
      </div>

      <div className="eoc-panel">
        <div className="eoc-panel-header">
          <span>Volunteer Status</span>
        </div>
        <div className="flex h-[220px] items-center gap-3 p-3">
          <div className="h-full flex-1">
            <Pie
              data={{
                labels: volunteerLabels,
                datasets: [
                  {
                    data: volunteerCounts,
                    backgroundColor: volunteerLabels.map((status) => COLORS[status]),
                    borderWidth: 0,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: chartOptions.plugins.tooltip,
                },
              }}
            />
          </div>
          <div className="space-y-1.5">
            {volunteerLabels.map((status) => (
              <div key={status} className="flex items-center gap-2 text-[10px]">
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[status] }} />
                <span className="text-muted-foreground">{status}</span>
                <span className="mono font-semibold text-foreground">{volunteerCounts[volunteerLabels.indexOf(status)]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
