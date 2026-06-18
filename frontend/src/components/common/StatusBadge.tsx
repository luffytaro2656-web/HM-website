import { cn } from "@/lib/utils";

const VARIANT: Record<string, string> = {
  Active: "bg-success/15 text-success border-success/30",
  Inactive: "bg-muted text-muted-foreground border-border",
  "On Duty": "bg-success/15 text-success border-success/30",
  "Off Duty": "bg-muted text-muted-foreground border-border",
  "On Leave": "bg-warning/15 text-warning-foreground border-warning/30",
  Inpatient: "bg-primary/15 text-primary border-primary/30",
  Outpatient: "bg-success/15 text-success border-success/30",
  Discharged: "bg-muted text-muted-foreground border-border",
  Scheduled: "bg-primary/15 text-primary border-primary/30",
  Confirmed: "bg-success/15 text-success border-success/30",
  Completed: "bg-muted text-muted-foreground border-border",
  Cancelled: "bg-danger/15 text-danger border-danger/30",
  "No-show": "bg-danger/15 text-danger border-danger/30",
  Paid: "bg-success/15 text-success border-success/30",
  Pending: "bg-warning/15 text-warning-foreground border-warning/30",
  Partial: "bg-accent/20 text-accent-foreground border-accent/40",
  Overdue: "bg-danger/15 text-danger border-danger/30",
  "Low Stock": "bg-warning/15 text-warning-foreground border-warning/30",
  "Expiring Soon": "bg-accent/20 text-accent-foreground border-accent/40",
  Expired: "bg-danger/15 text-danger border-danger/30",
  Normal: "bg-success/15 text-success border-success/30",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const cls = VARIANT[status] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        cls,
        className,
      )}
    >
      {status}
    </span>
  );
}
