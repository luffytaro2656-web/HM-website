import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PURCHASES, addPurchaseRecord } from "@/mocks/pharmacy";
import { INVENTORY } from "@/mocks/inventory";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Landmark, FileSpreadsheet, PlusCircle, RefreshCw, ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/_app/pharmacy/purchases")({
  head: () => ({ meta: [{ title: "Restock & Supplier Invoice Desk — HMS" }] }),
  component: PharmacyPurchasesPage,
});

const PRESET_SUPPLIERS = [
  "AstraZeneca Pharma",
  "Pfizer Ltd",
  "Sun Pharmaceuticals",
  "Cipla Ltd",
  "Reddy's Laboratories",
  "Merck & Co.",
  "GlaxoSmithKline (GSK)"
];

function PharmacyPurchasesPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Form states
  const [medName, setMedName] = useState("");
  const [isNewMed, setIsNewMed] = useState(false);
  const [customMedName, setCustomMedName] = useState("");
  const [qty, setQty] = useState<number>(100);
  const [batchNumber, setBatchNumber] = useState("BAT-PUR-1090");
  const [expiryDate, setExpiryDate] = useState("2028-06-30");
  const [supplierName, setSupplierName] = useState(PRESET_SUPPLIERS[0]);
  const [cost, setCost] = useState<number>(450);

  const existingMeds = INVENTORY.filter(item => item.category === "Medicine");

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedMedName = isNewMed ? customMedName : medName;
    if (!selectedMedName) {
      toast.error("Please enter or select a medicine name");
      return;
    }

    if (qty <= 0) {
      toast.error("Quantity must be greater than zero");
      return;
    }

    const record = addPurchaseRecord(selectedMedName, qty, batchNumber, expiryDate, supplierName, cost);

    if (record) {
      toast.success("Restock Record Added!", {
        description: `Successfully added ${qty} units of ${selectedMedName} under Batch ${batchNumber} from ${supplierName}.`,
      });

      // Clear states
      setCustomMedName("");
      setMedName("");
      setQty(100);
      setCost(450);
      setBatchNumber(`BAT-PUR-${Math.floor(1000 + Math.random() * 9000)}`);
      
      setRefreshKey(k => k + 1);
    } else {
      toast.error("Failed to register purchase record.");
    }
  };

  const handleSelectMedChange = (value: string) => {
    if (value === "new") {
      setIsNewMed(true);
    } else {
      setIsNewMed(false);
      setMedName(value);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto" key={refreshKey}>
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
            <ShoppingCart className="size-6 text-primary" />
            Pharmacy Purchase & Restock
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            File supplier procurement invoices, register new batches, and update inventory counts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Purchase intake Form */}
        <div className="lg:col-span-5">
          <Card className="border border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <PlusCircle className="size-4 text-primary" />
                Procurement Invoice
              </CardTitle>
              <CardDescription className="text-xs">
                Log procurement shipments to increment warehouse counts.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleRestockSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Select Medication</Label>
                  <Select value={isNewMed ? "new" : medName} onValueChange={handleSelectMedChange}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Choose medicine..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {existingMeds.map((med) => (
                        <SelectItem key={med.id} value={med.name}>
                          {med.name} ({med.quantity} {med.unit} left)
                        </SelectItem>
                      ))}
                      <SelectItem value="new" className="font-bold text-primary">
                        + Register New Medicine Brand
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isNewMed && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <Label className="text-xs font-semibold">New Medicine Brand Name</Label>
                    <Input
                      placeholder="e.g. Lipitor 10mg"
                      className="text-xs h-9"
                      value={customMedName}
                      onChange={(e) => setCustomMedName(e.target.value)}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Quantity Restocked</Label>
                    <Input
                      type="number"
                      min={1}
                      className="text-xs h-9"
                      value={qty}
                      onChange={(e) => setQty(parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Total Cost (₹)</Label>
                    <Input
                      type="number"
                      min={1}
                      className="text-xs h-9"
                      value={cost}
                      onChange={(e) => setCost(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Batch Number</Label>
                    <Input
                      className="text-xs h-9"
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Expiry Date</Label>
                    <Input
                      type="date"
                      className="text-xs h-9"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Supplier Manufacturer</Label>
                  <Select value={supplierName} onValueChange={setSupplierName}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Choose supplier..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PRESET_SUPPLIERS.map((sup) => (
                        <SelectItem key={sup} value={sup}>
                          {sup}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2">
                  <Button type="submit" className="w-full text-xs">
                    File Invoice & Increment Stock
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Procurement Registry Table */}
        <div className="lg:col-span-7">
          <Card className="border border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <FileSpreadsheet className="size-4 text-primary" />
                Procurement & Invoice Logs
              </CardTitle>
              <CardDescription className="text-xs">
                History of recently recorded restock transactions.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="overflow-x-auto border border-border rounded-xl bg-card">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-accent/20 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="p-3 pl-4">Order ID</th>
                      <th className="p-3">Medicine Info</th>
                      <th className="p-3">Batch & Expiry</th>
                      <th className="p-3">Supplier</th>
                      <th className="p-3 text-right">Qty Received</th>
                      <th className="p-3 text-right pr-4">Cost (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {PURCHASES.length > 0 ? (
                      PURCHASES.map((pur) => (
                        <tr key={pur.id} className="hover:bg-accent/5 transition-colors">
                          <td className="p-3 pl-4 font-mono text-muted-foreground font-bold">
                            {pur.id.slice(0, 10)}
                          </td>
                          <td className="p-3">
                            <span className="font-semibold block text-foreground">{pur.medicineName}</span>
                            <span className="text-[10px] text-muted-foreground">{pur.category}</span>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            <div>Batch: {pur.batchNumber}</div>
                            <div className="text-[9px]">Exp: {pur.expiryDate}</div>
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">
                            {pur.supplierName}
                          </td>
                          <td className="p-3 text-right font-semibold">
                            {pur.qty} units
                          </td>
                          <td className="p-3 text-right font-bold text-foreground pr-4">
                            ₹{pur.cost.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground text-xs italic">
                          No recent purchases filed.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
