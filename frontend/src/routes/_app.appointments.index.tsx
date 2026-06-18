import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus, Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppointmentCalendar } from "@/components/modules/appointments/AppointmentCalendar";
import { APPOINTMENTS } from "@/mocks/appointments";

export const Route = createFileRoute("/_app/appointments/")({
  head: () => ({ meta: [{ title: "Appointments Overview — HMS" }] }),
  component: AppointmentsIndexPage,
});

function AppointmentsIndexPage() {
  const navigate = useNavigate();

  // Aggregate stats
  const total = APPOINTMENTS.length;
  const scheduled = APPOINTMENTS.filter((a) => a.status === "Scheduled").length;
  const confirmed = APPOINTMENTS.filter((a) => a.status === "Confirmed").length;
  const completed = APPOINTMENTS.filter((a) => a.status === "Completed").length;
  const cancelled = APPOINTMENTS.filter((a) => a.status === "Cancelled").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments Overview"
        description="Monitor, triage, and schedule clinic appointments for all patient and staff tiers."
        actions={
          <Button onClick={() => navigate({ to: "/appointments/booking" })} className="gap-2">
            <Plus className="size-4" />
            Book Appointment
          </Button>
        }
      />

      {/* Roster overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Calendar className="size-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Active Bookings</p>
              <p className="text-lg font-extrabold">{scheduled + confirmed}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Pending/Scheduled</p>
              <p className="text-lg font-extrabold">{scheduled}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Completed</p>
              <p className="text-lg font-extrabold">{completed}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="size-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <XCircle className="size-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Cancelled / No-Show</p>
              <p className="text-lg font-extrabold">{cancelled}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <AppointmentCalendar />
    </div>
  );
}
