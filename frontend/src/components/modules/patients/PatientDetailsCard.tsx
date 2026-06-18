import React from "react";
import { User, Phone, Mail, MapPin, Calendar, Heart, Shield, Bed } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import { UhidBadge } from "./UhidBadge";
import { getDoctor } from "@/mocks/doctors";
import { getHospital } from "@/mocks/hospitals";
import { formatDate } from "@/utils/formatters";
import type { Patient } from "@/types/patient";

interface PatientDetailsCardProps {
  patient: Patient;
}

export function PatientDetailsCard({ patient }: PatientDetailsCardProps) {
  const doctor = getDoctor(patient.doctorId);
  const hospital = getHospital(patient.hospitalId);

  return (
    <Card className="shadow-sm border-sidebar-border bg-card">
      <CardHeader className="pb-3 border-b border-sidebar-border">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-xl font-bold">{patient.name}</CardTitle>
                <StatusBadge status={patient.status} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {patient.age} years old · {patient.gender}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <UhidBadge uhid={patient.uhid} />
            <p className="text-[10px] text-muted-foreground font-mono mt-1">
              Registered on: {formatDate(patient.lastVisit)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Section 1: Demographics */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Demographics</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5 text-muted-foreground">
                <Heart className="size-4 text-danger shrink-0" />
                <span>Blood Group: <span className="font-semibold text-foreground">{patient.bloodGroup}</span></span>
              </li>
              <li className="flex items-center gap-2.5 text-muted-foreground">
                <Phone className="size-4 shrink-0" />
                <span className="font-mono text-foreground">{patient.phone}</span>
              </li>
              <li className="flex items-center gap-2.5 text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                <span className="truncate text-foreground">{patient.email}</span>
              </li>
            </ul>
          </div>

          {/* Section 2: Clinical Details */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Primary Physician & Care</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5 text-muted-foreground">
                <Shield className="size-4 text-accent-foreground shrink-0" />
                <span>
                  Doctor: <span className="font-semibold text-foreground">{doctor?.name ?? "None"}</span>
                  <span className="block text-[11px] text-muted-foreground font-medium">{doctor?.specialization}</span>
                </span>
              </li>
              <li className="flex items-center gap-2.5 text-muted-foreground">
                <MapPin className="size-4 shrink-0" />
                <span className="truncate text-foreground">{hospital?.name ?? "None"}</span>
              </li>
            </ul>
          </div>

          {/* Section 3: Room/Bed Info for Inpatients */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Facility Allocation</h4>
            {patient.status === "Inpatient" ? (
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center gap-2.5 text-muted-foreground">
                  <Bed className="size-4 text-primary shrink-0" />
                  <span>
                    Location: <span className="font-semibold text-foreground">{patient.ward}</span>
                    <span className="block text-[11px] text-muted-foreground font-medium">Bed: {patient.bed}</span>
                  </span>
                </li>
                <li className="flex items-center gap-2.5 text-muted-foreground">
                  <Calendar className="size-4 shrink-0" />
                  <span>
                    Admitted: <span className="font-mono text-foreground">{patient.admissionDate ? formatDate(patient.admissionDate) : "—"}</span>
                  </span>
                </li>
              </ul>
            ) : (
              <div className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground bg-muted/10">
                Outpatient - No active ward assignment.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
