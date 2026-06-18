import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { INVENTORY, inventoryStatus, logInventoryUsage, logStockAdjustment } from "@/mocks/inventory";
import { HOSPITALS } from "@/mocks/hospitals";
import { toast } from "sonner";
import { Search, Filter, Edit3, ArrowDownCircle, AlertTriangle, RefreshCw, X, ShoppingCart } from "lucide-react";
import type { InventoryItem } from "@/types/inventory";

interface SupplyStockTableProps {
  hospitalId?: string;
  onReorderClick?: (item: InventoryItem) => void;
}

export function SupplyStockTable({ hospitalId, onReorderClick }: SupplyStockTableProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedHospId, setSelectedHospId] = useState(hospitalId || HOSPITALS[0].id);

  // Adjustment Modal states
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<"Usage" | "Override">("Usage");
  const [adjustQty, setAdjustQty] = useState<number>(0);

  const activeHospId = hospitalId || selectedHospId;

  // Filtered items
  const filtered = INVENTORY.filter((item) => {
    if (item.hospitalId !== activeHospId) return false;
    // Exclude Medicine from supplies directory (since pharmacy handles it)
    if (item.category === "Medicine") return false;
    
    if (query && !item.name.toLowerCase().includes(query.toLowerCase()) && !item.id.toLowerCase().includes(query.toLowerCase())) return false;
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    
    const status = inventoryStatus(item);
    if (statusFilter !== "all" && status !== statusFilter) return false;
    
    return true;
  });

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    if (adjustQty <= 0) {
      toast.error("Please enter a valid quantity value");
      return;
    }

    if (adjustType === "Usage") {
      logInventoryUsage(editingItem.id, adjustQty);
      toast.success("Usage Logged!", {
        description: `Deducted ${adjustQty} ${editingItem.unit} from ${editingItem.name}.`,
      });
    } else {
      logStockAdjustment(editingItem.id, adjustQty);
      toast.success("Stock Level Adjusted", {
        description: `Set quantity for ${editingItem.name} to ${adjustQty} ${editingItem.unit}.`,
      });
    }

    setEditingItem(null);
    setAdjustQty(0);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6" key={refreshKey}>
      {/* Filters Card */}
      <Card className="border border-border p-4 bg-card">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Search Supplies</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID or name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>
          </div>

          {!hospitalId && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Hospital Branch</Label>
              <Select value={selectedHospId} onValueChange={setSelectedHospId}>
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
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Supplies Category</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Surgical">Surgical Supplies</SelectItem>
                <SelectItem value="Consumable">Consumable items</SelectItem>
                <SelectItem value="Equipment">Linen & Equipment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Alert Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Low Stock">Low Stock</SelectItem>
                <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Directory Table */}
      <Card className="border border-border bg-card">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Supplies Ledger ({filtered.length} Items)</CardTitle>
          <CardDescription className="text-xs">
            Review stock levels, units, and supplier coordinates for general clinical items.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/20 border-b border-border text-[10px] font-semibold text-muted-foreground uppercase">
                  <th className="p-3 pl-4">Supply Item</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Supplier Details</th>
                  <th className="p-3 text-right">Available Qty</th>
                  <th className="p-3 text-right">Reorder Threshold</th>
                  <th className="p-3 text-center">Expiry Date</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length > 0 ? (
                  filtered.map((item) => {
                    const status = inventoryStatus(item);
                    
                    let badgeClass = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
                    if (status === "Expired") badgeClass = "bg-rose-500/10 text-rose-600 border-rose-500/20";
                    else if (status === "Expiring Soon") badgeClass = "bg-amber-500/10 text-amber-600 border-amber-500/20";
                    else if (status === "Low Stock") badgeClass = "bg-red-500/10 text-red-600 border-red-500/20 animate-pulse";

                    return (
                      <tr key={item.id} className="hover:bg-accent/5 align-middle">
                        <td className="p-3 pl-4">
                          <span className="font-semibold text-foreground block">{item.name}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">{item.id}</span>
                        </td>
                        <td className="p-3 text-muted-foreground">{item.category}</td>
                        <td className="p-3">
                          <span className="font-medium text-slate-700 dark:text-slate-300 block">{item.supplierName}</span>
                          <span className="text-[9px] text-muted-foreground">{item.supplierContact}</span>
                        </td>
                        <td className="p-3 text-right font-semibold">
                          {item.quantity} <span className="text-[10px] text-muted-foreground font-normal">{item.unit}</span>
                        </td>
                        <td className="p-3 text-right font-medium text-muted-foreground">
                          {item.reorderLevel} {item.unit}
                        </td>
                        <td className="p-3 text-center font-mono text-[10px] text-muted-foreground">
                          {item.expiryDate}
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="outline" className={`text-[9px] h-5 ${badgeClass}`}>
                            {status}
                          </Badge>
                        </td>
                        <td className="p-3 pr-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingItem(item);
                                setAdjustType("Usage");
                              }}
                              className="h-7 text-[10px] px-2 gap-1"
                            >
                              <ArrowDownCircle className="size-3" /> Log Usage
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingItem(item);
                                setAdjustType("Override");
                                setAdjustQty(item.quantity);
                              }}
                              className="h-7 text-[10px] px-2"
                            >
                              Adjust
                            </Button>

                            {status === "Low Stock" && onReorderClick && (
                              <Button
                                size="sm"
                                onClick={() => onReorderClick(item)}
                                className="h-7 text-[10px] bg-amber-600 hover:bg-amber-700 gap-1 px-2"
                              >
                                <ShoppingCart className="size-3" /> Reorder
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-muted-foreground italic">
                      No supplies matches the filter configurations.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Adjust Inventory Stock Dialog Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <Card className="max-w-sm w-full bg-card border border-border">
            <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">
                  {adjustType === "Usage" ? "Log Material Consumption" : "Override Stock Level"}
                </CardTitle>
                <CardDescription className="text-[10px] truncate max-w-[250px]">
                  {editingItem.name} ({editingItem.id})
                </CardDescription>
              </div>
              <button onClick={() => setEditingItem(null)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleAdjustSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Adjustment Action</Label>
                  <Select value={adjustType} onValueChange={(v: any) => setAdjustType(v)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Usage">Deduct Materials Consumption (Usage)</SelectItem>
                      <SelectItem value="Override">Override Level (Manual Count Auditing)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {adjustType === "Usage" ? "Quantity Consumed" : "Exact Count Level"} ({editingItem.unit})
                  </Label>
                  <Input
                    type="number"
                    className="text-xs h-9"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Current shelf level: {editingItem.quantity} {editingItem.unit}
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" type="button" onClick={() => setEditingItem(null)} className="h-8 text-xs">
                    Cancel
                  </Button>
                  <Button size="sm" type="submit" className="h-8 text-xs">
                    Apply Adjustment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
