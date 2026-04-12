import type { Severity, AlertStatus, VolunteerStatus } from "@/lib/mock-data";

const severityStyles: Record<Severity, string> = {
  LOW: "bg-success/10 text-success border-success/20",
  MEDIUM: "bg-warning/10 text-warning border-warning/20",
  HIGH: "bg-accent/10 text-accent border-accent/20",
  CRITICAL: "bg-destructive/10 text-destructive border-destructive/20 animate-pulse-glow",
};

const alertStyles: Record<AlertStatus, string> = {
  PENDING: "bg-warning/10 text-warning border-warning/20",
  SENT: "bg-accent/10 text-accent border-accent/20",
  DELIVERED: "bg-success/10 text-success border-success/20",
  FAILED: "bg-destructive/10 text-destructive border-destructive/20",
};

const volunteerStyles: Record<VolunteerStatus, string> = {
  Available: "bg-success/10 text-success border-success/20",
  Assigned: "bg-accent/10 text-accent border-accent/20",
  Unavailable: "bg-destructive/10 text-destructive border-destructive/20",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${severityStyles[severity]}`}>
      {severity}
    </span>
  );
}

export function AlertStatusBadge({ status }: { status: AlertStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${alertStyles[status]}`}>
      {status}
    </span>
  );
}

export function VolunteerStatusBadge({ status }: { status: VolunteerStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${volunteerStyles[status]}`}>
      {status}
    </span>
  );
}
