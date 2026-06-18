import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TestOrderList } from "@/components/modules/lab/TestOrderList";
import { LAB_ORDERS } from "@/mocks/lab";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FlaskConical, ClipboardList, Clock, CheckCircle2, ChevronRight,
  Gauge, HelpCircle, Activity, Hourglass, ShieldAlert
} from "lucide-react";

export const Route = createFileRoute("/_app/lab/")({
  head: () => ({ meta: [{ title: "Lab Orders & Requisitions — HMS" }] }),
  component: LabOverviewPage,
});

function LabOverviewPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const forceRefresh = () => setRefreshKey((k) => k + 1);

  // Statistics
  const totalOrders = LAB_ORDERS.length;
  const pendingCollection = LAB_ORDERS.filter((o) => o.status === "Order Received").length;
  const inProcessing = LAB_ORDERS.filter((o) => o.status === "In Processing" || o.status === "Sample Collected").length;
  const completedReleased = LAB_ORDERS.filter((o) => o.status === "Released").length;

  const statUrgent = LAB_ORDERS.filter((o) => o.urgency === "STAT" && o.status !== "Released").length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" key={refreshKey}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FlaskConical className="size-6 text-primary" />
            Lab Management Overview
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Doctors requisition portal, real-time sample collections desk, and diagnostic status tracking.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/lab/samples">
            <Button size="sm" variant="outline" className="text-xs h-9 gap-1">
              Sample Tracking
              <ChevronRight className="size-3.5" />
            </Button>
          </Link>
          <Link to="/lab/results">
            <Button size="sm" className="text-xs h-9 gap-1 bg-primary text-primary-foreground hover:bg-primary/95">
              Result Upload Desk
              <ChevronRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Numeric Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Requests</span>
              <p className="text-2xl font-bold">{totalOrders}</p>
              <span className="text-[9px] text-muted-foreground block">Accrued clinical orders</span>
            </div>
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <ClipboardList className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Pending Specimen</span>
              <p className="text-2xl font-bold text-amber-500">{pendingCollection}</p>
              {statUrgent > 0 && (
                <Badge variant="outline" className="text-[9px] h-4 bg-red-500/10 text-red-600 border-red-500/20 font-semibold animate-pulse">
                  {statUrgent} STAT pending
                </Badge>
              )}
            </div>
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
              <Hourglass className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">In Processing</span>
              <p className="text-2xl font-bold text-purple-500">{inProcessing}</p>
              <span className="text-[9px] text-muted-foreground block">Active analysis in lab</span>
            </div>
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
              <Activity className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Released Reports</span>
              <p className="text-2xl font-bold text-emerald-500">{completedReleased}</p>
              <span className="text-[9px] text-emerald-600 block font-medium">Pathology cleared</span>
            </div>
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <CheckCircle2 className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reorder levels & TAT indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-border bg-card p-4 flex items-start gap-3">
          <div className="p-2 bg-slate-500/10 text-slate-600 rounded-lg mt-0.5">
            <Gauge className="size-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold">Routine Requisitions</h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">Target Turnaround Time: <strong>24 Hours</strong>.</p>
            <p className="text-[10px] text-muted-foreground">Applies to general wellness tests, HbA1c, vitamins, lipids.</p>
          </div>
        </Card>
        <Card className="border border-border bg-card p-4 flex items-start gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg mt-0.5">
            <Clock className="size-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400">Urgent Requisitions</h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">Target Turnaround Time: <strong>4 Hours</strong>.</p>
            <p className="text-[10px] text-muted-foreground">Applies to acute febrile panels, electrolytes, LFT, CBC updates.</p>
          </div>
        </Card>
        <Card className="border border-red-500/20 bg-red-500/5 dark:bg-red-950/10 p-4 flex items-start gap-3">
          <div className="p-2 bg-red-500/10 text-red-600 rounded-lg mt-0.5">
            <ShieldAlert className="size-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-red-700 dark:text-red-400">STAT Critical Requisitions</h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">Target Turnaround Time: <strong>1 Hour</strong>.</p>
            <p className="text-[10px] text-muted-foreground">Applies to emergency ICU samples, cardiac troponin, CSF values.</p>
          </div>
        </Card>
      </div>

      {/* Main Order Desk */}
      <TestOrderList onSuccess={forceRefresh} />
    </div>
  );
}
