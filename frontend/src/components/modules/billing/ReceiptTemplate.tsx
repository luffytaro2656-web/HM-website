import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PATIENTS } from "@/mocks/patients";
import { HOSPITALS } from "@/mocks/hospitals";
import { formatCurrency } from "@/utils/formatters";
import { Printer, ArrowLeft, HeartPulse, CheckSquare } from "lucide-react";
import type { Invoice } from "@/types/billing";

interface ReceiptTemplateProps {
  invoice: Invoice;
  onBackClick?: () => void;
}

export function ReceiptTemplate({ invoice, onBackClick }: ReceiptTemplateProps) {
  const patient = PATIENTS.find((p) => p.id === invoice.patientId);
  const hospital = HOSPITALS.find((h) => h.id === invoice.hospitalId) || HOSPITALS[0];

  const subtotal = invoice.items.reduce((sum, item) => sum + item.rate * item.qty, 0);
  const totalGst = invoice.items.reduce((sum, item) => sum + item.rate * item.qty * (item.gstPct / 100), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Action panel */}
      <div className="flex items-center justify-between no-print">
        {onBackClick ? (
          <Button variant="outline" size="sm" onClick={onBackClick} className="h-8 text-xs gap-1">
            <ArrowLeft className="size-3.5" /> Back to List
          </Button>
        ) : (
          <div />
        )}
        <Button size="sm" onClick={handlePrint} className="h-8 text-xs gap-1.5 bg-primary hover:bg-primary/95">
          <Printer className="size-3.5" /> Print Receipt
        </Button>
      </div>

      {/* Printable Receipt Frame */}
      <Card className="border border-border p-6 shadow-sm bg-card print:border-0 print:shadow-none print:p-0" id="printable-receipt">
        <CardContent className="space-y-6 p-0">
          {/* Hospital Header */}
          <div className="flex justify-between items-start border-b border-border pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-primary">
                <HeartPulse className="size-5" />
                <span className="font-bold text-sm tracking-tight">HMS MULTISPECIALITY HOSPITAL</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{hospital.name}</p>
              <p className="text-[9px] text-muted-foreground max-w-xs">{hospital.address}, {hospital.city}</p>
              <p className="text-[9px] text-muted-foreground">Helpline: {hospital.contact}</p>
            </div>
            <div className="text-right space-y-1">
              <span className="text-xs font-bold text-primary block">OFFICIAL PAYMENT RECEIPT</span>
              <p className="text-[10px] text-muted-foreground">Invoice ID: <strong className="font-mono text-foreground">{invoice.id}</strong></p>
              <p className="text-[10px] text-muted-foreground">Date: {invoice.date}</p>
            </div>
          </div>

          {/* Patient Details */}
          <div className="grid grid-cols-2 gap-4 text-[11px] bg-accent/25 p-3 rounded-lg border border-border/60">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-muted-foreground block">Patient Details</span>
              <p className="font-semibold text-foreground">{patient?.name || "Patient Profile"}</p>
              <p className="text-muted-foreground">ID: {patient?.id} • Age/Gender: {patient?.age || "—"}/{patient?.gender || "—"}</p>
              <p className="text-muted-foreground">Contact: {patient?.phone || "—"}</p>
            </div>
            <div className="space-y-1 text-right">
              <span className="text-[9px] uppercase font-bold text-muted-foreground block">Billing Status</span>
              <p className="font-semibold">
                Status: <span className={invoice.status === "Paid" ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>{invoice.status.toUpperCase()}</span>
              </p>
              {invoice.insuranceProvider && (
                <p className="text-muted-foreground text-[10px]">
                  TPA: {invoice.insuranceProvider} ({invoice.claimStatus})
                </p>
              )}
            </div>
          </div>

          {/* Charge Details Table */}
          <div className="space-y-2">
            <table className="w-full text-left border-collapse text-[10px]">
              <thead>
                <tr className="border-b border-border font-bold text-muted-foreground uppercase text-[9px]">
                  <th className="py-2 pl-1">Description</th>
                  <th className="py-2 text-right">Rate (₹)</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">GST %</th>
                  <th className="py-2 pr-1 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {invoice.items.map((item, idx) => {
                  const lineTotal = item.rate * item.qty;
                  const itemGst = lineTotal * (item.gstPct / 100);
                  return (
                    <tr key={idx} className="align-middle">
                      <td className="py-2 pl-1 font-medium text-slate-800 dark:text-slate-200">{item.description}</td>
                      <td className="py-2 text-right font-mono">{formatCurrency(item.rate)}</td>
                      <td className="py-2 text-center">{item.qty}</td>
                      <td className="py-2 text-right font-mono text-muted-foreground">{item.gstPct}%</td>
                      <td className="py-2 pr-1 text-right font-mono font-medium">{formatCurrency(lineTotal + itemGst)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="border-t border-border pt-4 grid grid-cols-2 gap-4 text-[11px]">
            <div className="space-y-1 text-muted-foreground">
              <p>Payment Mode: <strong>Cash / Card online settlement</strong></p>
              <p className="text-[9px] italic">Thank you for choosing HMS. For billing queries, reach the Outpatient Billing Desk.</p>
            </div>
            <div className="space-y-1.5 text-right font-medium">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax amount (GST):</span>
                <span className="font-mono">{formatCurrency(totalGst)}</span>
              </div>
              <div className="flex justify-between text-foreground font-bold border-t border-border/80 pt-1.5 text-xs">
                <span>Grand Total:</span>
                <span className="font-mono text-primary">{formatCurrency(invoice.total)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Total Paid:</span>
                <span className="font-mono">{formatCurrency(invoice.paid)}</span>
              </div>
              {invoice.refundAmount ? (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Refund Disbursed:</span>
                  <span className="font-mono">-{formatCurrency(invoice.refundAmount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-foreground font-bold border-t border-dashed border-border pt-1">
                <span>Balance Due:</span>
                <span className="font-mono">{formatCurrency(invoice.balance)}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 flex justify-between items-end text-[9px] text-muted-foreground">
            <div>
              <p>Generated by: System Billing Executive</p>
              <p className="font-mono">{new Date().toLocaleString()}</p>
            </div>
            <div className="text-right">
              <div className="w-32 border-b border-border/80 mb-1" />
              <p>Authorized Signature / Stamp</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
