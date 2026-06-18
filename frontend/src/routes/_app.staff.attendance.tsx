import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Calendar, ArrowLeft, CheckCircle, Clock, XCircle, AlertTriangle, Edit3, X } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ATTENDANCE, STAFF, logAttendanceRecord } from "@/mocks/staff";
import { toast } from "sonner";
import type { AttendanceRecord, AttendanceStatus } from "@/types/staff";

export const Route = createFileRoute("/_app/staff/attendance")({
  head: () => ({ meta: [{ title: "Daily Attendance — HMS" }] }),
  component: AttendancePage,
});

function AttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [refreshKey, setRefreshKey] = useState(0);

  // Edit attendance states
  const [editStaffId, setEditStaffId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<AttendanceStatus>("Present");
  const [editCheckIn, setEditCheckIn] = useState("");
  const [editCheckOut, setEditCheckOut] = useState("");

  const present = ATTENDANCE.filter((a) => a.status === "Present").length;
  const absent = ATTENDANCE.filter((a) => a.status === "Absent").length;
  const late = ATTENDANCE.filter((a) => a.status === "Late").length;
  const halfDay = ATTENDANCE.filter((a) => a.status === "Half-day").length;

  const startEditAttendance = (rec: AttendanceRecord) => {
    setEditStaffId(rec.staffId);
    setEditStatus(rec.status);
    setEditCheckIn(rec.checkIn || "");
    setEditCheckOut(rec.checkOut || "");
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStaffId) return;

    logAttendanceRecord(
      editStaffId,
      editStatus,
      editStatus === "Absent" ? undefined : editCheckIn || undefined,
      editStatus === "Absent" || editStatus === "Half-day" ? undefined : editCheckOut || undefined
    );

    toast.success("Attendance Updated", {
      description: "Successfully saved daily status override.",
    });

    setEditStaffId(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" key={refreshKey}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <Link to="/staff" className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-3" /> Back to Staff Directory
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Clock className="size-6 text-primary" />
            Daily Attendance
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Log clinic check-in / check-out timestamps and track late logins.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 rounded-md border border-border bg-background pl-8 pr-3 text-xs focus:ring-1 focus:ring-primary"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => toast.success("Attendance Excel spreadsheet exported")} className="h-9 text-xs gap-1.5">
            <Download className="size-3.5" />
            Export Sheets
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-emerald-500/5 p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">Present</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{present}</p>
          </div>
          <CheckCircle className="size-6 text-emerald-500/80" />
        </div>
        <div className="rounded-xl border border-border bg-rose-500/5 p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">Absent</p>
            <p className="mt-1 text-2xl font-bold text-rose-600">{absent}</p>
          </div>
          <XCircle className="size-6 text-rose-500/80" />
        </div>
        <div className="rounded-xl border border-border bg-amber-500/5 p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">Late arrivals</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{late}</p>
          </div>
          <Clock className="size-6 text-amber-500/80" />
        </div>
        <div className="rounded-xl border border-border bg-indigo-500/5 p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">Half-day</p>
            <p className="mt-1 text-2xl font-bold text-indigo-600">{halfDay}</p>
          </div>
          <AlertTriangle className="size-6 text-indigo-500/80" />
        </div>
      </div>

      {/* Attendance Registry */}
      <Card className="border border-border bg-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Daily Timestamps Ledger ({date})</CardTitle>
          <CardDescription className="text-xs">
            Review shifts, check-in, check-out times, and calculate duty duration.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/20 border-b border-border text-[10px] font-semibold text-muted-foreground uppercase">
                  <th className="p-3 pl-4">Staff Member</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Check-In</th>
                  <th className="p-3">Check-Out</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ATTENDANCE.map((r) => {
                  const s = STAFF.find((x) => x.id === r.staffId);
                  
                  // Duration calculation
                  let durationStr = "—";
                  if (r.checkIn && r.checkOut) {
                    const [ih, im] = r.checkIn.split(":").map(Number);
                    const [oh, om] = r.checkOut.split(":").map(Number);
                    const mins = (oh * 60 + om) - (ih * 60 + im);
                    durationStr = `${Math.floor(mins / 60)}h ${mins % 60}m`;
                  }

                  return (
                    <tr key={r.staffId} className="hover:bg-accent/5 align-middle">
                      <td className="p-3 pl-4 font-semibold text-foreground">{s?.name ?? r.staffId}</td>
                      <td className="p-3 text-muted-foreground">{s?.role ?? "—"}</td>
                      <td className="p-3 font-mono text-slate-700 dark:text-slate-300">{r.checkIn ?? "—"}</td>
                      <td className="p-3 font-mono text-slate-700 dark:text-slate-300">{r.checkOut ?? "—"}</td>
                      <td className="p-3 font-mono text-slate-700 dark:text-slate-300">{durationStr}</td>
                      <td className="p-3 text-center">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="p-3 pr-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEditAttendance(r)}
                          className="h-7 text-[10px] gap-1 px-2"
                        >
                          <Edit3 className="size-3" /> Override
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Override Attendance Modal */}
      {editStaffId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <Card className="max-w-sm w-full bg-card border border-border">
            <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Override Attendance Record</CardTitle>
                <CardDescription className="text-[10px]">Alter check-in timestamps or status.</CardDescription>
              </div>
              <button onClick={() => setEditStaffId(null)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleSaveAttendance} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Attendance Status</Label>
                  <Select value={editStatus} onValueChange={(v: any) => setEditStatus(v)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Present">Present</SelectItem>
                      <SelectItem value="Absent">Absent</SelectItem>
                      <SelectItem value="Late">Late</SelectItem>
                      <SelectItem value="Half-day">Half-day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editStatus !== "Absent" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Check-In Time</Label>
                      <Input
                        type="text"
                        placeholder="e.g. 08:30"
                        className="text-xs h-9 font-mono"
                        value={editCheckIn}
                        onChange={(e) => setEditCheckIn(e.target.value)}
                      />
                    </div>

                    {editStatus !== "Half-day" && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold">Check-Out Time</Label>
                        <Input
                          type="text"
                          placeholder="e.g. 17:00"
                          className="text-xs h-9 font-mono"
                          value={editCheckOut}
                          onChange={(e) => setEditCheckOut(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" type="button" onClick={() => setEditStaffId(null)} className="h-8 text-xs">
                    Cancel
                  </Button>
                  <Button size="sm" type="submit" className="h-8 text-xs">
                    Save Record
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
