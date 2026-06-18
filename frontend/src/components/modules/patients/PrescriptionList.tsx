import React from "react";
import { Pill, Calendar } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PRESCRIPTIONS } from "@/mocks/patients";
import { getDoctor } from "@/mocks/doctors";
import { formatDate } from "@/utils/formatters";
import type { Patient } from "@/types/patient";

interface PrescriptionListProps {
  patient: Patient;
}

export function PrescriptionList({ patient }: PrescriptionListProps) {
  const patientPrescriptions = PRESCRIPTIONS.filter((p) => p.patientId === patient.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (patientPrescriptions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground bg-muted/5">
        No active prescriptions recorded for this patient.
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead>Date</TableHead>
            <TableHead>Medicine</TableHead>
            <TableHead>Dosage</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead className="text-right">Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patientPrescriptions.map((p) => {
            const doc = getDoctor(p.doctorId);
            return (
              <TableRow key={p.id} className="hover:bg-muted/10">
                <TableCell className="font-mono text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-muted-foreground" />
                    <span>{formatDate(p.date)}</span>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-primary">
                  <div className="flex items-center gap-1.5">
                    <Pill className="size-3.5 text-primary shrink-0" />
                    <span>{p.medicine}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs">{p.dosage}</TableCell>
                <TableCell className="text-xs">{p.frequency}</TableCell>
                <TableCell className="text-xs font-medium">{p.duration}</TableCell>
                <TableCell className="text-xs">
                  <div>
                    <span className="font-medium text-foreground">{doc?.name ?? "Unknown"}</span>
                    <span className="block text-[10px] text-muted-foreground">{doc?.specialization}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground max-w-[200px] truncate italic">
                  {p.notes ? `"${p.notes}"` : "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
