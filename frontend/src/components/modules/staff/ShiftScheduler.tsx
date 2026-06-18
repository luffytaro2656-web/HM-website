import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { STAFF, updateRosterShift } from "@/mocks/staff";
import { HOSPITALS } from "@/mocks/hospitals";
import { toast } from "sonner";
import { Sun, Sunset, Moon, ShieldAlert, CheckCircle2, AlertTriangle, RefreshCw, CalendarDays } from "lucide-react";
import type { StaffMember, Shift } from "@/types/staff";

interface ShiftSchedulerProps {
  hospitalId?: string; // Optional: filters to a single hospital
}

export function ShiftScheduler({ hospitalId }: ShiftSchedulerProps) {
  const [selectedHospId, setSelectedHospId] = useState(hospitalId || HOSPITALS[0].id);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [refreshKey, setRefreshKey] = useState(0);

  const activeHospId = hospitalId || selectedHospId;

  // Filter staff for active branch
  const activeStaff = STAFF.filter((s) => {
    if (s.hospitalId !== activeHospId) return false;
    if (roleFilter !== "all" && s.role !== roleFilter) return false;
    return true;
  });

  // Shift rosters
  const morningShift = activeStaff.filter((s) => s.shift === "Morning");
  const eveningShift = activeStaff.filter((s) => s.shift === "Evening");
  const nightShift = activeStaff.filter((s) => s.shift === "Night");

  // Scheduling conflicts detection
  // For demonstration, we simulate standard scheduling rules:
  // 1. Fatigue rule: Staff assigned to night shifts shouldn't work consecutive morning/evening shifts without rest.
  // 2. Capacity rule: Minimum 2 nurses required per shift in the branch.
  const checkConflicts = (member: StaffMember): { type: "warning" | "danger"; msg: string }[] => {
    const conflicts: { type: "warning" | "danger"; msg: string }[] = [];
    
    if (member.shift === "Night" && member.role === "Nurse") {
      conflicts.push({
        type: "warning",
        msg: "Night shift fatigue: Limit to 3 consecutive nights.",
      });
    }

    // Double-shift logic: if they have a critical role and shift is Night/Evening
    if (member.role === "Lab Tech" && member.shift === "Night") {
      conflicts.push({
        type: "danger",
        msg: "Solo Tech Duty: Requires back-up on-call coverage.",
      });
    }

    return conflicts;
  };

  const handleShiftChange = (staffId: string, newShift: Shift) => {
    const updated = updateRosterShift(staffId, newShift);
    if (updated) {
      toast.success("Roster Updated!", {
        description: `Successfully reassigned ${updated.name} to ${newShift} shift.`,
      });
      setRefreshKey((k) => k + 1);
    }
  };

  const currentHospital = HOSPITALS.find((h) => h.id === activeHospId);

  return (
    <div className="space-y-6" key={refreshKey}>
      {/* Filters bar */}
      <Card className="border border-border p-4 bg-card">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-wrap gap-4 items-end">
            {!hospitalId && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Hospital Branch</Label>
                <Select value={selectedHospId} onValueChange={setSelectedHospId}>
                  <SelectTrigger className="h-9 w-[220px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {HOSPITALS.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Role Filter</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-9 w-[160px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Nurse">Nurses</SelectItem>
                  <SelectItem value="Lab Tech">Lab Technicians</SelectItem>
                  <SelectItem value="Admin">Administrators</SelectItem>
                  <SelectItem value="Pharmacist">Pharmacists</SelectItem>
                  <SelectItem value="Support">Support Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/20 px-3 py-1.5 rounded-lg">
            <CalendarDays className="size-4 text-primary" />
            <span> Roster Week: <strong>Mon - Sun (Active)</strong></span>
          </div>
        </div>
      </Card>

      {/* Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Morning Shift */}
        <Card className="border border-border">
          <CardHeader className="p-4 pb-2 border-b border-border bg-emerald-500/5 dark:bg-emerald-500/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <Sun className="size-4" />
                Morning Shift
              </CardTitle>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                {morningShift.length} Assigned
              </Badge>
            </div>
            <CardDescription className="text-[10px] mt-0.5">Roster window: 07:00 AM – 03:00 PM</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3 max-h-[450px] overflow-y-auto">
            {morningShift.length > 0 ? (
              morningShift.map((s) => (
                <div key={s.id} className="border border-border rounded-xl p-3 space-y-2 hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-xs text-foreground">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground">{s.role} • {s.department}</p>
                    </div>
                    <Select value={s.shift} onValueChange={(v: Shift) => handleShiftChange(s.id, v)}>
                      <SelectTrigger className="h-6 w-[75px] text-[9px] px-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Morning">Morning</SelectItem>
                        <SelectItem value="Evening">Evening</SelectItem>
                        <SelectItem value="Night">Night</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-center py-6 text-muted-foreground italic">No staff assigned to Morning shift.</p>
            )}
          </CardContent>
        </Card>

        {/* Evening Shift */}
        <Card className="border border-border">
          <CardHeader className="p-4 pb-2 border-b border-border bg-indigo-500/5 dark:bg-indigo-500/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
                <Sunset className="size-4" />
                Evening Shift
              </CardTitle>
              <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
                {eveningShift.length} Assigned
              </Badge>
            </div>
            <CardDescription className="text-[10px] mt-0.5">Roster window: 03:00 PM – 11:00 PM</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3 max-h-[450px] overflow-y-auto">
            {eveningShift.length > 0 ? (
              eveningShift.map((s) => (
                <div key={s.id} className="border border-border rounded-xl p-3 space-y-2 hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-xs text-foreground">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground">{s.role} • {s.department}</p>
                    </div>
                    <Select value={s.shift} onValueChange={(v: Shift) => handleShiftChange(s.id, v)}>
                      <SelectTrigger className="h-6 w-[75px] text-[9px] px-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Morning">Morning</SelectItem>
                        <SelectItem value="Evening">Evening</SelectItem>
                        <SelectItem value="Night">Night</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-center py-6 text-muted-foreground italic">No staff assigned to Evening shift.</p>
            )}
          </CardContent>
        </Card>

        {/* Night Shift */}
        <Card className="border border-border">
          <CardHeader className="p-4 pb-2 border-b border-border bg-amber-500/5 dark:bg-amber-500/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <Moon className="size-4" />
                Night Shift
              </CardTitle>
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                {nightShift.length} Assigned
              </Badge>
            </div>
            <CardDescription className="text-[10px] mt-0.5">Roster window: 11:00 PM – 07:00 AM</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3 max-h-[450px] overflow-y-auto">
            {nightShift.length > 0 ? (
              nightShift.map((s) => {
                const conflicts = checkConflicts(s);
                return (
                  <div key={s.id} className="border border-border rounded-xl p-3 space-y-2 hover:border-primary/30 transition-all bg-amber-500/[0.02]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-xs text-foreground">{s.name}</p>
                        <p className="text-[10px] text-muted-foreground">{s.role} • {s.department}</p>
                      </div>
                      <Select value={s.shift} onValueChange={(v: Shift) => handleShiftChange(s.id, v)}>
                        <SelectTrigger className="h-6 w-[75px] text-[9px] px-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Morning">Morning</SelectItem>
                          <SelectItem value="Evening">Evening</SelectItem>
                          <SelectItem value="Night">Night</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Conflict Warnings */}
                    {conflicts.map((c, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-1 p-1.5 rounded-lg text-[9px] border ${
                          c.type === "danger"
                            ? "bg-rose-500/10 text-rose-700 border-rose-500/20"
                            : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                        }`}
                      >
                        {c.type === "danger" ? (
                          <ShieldAlert className="size-3 text-rose-500 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="size-3 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <span>{c.msg}</span>
                      </div>
                    ))}
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-center py-6 text-muted-foreground italic">No staff assigned to Night shift.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Roster Conflict Alert Summary */}
      <Card className="border border-yellow-500/20 bg-yellow-500/5 p-4 rounded-xl flex items-start gap-3">
        <AlertTriangle className="size-5 text-yellow-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-yellow-800 dark:text-yellow-400">Roster Capacity Check</h4>
          <p className="text-[11px] text-yellow-700 dark:text-yellow-500/90 mt-0.5">
            HMS guidelines require that every clinical shift holds a minimum of 2 Nurses and 1 Lab Technician.
            Ensure sufficient coverage before locking the week's roster.
          </p>
        </div>
      </Card>
    </div>
  );
}
