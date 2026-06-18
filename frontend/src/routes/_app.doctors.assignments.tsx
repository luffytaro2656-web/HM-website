import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { UserPlus, Calendar, Stethoscope, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { PATIENTS } from "@/mocks/patients";
import { getDoctor } from "@/mocks/doctors";
import { AssignmentModal } from "@/components/modules/doctors/AssignmentModal";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Patient } from "@/types/patient";

export const Route = createFileRoute("/_app/doctors/assignments")({
  head: () => ({ meta: [{ title: "Doctor Assignments — HMS" }] }),
  component: DoctorAssignmentsPage,
});

function DoctorAssignmentsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Columns for assignments
  const cols: Column<Patient>[] = [
    {
      key: "patient",
      header: "Patient Case",
      render: (p) => (
        <div>
          <p className="font-semibold text-sm">{p.name}</p>
          <span className="font-mono text-[10px] text-muted-foreground">{p.uhid}</span>
        </div>
      ),
      sortValue: (p) => p.name,
    },
    {
      key: "status",
      header: "Intake Status",
      render: (p) => <StatusBadge status={p.status} />,
      sortValue: (p) => p.status,
    },
    {
      key: "location",
      header: "Ward / Bed",
      render: (p) => p.status === "Inpatient" ? `${p.ward} · Bed ${p.bed}` : "Outpatient Care",
    },
    {
      key: "arrow",
      header: "",
      render: () => <ArrowRight className="size-3.5 text-muted-foreground/60" />,
    },
    {
      key: "doctor",
      header: "Assigned Physician",
      render: (p) => {
        const doc = getDoctor(p.doctorId);
        return (
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Stethoscope className="size-3.5" />
            </div>
            <div>
              <p className="font-medium text-xs sm:text-sm">{doc?.name ?? "No Doctor Assigned"}</p>
              {doc && <p className="text-[10px] text-muted-foreground">{doc.specialization}</p>}
            </div>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "",
      render: (p) => (
        <AssignmentModal
          initialPatient={p}
          onSuccess={() => setRefreshKey((k) => k + 1)}
          trigger={
            <Button size="sm" variant="outline" className="text-[10px] h-7">
              Reassign
            </Button>
          }
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Patient Care Assignments"
        description="Monitor active clinical case allocations and assign primary care physicians to patients."
        actions={
          <AssignmentModal
            onSuccess={() => setRefreshKey((k) => k + 1)}
            trigger={
              <Button size="sm">
                <UserPlus className="mr-1.5 size-4" /> Assign New Case
              </Button>
            }
          />
        }
      />
      <div key={refreshKey} className="px-6 pb-6">
        <DataTable
          data={PATIENTS}
          columns={cols}
          searchableFields={["name", "uhid"]}
          rowKey={(p) => p.id}
          pageSize={12}
        />
      </div>
    </div>
  );
}
