import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AdmissionWorkflow } from "@/components/modules/admissions/AdmissionWorkflow";
import { BEDS, ADMISSIONS } from "@/mocks/admissions";
import { PATIENTS } from "@/mocks/patients";
import { DOCTORS } from "@/mocks/doctors";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BedDouble, Users, CheckCircle, Settings, FileText, ArrowRight,
  TrendingUp, Clock, UserCheck, HeartHandshake, ShieldAlert
} from "lucide-react";

export const Route = createFileRoute("/_app/admissions/")({
  head: () => ({ meta: [{ title: "Admissions & Bed Management — HMS" }] }),
  component: AdmissionsOverviewPage,
});

function AdmissionsOverviewPage() {
  const [activeTab, setActiveTab] = useState<"visual" | "registry">("visual");
  const [refreshKey, setRefreshKey] = useState(0);

  const forceRefresh = () => setRefreshKey((k) => k + 1);

  // Statistics
  const totalBeds = BEDS.length;
  const occupiedBeds = BEDS.filter((b) => b.status === "Occupied").length;
  const vacantBeds = BEDS.filter((b) => b.status === "Vacant").length;
  const maintenanceBeds = BEDS.filter((b) => b.status === "Maintenance").length;

  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // Active inpatient records (no discharge date)
  const activeAdmissions = ADMISSIONS.filter((a) => !a.dischargeDate);

  return (
    <div className="space-y-6 max-w-7xl mx-auto" key={refreshKey}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BedDouble className="size-6 text-primary" />
            Admissions & Bed Allocations
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time inpatient tracking, visual ward layout mappings, and direct clinical discharge workflows.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admissions/discharge">
            <Button size="sm" variant="outline" className="text-xs gap-1.5 h-9">
              Discharge Workflows
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Numerical Stats Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Capacity</span>
              <p className="text-2xl font-bold">{totalBeds}</p>
              <span className="text-[9px] text-muted-foreground block">Beds across 4 Wards</span>
            </div>
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <BedDouble className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Occupied Beds</span>
              <p className="text-2xl font-bold text-rose-500">{occupiedBeds}</p>
              <Badge variant="outline" className="text-[9px] h-4 bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20">
                {occupancyRate}% Occupancy
              </Badge>
            </div>
            <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
              <Users className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Vacant Available</span>
              <p className="text-2xl font-bold text-emerald-500">{vacantBeds}</p>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block font-medium">Ready for Intake</span>
            </div>
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <CheckCircle className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Maintenance</span>
              <p className="text-2xl font-bold text-amber-500">{maintenanceBeds}</p>
              <span className="text-[9px] text-muted-foreground block">Housekeeping Logs Active</span>
            </div>
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
              <Settings className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Container */}
      <Tabs defaultValue="visual" value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full space-y-4">
        <TabsList className="bg-muted/60 p-1 border border-border rounded-xl">
          <TabsTrigger value="visual" className="text-xs rounded-lg px-4 py-2">
            Visual Bed Grid Intake
          </TabsTrigger>
          <TabsTrigger value="registry" className="text-xs rounded-lg px-4 py-2">
            Inpatient Registry ({activeAdmissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="outline-none">
          <AdmissionWorkflow onSuccess={forceRefresh} />
        </TabsContent>

        <TabsContent value="registry" className="outline-none">
          <Card className="border border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-bold">Active Inpatient registry</CardTitle>
              <CardDescription className="text-xs">
                Real-time snapshot of currently admitted inpatients, assigned doctors, and bed status.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="overflow-x-auto border border-border rounded-xl bg-card">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-accent/20 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="p-3 pl-4">Patient UHID</th>
                      <th className="p-3">Admitted Bed</th>
                      <th className="p-3">Ward Info</th>
                      <th className="p-3">Admitting Date & Stay</th>
                      <th className="p-3">Attending Physician</th>
                      <th className="p-3">Billing clearance</th>
                      <th className="p-3 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {activeAdmissions.length > 0 ? (
                      activeAdmissions.map((adm) => {
                        const patient = PATIENTS.find((p) => p.id === adm.patientId);
                        const doctor = DOCTORS.find((d) => d.id === adm.doctorId);
                        const bed = BEDS.find((b) => b.id === adm.bedId);

                        // Calculate current duration
                        const start = new Date(adm.admissionDate);
                        const diff = Math.max(1, Math.ceil((new Date().getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

                        return (
                          <tr key={adm.id} className="hover:bg-accent/5 transition-colors">
                            <td className="p-3 pl-4">
                              <div className="font-semibold text-foreground">{patient?.name || "Unknown Patient"}</div>
                              <div className="text-[10px] text-muted-foreground">{adm.patientId}</div>
                            </td>
                            <td className="p-3 font-semibold text-primary">
                              {adm.bedId}
                            </td>
                            <td className="p-3">
                              {bed?.ward || "General Ward A"}
                            </td>
                            <td className="p-3">
                              <div>{new Date(adm.admissionDate).toLocaleDateString()}</div>
                              <div className="text-[10px] text-amber-600 font-semibold">{diff} Day(s) Stay</div>
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-foreground">Dr. {doctor?.name || "Unassigned"}</div>
                              <div className="text-[10px] text-muted-foreground">{doctor?.specialization || ""}</div>
                            </td>
                            <td className="p-3">
                              <Badge
                                variant="outline"
                                className={`text-[10px] h-5 font-semibold ${
                                  adm.billingStatus === "Cleared"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                }`}
                              >
                                {adm.billingStatus}
                              </Badge>
                            </td>
                            <td className="p-3 pr-4 text-right">
                              <Link
                                to="/admissions/discharge"
                                className="inline-block"
                              >
                                <Button size="sm" variant="ghost" className="h-7 text-[10px] gap-1 text-primary hover:text-primary-foreground hover:bg-primary">
                                  Discharge Out
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground text-xs italic">
                          No active inpatients registered in any ward.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
