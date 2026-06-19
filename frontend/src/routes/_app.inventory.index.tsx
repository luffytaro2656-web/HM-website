import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Package, Plus, ClipboardList, AlertTriangle, HelpCircle, CheckCircle2, ShoppingCart, Truck, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SupplyStockTable } from "@/components/modules/inventory/SupplyStockTable";
import { ReorderTrigger } from "@/components/modules/inventory/ReorderTrigger";
import { INVENTORY, inventoryStatus } from "@/mocks/inventory";
import type { InventoryItem } from "@/types/inventory";

export const Route = createFileRoute("/_app/inventory/")({
  head: () => ({ meta: [{ title: "Inventory Directory — HMS" }] }),
  component: InventoryIndexPage,
});

function InventoryIndexPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [reorderItem, setReorderItem] = useState<InventoryItem | null>(null);
  const [showRestockModal, setShowRestockModal] = useState(false);

  // Stats calculation (supplies only, excluding Medicine)
  const supplies = INVENTORY.filter(i => i.category !== "Medicine");
  const totalSupplies = supplies.length;
  
  const lowStock = supplies.filter(i => inventoryStatus(i) === "Low Stock").length;
  const expired = supplies.filter(i => inventoryStatus(i) === "Expired").length;
  const expiringSoon = supplies.filter(i => inventoryStatus(i) === "Expiring Soon").length;

  const handleRestockSuccess = () => {
    setReorderItem(null);
    setShowRestockModal(false);
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto" key={refreshKey}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Package className="size-6 text-primary" />
            General Supplies Inventory
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track clinical consumables, surgical gear, syringes, PPE masks, and linen across branches.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/inventory/purchases">
            <Button size="sm" variant="outline" className="text-xs h-9 gap-1.5">
              <ClipboardList className="size-4" />
              Purchase Registry
            </Button>
          </Link>
          <Button size="sm" onClick={() => setShowRestockModal(true)} className="text-xs h-9 gap-1.5">
            <Truck className="size-4" />
            Log Stock Delivery
          </Button>
        </div>
      </div>

      {/* Roster Alerts Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-border">
          <CardContent className="p-4">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">General Supply Items</span>
            <p className="text-2xl font-bold mt-1">{totalSupplies}</p>
            <span className="text-[9px] text-muted-foreground mt-0.5 block">Excluding Pharmacy Medicines</span>
          </CardContent>
        </Card>
        <Card className={`border ${lowStock > 0 ? "border-red-500/20 bg-red-500/[0.02]" : "border-border"}`}>
          <CardContent className="p-4">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">Low Stock Warnings</span>
            <p className="text-2xl font-bold mt-1 text-rose-600">{lowStock}</p>
            <span className="text-[9px] text-muted-foreground mt-0.5 block">Requires reordering attention</span>
          </CardContent>
        </Card>
        <Card className={`border ${expired > 0 ? "border-rose-500/20 bg-rose-500/[0.02]" : "border-border"}`}>
          <CardContent className="p-4">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">Expired Materials</span>
            <p className="text-2xl font-bold mt-1 text-rose-600">{expired}</p>
            <span className="text-[9px] text-muted-foreground mt-0.5 block">Flagged for disposal desk</span>
          </CardContent>
        </Card>
        <Card className={`border ${expiringSoon > 0 ? "border-amber-500/20 bg-amber-500/[0.02]" : "border-border"}`}>
          <CardContent className="p-4">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground">Expiring soon (&lt;30d)</span>
            <p className="text-2xl font-bold mt-1 text-amber-600">{expiringSoon}</p>
            <span className="text-[9px] text-muted-foreground mt-0.5 block">Prioritize shelf consumption</span>
          </CardContent>
        </Card>
      </div>

      {/* Supply Stock Table */}
      <SupplyStockTable onReorderClick={(item) => setReorderItem(item)} />

      {/* Restock/Reorder Dialog modal (triggered from table row action) */}
      {reorderItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="max-w-xl w-full relative bg-card border border-border rounded-xl">
            <button
              onClick={() => setReorderItem(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground z-10"
            >
              <X className="size-4" />
            </button>
            <div className="p-1">
              <ReorderTrigger
                preselectedItem={reorderItem}
                onSuccess={handleRestockSuccess}
                onCancel={() => setReorderItem(null)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Generic Restock Dialog modal (triggered from header action button) */}
      {showRestockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="max-w-xl w-full relative bg-card border border-border rounded-xl">
            <button
              onClick={() => setShowRestockModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground z-10"
            >
              <X className="size-4" />
            </button>
            <div className="p-1">
              <ReorderTrigger
                onSuccess={handleRestockSuccess}
                onCancel={() => setShowRestockModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
