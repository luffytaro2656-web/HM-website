import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { LAB_ORDERS, startProcessing } from "@/mocks/lab";
import { PATIENTS } from "@/mocks/patients";
import { DOCTORS } from "@/mocks/doctors";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, Beaker, HelpCircle, Activity, ShieldAlert, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_app/lab/samples")({
  head: () => ({ meta: [{ title: "Lab Specimen & Sample Tracking — HMS" }] }),
  component: LabSamplesPage,
});

function LabSamplesPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const forceRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Filter orders that have a collected sample
  const sampleOrders = LAB_ORDERS.filter(
    (o) => o.status !== "Order Received"
  );

  const handleStartProcessing = (orderId: string) => {
    const order = startProcessing(orderId);
    if (order) {
      toast.success("Specimen Processing Started!", {
        description: `Order ${orderId} has been successfully transferred to the laboratory analyzer.`,
      });
      forceRefresh();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto" key={refreshKey}>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link to="/lab" className="hover:text-primary flex items-center gap-1 transition-colors">
              <ArrowLeft className="size-3" />
              Back to Overview
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Beaker className="size-6 text-primary" />
            Specimen Sample Tracking
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track clinical samples, view collection timestamps, and manage active lab processing workflows.
          </p>
        </div>
        <div>
          <Button size="sm" variant="outline" onClick={forceRefresh} className="h-9 gap-1 text-xs">
            <RefreshCw className="size-3.5" />
            Refresh Desk
          </Button>
        </div>
      </div>

      {/* Main Specimen Table */}
      <Card className="border border-border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Specimen Registry Log</CardTitle>
          <CardDescription className="text-xs">
            Active tracking details for all collected blood, serum, or urine samples.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="overflow-x-auto border border-border rounded-xl bg-card">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-accent/20 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="p-3 pl-4">Order ID</th>
                  <th className="p-3">Patient UHID</th>
                  <th className="p-3">Test Type</th>
                  <th className="p-3">Specimen Type</th>
                  <th className="p-3">Collected Date & Time</th>
                  <th className="p-3">Phlebotomist / Collector</th>
                  <th className="p-3">Active Status</th>
                  <th className="p-3 pr-4 text-right">Analyzer Desk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {sampleOrders.length > 0 ? (
                  sampleOrders.map((order) => {
                    const pat = PATIENTS.find((p) => p.id === order.patientId);
                    
                    let urgColor = "bg-slate-500/10 text-slate-600 border-slate-500/20";
                    if (order.urgency === "STAT") {
                      urgColor = "bg-red-500/10 text-red-600 border-red-500/20 font-bold animate-pulse";
                    } else if (order.urgency === "Urgent") {
                      urgColor = "bg-amber-500/10 text-amber-600 border-amber-500/20";
                    }

                    let stBadge = "bg-slate-500/10 text-slate-600 border-transparent";
                    if (order.status === "Released") stBadge = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
                    else if (order.status === "Resulted") stBadge = "bg-blue-500/10 text-blue-600 border-blue-500/20";
                    else if (order.status === "In Processing") stBadge = "bg-purple-500/10 text-purple-600 border-purple-500/20";
                    else if (order.status === "Sample Collected") stBadge = "bg-orange-500/10 text-orange-600 border-orange-500/20";

                    return (
                      <tr key={order.id} className="hover:bg-accent/5 transition-colors">
                        <td className="p-3 pl-4 font-bold text-foreground">
                          {order.id}
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-foreground">{pat?.name || "Unknown"}</div>
                          <div className="text-[10px] text-muted-foreground">{order.patientId}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-primary">{order.testType}</div>
                          <Badge variant="outline" className={`text-[9px] mt-0.5 h-4.5 ${urgColor}`}>
                            {order.urgency}
                          </Badge>
                        </td>
                        <td className="p-3 font-semibold text-slate-600 dark:text-slate-400">
                          {order.sampleType || "Blood (EDTA)"}
                        </td>
                        <td className="p-3 text-muted-foreground text-[11px]">
                          {order.collectedAt ? new Date(order.collectedAt).toLocaleString() : "-"}
                        </td>
                        <td className="p-3 font-medium text-slate-700 dark:text-slate-300">
                          {order.collectorName || "-"}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className={`text-[10px] font-semibold h-5 ${stBadge}`}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="p-3 pr-4 text-right">
                          {order.status === "Sample Collected" ? (
                            <Button
                              size="sm"
                              onClick={() => handleStartProcessing(order.id)}
                              className="h-7 text-[10px] bg-purple-600 hover:bg-purple-700 text-white gap-1"
                            >
                              <Activity className="size-3" />
                              Start Analyzer
                            </Button>
                          ) : order.status === "In Processing" ? (
                            <span className="text-[10px] text-purple-600 font-semibold flex items-center justify-end gap-1">
                              <Activity className="size-3.5 animate-spin" />
                              Processing
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                              <CheckCircle2 className="size-3.5" />
                              Done
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground text-xs italic">
                      No collected specimen samples currently registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
