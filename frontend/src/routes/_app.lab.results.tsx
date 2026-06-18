import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ResultUploader } from "@/components/modules/lab/ResultUploader";
import { LAB_ORDERS } from "@/mocks/lab";
import { PATIENTS } from "@/mocks/patients";
import { DOCTORS } from "@/mocks/doctors";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw, FileCheck, CheckCircle, Printer } from "lucide-react";

export const Route = createFileRoute("/_app/lab/results")({
  head: () => ({ meta: [{ title: "Lab Result Uploads & Release — HMS" }] }),
  component: LabResultsPage,
});

function LabResultsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const forceRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Filter completed and released orders
  const releasedOrders = LAB_ORDERS.filter((o) => o.status === "Released");

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" key={refreshKey}>
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
            <FileCheck className="size-6 text-primary" />
            Result Upload & Verification
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Enter test parameters, generate diagnostic summaries, and release verified laboratory reports.
          </p>
        </div>
        <div>
          <Button size="sm" variant="outline" onClick={forceRefresh} className="h-9 gap-1 text-xs">
            <RefreshCw className="size-3.5" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Main Results Form component */}
      <ResultUploader onSuccess={forceRefresh} />

      {/* Daily Completion Log / Recently Released Reports */}
      <Card className="border border-border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <CheckCircle className="size-4 text-emerald-500" />
            Daily Completion Log (Released Reports)
          </CardTitle>
          <CardDescription className="text-xs">
            Summary of pathology reports clinically authorized and released to patients.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="overflow-x-auto border border-border rounded-xl bg-card">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/20 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="p-3 pl-4">Order ID</th>
                  <th className="p-3">Patient Profile</th>
                  <th className="p-3">Diagnostic Test</th>
                  <th className="p-3">Released Timestamp</th>
                  <th className="p-3">Chief Pathologist Signature</th>
                  <th className="p-3 pr-4 text-right font-semibold">Report Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {releasedOrders.length > 0 ? (
                  releasedOrders.map((order) => {
                    const pat = PATIENTS.find((p) => p.id === order.patientId);

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
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{order.testType}</div>
                          <div className="text-[9px] text-muted-foreground uppercase">{order.urgency}</div>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {order.releasedAt ? new Date(order.releasedAt).toLocaleString() : "-"}
                        </td>
                        <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                          {order.verifiedBy || "Dr. Bose"}
                        </td>
                        <td className="p-3 pr-4 text-right">
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] h-4.5 font-bold uppercase">
                            Released
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground text-xs italic">
                      No reports released today.
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
