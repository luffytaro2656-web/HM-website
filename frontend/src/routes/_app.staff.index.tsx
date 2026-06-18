import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, User, Edit3, ClipboardCheck, CalendarRange, Landmark, Mail, Phone, Clock, UserCheck, ShieldAlert, Check, X } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { STAFF, updateStaffMember } from "@/mocks/staff";
import { HOSPITALS } from "@/mocks/hospitals";
import { formatCurrency } from "@/utils/formatters";
import { StaffForm } from "@/components/modules/staff/StaffForm";
import { toast } from "sonner";
import type { StaffMember } from "@/types/staff";

export const Route = createFileRoute("/_app/staff/")({
  head: () => ({ meta: [{ title: "Staff Directory — HMS" }] }),
  component: StaffPage,
});

function StaffPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [hospitalFilter, setHospitalFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Edit states
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Toggle account status
  const handleToggleStatus = (s: StaffMember) => {
    const newStatus = s.status === "Active" ? "Inactive" : "Active";
    updateStaffMember(s.id, { status: newStatus });
    toast.success("Account Status Updated!", {
      description: `${s.name} is now marked as ${newStatus}.`,
    });
    setRefreshKey((k) => k + 1);
  };

  const filtered = STAFF.filter((s) => {
    if (query && !s.name.toLowerCase().includes(query.toLowerCase()) && !s.id.toLowerCase().includes(query.toLowerCase())) return false;
    if (roleFilter !== "all" && s.role !== roleFilter) return false;
    if (hospitalFilter !== "all" && s.hospitalId !== hospitalFilter) return false;
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    return true;
  });

  const cols: Column<StaffMember>[] = [
    {
      key: "name",
      header: "Employee",
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary uppercase">
            {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <span className="font-semibold text-foreground block">{s.name}</span>
            <span className="text-[10px] font-mono text-muted-foreground">{s.id}</span>
          </div>
        </div>
      ),
      sortValue: (s) => s.name,
    },
    { key: "role", header: "Role", render: (s) => s.role, sortValue: (s) => s.role },
    { key: "dept", header: "Department", render: (s) => s.department },
    {
      key: "hospital",
      header: "Hospital Branch",
      render: (s) => HOSPITALS.find((h) => h.id === s.hospitalId)?.name ?? "—",
    },
    { key: "shift", header: "Shift", render: (s) => s.shift },
    {
      key: "salary",
      header: "Basic Salary",
      render: (s) => <span className="font-mono text-xs">{formatCurrency(s.salary)}</span>,
      sortValue: (s) => s.salary,
    },
    {
      key: "credentials",
      header: "Portal Access",
      render: (s) => (
        <div className="flex items-center gap-1.5">
          {s.hasLogin ? (
            <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-700 border-emerald-500/20 py-0.5">
              Enabled ({s.username})
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[9px] bg-slate-100 text-slate-500 border-slate-200 py-0.5 dark:bg-slate-800 dark:text-slate-400">
              Disabled
            </Badge>
          )}
        </div>
      ),
    },
    { key: "status", header: "Status", render: (s) => <StatusBadge status={s.status} /> },
    {
      key: "actions",
      header: "Actions",
      render: (s) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditingStaff(s)}
            className="h-7 text-[10px] px-2.5 gap-1"
          >
            <Edit3 className="size-3" /> Edit Profile
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleToggleStatus(s)}
            className={`h-7 text-[10px] px-2.5 ${
              s.status === "Active" ? "text-rose-600 hover:bg-rose-50" : "text-emerald-600 hover:bg-emerald-50"
            }`}
          >
            {s.status === "Active" ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" key={refreshKey}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <User className="size-6 text-primary" />
            Staff & Employees Directory
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure clinic roles, audit salaries, manage department transfers, and view work shifts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/staff/attendance">
            <Button size="sm" variant="outline" className="text-xs h-9 gap-1.5">
              <ClipboardCheck className="size-4" />
              Attendance Desk
            </Button>
          </Link>
          <Link to="/staff/schedule">
            <Button size="sm" variant="outline" className="text-xs h-9 gap-1.5">
              <CalendarRange className="size-4" />
              Shift Planner
            </Button>
          </Link>
          <Link to="/staff/leaves">
            <Button size="sm" variant="outline" className="text-xs h-9 gap-1.5">
              <ClipboardCheck className="size-4" />
              Leave Applications
            </Button>
          </Link>
          <Link to="/staff/payroll">
            <Button size="sm" variant="outline" className="text-xs h-9 gap-1.5">
              <Landmark className="size-4" />
              Payroll Desk
            </Button>
          </Link>
          <Link to="/staff/create">
            <Button size="sm" className="text-xs h-9 gap-1.5">
              <Plus className="size-4" />
              Enroll Staff
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="border border-border p-4 bg-card">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Search Employees</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID or name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Staff Role</Label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-9 text-xs">
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

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Hospital Branch</Label>
            <Select value={hospitalFilter} onValueChange={setHospitalFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                <SelectItem value="all">All Branches</SelectItem>
                {HOSPITALS.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Employment Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Directory Table */}
      <Card className="border border-border">
        <DataTable data={filtered} columns={cols} rowKey={(s) => s.id} pageSize={15} />
      </Card>

      {/* Editing Dialog Modal */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto relative bg-card border border-border rounded-xl">
            <button
              onClick={() => setEditingStaff(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground z-10"
            >
              <X className="size-4" />
            </button>
            <div className="p-1">
              <StaffForm
                initialData={editingStaff}
                onSuccess={() => {
                  setEditingStaff(null);
                  setRefreshKey((k) => k + 1);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
