import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CreditCard, Search, Banknote, Landmark, Smartphone, ShieldCheck, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PAYMENTS } from "@/mocks/billing";
import { formatCurrency } from "@/utils/formatters";

export const Route = createFileRoute("/_app/billing/payments")({
  head: () => ({ meta: [{ title: "Payments Registry — HMS" }] }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const [query, setQuery] = useState("");

  const filtered = PAYMENTS.filter((p) => {
    if (query && !p.patientName.toLowerCase().includes(query.toLowerCase()) && !p.invoiceId.toLowerCase().includes(query.toLowerCase()) && !p.transactionRef.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  // Calculate totals by modes
  const totalReceived = PAYMENTS.reduce((sum, p) => sum + p.amount, 0);
  const cashTotal = PAYMENTS.filter((p) => p.paymentMode === "Cash").reduce((sum, p) => sum + p.amount, 0);
  const cardTotal = PAYMENTS.filter((p) => p.paymentMode === "Card").reduce((sum, p) => sum + p.amount, 0);
  const upiTotal = PAYMENTS.filter((p) => p.paymentMode === "UPI").reduce((sum, p) => sum + p.amount, 0);
  const insTotal = PAYMENTS.filter((p) => p.paymentMode === "Insurance").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <Link to="/billing" className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-3" /> Back to Invoices
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="size-6 text-primary" />
            Payments Settlement Registry
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Audit payment receipts, track transaction reference IDs, and reconcile financial collections.
          </p>
        </div>
      </div>

      {/* Metrics breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border border-border bg-slate-500/5">
          <CardContent className="p-3">
            <span className="text-[9px] uppercase font-bold text-muted-foreground block">Net Collections</span>
            <p className="text-lg font-bold mt-1">{formatCurrency(totalReceived)}</p>
          </CardContent>
        </Card>
        <Card className="border border-border bg-emerald-500/5">
          <CardContent className="p-3">
            <span className="text-[9px] uppercase font-bold text-muted-foreground block flex items-center gap-1">
              <Banknote className="size-3 text-emerald-600" /> Cash Counter
            </span>
            <p className="text-lg font-bold mt-1 text-emerald-600">{formatCurrency(cashTotal)}</p>
          </CardContent>
        </Card>
        <Card className="border border-border bg-indigo-500/5">
          <CardContent className="p-3">
            <span className="text-[9px] uppercase font-bold text-muted-foreground block flex items-center gap-1">
              <CreditCard className="size-3 text-indigo-600" /> Card Terminals
            </span>
            <p className="text-lg font-bold mt-1 text-indigo-600">{formatCurrency(cardTotal)}</p>
          </CardContent>
        </Card>
        <Card className="border border-border bg-amber-500/5">
          <CardContent className="p-3">
            <span className="text-[9px] uppercase font-bold text-muted-foreground block flex items-center gap-1">
              <Smartphone className="size-3 text-amber-600" /> UPI QR Code
            </span>
            <p className="text-lg font-bold mt-1 text-amber-600">{formatCurrency(upiTotal)}</p>
          </CardContent>
        </Card>
        <Card className="border border-border bg-blue-500/5">
          <CardContent className="p-3">
            <span className="text-[9px] uppercase font-bold text-muted-foreground block flex items-center gap-1">
              <ShieldCheck className="size-3 text-blue-600" /> TPA Insurance
            </span>
            <p className="text-lg font-bold mt-1 text-blue-600">{formatCurrency(insTotal)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter bar */}
      <Card className="border border-border p-4 bg-card">
        <div className="space-y-1.5 max-w-sm">
          <Label className="text-xs font-semibold">Filter Payment Records</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by Patient, Invoice ID, or TXN Ref..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8 h-9 text-xs"
            />
          </div>
        </div>
      </Card>

      {/* Payments Ledger Table */}
      <Card className="border border-border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Payments Settlement Ledger</CardTitle>
          <CardDescription className="text-xs">
            A list of all incoming payments registered across clinic terminals.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/20 border-b border-border text-[10px] font-semibold text-muted-foreground uppercase">
                  <th className="p-3 pl-4">Receipt ID</th>
                  <th className="p-3">Linked Invoice</th>
                  <th className="p-3">Patient Beneficiary</th>
                  <th className="p-3">Payment Channel</th>
                  <th className="p-3 font-mono">Gateway Ref (TXN)</th>
                  <th className="p-3 text-right">Amount Credited</th>
                  <th className="p-3 pr-4 text-right">Settled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length > 0 ? (
                  filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-accent/5 align-middle">
                      <td className="p-3 pl-4 font-semibold text-foreground">{p.id}</td>
                      <td className="p-3 font-mono font-medium text-primary hover:underline">
                        <Link to="/billing/$id" params={{ id: p.invoiceId }}>{p.invoiceId}</Link>
                      </td>
                      <td className="p-3 font-medium text-slate-800 dark:text-slate-200">{p.patientName}</td>
                      <td className="p-3 text-muted-foreground">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                          p.paymentMode === "Cash" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          p.paymentMode === "Card" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                          p.paymentMode === "UPI" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                          {p.paymentMode}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-700 dark:text-slate-300">{p.transactionRef}</td>
                      <td className="p-3 text-right font-mono font-bold text-foreground">{formatCurrency(p.amount)}</td>
                      <td className="p-3 pr-4 text-right font-mono text-[10px] text-muted-foreground">{p.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-muted-foreground italic">
                      No payment settlements match the filter.
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
