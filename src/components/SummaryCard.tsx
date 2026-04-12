import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: "danger" | "warning" | "accent" | "success";
  delay?: number;
}

const variantStyles = {
  danger: "border-primary/20 bg-primary/5 text-primary",
  warning: "border-warning/20 bg-warning/5 text-warning",
  accent: "border-accent/20 bg-accent/5 text-accent",
  success: "border-success/20 bg-success/5 text-success",
};

const iconBg = {
  danger: "bg-primary/10",
  warning: "bg-warning/10",
  accent: "bg-accent/10",
  success: "bg-success/10",
};

export default function SummaryCard({ title, value, icon: Icon, variant, delay = 0 }: SummaryCardProps) {
  return (
    <div
      className={`glass-card-hover p-5 ${variantStyles[variant]} animate-slide-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="mt-2 text-3xl font-bold animate-count-up">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${iconBg[variant]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
