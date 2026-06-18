import { createFileRoute } from "@tanstack/react-router";
import { Plus, Star, Stethoscope, UserCheck, ShieldAlert, CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DOCTORS } from "@/mocks/doctors";
import { getHospital } from "@/mocks/hospitals";
import { toast } from "sonner";
import type { Doctor } from "@/types/doctor";

export const Route = createFileRoute("/_app/doctors/")({
  head: () => ({ meta: [{ title: "Doctors — HMS" }] }),
  component: DoctorsPage,
});

function DoctorsPage() {
  const totalDoctors = DOCTORS.length;
  const onDuty = DOCTORS.filter((d) => d.status === "On Duty").length;
  const offDuty = DOCTORS.filter((d) => d.status === "Off Duty").length;
  const onLeave = DOCTORS.filter((d) => d.status === "On Leave").length;

  const cols: Column<Doctor>[] = [
    {
      key: "name",
      header: "Doctor",
      render: (d) => (
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {d.name.split(" ").slice(1).map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="font-medium">{d.name}</p>
            <p className="text-xs text-muted-foreground">{d.qualification}</p>
          </div>
        </div>
      ),
      sortValue: (d) => d.name,
    },
    { key: "spec", header: "Specialization", render: (d) => d.specialization, sortValue: (d) => d.specialization },
    { key: "hospital", header: "Hospital", render: (d) => getHospital(d.hospitalId)?.name ?? "—" },
    { key: "schedule", header: "Today", render: (d) => <span className="font-mono text-xs">{d.scheduleToday}</span> },
    { key: "patients", header: "Patients", render: (d) => d.patientsToday, sortValue: (d) => d.patientsToday },
    {
      key: "rating",
      header: "Rating",
      render: (d) => (
        <span className="inline-flex items-center gap-1 text-xs">
          <Star className="size-3 fill-accent text-accent" />{d.rating.toFixed(1)}
        </span>
      ),
      sortValue: (d) => d.rating,
    },
    { key: "status", header: "Status", render: (d) => <StatusBadge status={d.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title="Doctors"
        description={`${totalDoctors} registered medical practitioners`}
        actions={<Button onClick={() => toast.info("Add Doctor feature coming soon")}><Plus className="mr-1.5 size-4" />Add Doctor</Button>}
      />

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 px-6 mb-2">
        <Card className="bg-card shadow-sm border-sidebar-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Roster</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{totalDoctors}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Active specialists</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Stethoscope className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-sidebar-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">On Duty</p>
              <h3 className="text-2xl font-bold mt-1 text-success-foreground">{onDuty}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Consulting today</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-full bg-success/10 text-success-foreground">
              <UserCheck className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-sidebar-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Off Duty</p>
              <h3 className="text-2xl font-bold mt-1 text-muted-foreground">{offDuty}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Shift completed</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ShieldAlert className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-sidebar-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">On Leave</p>
              <h3 className="text-2xl font-bold mt-1 text-danger">{onLeave}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Approved absence</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-full bg-danger/10 text-danger">
              <CalendarClock className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable data={DOCTORS} columns={cols} searchableFields={["name", "specialization"]} rowKey={(d) => d.id} pageSize={15} />
    </div>
  );
}
