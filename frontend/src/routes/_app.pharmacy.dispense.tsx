import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { DispenseForm } from "@/components/modules/pharmacy/DispenseForm";
import { DISPENSING_LOGS } from "@/mocks/pharmacy";
import { PATIENTS } from "@/mocks/patients";
import { DOCTORS } from "@/mocks/doctors";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, RefreshCw, FileText } from "lucide-react";

export const Route = createFileRoute("/_app/pharmacy/dispense")({
  head: () => ({ meta: [{ title: "Dispensing Desk & Returns — HMS" }] }),
  component: PharmacyDispensePage,
});

function PharmacyDispensePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const forceRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" key={refreshKey}>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link to="/pharmacy" className="hover:text-primary flex items-center gap-1 transition-colors">
              <ArrowLeft className="size-3" />
              Back to Inventory
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Clock className="size-6 text-primary" />
            Prescription Dispensing Desk
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Search doctor prescriptions, issue medicine packs, and track custom patient credits/returns.
          </p>
        </div>
        <div>
          <Button size="sm" variant="outline" onClick={forceRefresh} className="h-9 gap-1 text-xs">
            <RefreshCw className="size-3.5" />
            Refresh Logs
          </Button>
        </div>
      </div>

      {/* Forms Component */}
      <DispenseForm onSuccess={forceRefresh} />

      {/* Daily Dispensing Log Table (satisfying reports requirements) */}
      <Card className="border border-border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-1.5">
            <FileText className="size-4 text-primary" />
            Daily Dispensing & Return Logs
          </CardTitle>
          <CardDescription className="text-xs">
            Audit trail of recently issued prescriptions and returned stock transactions.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="overflow-x-auto border border-border rounded-xl bg-card">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-accent/20 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="p-3 pl-4">Log ID</th>
                  <th className="p-3">Patient Profile</th>
                  <th className="p-3">Medicine Issued</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Batch & Expiry</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3 pr-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs">
                {DISPENSING_LOGS.length > 0 ? (
                  DISPENSING_LOGS.map((log) => {
                    const patient = PATIENTS.find((p) => p.id === log.patientId);
                    const isReturn = log.id.startsWith("RET");

                    return (
                      <tr key={log.id} className="hover:bg-accent/5 transition-colors">
                        <td className="p-3 pl-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {log.id.slice(0, 10)}
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-foreground">{patient?.name || "Unknown Patient"}</div>
                          <div className="text-[10px] text-muted-foreground">{log.patientId}</div>
                        </td>
                        <td className="p-3">
                          {log.medicines.map((med, mIdx) => (
                            <span key={mIdx} className="font-semibold block">
                              {med.name}
                            </span>
                          ))}
                        </td>
                        <td className="p-3">
                          {log.medicines.map((med, mIdx) => {
                            const val = med.qtyDispensed;
                            return (
                              <span
                                key={mIdx}
                                className={`font-bold block ${
                                  val < 0 ? "text-red-500" : "text-emerald-500"
                                }`}
                              >
                                {val < 0 ? `Returned (${Math.abs(val)})` : `${val} strip(s)`}
                              </span>
                            );
                          })}
                        </td>
                        <td className="p-3 text-[11px] text-muted-foreground">
                          {log.medicines.map((med, mIdx) => (
                            <div key={mIdx}>
                              <div>Batch: {med.batchNumber}</div>
                              <div className="text-[9px]">Exp: {med.expiryDate}</div>
                            </div>
                          ))}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {new Date(log.dispensedDate).toLocaleString()}
                        </td>
                        <td className="p-3 pr-4">
                          <span className="italic text-muted-foreground text-[11px]">
                            {log.notes || "Dispensation complete"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground text-xs italic">
                      No dispensing transactions recorded today.
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
