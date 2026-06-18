import { createFileRoute, Link } from "@tanstack/react-router";
import { DepartmentList } from "@/components/modules/hospitals/DepartmentList";
import { ArrowLeft, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/hospitals/departments")({
  head: () => ({ meta: [{ title: "Hospital Departments Directory — HMS" }] }),
  component: HospitalDepartmentsPage,
});

function HospitalDepartmentsPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <Link to="/hospitals" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-3" /> Back to Branch Overview
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Stethoscope className="size-6 text-primary" />
          Department Registry
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Configure, manage, and scale clinical departments (OPD, ICU, Surgery, Laboratory) across the hospital network.
        </p>
      </div>

      <DepartmentList />
    </div>
  );
}
