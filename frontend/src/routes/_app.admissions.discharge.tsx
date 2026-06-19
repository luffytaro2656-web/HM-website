import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { DischargeForm } from "@/components/modules/admissions/DischargeForm";
import { ADMISSIONS } from "@/mocks/admissions";
import { PATIENTS } from "@/mocks/patients";
import { DOCTORS } from "@/mocks/doctors";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, FileText, CheckCircle2, BadgeAlert, Printer, 
  Receipt, Landmark, History, ClipboardCheck
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admissions/discharge")({
  head: () => ({ meta: [{ title: "Patient Discharge & Billing Clearance — HMS" }] }),
  component: AdmissionsDischargePage,
});

function AdmissionsDischargePage() {
  const [activeTab, setActiveTab] = useState<"discharge" | "history">("discharge");
  const [refreshKey, setRefreshKey] = useState(0);

  const forceRefresh = () => setRefreshKey((k) => k + 1);

  // Filter historical discharge records
  const dischargedAdmissions = ADMISSIONS.filter((a) => !!a.dischargeDate);

  return (
    <div className="space-y-6 max-w-7xl mx-auto" key={refreshKey}>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link to="/admissions" className="hover:text-primary flex items-center gap-1 transition-colors">
              <ArrowLeft className="size-3" />
              Back to Bed Grid
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ClipboardCheck className="size-6 text-primary" />
            Patient Discharge & Billing Clearance
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Resolve inpatient admission stays, trigger financial audit requests, and print clinical certificates.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full space-y-4">
        <TabsList className="bg-muted/60 p-1 border border-border rounded-xl">
          <TabsTrigger value="discharge" className="text-xs rounded-lg px-4 py-2 flex items-center gap-1.5">
            <Receipt className="size-3.5" />
            Intake Clearance & Billing
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs rounded-lg px-4 py-2 flex items-center gap-1.5">
            <History className="size-3.5" />
            Discharged Registry ({dischargedAdmissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discharge" className="outline-none">
          <DischargeForm onSuccess={forceRefresh} />
        </TabsContent>

        <TabsContent value="history" className="outline-none">
          <Card className="border border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-bold">Historical Discharged Registry</CardTitle>
              <CardDescription className="text-xs">
                History of recently discharged patients, clinical stay length, final bills, and clearance status.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="overflow-x-auto border border-border rounded-xl bg-card">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-accent/20 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="p-3 pl-4">Patient UHID</th>
                      <th className="p-3">Bed ID</th>
                      <th className="p-3">Admit Date</th>
                      <th className="p-3">Discharge Date</th>
                      <th className="p-3">Physician</th>
                      <th className="p-3">Billing Status</th>
                      <th className="p-3 text-right">Total Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {dischargedAdmissions.length > 0 ? (
                      dischargedAdmissions.map((adm) => {
                        const patient = PATIENTS.find((p) => p.id === adm.patientId);
                        const doctor = DOCTORS.find((d) => d.id === adm.doctorId);

                        return (
                          <tr key={adm.id} className="hover:bg-accent/5 transition-colors">
                            <td className="p-3 pl-4">
                              <div className="font-semibold text-foreground">{patient?.name || "Unknown Patient"}</div>
                              <div className="text-[10px] text-muted-foreground">{adm.patientId}</div>
                            </td>
                            <td className="p-3 font-semibold text-slate-600 dark:text-slate-400">
                              {adm.bedId}
                            </td>
                            <td className="p-3 text-[11px] text-muted-foreground">
                              {new Date(adm.admissionDate).toLocaleDateString()}
                            </td>
                            <td className="p-3 text-[11px] font-medium text-foreground">
                              {adm.dischargeDate ? new Date(adm.dischargeDate).toLocaleDateString() : "-"}
                            </td>
                            <td className="p-3">
                              <div className="font-semibold">Dr. {doctor?.name || "Physician"}</div>
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
                            <td className="p-3 text-right font-bold text-foreground">
                              ₹{adm.totalBillAmount.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground text-xs italic">
                          No discharged records found.
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
