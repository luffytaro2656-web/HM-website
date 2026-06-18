import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ClipboardList, IndianRupee, Truck, Calendar, DollarSign, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PURCHASES } from "@/mocks/inventory";
import { HOSPITALS } from "@/mocks/hospitals";
import { formatCurrency } from "@/utils/formatters";
import { ReorderTrigger } from "@/components/modules/inventory/ReorderTrigger";

export const Route = createFileRoute("/_app/inventory/purchases")({
  head: () => ({ meta: [{ title: "Inventory Purchase Entries — HMS" }] }),
  component: InventoryPurchasesPage,
});

function InventoryPurchasesPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showLogModal, setShowLogModal] = useState(false);

  const totalCost = PURCHASES.reduce((acc, p) => acc + p.cost, 0);
  const totalVolume = PURCHASES.reduce((acc, p) => acc + p.quantityReceived, 0);

  const handleSuccess = () => {
    setShowLogModal(false);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" key={refreshKey}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <Link to="/inventory" className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-3" /> Back to Supply Directory
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ClipboardList className="size-6 text-primary" />
            Supply Purchase Entries
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Log incoming shipments, audit supplier pricing structures, and match receipts to purchase orders.
          </p>
        </div>
        <div>
          <Button size="sm" onClick={() => setShowLogModal(true)} className="text-xs h-9 gap-1.5">
            <Plus className="size-4" />
            Log Purchase Invoice
          </Button>
        </div>
      </div>

      {/* Procurement Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">Total Supplies Expenditure</span>
              <p className="text-2xl font-bold mt-1 text-foreground">{formatCurrency(totalCost)}</p>
            </div>
            <DollarSign className="size-7 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className="border border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">Restocked Materials Volume</span>
              <p className="text-2xl font-bold mt-1 text-foreground">{totalVolume} units</p>
            </div>
            <Truck className="size-7 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Purchase Ledger Table */}
      <Card className="border border-border">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Invoices & Deliveries Ledger</CardTitle>
          <CardDescription className="text-xs">
            Review logged incoming items, supplier tags, and cost per receipt.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-accent/20 border-b border-border text-[10px] font-semibold text-muted-foreground uppercase">
                  <th className="p-3 pl-4">Delivery ID / Invoice</th>
                  <th className="p-3">Item details</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Hospital Branch</th>
                  <th className="p-3">Supplier Company</th>
                  <th className="p-3 text-right">Quantity Received</th>
                  <th className="p-3 text-right">Cost (Total)</th>
                  <th className="p-3 pr-4 text-right">Received Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {PURCHASES.length > 0 ? (
                  PURCHASES.map((p) => {
                    const hospName = HOSPITALS.find((h) => h.id === p.hospitalId)?.name ?? "—";
                    return (
                      <tr key={p.id} className="hover:bg-accent/5 align-middle">
                        <td className="p-3 pl-4 font-semibold text-foreground">
                          <span>{p.id}</span>
                          <span className="text-[10px] font-mono text-muted-foreground block">{p.invoiceRef}</span>
                        </td>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{p.itemName}</td>
                        <td className="p-3 text-muted-foreground">{p.category}</td>
                        <td className="p-3 text-muted-foreground max-w-[150px] truncate" title={hospName}>
                          {hospName}
                        </td>
                        <td className="p-3 font-medium text-slate-700 dark:text-slate-300">{p.supplierName}</td>
                        <td className="p-3 text-right font-semibold">{p.quantityReceived}</td>
                        <td className="p-3 text-right font-mono font-bold text-foreground">{formatCurrency(p.cost)}</td>
                        <td className="p-3 pr-4 text-right font-mono text-[10px] text-muted-foreground">
                          {p.purchaseDate}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-muted-foreground italic">
                      No purchase entries logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Log Purchase Invoice Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="max-w-xl w-full relative bg-card border border-border rounded-xl">
            <button
              onClick={() => setShowLogModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground z-10"
            >
              <X className="size-4" />
            </button>
            <div className="p-1">
              <ReorderTrigger
                onSuccess={handleSuccess}
                onCancel={() => setShowLogModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
