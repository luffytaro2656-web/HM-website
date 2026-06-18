import React from "react";
import { MessageSquare, Stethoscope, Calendar } from "lucide-react";
import { CONSULTATION_LOGS } from "@/mocks/patients";
import { getDoctor } from "@/mocks/doctors";
import { formatDate } from "@/utils/formatters";
import type { Patient } from "@/types/patient";

interface ConsultationLogTimelineProps {
  patient: Patient;
}

export function ConsultationLogTimeline({ patient }: ConsultationLogTimelineProps) {
  const patientLogs = CONSULTATION_LOGS.filter((log) => log.patientId === patient.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (patientLogs.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground bg-muted/5">
        No consultation logs found for this patient.
      </div>
    );
  }

  return (
    <div className="relative border-l border-sidebar-border/60 ml-4 pl-6 space-y-6">
      {patientLogs.map((log) => {
        const doc = getDoctor(log.doctorId);
        return (
          <div key={log.id} className="relative">
            {/* Timeline Dot */}
            <span className="absolute -left-10 top-1.5 flex size-8 items-center justify-center rounded-full border bg-background text-primary shadow-sm">
              <Stethoscope className="size-4" />
            </span>
            <div className="rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-2 mb-3">
                <div>
                  <h4 className="font-semibold text-sm">{doc?.name ?? "Unknown Doctor"}</h4>
                  <p className="text-xs text-muted-foreground">{doc?.specialization ?? "General Consulting"}</p>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                  <Calendar className="size-3" />
                  <span>{formatDate(log.date)}</span>
                </div>
              </div>
              <div className="space-y-2.5 text-xs sm:text-sm">
                <div>
                  <span className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wide">Symptoms:</span>
                  <p className="mt-0.5 font-medium">{log.symptoms}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wide">Diagnosis:</span>
                  <p className="mt-0.5 font-semibold text-primary">{log.diagnosis}</p>
                </div>
                {log.notes && (
                  <div>
                    <span className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wide flex items-center gap-1">
                      <MessageSquare className="size-3" /> Notes & Recommendations:
                    </span>
                    <p className="mt-0.5 text-muted-foreground italic bg-muted/20 p-2.5 rounded border border-dashed">
                      "{log.notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
