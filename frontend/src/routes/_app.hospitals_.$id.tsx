import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, MapPin, Phone, BedDouble, Stethoscope, Users, IndianRupee, Edit3, Settings, Clock, HelpCircle } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, type Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getHospital, updateHospitalProfile } from "@/mocks/hospitals";
import { DOCTORS } from "@/mocks/doctors";
import { STAFF } from "@/mocks/staff";
import { formatCurrency } from "@/utils/formatters";
import { cn } from "@/lib/utils";
import type { Doctor } from "@/types/doctor";
import { DepartmentList } from "@/components/modules/hospitals/DepartmentList";
import { BedStatusGrid } from "@/components/modules/hospitals/BedStatusGrid";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/hospitals_/$id")({
  loader: ({ params }) => {
    const hospital = getHospital(params.id);
    if (!hospital) throw notFound();
    return { hospital };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.hospital.name} — HMS` : "Hospital — HMS" }],
  }),
  component: HospitalDetail,
  notFoundComponent: () => (
    <div className="rounded-lg border bg-card p-12 text-center">
      <p className="text-muted-foreground">Hospital not found.</p>
      <Link to="/hospitals" className="mt-3 inline-block text-sm text-primary hover:underline">Back to hospitals</Link>
    </div>
  ),
  errorComponent: ({ error }) => <div className="rounded-lg border bg-card p-6 text-danger">{error.message}</div>,
});

const TABS = ["Overview", "Departments", "Doctors", "Beds", "Staff", "Reports"] as const;

function HospitalDetail() {
  const { hospital } = Route.useLoaderData();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [refreshKey, setRefreshKey] = useState(0);

  // Edit Profile Dialog states
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [hospName, setHospName] = useState(hospital.name);
  const [hospCity, setHospCity] = useState(hospital.city);
  const [hospAddress, setHospAddress] = useState(hospital.address);
  const [hospContact, setHospContact] = useState(hospital.contact);
  const [hospHours, setHospHours] = useState((hospital as any).operatingHours || "24/7 Fully Operational");
  const [hospStatus, setHospStatus] = useState(hospital.status);

  const doctors = DOCTORS.filter((d) => d.hospitalId === hospital.id);
  const staff = STAFF.filter((s) => s.hospitalId === hospital.id);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updateHospitalProfile(
      hospital.id,
      hospName,
      hospCity,
      hospAddress,
      hospContact,
      (hospital as any).facilities || [],
      hospHours,
      hospStatus
    );

    if (updated) {
      toast.success("Profile Updated!", {
        description: `Successfully saved details for ${hospName}.`,
      });
      setShowEditDialog(false);
      setRefreshKey(k => k + 1);
    } else {
      toast.error("Failed to update profile details.");
    }
  };

  const doctorCols: Column<Doctor>[] = [
    { key: "name", header: "Name", render: (d) => <span className="font-medium">{d.name}</span>, sortValue: (d) => d.name },
    { key: "spec", header: "Specialization", render: (d) => d.specialization, sortValue: (d) => d.specialization },
    { key: "schedule", header: "Schedule Today", render: (d) => <span className="font-mono text-xs">{d.scheduleToday}</span> },
    { key: "patients", header: "Patients today", render: (d) => d.patientsToday, sortValue: (d) => d.patientsToday },
    { key: "status", header: "Status Badge", render: (d) => <StatusBadge status={d.status} /> },
  ];

  return (
    <div key={refreshKey} className="space-y-6 max-w-7xl mx-auto">
      <div>
        <Link to="/hospitals" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-3" /> Back to Branch Overview
        </Link>
        
        {/* Branch Profile header Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{hospital.name}</h1>
                <StatusBadge status={hospital.status} />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="size-3.5 text-primary" /> {hospital.address}</span>
                <span className="flex items-center gap-1 font-mono"><Phone className="size-3.5 text-primary" /> {hospital.contact}</span>
                <span className="flex items-center gap-1"><Clock className="size-3.5 text-primary" /> {((hospital as any).operatingHours) || "24/7 Support"}</span>
              </div>
            </div>
            <div className="flex flex-row items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground bg-accent/25 px-2.5 py-1 rounded-md">ID: {hospital.id}</span>
              <Button size="sm" variant="outline" onClick={() => setShowEditDialog(true)} className="h-8 text-xs gap-1.5">
                <Edit3 className="size-3.5" />
                Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "border-b-2 px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap",
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >{t}</button>
        ))}
      </div>

      {/* Tab Panel contents */}
      {tab === "Overview" ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard title="Total Patients" value={hospital.totalPatients} icon={Users} />
            <StatCard title="On Duty Doctors" value={hospital.totalDoctors} icon={Stethoscope} />
            <StatCard title="Beds Available" value={hospital.totalBeds - hospital.occupiedBeds} unit={`/ ${hospital.totalBeds}`} icon={BedDouble} />
            <StatCard title="Revenue (MTD)" value={formatCurrency(hospital.revenueThisMonth)} icon={IndianRupee} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-border bg-card">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold">Facilities list</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                <ul className="list-disc list-inside space-y-1">
                  {((hospital as any).facilities || ["OPD Services", "24/7 ICU Care", "Radiology Lab"]).map((f: string, fIdx: number) => (
                    <li key={fIdx} className="text-slate-600 dark:text-slate-400">{f}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border border-border bg-card">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold">Branch Operations</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-xs space-y-2 text-muted-foreground">
                <p>Location: <strong>{hospital.city}</strong></p>
                <p>Emergency Contact: <strong>{hospital.contact}</strong></p>
                <p>Status: <strong>{hospital.status}</strong></p>
                <p>Operating Hours: <strong>{((hospital as any).operatingHours) || "24/7"}</strong></p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}

      {tab === "Doctors" ? (
        <DataTable data={doctors} columns={doctorCols} searchableFields={["name", "specialization"]} rowKey={(d) => d.id} />
      ) : null}

      {tab === "Beds" ? (
        <BedStatusGrid hospitalId={hospital.id} />
      ) : null}

      {tab === "Departments" ? (
        <DepartmentList hospitalId={hospital.id} />
      ) : null}

      {tab === "Staff" ? (
        <Card className="border border-border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold">Active Staff Directory ({staff.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="overflow-x-auto border border-border rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-accent/20 border-b border-border text-[10px] font-semibold text-muted-foreground uppercase">
                    <th className="p-3 pl-4">Staff Name</th>
                    <th className="p-3">Staff ID</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Department</th>
                    <th className="p-3 pr-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {staff.length > 0 ? (
                    staff.map((s) => (
                      <tr key={s.id} className="hover:bg-accent/5">
                        <td className="p-3 pl-4 font-semibold text-foreground">{s.name}</td>
                        <td className="p-3 text-muted-foreground font-mono">{s.id}</td>
                        <td className="p-3 font-medium text-slate-700 dark:text-slate-300">{s.role}</td>
                        <td className="p-3 text-muted-foreground">{s.department || "General"}</td>
                        <td className="p-3 pr-4 text-right">
                          <Badge variant="outline" className={`text-[9px] h-4.5 ${
                            s.status === "Active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"
                          }`}>
                            {s.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-muted-foreground italic">
                        No staff members assigned to this hospital branch yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === "Reports" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card className="border border-border bg-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Occupancy report</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground space-y-2">
              <p>Total beds capacity: <strong>{hospital.totalBeds}</strong></p>
              <p>Occupied beds today: <strong>{hospital.occupiedBeds}</strong></p>
              <p>Vacant beds: <strong>{hospital.totalBeds - hospital.occupiedBeds}</strong></p>
              <div className="w-full bg-accent h-2.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-primary h-full transition-all"
                  style={{ width: `${Math.round((hospital.occupiedBeds / hospital.totalBeds) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] block mt-1">Utilization: {Math.round((hospital.occupiedBeds / hospital.totalBeds) * 100)}%</span>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Revenue Insights</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground space-y-2">
              <p>Total Revenue (MTD): <strong>{formatCurrency(hospital.revenueThisMonth)}</strong></p>
              <p>Average daily ticket: <strong>{formatCurrency(hospital.revenueThisMonth / 30)}</strong></p>
              <p>Clinical departments: <strong>6 active</strong></p>
              <p className="italic text-[10px] text-muted-foreground mt-2">Report compiles invoices cleared by outpatient billing and pharmacy dispense counters.</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Edit Profile Dialog Modal */}
      {showEditDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <Card className="max-w-md w-full bg-card border border-border">
            <CardHeader className="p-4 border-b border-border">
              <CardTitle className="text-sm font-bold">Edit Hospital Branch Profile</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Hospital Name</Label>
                  <Input
                    className="text-xs h-9"
                    value={hospName}
                    onChange={(e) => setHospName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">City</Label>
                    <Input
                      className="text-xs h-9"
                      value={hospCity}
                      onChange={(e) => setHospCity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Operational Status</Label>
                    <Select value={hospStatus} onValueChange={(v: any) => setHospStatus(v)}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Helpline Number</Label>
                  <Input
                    className="text-xs h-9"
                    value={hospContact}
                    onChange={(e) => setHospContact(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Operating Hours</Label>
                  <Input
                    className="text-xs h-9"
                    value={hospHours}
                    onChange={(e) => setHospHours(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Street Address</Label>
                  <Input
                    className="text-xs h-9"
                    value={hospAddress}
                    onChange={(e) => setHospAddress(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" type="button" onClick={() => setShowEditDialog(false)} className="h-8 text-xs">
                    Cancel
                  </Button>
                  <Button size="sm" type="submit" className="h-8 text-xs">
                    Save Details
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
