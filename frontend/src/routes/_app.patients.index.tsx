import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Eye, Users, Bed, UserCheck, LogOut } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PATIENTS } from "@/mocks/patients";
import { getDoctor } from "@/mocks/doctors";
import { getHospital } from "@/mocks/hospitals";
import { formatDate } from "@/utils/formatters";
import { toast } from "sonner";
import type { Patient } from "@/types/patient";

export const Route = createFileRoute("/_app/patients/")({
  head: () => ({ meta: [{ title: "Patients — HMS" }] }),
  component: PatientsPage,
});

function PatientsPage() {
  const totalPatients = PATIENTS.length;
  const activeInpatients = PATIENTS.filter((p) => p.status === "Inpatient").length;
  const activeOutpatients = PATIENTS.filter((p) => p.status === "Outpatient").length;
  const discharged = PATIENTS.filter((p) => p.status === "Discharged").length;

  const cols: Column<Patient>[] = [
    { key: "uhid", header: "UHID", render: (p) => <span className="font-mono text-xs">{p.uhid}</span>, sortValue: (p) => p.uhid },
    { key: "name", header: "Name", render: (p) => <span className="font-medium">{p.name}</span>, sortValue: (p) => p.name },
    { key: "age", header: "Age/Sex", render: (p) => `${p.age} / ${p.gender[0]}`, sortValue: (p) => p.age },
    { key: "hospital", header: "Hospital", render: (p) => getHospital(p.hospitalId)?.name ?? "—" },
    { key: "doctor", header: "Doctor", render: (p) => getDoctor(p.doctorId)?.name ?? "—" },
    { key: "status", header: "Status", render: (p) => <StatusBadge status={p.status} /> },
    { key: "visit", header: "Last Visit", render: (p) => <span className="font-mono text-xs">{formatDate(p.lastVisit)}</span>, sortValue: (p) => p.lastVisit },
    {
      key: "actions",
      header: "",
      render: (p) => (
        <Link
          to="/patients/$id"
          params={{ id: p.id }}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground inline-flex items-center"
        >
          <Eye className="size-4" />
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Patients"
        description={`${totalPatients} registered patients across the network`}
        actions={
          <Link to="/patients/registration">
            <Button>
              <Plus className="mr-1.5 size-4" />Register Patient
            </Button>
          </Link>
        }
      />

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 px-6 mb-2">
        <Card className="bg-card shadow-sm border-sidebar-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Directory</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">{totalPatients}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">System-wide records</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-sidebar-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Active Inpatients</p>
              <h3 className="text-2xl font-bold mt-1 text-primary">{activeInpatients}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Currently admitted</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bed className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-sidebar-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Active Outpatients</p>
              <h3 className="text-2xl font-bold mt-1 text-success-foreground">{activeOutpatients}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Consultation status</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-full bg-success/10 text-success-foreground">
              <UserCheck className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm border-sidebar-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Discharged</p>
              <h3 className="text-2xl font-bold mt-1 text-muted-foreground">{discharged}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Released from care</p>
            </div>
            <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <LogOut className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable data={PATIENTS} columns={cols} searchableFields={["name", "uhid", "phone"]} rowKey={(p) => p.id} pageSize={15} />
    </div>
  );
}
