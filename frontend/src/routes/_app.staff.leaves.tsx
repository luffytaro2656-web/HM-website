import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Calendar, FileText, Check, X, Plus, AlertCircle, FileCheck2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LEAVE_REQUESTS, STAFF, submitLeaveRequest, updateLeaveStatus } from "@/mocks/staff";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/staff/leaves")({
  head: () => ({ meta: [{ title: "Leave Applications — HMS" }] }),
  component: StaffLeavesPage,
});

function StaffLeavesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Form states
  const [staffId, setStaffId] = useState("");
  const [leaveType, setLeaveType] = useState<"Sick Leave" | "Casual Leave" | "Earned Leave" | "Maternity Leave">("Sick Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [days, setDays] = useState(1);

  const handleApprove = (id: string) => {
    const res = updateLeaveStatus(id, "Approved");
    if (res) {
      toast.success("Leave Approved!", {
        description: `Approved request ${id} for ${res.staffName}.`,
      });
      setRefreshKey((k) => k + 1);
    }
  };

  const handleReject = (id: string) => {
    const res = updateLeaveStatus(id, "Rejected");
    if (res) {
      toast.error("Leave Request Rejected", {
        description: `Rejected request ${id} for ${res.staffName}.`,
      });
      setRefreshKey((k) => k + 1);
    }
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId || !startDate || !endDate || !reason) {
      toast.error("Please fill in all leave request parameters");
      return;
    }

    const selectedStaff = STAFF.find((s) => s.id === staffId);
    if (!selectedStaff) return;

    submitLeaveRequest({
      staffId: selectedStaff.id,
      staffName: selectedStaff.name,
      role: selectedStaff.role,
      leaveType,
      startDate,
      endDate,
      reason,
      days,
    });

    toast.success("Leave Request Submitted!", {
      description: `Pending approval from department head.`,
    });

    // Reset
    setStaffId("");
    setStartDate("");
    setEndDate("");
    setReason("");
    setDays(1);
    setShowApplyModal(false);
    setRefreshKey((k) => k + 1);
  };

  const pendingCount = LEAVE_REQUESTS.filter((l) => l.status === "Pending").length;
  const approvedCount = LEAVE_REQUESTS.filter((l) => l.status === "Approved").length;
  const rejectedCount = LEAVE_REQUESTS.filter((l) => l.status === "Rejected").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto" key={refreshKey}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <Link to="/staff" className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-3" /> Back to Staff Directory
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Calendar className="size-6 text-primary" />
            Leave Registry
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track leave requests, review medical certificates, and approve absenteeism records.
          </p>
        </div>
        <div>
          <Button size="sm" onClick={() => setShowApplyModal(true)} className="text-xs h-9 gap-1.5">
            <Plus className="size-4" />
            Request Leave
          </Button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">Pending Action</span>
              <p className="text-2xl font-bold mt-1 text-amber-600">{pendingCount}</p>
            </div>
            <AlertCircle className="size-7 text-amber-500/80" />
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">Approved Leaves</span>
              <p className="text-2xl font-bold mt-1 text-emerald-600">{approvedCount}</p>
            </div>
            <FileCheck2 className="size-7 text-emerald-500/80" />
          </CardContent>
        </Card>
        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">Declined Requests</span>
              <p className="text-2xl font-bold mt-1 text-rose-600">{rejectedCount}</p>
            </div>
            <X className="size-7 text-rose-500/80" />
          </CardContent>
        </Card>
      </div>

      {/* Roster Leave Table */}
      <Card className="border border-border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Roster Absenteeism Log</CardTitle>
          <CardDescription className="text-xs">
            Review request parameters, medical reasons, and duration of planned leaves.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/20 border-b border-border text-[10px] font-semibold text-muted-foreground uppercase">
                  <th className="p-3 pl-4">Staff Member</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Dates</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3 text-center">Days</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {LEAVE_REQUESTS.length > 0 ? (
                  LEAVE_REQUESTS.map((lr) => {
                    let badgeClass = "bg-amber-500/10 text-amber-600 border-amber-500/20";
                    if (lr.status === "Approved") badgeClass = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
                    else if (lr.status === "Rejected") badgeClass = "bg-rose-500/10 text-rose-600 border-rose-500/20";

                    return (
                      <tr key={lr.id} className="hover:bg-accent/5 align-middle">
                        <td className="p-3 pl-4 font-semibold text-foreground">{lr.staffName}</td>
                        <td className="p-3 text-muted-foreground">{lr.role}</td>
                        <td className="p-3 font-medium text-slate-700 dark:text-slate-300">{lr.leaveType}</td>
                        <td className="p-3 font-mono text-[11px] text-muted-foreground">
                          {lr.startDate} to {lr.endDate}
                        </td>
                        <td className="p-3 text-muted-foreground max-w-xs truncate" title={lr.reason}>
                          {lr.reason}
                        </td>
                        <td className="p-3 text-center font-bold">{lr.days}</td>
                        <td className="p-3 text-center">
                          <Badge variant="outline" className={`text-[9px] h-5 ${badgeClass}`}>
                            {lr.status}
                          </Badge>
                        </td>
                        <td className="p-3 pr-4 text-right">
                          {lr.status === "Pending" ? (
                            <div className="flex justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApprove(lr.id)}
                                className="h-7 w-7 p-0 text-emerald-600 hover:bg-emerald-50"
                              >
                                <Check className="size-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(lr.id)}
                                className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-50"
                              >
                                <X className="size-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">Processed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-muted-foreground italic">
                      No leave requests filed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Apply Leave Request Dialog Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <Card className="max-w-md w-full bg-card border border-border">
            <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">File Leave Requisition</CardTitle>
                <CardDescription className="text-[10px]">Submit leave duration and clinical notes.</CardDescription>
              </div>
              <button onClick={() => setShowApplyModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Select Employee</Label>
                  <Select value={staffId} onValueChange={setStaffId}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Choose staff member..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {STAFF.filter(s => s.status === "Active").map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Leave Type</Label>
                    <Select value={leaveType} onValueChange={(v: any) => setLeaveType(v)}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                        <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                        <SelectItem value="Earned Leave">Earned Leave</SelectItem>
                        <SelectItem value="Maternity Leave">Maternity Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Total Days</Label>
                    <Input
                      type="number"
                      className="text-xs h-9"
                      value={days}
                      onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Start Date</Label>
                    <Input
                      type="date"
                      className="text-xs h-9"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">End Date</Label>
                    <Input
                      type="date"
                      className="text-xs h-9"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Detailed Reason</Label>
                  <Input
                    placeholder="e.g. Medical recovery recommendation..."
                    className="text-xs h-9"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" type="button" onClick={() => setShowApplyModal(false)} className="h-8 text-xs">
                    Cancel
                  </Button>
                  <Button size="sm" type="submit" className="h-8 text-xs">
                    Submit Request
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
