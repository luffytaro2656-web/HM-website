import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { INVENTORY, inventoryStatus } from "@/mocks/inventory";
import { ExpiryAlerts } from "@/components/modules/pharmacy/ExpiryAlerts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Pill, PlusCircle, ArrowRight, Search, FileBarChart, AlertTriangle, 
  Layers, Package, ShieldCheck, HelpCircle
} from "lucide-react";

export const Route = createFileRoute("/_app/pharmacy/")({
  head: () => ({ meta: [{ title: "Pharmacy Inventory & Dispensing — HMS" }] }),
  component: PharmacyOverviewPage,
});

function PharmacyOverviewPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"inventory" | "reports">("inventory");
  const [refreshKey, setRefreshKey] = useState(0);

  const forceRefresh = () => setRefreshKey((k) => k + 1);

  // Filters for Medicine category
  const medicineStock = INVENTORY.filter(
    (item) => item.category === "Medicine" &&
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMeds = INVENTORY.filter((item) => item.category === "Medicine").length;
  const lowStockCount = INVENTORY.filter(
    (item) => item.category === "Medicine" && inventoryStatus(item) === "Low Stock"
  ).length;
  const expiredCount = INVENTORY.filter(
    (item) => item.category === "Medicine" && inventoryStatus(item) === "Expired"
  ).length;
  const expiringSoonCount = INVENTORY.filter(
    (item) => item.category === "Medicine" && inventoryStatus(item) === "Expiring Soon"
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto" key={refreshKey}>
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Pill className="size-6 text-primary" />
            Pharmacy Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track medicine stocks, dispense doctor prescriptions, record restock entries, and monitor expiry/low stock alerts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/pharmacy/dispense">
            <Button size="sm" variant="outline" className="text-xs h-9 gap-1.5">
              <Pill className="size-3.5" />
              Dispense Desk
            </Button>
          </Link>
          <Link to="/pharmacy/purchases">
            <Button size="sm" className="text-xs h-9 gap-1.5">
              <PlusCircle className="size-3.5" />
              Record Restock
            </Button>
          </Link>
        </div>
      </div>

      {/* Expiry / Low stock Alerts section */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Critical Stock Warnings</h2>
        <ExpiryAlerts />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="inventory" value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full space-y-4">
        <TabsList className="bg-muted/60 p-1 border border-border rounded-xl">
          <TabsTrigger value="inventory" className="text-xs rounded-lg px-4 py-2 flex items-center gap-1.5">
            <Package className="size-3.5" />
            Medicine Stock Registry
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-xs rounded-lg px-4 py-2 flex items-center gap-1.5">
            <FileBarChart className="size-3.5" />
            Consumption & Expiry Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="outline-none space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search medicines by name..."
              className="pl-9 text-xs h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Stock Table */}
          <Card className="border border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-bold">Medicines in Stock ({medicineStock.length})</CardTitle>
              <CardDescription className="text-xs">
                Real-time snapshot of active pharmaceutical stocks.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="overflow-x-auto border border-border rounded-xl bg-card">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-accent/20 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="p-3 pl-4">Medicine Name</th>
                      <th className="p-3">Item ID</th>
                      <th className="p-3">Current Stock</th>
                      <th className="p-3">Reorder Threshold</th>
                      <th className="p-3">Expiry Date</th>
                      <th className="p-3">Status Tag</th>
                      <th className="p-3 pr-4 text-right">Quick Desk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {medicineStock.length > 0 ? (
                      medicineStock.map((item) => {
                        const status = inventoryStatus(item);
                        let badgeClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
                        if (status === "Expired") {
                          badgeClass = "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
                        } else if (status === "Expiring Soon") {
                          badgeClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
                        } else if (status === "Low Stock") {
                          badgeClass = "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
                        }

                        return (
                          <tr key={item.id} className="hover:bg-accent/5 transition-colors">
                            <td className="p-3 pl-4 font-semibold text-foreground">
                              {item.name}
                            </td>
                            <td className="p-3 text-muted-foreground font-mono">
                              {item.id}
                            </td>
                            <td className="p-3 font-semibold">
                              {item.quantity} {item.unit}(s)
                            </td>
                            <td className="p-3 text-muted-foreground">
                              {item.reorderLevel} {item.unit}(s)
                            </td>
                            <td className="p-3">
                              {item.expiryDate}
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className={`text-[10px] font-semibold h-5 ${badgeClass}`}>
                                {status}
                              </Badge>
                            </td>
                            <td className="p-3 pr-4 text-right">
                              <Link to="/pharmacy/dispense">
                                <Button size="sm" variant="ghost" className="h-7 text-[10px] text-primary hover:bg-primary/10">
                                  Dispense
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground text-xs italic">
                          No matching medicines found in stock registry.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="outline-none space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stock Consumption Summary */}
            <Card className="border border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <Layers className="size-4 text-primary" />
                  Stock Consumption Report
                </CardTitle>
                <CardDescription className="text-xs">
                  Summary list of low stock items requiring immediate reorder entries.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2 mt-2">
                  {INVENTORY.filter(i => inventoryStatus(i) === "Low Stock").slice(0, 5).map(item => (
                    <div key={item.id} className="flex justify-between items-center text-xs border-b border-border pb-2 last:border-0 last:pb-0">
                      <div>
                        <span className="font-semibold block">{item.name}</span>
                        <span className="text-[10px] text-muted-foreground">ID: {item.id}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-rose-500 font-bold block">{item.quantity} Left</span>
                        <span className="text-[9px] text-muted-foreground">Reorder at {item.reorderLevel}</span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 text-right">
                    <Link to="/pharmacy/purchases">
                      <Button size="sm" variant="link" className="text-[11px] h-6 p-0 text-primary">
                        Open Purchase desk to Restock →
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expiry Analysis */}
            <Card className="border border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-primary" />
                  Expiry Risk Analysis
                </CardTitle>
                <CardDescription className="text-xs">
                  Medications sorted by closest expiry schedule.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2 mt-2">
                  {INVENTORY.filter(i => inventoryStatus(i) === "Expired" || inventoryStatus(i) === "Expiring Soon").slice(0, 5).map(item => {
                    const status = inventoryStatus(item);
                    return (
                      <div key={item.id} className="flex justify-between items-center text-xs border-b border-border pb-2 last:border-0 last:pb-0">
                        <div>
                          <span className="font-semibold block">{item.name}</span>
                          <span className="text-[10px] text-muted-foreground">Expiry Date: {item.expiryDate}</span>
                        </div>
                        <Badge variant="outline" className={`text-[9px] h-4.5 font-bold ${
                          status === "Expired" 
                            ? "bg-red-500/10 text-red-600 border-red-500/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        }`}>
                          {status}
                        </Badge>
                      </div>
                    );
                  })}
                  <div className="pt-2 text-[10px] text-muted-foreground italic">
                    Expiring stock must be quarantined immediately to comply with patient safety regulations.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
