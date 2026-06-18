import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PATIENTS } from "@/mocks/patients";
import { DOCTORS } from "@/mocks/doctors";
import { LAB_ORDERS, LAB_TEST_TYPES, createLabOrder, collectSample, startProcessing } from "@/mocks/lab";
import { toast } from "sonner";
import { FlaskConical, PlusCircle, Clock, CheckCircle2, Clipboard, ChevronRight, Activity, Beaker } from "lucide-react";

interface TestOrderListProps {
  onSuccess?: () => void;
}

export function TestOrderList({ onSuccess }: TestOrderListProps) {
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Create Order states
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedTestType, setSelectedTestType] = useState(LAB_TEST_TYPES[0]);
  const [urgency, setUrgency] = useState<"Routine" | "Urgent" | "STAT">("Routine");
  const [orderNotes, setOrderNotes] = useState("");

  // Sample Collection states
  const [collectOrderId, setCollectOrderId] = useState<string | null>(null);
  const [sampleType, setSampleType] = useState("Blood (EDTA)");
  const [collectorName, setCollectorName] = useState("Staff Nurse Priya");

  const filteredOrders = LAB_ORDERS.filter((o) => {
    if (statusFilter === "all") return true;
    return o.status === statusFilter;
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedDoctorId) {
      toast.error("Please select both a patient and an ordering doctor");
      return;
    }

    const order = createLabOrder(selectedPatientId, selectedDoctorId, selectedTestType, urgency, orderNotes);
    if (order) {
      toast.success("Lab Test Order Raised!", {
        description: `Order ${order.id} for ${selectedTestType} has been recorded in status "Order Received".`,
      });
      
      // Reset
      setSelectedPatientId("");
      setSelectedDoctorId("");
      setOrderNotes("");
      setActiveTab("list");
      
      if (onSuccess) onSuccess();
    }
  };

  const handleCollectSampleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectOrderId) return;

    const order = collectSample(collectOrderId, sampleType, collectorName);
    if (order) {
      toast.success("Sample Collection Logged!", {
        description: `Logged ${sampleType} sample for ${order.id} collected by ${collectorName}.`,
      });
      setCollectOrderId(null);
      if (onSuccess) onSuccess();
    }
  };

  const handleStartProcessing = (orderId: string) => {
    const order = startProcessing(orderId);
    if (order) {
      toast.info(`Order ${orderId} is now in processing state.`);
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Tab Bar */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "list"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clipboard className="size-3.5" />
          Active Lab Orders
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "create"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <PlusCircle className="size-3.5" />
          Raise Test Order
        </button>
      </div>

      {activeTab === "create" ? (
        /* Create Lab Order Form */
        <Card className="border border-border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <FlaskConical className="size-4 text-primary" />
              Requisition Desk
            </CardTitle>
            <CardDescription className="text-xs">
              Raise diagnostic requisition forms for clinical analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleCreateOrder} className="space-y-4 max-w-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Patient</Label>
                  <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
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
                  <Label className="text-xs font-semibold">Requesting Doctor</Label>
                  <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select physician..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {DOCTORS.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          Dr. {d.name} ({d.specialization})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Test Requisition Profile</Label>
                  <Select value={selectedTestType} onValueChange={setSelectedTestType}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LAB_TEST_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Urgency Priority</Label>
                  <Select value={urgency} onValueChange={(v: any) => setUrgency(v)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Routine">Routine (Turnaround: 24 hrs)</SelectItem>
                      <SelectItem value="Urgent">Urgent (Turnaround: 4 hrs)</SelectItem>
                      <SelectItem value="STAT">STAT (Critical, Immediate - 1 hr)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Clinical Indication & Notes</Label>
                <Textarea
                  placeholder="e.g. Rule out hyperthyroidism, patient complains of lethargy..."
                  className="text-xs min-h-[80px]"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <Button type="submit" className="text-xs" disabled={!selectedPatientId || !selectedDoctorId}>
                  Raise Lab Order
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        /* Lab Orders Table */
        <div className="space-y-4 animate-fadeIn">
          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-1 bg-accent/20 p-1 border border-border rounded-lg max-w-lg">
            {["all", "Order Received", "Sample Collected", "In Processing", "Resulted", "Released"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md text-[10px] font-semibold transition-all ${
                  statusFilter === st
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {st === "all" ? "All" : st}
              </button>
            ))}
          </div>

          <Card className="border border-border">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-accent/20 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="p-3 pl-4">Order ID & Date</th>
                      <th className="p-3">Patient</th>
                      <th className="p-3">Test Type</th>
                      <th className="p-3">Urgency</th>
                      <th className="p-3">Attending Doctor</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => {
                        const pat = PATIENTS.find((p) => p.id === order.patientId);
                        const doc = DOCTORS.find((d) => d.id === order.doctorId);

                        // Urgency badge colors
                        let urgBadge = "bg-slate-500/10 text-slate-600 border-slate-500/20";
                        if (order.urgency === "STAT") {
                          urgBadge = "bg-red-500/10 text-red-600 border-red-500/20 font-bold animate-pulse";
                        } else if (order.urgency === "Urgent") {
                          urgBadge = "bg-amber-500/10 text-amber-600 border-amber-500/20";
                        }

                        // Status colors
                        let stBadge = "bg-slate-500/10 text-slate-600";
                        if (order.status === "Released") stBadge = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
                        else if (order.status === "Resulted") stBadge = "bg-blue-500/10 text-blue-600 border-blue-500/20";
                        else if (order.status === "In Processing") stBadge = "bg-purple-500/10 text-purple-600 border-purple-500/20";
                        else if (order.status === "Sample Collected") stBadge = "bg-orange-500/10 text-orange-600 border-orange-500/20";

                        return (
                          <tr key={order.id} className="hover:bg-accent/5 transition-colors">
                            <td className="p-3 pl-4">
                              <span className="font-bold block text-foreground">{order.id}</span>
                              <span className="text-[9px] text-muted-foreground block">
                                {new Date(order.collectedAt || Date.now()).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-foreground">{pat?.name || "Unknown"}</div>
                              <div className="text-[10px] text-muted-foreground">{order.patientId}</div>
                            </td>
                            <td className="p-3 font-semibold text-primary">
                              {order.testType}
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className={`text-[10px] h-5 ${urgBadge}`}>
                                {order.urgency}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="font-semibold">Dr. {doc?.name}</div>
                              <div className="text-[10px] text-muted-foreground">{doc?.specialization}</div>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline" className={`text-[10px] font-semibold h-5 ${stBadge}`}>
                                {order.status}
                              </Badge>
                            </td>
                            <td className="p-3 pr-4 text-right">
                              {order.status === "Order Received" && (
                                <Button
                                  size="sm"
                                  onClick={() => setCollectOrderId(order.id)}
                                  className="h-7 text-[10px] bg-orange-600 hover:bg-orange-700 text-white"
                                >
                                  Collect Sample
                                </Button>
                              )}
                              {order.status === "Sample Collected" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStartProcessing(order.id)}
                                  className="h-7 text-[10px] bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                  Start Process
                                </Button>
                              )}
                              {order.status === "In Processing" && (
                                <Link to="/lab/results">
                                  <Button size="sm" variant="outline" className="h-7 text-[10px]">
                                    Upload Results
                                  </Button>
                                </Link>
                              )}
                              {order.status === "Resulted" && (
                                <Link to="/lab/results">
                                  <Button size="sm" variant="default" className="h-7 text-[10px] bg-emerald-600 hover:bg-emerald-700">
                                    Release Results
                                  </Button>
                                </Link>
                              )}
                              {order.status === "Released" && (
                                <span className="text-[10px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                                  <CheckCircle2 className="size-3.5" />
                                  Released
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground text-xs italic">
                          No lab test requests matched the status filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Collect Sample Dialog Modal */}
      {collectOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="max-w-sm w-full bg-card border border-border">
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Beaker className="size-4 text-primary" />
                Sample Collection Desk ({collectOrderId})
              </CardTitle>
              <CardDescription className="text-xs">
                Log specimen retrieval credentials for clinical intake.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <form onSubmit={handleCollectSampleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Specimen Category / Specimen Type</Label>
                  <Select value={sampleType} onValueChange={setSampleType}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Blood (EDTA)">Blood (EDTA Vacutainer - Purple)</SelectItem>
                      <SelectItem value="Blood (Serum)">Blood (Serum Vacutainer - Red)</SelectItem>
                      <SelectItem value="Urine (Midstream)">Urine (Midstream Clean Catch)</SelectItem>
                      <SelectItem value="Saliva swab">Saliva Buccal swab</SelectItem>
                      <SelectItem value="CSF Fluid">Cerebrospinal Fluid (CSF)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Phlebotomist / Collector Name</Label>
                  <Input
                    className="text-xs h-8"
                    placeholder="Enter technician name..."
                    value={collectorName}
                    onChange={(e) => setCollectorName(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button variant="outline" size="sm" type="button" onClick={() => setCollectOrderId(null)} className="h-8 text-xs">
                    Cancel
                  </Button>
                  <Button size="sm" type="submit" className="h-8 text-xs">
                    Confirm Specimen collection
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
