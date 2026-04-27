import type { Severity, AlertStatus, VolunteerStatus } from "@/lib/types";

const severityStyles: Record<Severity, string> = {
  LOW: "text-success bg-success/10",
  MEDIUM: "text-warning bg-warning/10",
  HIGH: "text-accent bg-accent/10",
  CRITICAL: "text-destructive bg-destructive/10 animate-pulse",
};

const alertStyles: Record<AlertStatus, string> = {
  PENDING: "text-warning bg-warning/10",
  SENT: "text-accent bg-accent/10",
  DELIVERED: "text-success bg-success/10",
  FAILED: "text-destructive bg-destructive/10",
};

const volunteerStyles: Record<VolunteerStatus, string> = {
  Available: "text-success bg-success/10",
  Assigned: "text-accent bg-accent/10",
  Unavailable: "text-destructive bg-destructive/10",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${severityStyles[severity]}`}>
      {severity}
    </span>
  );
}

export function AlertStatusBadge({ status }: { status: AlertStatus }) {
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${alertStyles[status]}`}>
      {status}
    </span>
  );
}

export function VolunteerStatusBadge({ status }: { status: VolunteerStatus }) {
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${volunteerStyles[status]}`}>
      {status}
    </span>
  );
}
