import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Receipt, Plus, Search, Filter, ShieldCheck, CreditCard, Banknote, HelpCircle, Eye, ArrowRight, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INVOICES, recordPayment } from "@/mocks/billing";
import { PATIENTS } from "@/mocks/patients";
import { HOSPITALS } from "@/mocks/hospitals";
import { formatCurrency } from "@/utils/formatters";
import { StatusBadge } from "@/components/common/StatusBadge";
import { InvoiceCreator } from "@/components/modules/billing/InvoiceCreator";
import { InsuranceForm } from "@/components/modules/billing/InsuranceForm";
import { toast } from "sonner";
import type { Invoice } from "@/types/billing";

export const Route = createFileRoute("/_app/billing/")({
  head: () => ({ meta: [{ title: "Billing Desk — HMS" }] }),
  component: BillingIndexPage,
});

function BillingIndexPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedHospId, setSelectedHospId] = useState("all");

  // Modals / Triggers
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [insuranceTarget, setInsuranceTarget] = useState<Invoice | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<Invoice | null>(null);

  // Quick Payment form states
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMode, setPayMode] = useState<"Cash" | "Card" | "UPI" | "Insurance">("Cash");
  const [payRef, setPayRef] = useState("");

  const filtered = INVOICES.filter((inv) => {
    const patientName = PATIENTS.find((p) => p.id === inv.patientId)?.name || "";
    if (query && !inv.id.toLowerCase().includes(query.toLowerCase()) && !patientName.toLowerCase().includes(query.toLowerCase())) return false;
    if (statusFilter !== "all" && inv.status !== statusFilter) return false;
    if (selectedHospId !== "all" && inv.hospitalId !== selectedHospId) return false;
    return true;
  });

  // Aggregated figures
  const totalCollections = INVOICES.reduce((sum, i) => sum + i.paid, 0);
  const totalOutstanding = INVOICES.reduce((sum, i) => sum + i.balance, 0);
  const activeClaims = INVOICES.filter((i) => i.claimStatus === "Pending").length;
  const overdueCount = INVOICES.filter((i) => i.status === "Overdue").length;

  const handleCollectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentTarget) return;

    if (payAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    if (payAmount > paymentTarget.balance) {
      toast.error(`Payment amount exceeds outstanding balance of ₹${paymentTarget.balance}`);
      return;
    }

    const pr = recordPayment(paymentTarget.id, payAmount, payMode, payRef || `TXN-${Date.now().toString().slice(-6)}`);
    if (pr) {
      toast.success("Payment Received!", {
        description: `Successfully credited ₹${payAmount.toLocaleString("en-IN")} to ${paymentTarget.id}.`,
      });
      setPaymentTarget(null);
      setPayAmount(0);
      setPayRef("");
      setRefreshKey((k) => k + 1);
    }
  };

  const handleStartPayment = (inv: Invoice) => {
    setPaymentTarget(inv);
    setPayAmount(inv.balance);
    setPayRef(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto" key={refreshKey}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Receipt className="size-6 text-primary" />
            Billing & Invoices Ledger
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Oversee patient billing records, record payment entries, and track insurance claims pre-auth.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/billing/payments">
            <Button size="sm" variant="outline" className="text-xs h-9 gap-1.5">
              <CreditCard className="size-4" />
              Payments History
            </Button>
          </Link>
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="text-xs h-9 gap-1.5">
            <Plus className="size-4" />
            Generate Invoice
          </Button>
        </div>
      </div>

      {/* Aggregate metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-border bg-emerald-500/5">
          <CardContent className="p-4">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">Total Collections</span>
            <p className="text-xl font-bold mt-1 text-emerald-600">{formatCurrency(totalCollections)}</p>
            <span className="text-[9px] text-muted-foreground mt-0.5 block">Cash/UPI/Cards settled</span>
          </CardContent>
        </Card>
        <Card className="border border-border bg-rose-500/5">
          <CardContent className="p-4">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">Outstanding Dues</span>
            <p className="text-xl font-bold mt-1 text-rose-600">{formatCurrency(totalOutstanding)}</p>
            <span className="text-[9px] text-muted-foreground mt-0.5 block">Awaiting payment clearing</span>
          </CardContent>
        </Card>
        <Card className="border border-border bg-amber-500/5">
          <CardContent className="p-4">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">Pending Claims</span>
            <p className="text-xl font-bold mt-1 text-amber-600">{activeClaims} Claims</p>
            <span className="text-[9px] text-muted-foreground mt-0.5 block">Pre-auth audits in review</span>
          </CardContent>
        </Card>
        <Card className="border border-border bg-red-500/5">
          <CardContent className="p-4">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">Overdue Accounts</span>
            <p className="text-xl font-bold mt-1 text-red-600">{overdueCount} bills</p>
            <span className="text-[9px] text-muted-foreground mt-0.5 block">Exceeds billing thresholds</span>
          </CardContent>
        </Card>
      </div>

      {/* Search Toolbar */}
      <Card className="border border-border p-4 bg-card">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Search Invoices</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID or Patient Name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Hospital Branch</Label>
            <Select value={selectedHospId} onValueChange={setSelectedHospId}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                <SelectItem value="all">All Branches</SelectItem>
                {HOSPITALS.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Payment Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Invoices</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Main Ledger Table */}
      <Card className="border border-border bg-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Patient Invoices Ledger</CardTitle>
          <CardDescription className="text-xs">
            Review ledger items, tax amounts, remaining balances, and claim status.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/20 border-b border-border text-[10px] font-semibold text-muted-foreground uppercase">
                  <th className="p-3 pl-4">Invoice ID</th>
                  <th className="p-3">Patient Beneficiary</th>
                  <th className="p-3">Hospital Branch</th>
                  <th className="p-3 text-right">Total Net</th>
                  <th className="p-3 text-right">Paid (₹)</th>
                  <th className="p-3 text-right">Balance Due</th>
                  <th className="p-3 text-center">Insurance Claims</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length > 0 ? (
                  filtered.map((inv) => {
                    const pName = PATIENTS.find((p) => p.id === inv.patientId)?.name || inv.patientId;
                    const hName = HOSPITALS.find((h) => h.id === inv.hospitalId)?.name || inv.hospitalId;

                    return (
                      <tr key={inv.id} className="hover:bg-accent/5 align-middle">
                        <td className="p-3 pl-4">
                          <span className="font-mono font-bold text-foreground block">{inv.id}</span>
                          <span className="text-[9px] text-muted-foreground">{inv.date}</span>
                        </td>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{pName}</td>
                        <td className="p-3 text-muted-foreground max-w-[150px] truncate" title={hName}>
                          {hName}
                        </td>
                        <td className="p-3 text-right font-mono font-semibold">{formatCurrency(inv.total)}</td>
                        <td className="p-3 text-right font-mono text-emerald-600">{formatCurrency(inv.paid)}</td>
                        <td className="p-3 text-right font-mono text-rose-500 font-bold">{formatCurrency(inv.balance)}</td>
                        <td className="p-3 text-center">
                          {inv.insuranceProvider ? (
                            <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 block">
                              {inv.insuranceProvider}
                              <span className="text-[9px] text-muted-foreground block">({inv.claimStatus})</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <StatusBadge status={inv.status} />
                        </td>
                        <td className="p-3 pr-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <Link to="/billing/$id" params={{ id: inv.id }}>
                              <Button size="sm" variant="outline" className="h-7 text-[10px] px-2.5 gap-1">
                                <Eye className="size-3" /> View & Print
                              </Button>
                            </Link>
                            {inv.balance > 0 && (
                              <Button
                                size="sm"
                                onClick={() => handleStartPayment(inv)}
                                className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white gap-1 px-2.5"
                              >
                                <Banknote className="size-3" /> Collect
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setInsuranceTarget(inv)}
                              className="h-7 text-[10px] px-2.5 gap-1"
                            >
                              <ShieldCheck className="size-3" /> Insurance
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-muted-foreground italic">
                      No invoices match the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Collect Payment Modal Dialog */}
      {paymentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <Card className="max-w-sm w-full bg-card border border-border">
            <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Collect Invoice Payment</CardTitle>
                <CardDescription className="text-[10px]">Reference: {paymentTarget.id}</CardDescription>
              </div>
              <button onClick={() => setPaymentTarget(null)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleCollectPayment} className="space-y-4">
                <div className="bg-accent/25 p-3 rounded-lg text-xs space-y-1 text-muted-foreground">
                  <p>Invoice Total: <strong>₹{paymentTarget.total.toLocaleString("en-IN")}</strong></p>
                  <p>Balance Remaining: <strong className="text-rose-500 font-bold">₹{paymentTarget.balance.toLocaleString("en-IN")}</strong></p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Amount to Pay (₹)</Label>
                  <Input
                    type="number"
                    className="text-xs h-9 font-semibold"
                    value={payAmount}
                    onChange={(e) => setPayAmount(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Payment Gateway Mode</Label>
                  <Select value={payMode} onValueChange={(v: any) => setPayMode(v)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash Payout</SelectItem>
                      <SelectItem value="Card">Visa/Mastercard Terminal</SelectItem>
                      <SelectItem value="UPI">UPI QR Scan (GooglePay/PhonePe)</SelectItem>
                      <SelectItem value="Insurance">TPA Insurance Direct Payout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Transaction Reference / Receipt ID</Label>
                  <Input
                    placeholder="e.g. TXN-12345"
                    className="text-xs h-9 font-mono"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" type="button" onClick={() => setPaymentTarget(null)} className="h-8 text-xs">
                    Cancel
                  </Button>
                  <Button size="sm" type="submit" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700">
                    Record Receipt
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insurance Dialog Modal */}
      {insuranceTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="max-w-xl w-full relative bg-card border border-border rounded-xl">
            <button
              onClick={() => setInsuranceTarget(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground z-10"
            >
              <X className="size-4" />
            </button>
            <div className="p-1">
              <InsuranceForm
                invoice={insuranceTarget}
                onSuccess={() => {
                  setInsuranceTarget(null);
                  setRefreshKey((k) => k + 1);
                }}
                onCancel={() => setInsuranceTarget(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Custom Invoice Creator Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="max-w-3xl w-full relative bg-card border border-border rounded-xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground z-10"
            >
              <X className="size-4" />
            </button>
            <div className="p-1">
              <InvoiceCreator
                onSuccess={() => {
                  setShowCreateModal(false);
                  setRefreshKey((k) => k + 1);
                }}
                onCancel={() => setShowCreateModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
