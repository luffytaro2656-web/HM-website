import React from "react";
import { Activity, Heart, Thermometer, Droplets, Calendar, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VITALS } from "@/mocks/patients";
import { formatDate } from "@/utils/formatters";
import type { Patient } from "@/types/patient";

interface VitalsTrackerProps {
  patient: Patient;
}

export function VitalsTracker({ patient }: VitalsTrackerProps) {
  const patientVitals = VITALS.filter((v) => v.patientId === patient.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latest = patientVitals[0];

  if (patientVitals.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground bg-muted/5">
        No vitals history recorded for this patient.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Latest Vitals Visual Cards */}
      {latest && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card className="bg-primary/5 border-primary/20 shadow-none">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Blood Pressure</p>
                <h4 className="text-xl font-bold mt-1 text-foreground">{latest.bp}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">mmHg</p>
              </div>
              <Activity className="size-8 text-primary opacity-60" />
            </CardContent>
          </Card>

          <Card className="bg-danger/5 border-danger/20 shadow-none">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Heart Rate</p>
                <h4 className="text-xl font-bold mt-1 text-danger">{latest.pulse}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">bpm</p>
              </div>
              <Heart className="size-8 text-danger opacity-60" />
            </CardContent>
          </Card>

          <Card className="bg-accent-foreground/5 border-accent-foreground/20 shadow-none">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Temperature</p>
                <h4 className="text-xl font-bold mt-1 text-foreground">{latest.temperature}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">°F</p>
              </div>
              <Thermometer className="size-8 text-accent-foreground opacity-60" />
            </CardContent>
          </Card>

          <Card className="bg-success/5 border-success/20 shadow-none">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">SpO2</p>
                <h4 className="text-xl font-bold mt-1 text-success">{latest.spo2}%</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Blood Oxygen</p>
              </div>
              <Droplets className="size-8 text-success opacity-60" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Vitals History Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground">Vitals & Nursing Log History</h3>
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Recorded At</TableHead>
                <TableHead>B.P.</TableHead>
                <TableHead>Pulse</TableHead>
                <TableHead>Temp</TableHead>
                <TableHead>SpO2</TableHead>
                <TableHead className="text-right">Nursing / Clinical Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patientVitals.map((v) => (
                <TableRow key={v.id} className="hover:bg-muted/10">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      <span>{formatDate(v.date)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono font-medium text-xs">{v.bp}</TableCell>
                  <TableCell className="text-xs">{v.pulse} bpm</TableCell>
                  <TableCell className="text-xs">{v.temperature} °F</TableCell>
                  <TableCell className="text-xs font-semibold text-success">{v.spo2}%</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground max-w-[250px] truncate italic">
                    {v.nursingNotes ? `"${v.nursingNotes}"` : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
