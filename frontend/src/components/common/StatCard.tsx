import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: number; // %
  iconColor?: string;
}

export function StatCard({ title, value, unit, icon: Icon, trend, iconColor }: StatCardProps) {
  const positive = (trend ?? 0) >= 0;
  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {value}
            {unit ? <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span> : null}
          </p>
          {typeof trend === "number" ? (
            <p className={cn("mt-2 flex items-center gap-1 text-xs font-medium", positive ? "text-success" : "text-danger")}>
              {positive ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
              {Math.abs(trend)}% vs last period
            </p>
          ) : null}
        </div>
        <div className={cn("flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary", iconColor)}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}
