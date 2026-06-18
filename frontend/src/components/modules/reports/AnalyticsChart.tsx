import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, DollarSign, Activity, Users2, Package } from "lucide-react";

// Color palettes for premium feel
const PRIMARY_GRADIENT = ["#3b82f6", "#60a5fa"];
const EMERALD_GRADIENT = ["#10b981", "#34d399"];
const INDIGO_GRADIENT = ["#6366f1", "#818cf8"];
const ROSE_GRADIENT = ["#f43f5e", "#fb7185"];
const VIOLET_GRADIENT = ["#8b5cf6", "#a78bfa"];
const AMBER_GRADIENT = ["#f59e0b", "#fbbf24"];

const COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#6366f1", // Indigo
  "#f43f5e", // Rose
  "#8b5cf6", // Violet
  "#f59e0b", // Amber
  "#06b6d4", // Cyan
  "#ec4899", // Pink
];

interface AnalyticsChartProps {
  activeTab: "overview" | "patient" | "financial" | "staff" | "inventory";
  hospitalOverviewData: any[];
  patientStatsData: {
    admissionsTrend: any[];
    topDiagnoses: any[];
    labOrdersCount: number;
  };
  financialData: {
    hospitalRevenue: any[];
    departmentBreakdown: any[];
    totalRevenue: number;
    totalCollections: number;
  };
  staffData: {
    deptCompliance: any[];
    roleDistribution: any[];
  };
  inventoryData: {
    categoryDistribution: any[];
    topMedicines: any[];
  };
}

export function AnalyticsChart({
  activeTab,
  hospitalOverviewData,
  patientStatsData,
  financialData,
  staffData,
  inventoryData,
}: AnalyticsChartProps) {
  // Local chart view sub-toggles
  const [patientChartView, setPatientChartView] = useState<"trend" | "diagnoses">("trend");
  const [financialChartView, setFinancialChartView] = useState<"hospital" | "department">("hospital");
  const [inventoryChartView, setInventoryChartView] = useState<"category" | "medicines">("category");

  // Format currency helper
  const formatCurrencyK = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    return `₹${(value / 1000).toFixed(0)}k`;
  };

  const renderTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-border/80 bg-card/95 p-3 shadow-lg backdrop-blur-md">
          <p className="text-xs font-semibold text-foreground mb-1.5">{label}</p>
          <div className="flex flex-col gap-1">
            {payload.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between gap-4 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
                  <span className="text-muted-foreground">{item.name}:</span>
                </div>
                <span className="font-mono font-semibold text-foreground">
                  {typeof item.value === "number" && item.name.toLowerCase().includes("revenue")
                    ? formatCurrencyK(item.value)
                    : typeof item.value === "number" && item.name.toLowerCase().includes("collections")
                    ? formatCurrencyK(item.value)
                    : typeof item.value === "number" && item.name.toLowerCase().includes("outstanding")
                    ? formatCurrencyK(item.value)
                    : item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* 1. Hospital Overview Chart */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Chart A: Bed Occupancy Ratio */}
          <Card className="border bg-card/45 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-blue-500" />
                <CardTitle className="text-sm font-semibold">Bed Capacity & Occupancy</CardTitle>
              </div>
              <CardDescription className="text-xs">Occupied vs Total available beds per hospital</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hospitalOverviewData.slice(0, 8)} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="shortName" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" angle={-25} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                    <Tooltip content={renderTooltip} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Bar name="Occupied Beds" dataKey="occupiedBeds" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar name="Total Beds" dataKey="totalBeds" fill="var(--muted)" radius={[4, 4, 0, 0]} opacity={0.6} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chart B: Hospital Revenue Comparative */}
          <Card className="border bg-card/45 backdrop-blur-sm shadow-sm transition-all duration-200 hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="size-4 text-emerald-500" />
                <CardTitle className="text-sm font-semibold">Revenue Distribution (Monthly)</CardTitle>
              </div>
              <CardDescription className="text-xs">Top performing hospitals by monthly generated billings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hospitalOverviewData.slice(0, 8)} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="shortName" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" angle={-25} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                    <Tooltip content={renderTooltip} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Bar name="Revenue" dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. Patient Statistics Chart */}
      {activeTab === "patient" && (
        <Card className="border bg-card/45 backdrop-blur-sm shadow-sm">
          <CardHeader className="pb-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-indigo-500" />
                <CardTitle className="text-sm font-semibold">Clinical & Patient Metrics</CardTitle>
              </div>
              <CardDescription className="text-xs">
                {patientChartView === "trend"
                  ? "Admissions trends over the last 15 days"
                  : "Frequency distribution of top diagnoses across consultations"}
              </CardDescription>
            </div>
            <div className="flex rounded-lg border bg-muted p-0.5 self-start sm:self-center">
              <Button
                variant={patientChartView === "trend" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-3 text-[11px] font-medium"
                onClick={() => setPatientChartView("trend")}
              >
                Admissions Trend
              </Button>
              <Button
                variant={patientChartView === "diagnoses" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-3 text-[11px] font-medium"
                onClick={() => setPatientChartView("diagnoses")}
              >
                Top Diagnoses
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              {patientChartView === "trend" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={patientStatsData.admissionsTrend} margin={{ top: 15, right: 15, left: -20, bottom: 10 }}>
                    <defs>
                      <linearGradient id="patientTrendColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                    <Tooltip content={renderTooltip} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Area name="Daily Admissions" type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#patientTrendColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={patientStatsData.topDiagnoses} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} stroke="var(--muted-foreground)" width={120} />
                    <Tooltip content={renderTooltip} />
                    <Bar name="Cases Diagnosed" dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={15}>
                      {patientStatsData.topDiagnoses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. Financial Summary Chart */}
      {activeTab === "financial" && (
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="border bg-card/45 backdrop-blur-sm shadow-sm lg:col-span-3">
            <CardHeader className="pb-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="size-4 text-emerald-500" />
                  <CardTitle className="text-sm font-semibold">Revenue Operations</CardTitle>
                </div>
                <CardDescription className="text-xs">Comparing billed revenue against actual cash collections</CardDescription>
              </div>
              <div className="flex rounded-lg border bg-muted p-0.5 self-start sm:self-center">
                <Button
                  variant={financialChartView === "hospital" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-3 text-[11px] font-medium"
                  onClick={() => setFinancialChartView("hospital")}
                >
                  By Hospital
                </Button>
                <Button
                  variant={financialChartView === "department" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-3 text-[11px] font-medium"
                  onClick={() => setFinancialChartView("department")}
                >
                  By Department
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {financialChartView === "hospital" ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialData.hospitalRevenue.slice(0, 6)} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="var(--muted-foreground)" angle={-25} textAnchor="end" height={50} />
                      <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={renderTooltip} />
                      <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                      <Bar name="Billed Revenue" dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar name="Collected Amount" dataKey="collections" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar name="Outstanding Balance" dataKey="outstanding" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialData.departmentBreakdown} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} stroke="var(--muted-foreground)" width={110} />
                      <Tooltip content={renderTooltip} />
                      <Bar name="Billed Amount" dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={15}>
                        {financialData.departmentBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border bg-card/45 backdrop-blur-sm shadow-sm lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Department Contribution</CardTitle>
              <CardDescription className="text-xs">Percentage share of total network billings</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div className="h-[220px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={financialData.departmentBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {financialData.departmentBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={renderTooltip} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Donut Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">Net Revenue</span>
                  <span className="text-base font-bold text-foreground">{formatCurrencyK(financialData.totalRevenue)}</span>
                </div>
              </div>
              
              {/* Legend labels */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] mt-2 w-full px-2">
                {financialData.departmentBreakdown.map((dept, index) => (
                  <div key={dept.name} className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="truncate text-muted-foreground">{dept.name}</span>
                    <span className="ml-auto font-mono text-foreground font-semibold">{((dept.value / financialData.totalRevenue) * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 4. Staff Performance Chart */}
      {activeTab === "staff" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Chart A: Attendance Rate */}
          <Card className="border bg-card/45 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Users2 className="size-4 text-violet-500" />
                <CardTitle className="text-sm font-semibold">Attendance Status Distribution</CardTitle>
              </div>
              <CardDescription className="text-xs">Compliance of staff present vs late/absent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={staffData.roleDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={{ stroke: "var(--border)", strokeWidth: 1 }}
                    >
                      {staffData.roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Chart B: Department Attendance Compliance */}
          <Card className="border bg-card/45 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-violet-500" />
                <CardTitle className="text-sm font-semibold">Attendance Compliance by Department</CardTitle>
              </div>
              <CardDescription className="text-xs">Percentage of present/late shifts per clinical unit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={staffData.deptCompliance} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="department" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Bar name="Compliance Rate (%)" dataKey="presentRate" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 5. Inventory & Pharmacy Chart */}
      {activeTab === "inventory" && (
        <Card className="border bg-card/45 backdrop-blur-sm shadow-sm">
          <CardHeader className="pb-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Package className="size-4 text-amber-500" />
                <CardTitle className="text-sm font-semibold">Logistics & Supply Metrics</CardTitle>
              </div>
              <CardDescription className="text-xs">
                {inventoryChartView === "category"
                  ? "Quantity breakdown and valuation by inventory category"
                  : "Highest consumed medications via pharmacy dispensings"}
              </CardDescription>
            </div>
            <div className="flex rounded-lg border bg-muted p-0.5 self-start sm:self-center">
              <Button
                variant={inventoryChartView === "category" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-3 text-[11px] font-medium"
                onClick={() => setInventoryChartView("category")}
              >
                Category Valuation
              </Button>
              <Button
                variant={inventoryChartView === "medicines" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-3 text-[11px] font-medium"
                onClick={() => setInventoryChartView("medicines")}
              >
                Top Dispensed Medicines
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[320px] w-full">
              {inventoryChartView === "category" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryData.categoryDistribution} margin={{ top: 10, right: 15, left: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="category" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" name="Stock Qty" />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickFormatter={(v) => `₹${v/1000}k`} name="Valuation" />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Bar yAxisId="left" name="Items Count (Units)" dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" name="Total Value (INR)" dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventoryData.topMedicines} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} stroke="var(--muted-foreground)" width={120} />
                    <Tooltip />
                    <Bar name="Quantity Dispensed" dataKey="dispensed" fill="#10b981" radius={[0, 4, 4, 0]} barSize={15}>
                      {inventoryData.topMedicines.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
