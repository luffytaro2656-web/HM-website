import { createFileRoute, Link } from "@tanstack/react-router";
import { ShiftScheduler } from "@/components/modules/staff/ShiftScheduler";
import { ArrowLeft, CalendarRange } from "lucide-react";

export const Route = createFileRoute("/_app/staff/schedule")({
  head: () => ({ meta: [{ title: "Staff Shift Scheduling — HMS" }] }),
  component: StaffSchedulePage,
});

function StaffSchedulePage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <Link to="/staff" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-3" /> Back to Staff Directory
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <CalendarRange className="size-6 text-primary" />
          Shift Scheduling Planner
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Create rosters, assign staff shifts, and check compliance fatigue thresholds.
        </p>
      </div>

      <ShiftScheduler />
    </div>
  );
}
