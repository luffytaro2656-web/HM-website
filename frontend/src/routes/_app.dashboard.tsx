import { createFileRoute } from "@tanstack/react-router";
import { Users, Stethoscope, CalendarDays, BedDouble, IndianRupee, AlertTriangle } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from "recharts";
import { StatCard } from "@/components/common/StatCard";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, type Column } from "@/components/common/DataTable";
import { HOSPITALS } from "@/mocks/hospitals";
import { DOCTORS } from "@/mocks/doctors";
import { PATIENTS } from "@/mocks/patients";
import { APPOINTMENTS } from "@/mocks/appointments";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import { getDoctor } from "@/mocks/doctors";
import { getPatient } from "@/mocks/patients";
import type { Hospital } from "@/types/hospital";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — HMS" }] }),
  component: Dashboard,
});

function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const activeHospitalId = useAuthStore((s) => s.activeHospitalId);
  const isSuper = user?.role === "super_admin" && !activeHospitalId;

  const scopedHospitals = isSuper ? HOSPITALS : HOSPITALS.filter((h) => h.id === activeHospitalId);
  const scopedPatients = isSuper ? PATIENTS : PATIENTS.filter((p) => p.hospitalId === activeHospitalId);
  const scopedDoctors = isSuper ? DOCTORS : DOCTORS.filter((d) => d.hospitalId === activeHospitalId);
  const scopedAppts = isSuper ? APPOINTMENTS : APPOINTMENTS.filter((a) => a.hospitalId === activeHospitalId);

  const totalBeds = scopedHospitals.reduce((s, h) => s + h.totalBeds, 0);
  const occupiedBeds = scopedHospitals.reduce((s, h) => s + h.occupiedBeds, 0);
  const occupancy = totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const revenue = scopedHospitals.reduce((s, h) => s + h.revenueThisMonth, 0);

  const today = new Date();
  const isToday = (iso: string) => {
    const d = new Date(iso);
    return d.toDateString() === today.toDateString();
  };
  const apptsToday = scopedAppts.filter((a) => isToday(a.dateTime));

  // Patient trend last 30 days
  const trend = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().slice(0, 10);
    const count = scopedPatients.filter((p) => p.lastVisit.slice(0, 10) === key).length;
    return { date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }), patients: count + 5 + (i % 7) };
  });

  // Bed occupancy by ward
  const wards = ["A", "B", "C", "D", "E", "F"];
  const wardData = wards.map((w) => {
    const occupied = scopedPatients.filter((p) => p.ward === `Ward ${w}`).length;
    return { ward: `Ward ${w}`, occupied, available: 30 - occupied };
  });

  const lowStock = [
    { item: "Paracetamol 500mg", qty: 45, threshold: 100, hospital: "Apollo" },
    { item: "Surgical Gloves (M)", qty: 80, threshold: 200, hospital: "Fortis" },
    { item: "Insulin Pen", qty: 12, threshold: 50, hospital: "Kauvery" },
    { item: "N95 Masks", qty: 60, threshold: 150, hospital: "MIOT" },
  ];

  const hospitalCols: Column<Hospital>[] = [
    { key: "name", header: "Hospital", render: (h) => <span className="font-medium">{h.name}</span>, sortValue: (h) => h.name },
    { key: "city", header: "City", render: (h) => h.city, sortValue: (h) => h.city },
    { key: "patients", header: "Patients", render: (h) => h.totalPatients.toLocaleString("en-IN"), sortValue: (h) => h.totalPatients },
    { key: "doctors", header: "Doctors", render: (h) => h.totalDoctors, sortValue: (h) => h.totalDoctors },
    { key: "occ", header: "Occupancy", render: (h) => `${Math.round((h.occupiedBeds / h.totalBeds) * 100)}%`, sortValue: (h) => h.occupiedBeds / h.totalBeds },
    { key: "rev", header: "Revenue", render: (h) => <span className="font-mono">{formatCurrency(h.revenueThisMonth)}</span>, sortValue: (h) => h.revenueThisMonth },
    { key: "status", header: "Status", render: (h) => <StatusBadge status={h.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "Admin"}`}
        description={isSuper ? "All 20 hospitals · Network overview" : "Hospital overview"}
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard title="Patients Today" value={scopedPatients.filter((p) => isToday(p.lastVisit)).length || 142} icon={Users} trend={8.2} />
        <StatCard title="Active Doctors" value={scopedDoctors.filter((d) => d.status === "On Duty").length} icon={Stethoscope} trend={2.1} />
        <StatCard title="Appointments Today" value={apptsToday.length || 38} icon={CalendarDays} trend={-3.4} />
        <StatCard title="Bed Occupancy" value={occupancy} unit="%" icon={BedDouble} trend={1.5} />
        <StatCard title="Revenue (MTD)" value={formatCurrency(revenue)} icon={IndianRupee} trend={12.7} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Patient Trend (30 days)</h3>
            <span className="text-xs text-muted-foreground">Daily visits</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" interval={4} />
              <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="patients" stroke="var(--primary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Bed Occupancy by Ward</h3>
            <span className="text-xs text-muted-foreground">Today</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={wardData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="ward" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="occupied" stackId="a" fill="var(--primary)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="available" stackId="a" fill="var(--success)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold">Recent Appointments</h3>
          <div className="space-y-1">
            {scopedAppts.slice(0, 6).map((a) => {
              const doctor = getDoctor(a.doctorId);
              const patient = getPatient(a.patientId);
              return (
                <div key={a.id} className="flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-muted/50">
                  <div>
                    <p className="font-medium">{patient?.name}</p>
                    <p className="text-xs text-muted-foreground">{doctor?.name} · {doctor?.specialization}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground">{formatDateTime(a.dateTime)}</span>
                    <StatusBadge status={a.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="size-4 text-warning-foreground" />
            <h3 className="text-sm font-semibold">Low Stock Alerts</h3>
          </div>
          <div className="space-y-2">
            {lowStock.map((s) => (
              <div key={s.item} className="rounded-md border border-warning/30 bg-warning/5 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{s.item}</p>
                  <span className="font-mono text-xs text-warning-foreground">{s.qty}/{s.threshold}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{s.hospital} Hospital</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isSuper ? (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold">Hospital Network Overview</h3>
          <DataTable
            data={HOSPITALS}
            columns={hospitalCols}
            searchableFields={["name", "city"]}
            rowKey={(h) => h.id}
            pageSize={10}
          />
        </div>
      ) : null}
    </div>
  );
}
