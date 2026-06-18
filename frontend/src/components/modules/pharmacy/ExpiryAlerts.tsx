import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { INVENTORY, inventoryStatus } from "@/mocks/inventory";
import { AlertTriangle, AlertCircle, CalendarRange, PackagePlus, ShieldAlert, ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function ExpiryAlerts() {
  // Filter items
  const expiredItems = INVENTORY.filter((item) => inventoryStatus(item) === "Expired");
  const expiringSoonItems = INVENTORY.filter((item) => inventoryStatus(item) === "Expiring Soon");
  const lowStockItems = INVENTORY.filter((item) => inventoryStatus(item) === "Low Stock");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Expired Alerts Card */}
      <Card className="border border-red-500/20 bg-red-500/5 dark:bg-red-950/10">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-red-700 dark:text-red-400">
              <ShieldAlert className="size-4" />
              Expired Batch Alerts
            </CardTitle>
            <Badge variant="outline" className="bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400 h-5 text-[10px]">
              {expiredItems.length} Badges
            </Badge>
          </div>
          <CardDescription className="text-[11px] text-red-600/80 dark:text-red-400/80">
            Medicines past their safety dates. Action: Quarantine & Dispose.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 mt-2">
            {expiredItems.length > 0 ? (
              expiredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-background border border-red-500/10 p-2.5 rounded-lg flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold block text-foreground">{item.name}</span>
                    <span className="text-[9px] text-red-600 dark:text-red-400 font-semibold uppercase tracking-wider">
                      Expired: {item.expiryDate}
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-red-100 dark:bg-red-900/30 text-red-700 border-transparent text-[9px] h-4">
                    Qty: {item.quantity}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground italic">
                No expired items in pharmacy stock.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expiring Soon Alerts Card */}
      <Card className="border border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/10">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
              <CalendarRange className="size-4" />
              Expiring Soon (&lt; 30 Days)
            </CardTitle>
            <Badge variant="outline" className="bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400 h-5 text-[10px]">
              {expiringSoonItems.length} Badges
            </Badge>
          </div>
          <CardDescription className="text-[11px] text-amber-600/80 dark:text-amber-400/80">
            Stock expiring in less than a month. Prioritize usage or return to supplier.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 mt-2">
            {expiringSoonItems.length > 0 ? (
              expiringSoonItems.map((item) => {
                const days = Math.round(
                  (new Date(item.expiryDate).getTime() - Date.now()) / 86400000
                );
                return (
                  <div
                    key={item.id}
                    className="bg-background border border-amber-500/10 p-2.5 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold block text-foreground">{item.name}</span>
                      <span className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold">
                        Expires in {days} day(s) ({item.expiryDate})
                      </span>
                    </div>
                    <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 border-transparent text-[9px] h-4">
                      Qty: {item.quantity}
                    </Badge>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground italic">
                No items expiring soon.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alerts Card */}
      <Card className="border border-orange-500/20 bg-orange-500/5 dark:bg-orange-950/10">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-orange-700 dark:text-orange-400">
              <AlertTriangle className="size-4" />
              Low Stock Alerts
            </CardTitle>
            <Badge variant="outline" className="bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-400 h-5 text-[10px]">
              {lowStockItems.length} Items
            </Badge>
          </div>
          <CardDescription className="text-[11px] text-orange-600/80 dark:text-orange-400/80">
            Items under reorder levels. Action: Purchase restock entries.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 mt-2">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-background border border-orange-500/10 p-2.5 rounded-lg flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold block text-foreground">{item.name}</span>
                    <span className="text-[9px] text-muted-foreground">
                      Reorder level: {item.reorderLevel} {item.unit}s
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400 block">
                      {item.quantity} left
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground italic">
                All item stocks are within normal levels.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
