import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PATIENTS } from "@/mocks/patients";
import { HOSPITALS } from "@/mocks/hospitals";
import { addInvoice } from "@/mocks/billing";
import { toast } from "sonner";
import { Plus, Trash2, ShieldCheck, DollarSign, Calculator, Receipt } from "lucide-react";
import type { InvoiceLineItem } from "@/types/billing";

interface InvoiceCreatorProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PRESET_SERVICES = [
  { description: "Consultation Fee", rate: 800, gstPct: 18 },
  { description: "Blood Test (CBC)", rate: 450, gstPct: 12 },
  { description: "X-Ray Chest", rate: 1200, gstPct: 18 },
  { description: "ECG", rate: 600, gstPct: 12 },
  { description: "Ultrasound Abdomen", rate: 2500, gstPct: 18 },
  { description: "Room Charges (per day)", rate: 3500, gstPct: 12 },
  { description: "Dispensed Medication", rate: 1800, gstPct: 12 },
  { description: "Surgical Procedure", rate: 25000, gstPct: 18 },
  { description: "Special Procedure (Ad-hoc)", rate: 5000, gstPct: 18 },
  { description: "Equipment Use Charge", rate: 1500, gstPct: 12 },
];

export function InvoiceCreator({ onSuccess, onCancel }: InvoiceCreatorProps) {
  const [patientId, setPatientId] = useState("");
  const [hospitalId, setHospitalId] = useState(HOSPITALS[0].id);

  // Dynamic Line Items
  const [items, setItems] = useState<InvoiceLineItem[]>([
    { description: "Consultation Fee", qty: 1, rate: 800, gstPct: 18 },
  ]);

  // Insurance attachments
  const [hasInsurance, setHasInsurance] = useState(false);
  const [provider, setProvider] = useState("");
  const [policy, setPolicy] = useState("");
  const [claimAmount, setClaimAmount] = useState<number>(0);

  const addLineItem = () => {
    setItems([...items, { description: "New Charge", qty: 1, rate: 500, gstPct: 12 }]);
  };

  const removeLineItem = (index: number) => {
    if (items.length === 1) {
      toast.warning("Invoices require a minimum of 1 charge item.");
      return;
    }
    setItems(items.filter((_, idx) => idx !== index));
  };

  const updateLineItem = (index: number, fields: Partial<InvoiceLineItem>) => {
    const next = [...items];
    next[index] = { ...next[index], ...fields };
    setItems(next);
  };

  const applyPresetService = (index: number, serviceName: string) => {
    const s = PRESET_SERVICES.find((p) => p.description === serviceName);
    if (!s) return;
    updateLineItem(index, {
      description: s.description,
      rate: s.rate,
      gstPct: s.gstPct,
    });
  };

  // Math totals
  const subtotal = items.reduce((sum, item) => sum + item.rate * item.qty, 0);
  const totalGst = items.reduce((sum, item) => sum + item.rate * item.qty * (item.gstPct / 100), 0);
  const grandTotal = Math.round(subtotal + totalGst);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientId || !hospitalId) {
      toast.error("Please select a Patient and target Hospital branch.");
      return;
    }

    const invalid = items.some((i) => !i.description || i.qty <= 0 || i.rate < 0);
    if (invalid) {
      toast.error("Please enter valid descriptions, quantities, and rates for all items.");
      return;
    }

    const claimAmt = hasInsurance ? claimAmount || Math.round(grandTotal * 0.8) : 0;

    const res = addInvoice(
      patientId,
      hospitalId,
      items,
      hasInsurance ? { provider, policy, claimAmount: claimAmt } : undefined
    );

    if (res) {
      toast.success("Invoice Generated!", {
        description: `Reference: ${res.id} • Net: ₹${res.total.toLocaleString("en-IN")}`,
      });
      if (onSuccess) onSuccess();
    }
  };

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="p-5">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Receipt className="size-5 text-primary" />
          Create Patient Invoice
        </CardTitle>
        <CardDescription className="text-xs">
          Generate professional invoices. Choose standard presets or add manual ad-hoc clinical charges.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select Patient Profile</Label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select patient..." />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {PATIENTS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Hospital Branch</Label>
              <Select value={hospitalId} onValueChange={setHospitalId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {HOSPITALS.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Line Items Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Invoice line items</Label>
              <Button type="button" size="sm" variant="outline" onClick={addLineItem} className="h-7 text-[10px] gap-1">
                <Plus className="size-3" /> Add Charge Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-accent/10 p-3 rounded-xl border border-border">
                  {/* Preset picker */}
                  <div className="col-span-3 space-y-1">
                    <Label className="text-[9px] font-semibold text-muted-foreground">Library Preset</Label>
                    <Select onValueChange={(v) => applyPresetService(idx, v)}>
                      <SelectTrigger className="h-8 text-[10px] bg-background">
                        <SelectValue placeholder="Preset routines..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-[150px]">
                        {PRESET_SERVICES.map((ps) => (
                          <SelectItem key={ps.description} value={ps.description}>
                            {ps.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Manual description */}
                  <div className="col-span-3 space-y-1">
                    <Label className="text-[9px] font-semibold text-muted-foreground">Description</Label>
                    <Input
                      type="text"
                      className="h-8 text-[10px] bg-background"
                      value={item.description}
                      onChange={(e) => updateLineItem(idx, { description: e.target.value })}
                    />
                  </div>

                  {/* Rate */}
                  <div className="col-span-2 space-y-1">
                    <Label className="text-[9px] font-semibold text-muted-foreground">Rate (₹)</Label>
                    <Input
                      type="number"
                      className="h-8 text-[10px] bg-background text-right"
                      value={item.rate}
                      onChange={(e) => updateLineItem(idx, { rate: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  {/* Qty */}
                  <div className="col-span-1.5 space-y-1">
                    <Label className="text-[9px] font-semibold text-muted-foreground">Qty</Label>
                    <Input
                      type="number"
                      className="h-8 text-[10px] bg-background text-center"
                      value={item.qty}
                      onChange={(e) => updateLineItem(idx, { qty: parseInt(e.target.value) || 1 })}
                    />
                  </div>

                  {/* GST */}
                  <div className="col-span-1.5 space-y-1">
                    <Label className="text-[9px] font-semibold text-muted-foreground">GST %</Label>
                    <Select
                      value={String(item.gstPct)}
                      onValueChange={(v) => updateLineItem(idx, { gstPct: parseInt(v) })}
                    >
                      <SelectTrigger className="h-8 text-[10px] bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0%</SelectItem>
                        <SelectItem value="5">5%</SelectItem>
                        <SelectItem value="12">12%</SelectItem>
                        <SelectItem value="18">18%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Remove */}
                  <div className="col-span-1 text-center pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeLineItem(idx)}
                      className="h-7 w-7 p-0 text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insurance Claims Options */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="billingInsurance"
                checked={hasInsurance}
                onChange={(e) => setHasInsurance(e.target.checked)}
                className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="billingInsurance" className="text-xs font-bold flex items-center gap-1 cursor-pointer">
                <ShieldCheck className="size-3.5 text-primary" />
                Attach TPA Insurance Claim Details
              </Label>
            </div>

            {hasInsurance && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border border-dashed border-primary/20 bg-primary/5 animate-fadeIn">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">TPA Provider</Label>
                  <Select value={provider} onValueChange={setProvider}>
                    <SelectTrigger className="h-9 text-xs bg-background">
                      <SelectValue placeholder="Select TPA..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Star Health Allied">Star Health Allied</SelectItem>
                      <SelectItem value="Apollo Municipal Insurance">Apollo Municipal Insurance</SelectItem>
                      <SelectItem value="ICICI Lombard">ICICI Lombard</SelectItem>
                      <SelectItem value="HDFC ERGO">HDFC ERGO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Policy / Claim ID</Label>
                  <Input
                    placeholder="e.g. STAR-9876-12"
                    className="text-xs h-9 bg-background font-mono"
                    value={policy}
                    onChange={(e) => setPolicy(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Covered Amount Estimate (₹)</Label>
                  <Input
                    type="number"
                    className="text-xs h-9 bg-background"
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Pricing calculations */}
          <div className="border-t border-border pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Subtotal: <strong>₹{subtotal.toLocaleString("en-IN")}</strong></p>
              <p>Total GST Tax amount: <strong>₹{totalGst.toLocaleString("en-IN")}</strong></p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                <Calculator className="size-4" /> Grand Total:
              </span>
              <span className="text-xl font-bold text-primary">
                ₹{grandTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            {onCancel && (
              <Button variant="outline" size="sm" type="button" onClick={onCancel} className="h-8 text-xs">
                Cancel
              </Button>
            )}
            <Button size="sm" type="submit" className="h-8 text-xs gap-1.5">
              <DollarSign className="size-3.5" />
              Generate Invoice
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
