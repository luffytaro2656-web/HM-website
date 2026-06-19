import { createFileRoute, Link } from "@tanstack/react-router";
import { BedStatusGrid } from "@/components/modules/hospitals/BedStatusGrid";
import { ArrowLeft, BedDouble } from "lucide-react";

export const Route = createFileRoute("/_app/hospitals/beds")({
  head: () => ({ meta: [{ title: "Hospital Bed Management Directory — HMS" }] }),
  component: HospitalBedsPage,
});

function HospitalBedsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <Link to="/hospitals" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-3" /> Back to Branch Overview
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <BedDouble className="size-6 text-primary" />
          Network Bed Status Grid
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Monitor physical beds, track ward occupancies, configure category tiers, and view sanitization states.
        </p>
      </div>

      <BedStatusGrid />
    </div>
  );
}
