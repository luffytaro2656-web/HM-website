import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Download,
  FileSpreadsheet,
  ShieldAlert,
  Building2,
  Users2,
  Activity,
  DollarSign,
  Package,
  CheckCircle2,
  AlertCircle,
  Clock,
  Briefcase,
  FileText,
  Eye,
  Info,
  TrendingUp,
  FlaskConical
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Mocks
import { HOSPITALS } from "@/mocks/hospitals";
import { INVOICES } from "@/mocks/billing";
import { getPatient, PATIENTS, CONSULTATION_LOGS } from "@/mocks/patients";
import { STAFF, ATTENDANCE, LEAVE_REQUESTS, type LeaveRequest } from "@/mocks/staff";
import { ADMISSIONS, type AdmissionRecord } from "@/mocks/admissions";
import { INVENTORY, inventoryStatus } from "@/mocks/inventory";
import { DISPENSING_LOGS, type DispensingRecord } from "@/mocks/pharmacy";
import { LAB_ORDERS, type LabTestOrder } from "@/mocks/lab";

// Helpers
import { formatCurrency, formatDate, formatNumber } from "@/utils/formatters";
import { cn } from "@/lib/utils";

// Custom components
import { ExportActionBar, type DateRangeOption } from "@/components/modules/reports/ExportActionBar";
import { AnalyticsChart } from "@/components/modules/reports/AnalyticsChart";
import type { Invoice } from "@/types/billing";
import type { StaffMember, AttendanceRecord } from "@/types/staff";
import type { InventoryItem } from "@/types/inventory";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({ meta: [{ title: "Reports & Analytics — HMS" }] }),
  component: ReportsPage,
});

type TabId = "overview" | "patient" | "financial" | "staff" | "inventory";
type RoleId = "super-admin" | "hospital-admin-h001" | "hospital-admin-h002" | "billing-executive" | "pharmacy-staff" | "lab-technician";

const TABS = [
  { id: "overview", label: "Hospital Overview", icon: Building2 },
  { id: "patient", label: "Patient Statistics", icon: Activity },
  { id: "financial", label: "Financial Summary", icon: DollarSign },
  { id: "staff", label: "Staff Performance", icon: Users2 },
  { id: "inventory", label: "Inventory & Pharmacy", icon: Package }
] as const;

const ROLES_SIMULATOR = [
  { id: "super-admin", label: "Super Admin", desc: "Full access to all hospitals and reports" },
  { id: "hospital-admin-h001", label: "Hospital Admin (Apollo Hospital)", desc: "Access restricted to Apollo Hospital data only" },
  { id: "hospital-admin-h002", label: "Hospital Admin (Fortis Hospital)", desc: "Access restricted to Fortis Hospital data only" },
  { id: "billing-executive", label: "Billing Executive", desc: "Financial Reports only" },
  { id: "pharmacy-staff", label: "Pharmacy Staff", desc: "Inventory & Pharmacy reports only" },
  { id: "lab-technician", label: "Lab Technician", desc: "Patient & Lab Statistics only" }
] as const;

const ROLE_TAB_ACCESS: Record<RoleId, TabId[]> = {
  "super-admin": ["overview", "patient", "financial", "staff", "inventory"],
  "hospital-admin-h001": ["overview", "patient", "financial", "staff", "inventory"],
  "hospital-admin-h002": ["overview", "patient", "financial", "staff", "inventory"],
  "billing-executive": ["financial"],
  "pharmacy-staff": ["inventory"],
  "lab-technician": ["patient"]
};

// Helper: Check if a date falls in selected range
function isWithinDateRange(dateStr: string, range: DateRangeOption): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  switch (range) {
    case "7d":
      return diffDays <= 7;
    case "30d":
      return diffDays <= 30;
    case "this-month":
      // Treat mock dates (June 2026) as "this-month" if they match the year 2026 and month June (index 5)
      return date.getFullYear() === 2026 && date.getMonth() === 5;
    case "this-quarter":
      // Q2 of 2026 (April, May, June)
      return date.getFullYear() === 2026 && date.getMonth() >= 3 && date.getMonth() <= 5;
    case "this-year":
      return date.getFullYear() === 2026;
    default:
      return true;
  }
}

function ReportsPage() {
  // Roles simulator state
  const [currentRole, setCurrentRole] = useState<RoleId>("super-admin");
  const [hospitalId, setHospitalId] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRangeOption>("30d");
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  
  // Patient sub-table selection: Admissions vs Lab orders
  const [patientSubTab, setPatientSubTab] = useState<"admissions" | "lab-orders">("admissions");
  // Staff sub-table selection: Attendance vs Leaves
  const [staffSubTab, setStaffSubTab] = useState<"attendance" | "leaves">("attendance");
  // Inventory sub-table selection: Low Stock vs Pharmacy Dispensing
  const [inventorySubTab, setInventorySubTab] = useState<"stock" | "dispensing">("stock");

  // Determine hospital lock based on selected simulated role
  const isHospitalLocked = currentRole === "hospital-admin-h001" || currentRole === "hospital-admin-h002";
  const lockedHospitalId = currentRole === "hospital-admin-h001" ? "H001" : currentRole === "hospital-admin-h002" ? "H002" : null;
  const activeHospitalId = isHospitalLocked ? (lockedHospitalId || "H001") : hospitalId;
  const lockedHospitalName = isHospitalLocked 
    ? (HOSPITALS.find(h => h.id === activeHospitalId)?.name || "Own Hospital") 
    : "";
  const hospitalName = activeHospitalId === "all" ? "All Hospitals" : HOSPITALS.find(h => h.id === activeHospitalId)?.name ?? "Hospital";

  // Resolve allowed tabs. If activeTab is not allowed, switch to the first allowed tab.
  const allowedTabs = ROLE_TAB_ACCESS[currentRole];
  const resolvedTab = allowedTabs.includes(activeTab) ? activeTab : allowedTabs[0];

  // Dynamic statistics calculations
  const computed = useMemo(() => {
    // 1. Filter base entities by active hospital
    const baseHospitals = activeHospitalId === "all" 
      ? HOSPITALS 
      : HOSPITALS.filter(h => h.id === activeHospitalId);
      
    const baseStaff = activeHospitalId === "all"
      ? STAFF
      : STAFF.filter(s => s.hospitalId === activeHospitalId);
      
    const basePatients = activeHospitalId === "all"
      ? PATIENTS
      : PATIENTS.filter(p => p.hospitalId === activeHospitalId);
      
    const patientIds = new Set(basePatients.map(p => p.id));
    const staffIds = new Set(baseStaff.map(s => s.id));
    
    const baseInvoices = activeHospitalId === "all"
      ? INVOICES
      : INVOICES.filter(i => i.hospitalId === activeHospitalId);
      
    const baseInventory = activeHospitalId === "all"
      ? INVENTORY
      : INVENTORY.filter(i => i.hospitalId === activeHospitalId);
      
    const baseAdmissions = ADMISSIONS.filter(a => patientIds.has(a.patientId));
    const baseConsultations = CONSULTATION_LOGS.filter(c => patientIds.has(c.patientId));
    const baseDispensing = DISPENSING_LOGS.filter(d => patientIds.has(d.patientId));
    const baseLabOrders = LAB_ORDERS.filter(o => patientIds.has(o.patientId));
    const baseAttendance = ATTENDANCE.filter(a => staffIds.has(a.staffId));

    // 2. Filter by date range where appropriate
    const dateFilteredInvoices = baseInvoices.filter(i => isWithinDateRange(i.date, dateRange));
    const dateFilteredAdmissions = baseAdmissions.filter(a => isWithinDateRange(a.admissionDate, dateRange));
    const dateFilteredConsultations = baseConsultations.filter(c => isWithinDateRange(c.date, dateRange));
    const dateFilteredDispensing = baseDispensing.filter(d => isWithinDateRange(d.dispensedDate, dateRange));
    const dateFilteredLabOrders = baseLabOrders.filter(o => {
      const dStr = o.resultedAt || o.collectedAt || new Date().toISOString();
      return isWithinDateRange(dStr, dateRange);
    });

    // --- HOSPITAL OVERVIEW CALCULATIONS ---
    const totalHospitals = baseHospitals.length;
    const totalBedsCount = baseHospitals.reduce((sum, h) => sum + h.totalBeds, 0);
    const occupiedBedsCount = baseHospitals.reduce((sum, h) => sum + h.occupiedBeds, 0);
    const occupancyRate = totalBedsCount > 0 ? (occupiedBedsCount / totalBedsCount) * 100 : 0;
    const patientsVolume = baseHospitals.reduce((sum, h) => sum + h.totalPatients, 0);
    const totalHospRevenue = baseHospitals.reduce((sum, h) => sum + h.revenueThisMonth, 0);
    const totalStaffCount = baseStaff.length;

    const hospitalList = baseHospitals.map(h => {
      const staffInHospital = STAFF.filter(s => s.hospitalId === h.id).length;
      return {
        id: h.id,
        name: h.name,
        shortName: h.name.replace(" Hospital", ""),
        city: h.city,
        occupiedBeds: h.occupiedBeds,
        totalBeds: h.totalBeds,
        occupancyPercent: h.totalBeds > 0 ? Math.round((h.occupiedBeds / h.totalBeds) * 100) : 0,
        patientCount: h.totalPatients,
        staffCount: staffInHospital,
        revenue: h.revenueThisMonth,
        status: h.status
      };
    });

    // --- PATIENT STATISTICS CALCULATIONS ---
    const totalAdmissionsCount = dateFilteredAdmissions.length;
    const totalOPD = baseConsultations.length; // total consults as OPD volume
    const dischargedCount = dateFilteredAdmissions.filter(a => a.dischargeDate).length;
    const dischargeRate = totalAdmissionsCount > 0 ? (dischargedCount / totalAdmissionsCount) * 100 : 0;

    // Daily Admissions Trend
    const admissionsByDate: Record<string, number> = {};
    dateFilteredAdmissions.forEach(a => {
      const d = a.admissionDate.slice(0, 10);
      admissionsByDate[d] = (admissionsByDate[d] || 0) + 1;
    });
    const admissionsTrend = Object.entries(admissionsByDate)
      .map(([date, count]) => ({ date: formatDate(date), count, rawDate: date }))
      .sort((a, b) => a.rawDate.localeCompare(b.rawDate))
      .slice(-15);

    // Top Diagnoses
    const diagnosesCounts: Record<string, number> = {};
    dateFilteredConsultations.forEach(c => {
      if (c.diagnosis) {
        diagnosesCounts[c.diagnosis] = (diagnosesCounts[c.diagnosis] || 0) + 1;
      }
    });
    const topDiagnoses = Object.entries(diagnosesCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // --- FINANCIAL SUMMARY CALCULATIONS ---
    const totalRevenueSum = dateFilteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalCollectionsSum = dateFilteredInvoices.reduce((sum, inv) => sum + inv.paid, 0);
    const totalOutstandingSum = dateFilteredInvoices.reduce((sum, inv) => sum + inv.balance, 0);
    const totalInsuranceClaimsSum = dateFilteredInvoices
      .filter(i => i.insuranceProvider)
      .reduce((sum, inv) => sum + (inv.claimAmount || 0), 0);

    // Revenue by hospital
    const hospitalRevenueMap: Record<string, { name: string; revenue: number; collections: number; outstanding: number }> = {};
    dateFilteredInvoices.forEach(inv => {
      const hosp = HOSPITALS.find(h => h.id === inv.hospitalId);
      const hName = hosp ? hosp.name.replace(" Hospital", "") : "Unknown";
      if (!hospitalRevenueMap[inv.hospitalId]) {
        hospitalRevenueMap[inv.hospitalId] = { name: hName, revenue: 0, collections: 0, outstanding: 0 };
      }
      hospitalRevenueMap[inv.hospitalId].revenue += inv.total;
      hospitalRevenueMap[inv.hospitalId].collections += inv.paid;
      hospitalRevenueMap[inv.hospitalId].outstanding += inv.balance;
    });
    const hospitalRevenueChart = Object.values(hospitalRevenueMap);

    // Department-wise breakdown from invoice items
    const deptRevenueMap: Record<string, number> = {
      "Outpatient (OPD)": 0,
      "Laboratory": 0,
      "Radiology / Diagnostics": 0,
      "Inpatient Ward": 0,
      "Pharmacy": 0,
      "Surgical Department": 0
    };

    dateFilteredInvoices.forEach(inv => {
      inv.items.forEach(item => {
        const desc = item.description;
        const amount = item.rate * item.qty * (1 + item.gstPct / 100);
        if (desc.includes("Consultation")) {
          deptRevenueMap["Outpatient (OPD)"] += amount;
        } else if (desc.includes("Blood") || desc.includes("CBC")) {
          deptRevenueMap["Laboratory"] += amount;
        } else if (desc.includes("X-Ray") || desc.includes("Ultrasound") || desc.includes("ECG")) {
          deptRevenueMap["Radiology / Diagnostics"] += amount;
        } else if (desc.includes("Room") || desc.includes("Ward")) {
          deptRevenueMap["Inpatient Ward"] += amount;
        } else if (desc.includes("Medication") || desc.includes("Medicine")) {
          deptRevenueMap["Pharmacy"] += amount;
        } else if (desc.includes("Surgical") || desc.includes("Procedure") || desc.includes("Suture")) {
          deptRevenueMap["Surgical Department"] += amount;
        } else {
          deptRevenueMap["Outpatient (OPD)"] += amount;
        }
      });
    });

    const departmentBreakdownChart = Object.entries(deptRevenueMap)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .filter(d => d.value > 0);

    // --- STAFF PERFORMANCE CALCULATIONS ---
    const presentCount = baseAttendance.filter(a => a.status === "Present" || a.status === "Late").length;
    const attendanceCompliance = baseAttendance.length > 0 ? (presentCount / baseAttendance.length) * 100 : 0;
    const lateCheckins = baseAttendance.filter(a => a.status === "Late").length;
    const pendingLeavesCount = LEAVE_REQUESTS.filter(r => r.status === "Pending" && staffIds.has(r.staffId)).length;

    // Dept compliance
    const deptAttendanceMap: Record<string, { total: number; present: number }> = {};
    baseAttendance.forEach(att => {
      const member = STAFF.find(s => s.id === att.staffId);
      if (member) {
        const dept = member.department;
        if (!deptAttendanceMap[dept]) {
          deptAttendanceMap[dept] = { total: 0, present: 0 };
        }
        deptAttendanceMap[dept].total += 1;
        if (att.status === "Present" || att.status === "Late") {
          deptAttendanceMap[dept].present += 1;
        }
      }
    });
    const deptComplianceChart = Object.entries(deptAttendanceMap).map(([department, data]) => ({
      department,
      presentRate: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
    }));

    // Roles distribution
    const roleCounts: Record<string, number> = {};
    baseStaff.forEach(s => {
      roleCounts[s.role] = (roleCounts[s.role] || 0) + 1;
    });
    const roleDistributionChart = Object.entries(roleCounts).map(([name, value]) => ({ name, value }));

    // --- INVENTORY & PHARMACY CALCULATIONS ---
    const totalInventoryVal = baseInventory.reduce((sum, item) => sum + item.quantity * (item.costPerUnit || 150), 0);
    const lowStockAlerts = baseInventory.filter(item => item.quantity < item.reorderLevel).length;

    let expired = 0;
    let expiringSoon = 0;
    baseInventory.forEach(item => {
      const status = inventoryStatus(item);
      if (status === "Expired") expired += 1;
      else if (status === "Expiring Soon") expiringSoon += 1;
    });

    const medicineDispensedMap: Record<string, number> = {};
    dateFilteredDispensing.forEach(log => {
      log.medicines.forEach(m => {
        medicineDispensedMap[m.name] = (medicineDispensedMap[m.name] || 0) + Math.abs(m.qtyDispensed);
      });
    });
    const topMedicinesChart = Object.entries(medicineDispensedMap)
      .map(([name, dispensed]) => ({ name, dispensed }))
      .sort((a, b) => b.dispensed - a.dispensed)
      .slice(0, 5);

    const categoryMap: Record<string, { count: number; value: number }> = {};
    baseInventory.forEach(item => {
      const cat = item.category;
      if (!categoryMap[cat]) {
        categoryMap[cat] = { count: 0, value: 0 };
      }
      categoryMap[cat].count += item.quantity;
      categoryMap[cat].value += item.quantity * (item.costPerUnit || 150);
    });
    const categoryDistributionChart = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      count: data.count,
      value: data.value
    }));

    return {
      // Overviews
      totalHospitals,
      totalBedsCount,
      occupiedBedsCount,
      occupancyRate,
      patientsVolume,
      totalHospitalRevenue: totalHospRevenue,
      totalStaffCount,
      hospitalList,
      
      // Patient stats
      totalAdmissionsCount,
      totalOPD,
      dischargeRate,
      admissionsTrend,
      topDiagnoses,
      labOrdersCount: dateFilteredLabOrders.length,
      recentAdmissions: dateFilteredAdmissions.slice(0, 15),
      recentLabOrders: dateFilteredLabOrders,
      
      // Financials
      totalRevenueSum,
      totalCollectionsSum,
      totalOutstandingSum,
      totalInsuranceClaimsSum,
      hospitalRevenueChart,
      departmentBreakdownChart,
      recentInvoices: dateFilteredInvoices,
      
      // Staff
      attendanceCompliance,
      lateCheckins,
      pendingLeavesCount,
      deptComplianceChart,
      roleDistributionChart,
      recentLeaveRequests: LEAVE_REQUESTS.filter(r => staffIds.has(r.staffId)),
      recentAttendance: baseAttendance,
      
      // Inventory
      totalInventoryVal,
      lowStockAlerts,
      expired,
      expiringSoon,
      topMedicinesChart,
      categoryDistributionChart,
      lowStockItems: baseInventory.filter(item => item.quantity < item.reorderLevel),
      recentDispensingLogs: dateFilteredDispensing
    };
  }, [activeHospitalId, dateRange, currentRole]);

  // Export handlers
  const handleExport = (format: "pdf" | "excel" | "csv") => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Generating report in ${format.toUpperCase()} format...`,
        success: `Successfully exported ${resolvedTab.toUpperCase()} report as ${format.toUpperCase()}!`,
        error: "Failed to generate report export.",
      }
    );
  };

  const handlePrint = () => {
    window.print();
  };

  // 1. HOSPITAL TAB COLUMNS
  const hospitalCols: Column<any>[] = [
    { key: "id", header: "ID", render: (h) => <span className="font-mono text-xs font-semibold">{h.id}</span> },
    { key: "name", header: "Hospital Name", render: (h) => <span className="font-medium text-foreground">{h.name}</span>, sortValue: (h) => h.name },
    { key: "city", header: "Location", render: (h) => <span>{h.city}</span>, sortValue: (h) => h.city },
    {
      key: "beds",
      header: "Beds Occupied",
      render: (h) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs">{h.occupiedBeds} / {h.totalBeds}</span>
          <span className="text-[10px] text-muted-foreground font-semibold">({h.occupancyPercent}%)</span>
        </div>
      ),
      sortValue: (h) => h.occupancyPercent
    },
    { key: "patients", header: "Patients Volume", render: (h) => <span className="font-mono">{formatNumber(h.patientCount)}</span>, sortValue: (h) => h.patientCount },
    { key: "staff", header: "Staff count", render: (h) => <span className="font-mono">{h.staffCount}</span>, sortValue: (h) => h.staffCount },
    { key: "revenue", header: "Revenue (INR)", render: (h) => <span className="font-mono font-medium text-emerald-600">{formatCurrency(h.revenue)}</span>, sortValue: (h) => h.revenue },
    { key: "status", header: "Status", render: (h) => <StatusBadge status={h.status} /> }
  ];

  // 2. PATIENT ADMISSIONS COLUMNS
  const admissionsCols: Column<AdmissionRecord>[] = [
    { key: "id", header: "Admission ID", render: (a) => <span className="font-mono text-xs font-semibold">{a.id}</span> },
    {
      key: "patient",
      header: "Patient Name",
      render: (a) => {
        const p = getPatient(a.patientId);
        return <div>
          <span className="font-medium">{p?.name ?? "—"}</span>
          <span className="block text-[10px] text-muted-foreground">ID: {a.patientId}</span>
        </div>;
      }
    },
    { key: "date", header: "Admitted On", render: (a) => <span className="font-mono text-xs">{formatDate(a.admissionDate)}</span> },
    {
      key: "discharge",
      header: "Discharged On",
      render: (a) => a.dischargeDate ? (
        <span className="font-mono text-xs text-muted-foreground">{formatDate(a.dischargeDate)}</span>
      ) : (
        <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">Inpatient</Badge>
      )
    },
    { key: "notes", header: "Diagnosis Notes", render: (a) => <span className="text-xs truncate max-w-[200px] block">{a.admissionNotes}</span> },
    { key: "bill", header: "Total Est. Bill", render: (a) => <span className="font-mono font-medium">{formatCurrency(a.totalBillAmount)}</span>, sortValue: (a) => a.totalBillAmount }
  ];

  // 2. PATIENT LAB ORDERS COLUMNS
  const labOrdersCols: Column<LabTestOrder>[] = [
    { key: "id", header: "Order ID", render: (o) => <span className="font-mono text-xs font-semibold">{o.id}</span> },
    { key: "patient", header: "Patient", render: (o) => getPatient(o.patientId)?.name ?? "—" },
    { key: "testType", header: "Test Details", render: (o) => <span className="font-medium text-xs">{o.testType}</span> },
    { key: "urgency", header: "Urgency", render: (o) => <StatusBadge status={o.urgency === "STAT" ? "Cancelled" : o.urgency === "Urgent" ? "Pending" : "Active"} className="capitalize" /> },
    { key: "status", header: "Status", render: (o) => <StatusBadge status={o.status === "Released" ? "Completed" : o.status === "Resulted" ? "Active" : "Pending"} /> },
    { key: "date", header: "Completed Date", render: (o) => <span className="font-mono text-xs">{o.resultedAt ? formatDate(o.resultedAt) : "—"}</span> },
    { key: "tech", header: "Technician", render: (o) => <span className="text-xs">{o.technicianName ?? "—"}</span> }
  ];

  // 3. FINANCIAL INVOICES COLUMNS
  const invoiceCols: Column<Invoice>[] = [
    { key: "id", header: "Invoice ID", render: (i) => <span className="font-mono text-xs font-semibold">{i.id}</span> },
    { key: "patient", header: "Patient Name", render: (i) => getPatient(i.patientId)?.name ?? "—" },
    { key: "total", header: "Billed Total", render: (i) => <span className="font-mono font-semibold">{formatCurrency(i.total)}</span>, sortValue: (i) => i.total },
    { key: "paid", header: "Collected", render: (i) => <span className="font-mono text-emerald-600">{formatCurrency(i.paid)}</span>, sortValue: (i) => i.paid },
    { key: "balance", header: "Outstanding", render: (i) => <span className="font-mono text-danger">{formatCurrency(i.balance)}</span>, sortValue: (i) => i.balance },
    { key: "insurance", header: "Insurance Provider", render: (i) => <span className="text-xs font-medium">{i.insuranceProvider ?? "Self Paid"}</span> },
    { key: "claim", header: "Claim Status", render: (i) => i.claimStatus ? <StatusBadge status={i.claimStatus} /> : <span className="text-muted-foreground text-xs">—</span> },
    { key: "date", header: "Billed Date", render: (i) => <span className="font-mono text-xs">{formatDate(i.date)}</span>, sortValue: (i) => i.date }
  ];

  // 4. STAFF ATTENDANCE COLUMNS
  const staffAttendanceCols: Column<AttendanceRecord>[] = [
    {
      key: "staff",
      header: "Staff Member",
      render: (a) => {
        const member = STAFF.find(s => s.id === a.staffId);
        return <div>
          <span className="font-medium text-foreground">{member?.name ?? "—"}</span>
          <span className="block text-[10px] text-muted-foreground">{member?.role} | Dept: {member?.department}</span>
        </div>;
      }
    },
    { key: "date", header: "Date", render: (a) => <span className="font-mono text-xs">{formatDate(a.date)}</span> },
    { key: "shift", header: "Shift", render: (a) => {
      const member = STAFF.find(s => s.id === a.staffId);
      return <span className="text-xs">{member?.shift ?? "—"}</span>;
    } },
    { key: "checkIn", header: "Check In / Out", render: (a) => <span className="font-mono text-xs">{a.checkIn ?? "—"} / {a.checkOut ?? "—"}</span> },
    { key: "status", header: "Status", render: (a) => <StatusBadge status={a.status} /> }
  ];

  // 4. STAFF LEAVE COLUMNS
  const staffLeaveCols: Column<LeaveRequest>[] = [
    { key: "id", header: "Req ID", render: (r) => <span className="font-mono text-xs font-semibold">{r.id}</span> },
    { key: "staff", header: "Staff Member", render: (r) => <span className="font-medium">{r.staffName}</span> },
    { key: "role", header: "Role", render: (r) => <span className="text-xs">{r.role}</span> },
    { key: "type", header: "Leave Type", render: (r) => <span className="text-xs">{r.leaveType}</span> },
    { key: "days", header: "Duration", render: (r) => <span className="font-mono text-xs">{r.days} Days</span>, sortValue: (r) => r.days },
    { key: "reason", header: "Reason", render: (r) => <span className="text-xs truncate max-w-[200px] block">{r.reason}</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status === "Approved" ? "Paid" : r.status === "Pending" ? "Pending" : "Overdue"} /> }
  ];

  // 5. INVENTORY STOCK COLUMNS
  const inventoryCols: Column<InventoryItem>[] = [
    { key: "id", header: "Item ID", render: (i) => <span className="font-mono text-xs font-semibold">{i.id}</span> },
    { key: "name", header: "Item Name", render: (i) => <span className="font-medium text-foreground">{i.name}</span> },
    { key: "category", header: "Category", render: (i) => <span className="text-xs">{i.category}</span> },
    { key: "qty", header: "Current Stock", render: (i) => <span className="font-mono">{i.quantity}</span>, sortValue: (i) => i.quantity },
    { key: "reorder", header: "Reorder level", render: (i) => <span className="font-mono text-muted-foreground">{i.reorderLevel}</span> },
    { key: "cost", header: "Unit Cost", render: (i) => <span className="font-mono">{formatCurrency(i.costPerUnit || 120)}</span> },
    { key: "expiry", header: "Expiry Date", render: (i) => <span className="font-mono text-xs">{formatDate(i.expiryDate)}</span> },
    { key: "status", header: "Alert status", render: (i) => {
      const status = inventoryStatus(i);
      return <StatusBadge status={status} />;
    } }
  ];

  // 5. PHARMACY DISPENSING COLUMNS
  const pharmacyCols: Column<DispensingRecord>[] = [
    { key: "id", header: "Record ID", render: (d) => <span className="font-mono text-xs font-semibold">{d.id}</span> },
    { key: "patient", header: "Patient Name", render: (d) => getPatient(d.patientId)?.name ?? "—" },
    { key: "date", header: "Dispensed Date", render: (d) => <span className="font-mono text-xs">{formatDate(d.dispensedDate)}</span> },
    {
      key: "medicines",
      header: "Dispensed Medication",
      render: (d) => (
        <div className="flex flex-col">
          {d.medicines.map((m, idx) => (
            <span key={idx} className="text-xs font-medium text-foreground">
              {m.name} <span className="font-mono text-muted-foreground font-semibold">({m.qtyDispensed} qty)</span>
            </span>
          ))}
        </div>
      )
    },
    { key: "batch", header: "Batch Code / Expiry", render: (d) => (
      <div className="flex flex-col text-[10px] text-muted-foreground font-mono">
        <span>Batch: {d.medicines[0]?.batchNumber ?? "—"}</span>
        <span>Expires: {d.medicines[0]?.expiryDate ? formatDate(d.medicines[0].expiryDate) : "—"}</span>
      </div>
    ) },
    { key: "status", header: "Status", render: (d) => <StatusBadge status={d.status === "Completed" ? "Paid" : "Pending"} /> }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page header and print options */}
      <div className="print:hidden">
        <PageHeader
          title="HMS Consolidated Reports & Analytics"
          description="Cross-module analysis and management insights dashboard"
          actions={
            <div className="flex items-center gap-2 rounded-xl border bg-card/45 p-1.5 shadow-sm">
              <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground px-2">
                <Eye className="size-3.5 text-primary" />
                Simulate Access:
              </span>
              <div className="w-56">
                <Select value={currentRole} onValueChange={(val) => setCurrentRole(val as RoleId)}>
                  <SelectTrigger className="h-8 text-xs font-semibold bg-transparent border-0 focus:ring-0 focus:ring-offset-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES_SIMULATOR.map((r) => (
                      <SelectItem key={r.id} value={r.id} className="text-xs font-medium">
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          }
        />
      </div>

      {/* Simulated warning banner if restricted */}
      {currentRole !== "super-admin" && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-500/5 p-4 text-xs text-amber-800 backdrop-blur-sm shadow-sm print:hidden">
          <ShieldAlert className="size-4 shrink-0 mt-0.5 text-amber-600" />
          <div>
            <span className="font-semibold text-amber-900">Restricted Report Access Active:</span>{" "}
            Viewing as <strong className="underline">{ROLES_SIMULATOR.find(r => r.id === currentRole)?.label}</strong>. 
            {isHospitalLocked ? (
              <span> Analytics and records are automatically locked to <strong>{lockedHospitalName} ({activeHospitalId})</strong>.</span>
            ) : (
              <span> You only have permission to access the <strong>{ROLE_TAB_ACCESS[currentRole].map(t => TABS.find(tab => tab.id === t)?.label).join(", ")}</strong> sections.</span>
            )}
          </div>
        </div>
      )}

      {/* PRINT-ONLY HEADER */}
      <div className="hidden print:block border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold">Consolidated Management Report</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Hospital Network Management System | Generated on {new Date().toLocaleDateString()}
        </p>
        <div className="grid grid-cols-3 gap-4 mt-4 text-xs">
          <div><strong>Scope:</strong> {hospitalName}</div>
          <div><strong>Period:</strong> {dateRange === "7d" ? "Last 7 Days" : dateRange === "30d" ? "Last 30 Days" : dateRange === "this-month" ? "This Month" : "Full"}</div>
          <div><strong>Role Auth:</strong> {ROLES_SIMULATOR.find(r => r.id === currentRole)?.label}</div>
        </div>
      </div>

      {/* Export Action Bar / Filters */}
      <div className="print:hidden">
        <ExportActionBar
          selectedHospitalId={activeHospitalId}
          onHospitalChange={setHospitalId}
          selectedDateRange={dateRange}
          onDateRangeChange={setDateRange}
          onExport={handleExport}
          onPrint={handlePrint}
          disabledHospitalSelect={isHospitalLocked}
          hospitalLockName={lockedHospitalName}
        />
      </div>

      {/* Navigation tabs */}
      <div className="flex flex-col gap-1 border-b pb-px sm:flex-row print:hidden">
        {TABS.map((t) => {
          const isAllowed = allowedTabs.includes(t.id);
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => isAllowed && setActiveTab(t.id)}
              disabled={!isAllowed}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all duration-200 outline-none",
                !isAllowed 
                  ? "cursor-not-allowed opacity-40 text-muted-foreground border-transparent" 
                  : resolvedTab === t.id 
                  ? "border-primary text-primary bg-primary/[0.02] shadow-[inset_0_-2px_0_0_var(--primary)]" 
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
              )}
            >
              <Icon className={cn("size-4", resolvedTab === t.id ? "text-primary" : "text-muted-foreground")} />
              {t.label}
              {!isAllowed && <span className="text-[9px] uppercase tracking-wider font-extrabold text-danger bg-danger/10 px-1.5 py-0.5 rounded">Locked</span>}
            </button>
          );
        })}
      </div>

      {/* 1. METRIC STAT CARDS */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        {resolvedTab === "overview" && (
          <>
            <Card className="border bg-card/40 backdrop-blur-sm shadow-sm hover:shadow transition-all">
              <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">Active Locations</CardDescription>
                <Building2 className="size-4 text-blue-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold tracking-tight">{computed.totalHospitals}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Network facilities monitored</p>
              </CardContent>
            </Card>

            <Card className="border bg-card/40 backdrop-blur-sm shadow-sm hover:shadow transition-all">
              <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">Bed Occupancy Rate</CardDescription>
                <Activity className="size-4 text-indigo-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold tracking-tight">{computed.occupancyRate.toFixed(1)}%</div>
                <p className="text-[10px] text-muted-foreground mt-1">{computed.occupiedBedsCount} of {computed.totalBedsCount} beds taken</p>
              </CardContent>
            </Card>

            <Card className="border bg-card/40 backdrop-blur-sm shadow-sm hover:shadow transition-all">
              <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">Hospital Admissions</CardDescription>
                <Users2 className="size-4 text-emerald-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold tracking-tight">{computed.patientsVolume}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Active patients under network care</p>
              </CardContent>
            </Card>

            <Card className="border bg-card/40 backdrop-blur-sm shadow-sm hover:shadow transition-all">
              <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">Monthly Billings</CardDescription>
                <DollarSign className="size-4 text-amber-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold tracking-tight text-emerald-600">{formatCurrency(computed.totalHospitalRevenue)}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Billing aggregates (Monthly)</p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Card 2 */}
        {resolvedTab === "patient" && (
          <>
            <Card className="border bg-card/40 backdrop-blur-sm shadow-sm hover:shadow transition-all">
              <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">Admissions Count</CardDescription>
                <Users2 className="size-4 text-indigo-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold tracking-tight">{computed.totalAdmissionsCount}</div>
                <p className="text-[10px] text-muted-foreground mt-1">New in-patient intakes in range</p>
              </CardContent>
            </Card>

            <Card className="border bg-card/40 backdrop-blur-sm shadow-sm hover:shadow transition-all">
              <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">OPD Outpatient Count</CardDescription>
                <Activity className="size-4 text-blue-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold tracking-tight">{computed.totalOPD}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Consultation visits logged</p>
              </CardContent>
            </Card>

            <Card className="border bg-card/40 backdrop-blur-sm shadow-sm hover:shadow transition-all">
              <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">Discharge Rate</CardDescription>
                <CheckCircle2 className="size-4 text-emerald-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold tracking-tight">{computed.dischargeRate.toFixed(1)}%</div>
                <p className="text-[10px] text-muted-foreground mt-1">Patient turnover compliance</p>
              </CardContent>
            </Card>

            <Card className="border bg-card/40 backdrop-blur-sm shadow-sm hover:shadow transition-all">
              <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">Lab Tests Completed</CardDescription>
                <FlaskConical className="size-4 text-amber-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold tracking-tight">{computed.labOrdersCount}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Diagnostic profiles resulted</p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Card 3 */}
        {resolvedTab === "financial" && (
          <>
            <Card className="border bg-card/40 backdrop-blur-sm shadow-sm hover:shadow transition-all">
              <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">Billed Revenue</CardDescription>
                <DollarSign className="size-4 text-blue-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold tracking-tight text-blue-600">{formatCurrency(computed.totalRevenueSum)}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Total billing invoices issued</p>
              </CardContent>
            </Card>

            <Card className="border bg-card/40 backdrop-blur-sm shadow-sm hover:shadow transition-all">
              <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">Cash Collections</CardDescription>
                <CheckCircle2 className="size-4 text-emerald-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold tracking-tight text-emerald-600">{formatCurrency(computed.totalCollectionsSum)}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Realized payments (UPI, cash, etc.)</p>
              </CardContent>
            </Card>

            <Card className="border bg-card/40 backdrop-blur-sm shadow-sm hover:shadow transition-all">
              <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">Outstanding Dues</CardDescription>
                <AlertCircle className="size-4 text-red-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold tracking-tight text-red-500">{formatCurrency(computed.totalOutstandingSum)}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Pending patient balances</p>
              </CardContent>
            </Card>

            <Card className="border bg-card/40 backdrop-blur-sm shadow-sm hover:shadow transition-all">
              <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">Insurance Billings</CardDescription>
                <Briefcase className="size-4 text-amber-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold tracking-tight">{formatCurrency(computed.totalInsuranceClaimsSum)}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Claims submitted to providers</p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Card 4 */}
        {resolvedTab === "staff" && (
          <>
            <Card className="border bg-card/40 backdrop-blur-sm shadow-sm hover:shadow transition-all">
              <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">Staff Strength</CardDescription>
                <Users2 className="size-4 text-violet-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold tracking-tight">{computed.totalStaffCount}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Active staff members in database</p>
              </CardContent>
            </Card>

            <Card className="border bg-card/40 backdrop-blur-sm shadow-sm hover:shadow transition-all">
              <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">Attendance Rate</CardDescription>
                <CheckCircle2 className="size-4 text-emerald-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold tracking-tight text-violet-600">{computed.attendanceCompliance.toFixed(1)}%</div>
                <p className="text-[10px] text-muted-foreground mt-1">Present compliance rate</p>
              </CardContent>
            </Card>

            <Card className="border bg-card/40 backdrop-blur-sm shadow-sm hover:shadow transition-all">
              <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">Late Check-Ins</CardDescription>
                <Clock className="size-4 text-amber-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold tracking-tight">{computed.lateCheckins}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Late arrivals registered</p>
              </CardContent>
            </Card>

            <Card className="border bg-card/40 backdrop-blur-sm shadow-sm hover:shadow transition-all">
              <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">Pending Leaves</CardDescription>
                <FileText className="size-4 text-red-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold tracking-tight">{computed.pendingLeavesCount}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Requests requiring evaluation</p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Card 5 */}
        {resolvedTab === "inventory" && (
          <>
            <Card className="border bg-card/40 backdrop-blur-sm shadow-sm hover:shadow transition-all">
              <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">Inventory Value</CardDescription>
                <Package className="size-4 text-amber-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold tracking-tight text-amber-600">{formatCurrency(computed.totalInventoryVal)}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Estimated stock valuation</p>
              </CardContent>
            </Card>

            <Card className="border bg-card/40 backdrop-blur-sm shadow-sm hover:shadow transition-all">
              <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">Low Stock Alerts</CardDescription>
                <AlertCircle className="size-4 text-red-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold tracking-tight text-red-500">{computed.lowStockAlerts}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Items below reorder thresholds</p>
              </CardContent>
            </Card>

            <Card className="border bg-card/40 backdrop-blur-sm shadow-sm hover:shadow transition-all">
              <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">Expired Batch Items</CardDescription>
                <ShieldAlert className="size-4 text-rose-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold tracking-tight text-rose-600">{computed.expired}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Items requiring disposal / refund</p>
              </CardContent>
            </Card>

            <Card className="border bg-card/40 backdrop-blur-sm shadow-sm hover:shadow transition-all">
              <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">Expiring soon (30d)</CardDescription>
                <Clock className="size-4 text-blue-500" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold tracking-tight">{computed.expiringSoon}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Items requiring priority usage</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* 2. ANALYTICS VISUAL CHART */}
      <div className="w-full">
        <AnalyticsChart
          activeTab={resolvedTab}
          hospitalOverviewData={computed.hospitalList}
          patientStatsData={{
            admissionsTrend: computed.admissionsTrend,
            topDiagnoses: computed.topDiagnoses,
            labOrdersCount: computed.labOrdersCount
          }}
          financialData={{
            hospitalRevenue: computed.hospitalRevenueChart,
            departmentBreakdown: computed.departmentBreakdownChart,
            totalRevenue: computed.totalRevenueSum,
            totalCollections: computed.totalCollectionsSum
          }}
          staffData={{
            deptCompliance: computed.deptComplianceChart,
            roleDistribution: computed.roleDistributionChart
          }}
          inventoryData={{
            categoryDistribution: computed.categoryDistributionChart,
            topMedicines: computed.topMedicinesChart
          }}
        />
      </div>

      {/* 3. DETAILS / DATA TABLES SECTION */}
      <div className="w-full">
        {resolvedTab === "overview" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-tight flex items-center gap-1.5">
                <Building2 className="size-4 text-primary" />
                Hospital Capacity & Revenue Breakdown
              </h3>
            </div>
            <DataTable
              data={computed.hospitalList}
              columns={hospitalCols}
              searchableFields={["name", "city"]}
              rowKey={(h) => h.id}
              pageSize={10}
            />
          </div>
        )}

        {resolvedTab === "patient" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 justify-between sm:flex-row sm:items-center">
              <h3 className="text-sm font-bold tracking-tight flex items-center gap-1.5">
                <TrendingUp className="size-4 text-primary" />
                Detailed Patient Admissions & Diagnostic Logs
              </h3>
              <div className="flex border rounded-lg bg-muted p-0.5 self-start">
                <button
                  onClick={() => setPatientSubTab("admissions")}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                    patientSubTab === "admissions" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Clinical Admissions ({computed.totalAdmissionsCount})
                </button>
                <button
                  onClick={() => setPatientSubTab("lab-orders")}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                    patientSubTab === "lab-orders" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Diagnostic Lab Orders ({computed.labOrdersCount})
                </button>
              </div>
            </div>

            {patientSubTab === "admissions" ? (
              <DataTable
                data={computed.recentAdmissions}
                columns={admissionsCols}
                searchableFields={["patientId", "id"]}
                rowKey={(a) => a.id}
                pageSize={10}
              />
            ) : (
              <DataTable
                data={computed.recentLabOrders}
                columns={labOrdersCols}
                searchableFields={["testType", "patientId"]}
                rowKey={(o) => o.id}
                pageSize={10}
              />
            )}
          </div>
        )}

        {resolvedTab === "financial" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-tight flex items-center gap-1.5">
                <DollarSign className="size-4 text-primary" />
                Consolidated Billing Records
              </h3>
            </div>
            <DataTable
              data={computed.recentInvoices}
              columns={invoiceCols}
              searchableFields={["id", "insuranceProvider"]}
              rowKey={(i) => i.id}
              pageSize={10}
            />
          </div>
        )}

        {resolvedTab === "staff" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 justify-between sm:flex-row sm:items-center">
              <h3 className="text-sm font-bold tracking-tight flex items-center gap-1.5">
                <Users2 className="size-4 text-primary" />
                Human Resources Logs & Operations
              </h3>
              <div className="flex border rounded-lg bg-muted p-0.5 self-start">
                <button
                  onClick={() => setStaffSubTab("attendance")}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                    staffSubTab === "attendance" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Shift Attendance Logs
                </button>
                <button
                  onClick={() => setStaffSubTab("leaves")}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                    staffSubTab === "leaves" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Pending/Recent Leaves ({computed.pendingLeavesCount})
                </button>
              </div>
            </div>

            {staffSubTab === "attendance" ? (
              <DataTable
                data={computed.recentAttendance}
                columns={staffAttendanceCols}
                rowKey={(a) => `${a.staffId}-${a.date}`}
                pageSize={10}
              />
            ) : (
              <DataTable
                data={computed.recentLeaveRequests}
                columns={staffLeaveCols}
                searchableFields={["staffName", "leaveType"]}
                rowKey={(r) => r.id}
                pageSize={10}
              />
            )}
          </div>
        )}

        {resolvedTab === "inventory" && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 justify-between sm:flex-row sm:items-center">
              <h3 className="text-sm font-bold tracking-tight flex items-center gap-1.5">
                <Package className="size-4 text-primary" />
                Supply & Pharmacy Dispensing Logs
              </h3>
              <div className="flex border rounded-lg bg-muted p-0.5 self-start">
                <button
                  onClick={() => setInventorySubTab("stock")}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                    inventorySubTab === "stock" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Low Stock Inventory Alerts ({computed.lowStockAlerts})
                </button>
                <button
                  onClick={() => setInventorySubTab("dispensing")}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                    inventorySubTab === "dispensing" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Pharmacy Dispensing History
                </button>
              </div>
            </div>

            {inventorySubTab === "stock" ? (
              <DataTable
                data={computed.lowStockItems}
                columns={inventoryCols}
                searchableFields={["name", "category"]}
                rowKey={(i) => i.id}
                pageSize={10}
              />
            ) : (
              <DataTable
                data={computed.recentDispensingLogs}
                columns={pharmacyCols}
                rowKey={(d) => d.id}
                pageSize={10}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
