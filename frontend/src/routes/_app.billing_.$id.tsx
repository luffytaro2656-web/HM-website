import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, CreditCard, ShieldCheck, RefreshCcw, Landmark, Receipt, Info, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInvoice, recordPayment, processRefund, updateClaimStatus } from "@/mocks/billing";
import { formatCurrency } from "@/utils/formatters";
import { ReceiptTemplate } from "@/components/modules/billing/ReceiptTemplate";
import { InsuranceForm } from "@/components/modules/billing/InsuranceForm";
import { toast } from "sonner";
import type { PaymentStatus } from "@/types/billing";

export const Route = createFileRoute("/_app/billing_/$id")({
  loader: ({ params }) => {
    const invoice = getInvoice(params.id);
    if (!invoice) throw notFound();
    return { invoice };
  },
  head: ({ loaderData }) => ({ meta: [{ title: loaderData ? `${loaderData.invoice.id} — HMS` : "Invoice — HMS" }] }),
  component: InvoiceDetailsPage,
  notFoundComponent: () => <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">Invoice not found.</div>,
});

function InvoiceDetailsPage() {
  const { invoice } = Route.useLoaderData();
  const [refreshKey, setRefreshKey] = useState(0);

  // Active form drawers
  const [activeTab, setActiveTab] = useState<"Payment" | "Insurance" | "Refund">("Payment");

  // Payment Form States
  const [payAmount, setPayAmount] = useState<number>(invoice.balance);
  const [payMode, setPayMode] = useState<"Cash" | "Card" | "UPI" | "Insurance">("Cash");
  const [payRef, setPayRef] = useState(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);

  // Refund Form States
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState("");

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) {
      toast.error("Please specify a valid payment amount.");
      return;
    }
    if (payAmount > invoice.balance) {
      toast.error(`Payment exceeds balance remaining of ₹${invoice.balance}`);
      return;
    }

    const pr = recordPayment(invoice.id, payAmount, payMode, payRef);
    if (pr) {
      toast.success("Payment Logged!", {
        description: `Successfully credited ₹${payAmount.toLocaleString("en-IN")} via ${payMode}.`,
      });
      setPayAmount(invoice.balance - payAmount);
      setRefreshKey((k) => k + 1);
    }
  };

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (refundAmount <= 0 || !refundReason) {
      toast.error("Please provide both refund amount and reason.");
      return;
    }
    if (refundAmount > invoice.paid) {
      toast.error(`Refund exceeds amount already paid of ₹${invoice.paid}`);
      return;
    }

    const updated = processRefund(invoice.id, refundAmount, refundReason);
    if (updated) {
      toast.success("Refund Cleared!", {
        description: `Refunded ₹${refundAmount.toLocaleString("en-IN")} for ${refundReason}.`,
      });
      setRefundAmount(0);
      setRefundReason("");
      setRefreshKey((k) => k + 1);
    }
  };

  const handleApproveClaim = () => {
    updateClaimStatus(invoice.id, "Approved");
    toast.success("Insurance Claim Settled", {
      description: `Disbursed claim value of ₹${invoice.claimAmount} to invoice.`,
    });
    setRefreshKey((k) => k + 1);
  };

  const handleRejectClaim = () => {
    updateClaimStatus(invoice.id, "Rejected");
    toast.error("Insurance Claim Rejected", {
      description: "Claim flagged as rejected. Patient is liable for dues.",
    });
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto" key={refreshKey}>
      {/* Detail Page Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left column - Printable Receipt Panel */}
        <div className="lg:col-span-2 space-y-6">
          <ReceiptTemplate invoice={invoice} />
        </div>

        {/* Right column - Actions & Forms Panel */}
        <div className="space-y-6 no-print">
          <Card className="border border-border bg-card">
            <CardHeader className="p-4 pb-2 border-b border-border">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Sparkles className="size-4 text-primary" />
                Billing Operations Desk
              </CardTitle>
              <CardDescription className="text-xs">
                Process transactions, claims, and refunds.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-4 space-y-4">
              {/* Tab Selector buttons */}
              <div className="grid grid-cols-3 gap-1 bg-accent/20 p-1 rounded-lg">
                <Button
                  size="sm"
                  variant={activeTab === "Payment" ? "default" : "ghost"}
                  onClick={() => setActiveTab("Payment")}
                  disabled={invoice.balance === 0}
                  className="text-[10px] h-7 px-1.5"
                >
                  Pay Bill
                </Button>
                <Button
                  size="sm"
                  variant={activeTab === "Insurance" ? "default" : "ghost"}
                  onClick={() => setActiveTab("Insurance")}
                  className="text-[10px] h-7 px-1.5"
                >
                  Claims
                </Button>
                <Button
                  size="sm"
                  variant={activeTab === "Refund" ? "default" : "ghost"}
                  onClick={() => setActiveTab("Refund")}
                  disabled={invoice.paid === 0}
                  className="text-[10px] h-7 px-1.5"
                >
                  Refunds
                </Button>
              </div>

              {/* TAB 1: Pay Bill Form */}
              {activeTab === "Payment" && invoice.balance > 0 && (
                <form onSubmit={handlePaymentSubmit} className="space-y-3 animate-fadeIn">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-semibold">Collect Amount (₹)</Label>
                    <Input
                      type="number"
                      className="h-8 text-xs font-semibold"
                      value={payAmount}
                      onChange={(e) => setPayAmount(parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] font-semibold">Settlement Channel</Label>
                    <Select value={payMode} onValueChange={(v: any) => setPayMode(v)}>
                      <SelectTrigger className="h-8 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash Counter</SelectItem>
                        <SelectItem value="Card">Terminal POS Card</SelectItem>
                        <SelectItem value="UPI">UPI QR Mobile Scan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] font-semibold">Transaction Reference</Label>
                    <Input
                      className="h-8 text-xs font-mono"
                      value={payRef}
                      onChange={(e) => setPayRef(e.target.value)}
                    />
                  </div>

                  <Button type="submit" size="sm" className="w-full text-xs h-8 bg-emerald-600 hover:bg-emerald-700">
                    Record Receipt
                  </Button>
                </form>
              )}

              {activeTab === "Payment" && invoice.balance === 0 && (
                <div className="text-center py-6 text-muted-foreground text-xs italic">
                  Invoice fully settled. No dues remaining.
                </div>
              )}

              {/* TAB 2: Claims Management */}
              {activeTab === "Insurance" && (
                <div className="space-y-3 animate-fadeIn">
                  {invoice.insuranceProvider ? (
                    <div className="space-y-3">
                      <div className="bg-slate-50 dark:bg-slate-900 border border-border p-3 rounded-lg text-xs space-y-1">
                        <p>TPA Provider: <strong>{invoice.insuranceProvider}</strong></p>
                        <p>Policy Index: <strong className="font-mono">{invoice.policyNumber}</strong></p>
                        <p>Claim Cover Amount: <strong>₹{invoice.claimAmount?.toLocaleString("en-IN")}</strong></p>
                        <p>Current Claim Status: <strong className="text-primary">{invoice.claimStatus}</strong></p>
                      </div>

                      {invoice.claimStatus === "Pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleApproveClaim} className="flex-1 text-xs h-8 bg-emerald-600 hover:bg-emerald-700">
                            Approve & Settle
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleRejectClaim} className="flex-1 text-xs h-8 text-rose-600 hover:bg-rose-50 border-rose-200">
                            Reject
                          </Button>
                        </div>
                      )}

                      {invoice.claimStatus === "Approved" && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-400 p-2.5 rounded-lg text-[10px] flex items-center gap-1.5">
                          <Info className="size-3.5" /> Claim Approved and deducted from dues.
                        </div>
                      )}

                      {invoice.claimStatus === "Rejected" && (
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-400 p-2.5 rounded-lg text-[10px] flex items-center gap-1.5">
                          <Info className="size-3.5" /> Claim rejected by insurance. Patient is liable.
                        </div>
                      )}
                    </div>
                  ) : (
                    <InsuranceForm
                      invoice={invoice}
                      onSuccess={() => setRefreshKey((k) => k + 1)}
                    />
                  )}
                </div>
              )}

              {/* TAB 3: Refunds Drawer */}
              {activeTab === "Refund" && invoice.paid > 0 && (
                <form onSubmit={handleRefundSubmit} className="space-y-3 animate-fadeIn">
                  <div className="bg-rose-500/5 p-3 rounded-lg border border-rose-500/10 text-[10px] text-muted-foreground space-y-1">
                    <p>Total Paid till Date: <strong>₹{invoice.paid.toLocaleString("en-IN")}</strong></p>
                    <p>Maximum Refundable Amount: <strong className="text-foreground">₹{invoice.paid.toLocaleString("en-IN")}</strong></p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] font-semibold">Refund Amount (₹)</Label>
                    <Input
                      type="number"
                      className="h-8 text-xs font-semibold"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] font-semibold">Reason for Refund / Code</Label>
                    <Input
                      placeholder="e.g. Overcharged consultation, returned meds"
                      className="h-8 text-xs"
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                    />
                  </div>

                  <Button type="submit" size="sm" className="w-full text-xs h-8 bg-rose-600 hover:bg-rose-700">
                    Process Refund Log
                  </Button>
                </form>
              )}

              {activeTab === "Refund" && invoice.paid === 0 && (
                <div className="text-center py-6 text-muted-foreground text-xs italic">
                  Cannot process refunds. No payments received yet.
                </div>
              )}

            </CardContent>
          </Card>

          {/* Refund Log summary indicator */}
          {invoice.refundAmount && (
            <Card className="border border-rose-500/20 bg-rose-500/[0.02] p-4 text-xs text-rose-800 dark:text-rose-400 space-y-1.5">
              <span className="font-bold flex items-center gap-1.5">
                <RefreshCcw className="size-3.5 shrink-0" /> Refund Disbursed
              </span>
              <p>Refund Amount: <strong>₹{invoice.refundAmount.toLocaleString("en-IN")}</strong></p>
              <p>Reason: <em className="text-slate-600 dark:text-slate-400">"{invoice.refundReason}"</em></p>
              <p className="text-[10px] text-muted-foreground">Cleared Date: {invoice.refundDate}</p>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}
