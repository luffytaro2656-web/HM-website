import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INVENTORY, addPurchaseEntry } from "@/mocks/inventory";
import { HOSPITALS } from "@/mocks/hospitals";
import { toast } from "sonner";
import { ShoppingCart, Landmark, Truck, FileText, CalendarDays } from "lucide-react";
import type { InventoryItem } from "@/types/inventory";

interface ReorderTriggerProps {
  preselectedItem?: InventoryItem | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReorderTrigger({ preselectedItem, onSuccess, onCancel }: ReorderTriggerProps) {
  const [itemId, setItemId] = useState(preselectedItem?.id || "");
  const [hospitalId, setHospitalId] = useState(preselectedItem?.hospitalId || HOSPITALS[0].id);
  const [supplierName, setSupplierName] = useState(preselectedItem?.supplierName || "");
  const [qty, setQty] = useState<number>(100);
  const [invoiceRef, setInvoiceRef] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));

  // Sync state if preselectedItem changes
  useEffect(() => {
    if (preselectedItem) {
      setItemId(preselectedItem.id);
      setHospitalId(preselectedItem.hospitalId);
      setSupplierName(preselectedItem.supplierName || "");
      // Recommend ordering twice the reorder level to restock fully
      setQty(Math.max(50, preselectedItem.reorderLevel * 2));
      setInvoiceRef(`PO-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    } else {
      setInvoiceRef(`PO-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [preselectedItem]);

  const selectedItem = INVENTORY.find((i) => i.id === itemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemId || !invoiceRef || qty <= 0) {
      toast.error("Please fill in item details, invoice reference and valid quantity");
      return;
    }

    const res = addPurchaseEntry({
      itemId,
      hospitalId,
      invoiceRef,
      quantityReceived: qty,
      supplierName: supplierName || selectedItem?.supplierName || "Default Supplier",
      purchaseDate,
    });

    if (res) {
      toast.success("Purchase Logged!", {
        description: `Successfully added ${qty} units of ${res.itemName} and updated stock levels.`,
      });
      if (onSuccess) onSuccess();
    } else {
      toast.error("Error logging purchase entry");
    }
  };

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="p-5">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <ShoppingCart className="size-5 text-primary" />
          Log Incoming Restock Purchase
        </CardTitle>
        <CardDescription className="text-xs">
          Record deliveries of surgical supplies, linen, or general clinic consumables from suppliers.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select Supply Item</Label>
              <Select value={itemId} onValueChange={(v) => {
                setItemId(v);
                const matched = INVENTORY.find(i => i.id === v);
                if (matched) {
                  setSupplierName(matched.supplierName || "");
                  setHospitalId(matched.hospitalId);
                  setQty(Math.max(50, matched.reorderLevel * 2));
                }
              }}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Choose an item to restock..." />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {INVENTORY.filter(i => i.category !== "Medicine").map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name} ({i.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Receiving Hospital Branch</Label>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <FileText className="size-3 text-muted-foreground" />
                PO/Invoice Reference
              </Label>
              <Input
                placeholder="e.g. PO-2026-987"
                className="text-xs h-9 font-mono"
                value={invoiceRef}
                onChange={(e) => setInvoiceRef(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <Truck className="size-3 text-muted-foreground" />
                Supplier Company
              </Label>
              <Input
                placeholder="e.g. Apex Surgical Co."
                className="text-xs h-9"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <CalendarDays className="size-3 text-muted-foreground" />
                Received Date
              </Label>
              <Input
                type="date"
                className="text-xs h-9 font-mono"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Quantity Received</Label>
              <Input
                type="number"
                className="text-xs h-9"
                value={qty}
                onChange={(e) => setQty(parseInt(e.target.value) || 0)}
              />
              {selectedItem && (
                <p className="text-[10px] text-muted-foreground">
                  Supplied in units of <strong>{selectedItem.unit}</strong>. Currently in stock: {selectedItem.quantity}
                </p>
              )}
            </div>

            <div className="space-y-1.5 bg-accent/20 p-3 rounded-lg flex flex-col justify-center">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Financial Summary Estimate</span>
              <p className="text-sm font-bold mt-1 text-slate-800 dark:text-slate-200">
                Unit Cost: ₹{selectedItem?.costPerUnit || 0}
              </p>
              <p className="text-xs font-bold text-primary">
                Total Estimate: ₹{((selectedItem?.costPerUnit || 0) * qty).toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            {onCancel && (
              <Button variant="outline" size="sm" type="button" onClick={onCancel} className="h-8 text-xs">
                Cancel
              </Button>
            )}
            <Button size="sm" type="submit" className="h-8 text-xs gap-1">
              <Truck className="size-3.5" /> Log Delivery & Replenish Stock
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
