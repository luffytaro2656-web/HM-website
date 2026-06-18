import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { attachInsurance, updateClaimStatus } from "@/mocks/billing";
import { PATIENTS } from "@/mocks/patients";
import { toast } from "sonner";
import { ShieldCheck, ArrowRightCircle, Info, Landmark } from "lucide-react";
import type { Invoice } from "@/types/billing";

interface InsuranceFormProps {
  invoice: Invoice;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PROVIDERS = ["Apollo Municipal Insurance", "Star Health Allied", "ICICI Lombard", "HDFC ERGO"];

export function InsuranceForm({ invoice, onSuccess, onCancel }: InsuranceFormProps) {
  const [provider, setProvider] = useState(invoice.insuranceProvider || PROVIDERS[0]);
  const [policyNumber, setPolicyNumber] = useState(invoice.policyNumber || "");
  const [claimAmount, setClaimAmount] = useState<number>(invoice.claimAmount || Math.round(invoice.total * 0.8));
  const [claimStatus, setClaimStatus] = useState<"Pending" | "Approved" | "Rejected">(
    (invoice.claimStatus as any) || "Pending"
  );

  const patientName = PATIENTS.find((p) => p.id === invoice.patientId)?.name || "Patient";

  const handleAttachSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!policyNumber || claimAmount <= 0) {
      toast.error("Please enter a valid Policy ID and Claim Amount");
      return;
    }

    // Attach/update insurance coordinates first
    attachInsurance(invoice.id, provider, policyNumber, claimAmount);

    // If claimStatus changed, update it too
    if (claimStatus === "Approved" || claimStatus === "Rejected") {
      updateClaimStatus(invoice.id, claimStatus);
    }

    toast.success("Insurance Coordinates Saved", {
      description: `Successfully attached ${provider} policy to invoice ${invoice.id}.`,
    });

    if (onSuccess) onSuccess();
  };

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="p-5">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          Insurance Claims Panel
        </CardTitle>
        <CardDescription className="text-xs">
          Manage TPA insurance pre-auth coordinates and claim settlement status for this invoice.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <form onSubmit={handleAttachSubmit} className="space-y-4">
          <div className="bg-accent/20 p-3 rounded-xl border border-border text-xs text-muted-foreground space-y-1 mb-2">
            <p>Invoice Reference: <strong>{invoice.id}</strong></p>
            <p>Beneficiary Patient: <strong>{patientName} ({invoice.patientId})</strong></p>
            <p>Grand Invoice Total: <strong className="text-foreground">₹{invoice.total.toLocaleString("en-IN")}</strong></p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">TPA Insurance Company</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((prov) => (
                  <SelectItem key={prov} value={prov}>
                    {prov}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Policy / Pre-Auth ID</Label>
              <Input
                placeholder="e.g. POL-556-9"
                className="text-xs h-9 font-mono"
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Claim Amount Coverage (₹)</Label>
              <Input
                type="number"
                className="text-xs h-9"
                value={claimAmount}
                onChange={(e) => setClaimAmount(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Claim Settlement Status</Label>
            <Select value={claimStatus} onValueChange={(v: any) => setClaimStatus(v)}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending Audit (Awaiting TPA approval)</SelectItem>
                <SelectItem value="Approved">Approved (Settle balance via insurance payout)</SelectItem>
                <SelectItem value="Rejected">Rejected (Patient liable for full invoice balance)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {claimStatus === "Approved" && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 text-emerald-800 dark:text-emerald-400 p-3 rounded-lg text-[10px] flex items-start gap-1.5 mt-2">
              <Info className="size-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong>Auto-Settlement Action:</strong> Marking this claim as approved will automatically credit
                ₹{claimAmount.toLocaleString("en-IN")} as a TPA payout to this invoice.
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            {onCancel && (
              <Button variant="outline" size="sm" type="button" onClick={onCancel} className="h-8 text-xs">
                Cancel
              </Button>
            )}
            <Button size="sm" type="submit" className="h-8 text-xs gap-1.5">
              <ArrowRightCircle className="size-3.5" />
              Update Claim Status
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
