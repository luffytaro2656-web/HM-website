import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PATIENTS } from "@/mocks/patients";
import { DOCTORS } from "@/mocks/doctors";
import { INVENTORY } from "@/mocks/inventory";
import { PRESCRIPTIONS } from "@/mocks/patients";
import { dispensePrescription, handleMedicineReturn } from "@/mocks/pharmacy";
import { toast } from "sonner";
import { Pill, ClipboardList, CheckCircle2, RotateCcw, AlertCircle, ShoppingBag } from "lucide-react";

interface DispenseFormProps {
  onSuccess?: () => void;
}

export function DispenseForm({ onSuccess }: DispenseFormProps) {
  const [activeTab, setActiveTab] = useState<"dispense" | "return">("dispense");

  // Dispense states
  const [selectedPrId, setSelectedPrId] = useState("");
  const [dispenseQty, setDispenseQty] = useState<number>(10);
  const [batchNum, setBatchNum] = useState("BAT-8092");
  const [expiryDate, setExpiryDate] = useState("2027-08-30");
  const [dispenseStatus, setDispenseStatus] = useState<"Completed" | "Partial">("Completed");
  const [dispenseNotes, setDispenseNotes] = useState("");

  // Return states
  const [returnPatientId, setReturnPatientId] = useState("");
  const [returnMedName, setReturnMedName] = useState("");
  const [returnQty, setReturnQty] = useState<number>(5);
  const [returnNotes, setReturnNotes] = useState("");

  // Filter pending prescriptions that haven't been dispensed yet
  const eligiblePrescriptions = PRESCRIPTIONS.slice(0, 15); // mock active prescriptions list

  const activePrescription = PRESCRIPTIONS.find((p) => p.id === selectedPrId);
  const patientDetails = activePrescription ? PATIENTS.find((p) => p.id === activePrescription.patientId) : null;
  const doctorDetails = activePrescription ? DOCTORS.find((d) => d.id === activePrescription.doctorId) : null;

  // Find inventory stock for selected prescription drug
  const matchingStock = activePrescription 
    ? INVENTORY.find((item) => item.name.toLowerCase().includes(activePrescription.medicine.toLowerCase()))
    : null;

  const handleDispenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrId || !activePrescription) {
      toast.error("Please select a prescription first");
      return;
    }

    if (matchingStock && matchingStock.quantity < dispenseQty) {
      toast.warning("Low stock alert", {
        description: `Only ${matchingStock.quantity} ${matchingStock.unit}(s) available in stock. Dispensing requested quantity may deplete resources.`,
      });
    }

    const medicinesDispensed = [
      {
        name: activePrescription.medicine,
        qtyPrescribed: 15, // Mock prescribed course total
        qtyDispensed: dispenseQty,
        batchNumber: batchNum || "BAT-GEN-01",
        expiryDate: expiryDate || new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
      },
    ];

    const record = dispensePrescription(selectedPrId, medicinesDispensed, dispenseStatus, dispenseNotes);

    if (record) {
      toast.success("Medicines Dispensed Successfully!", {
        description: `${dispenseQty} units of ${activePrescription.medicine} marked as ${dispenseStatus}.`,
      });

      // Reset
      setSelectedPrId("");
      setDispenseNotes("");
      setDispenseQty(10);
      
      if (onSuccess) onSuccess();
    } else {
      toast.error("Failed to process dispensing record.");
    }
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnPatientId) {
      toast.error("Please select a patient returning medicine");
      return;
    }
    if (!returnMedName) {
      toast.error("Please enter the returned medicine name");
      return;
    }
    if (returnQty <= 0) {
      toast.error("Please enter a valid quantity of returned medicine");
      return;
    }

    const record = handleMedicineReturn(returnPatientId, returnMedName, returnQty, returnNotes);

    if (record) {
      toast.success("Medicine Return Logged!", {
        description: `Successfully credited ${returnQty} units of ${returnMedName} back to pharmacy inventory.`,
      });

      // Reset
      setReturnPatientId("");
      setReturnMedName("");
      setReturnQty(5);
      setReturnNotes("");

      if (onSuccess) onSuccess();
    } else {
      toast.error("Failed to process return transaction.");
    }
  };

  // Prepopulate batch/expiry if stock matches
  const selectPrescription = (prId: string) => {
    setSelectedPrId(prId);
    const pr = PRESCRIPTIONS.find((p) => p.id === prId);
    if (pr) {
      const stock = INVENTORY.find((item) => item.name.toLowerCase().includes(pr.medicine.toLowerCase()));
      if (stock) {
        setExpiryDate(stock.expiryDate);
        setBatchNum(`BAT-${Math.floor(1000 + Math.random() * 9000)}`);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Mini tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("dispense")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "dispense"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Pill className="size-3.5" />
          Dispense Prescriptions
        </button>
        <button
          onClick={() => setActiveTab("return")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === "return"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <RotateCcw className="size-3.5" />
          Patient Returns & Credits
        </button>
      </div>

      {activeTab === "dispense" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-7">
            <Card className="border border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold">Dispensing Desk</CardTitle>
                <CardDescription className="text-xs">
                  Mark medicine packs as dispensed based on doctor prescription notes.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <form onSubmit={handleDispenseSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Active Doctor Prescriptions</Label>
                    <Select value={selectedPrId} onValueChange={selectPrescription}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select pending prescription..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {eligiblePrescriptions.map((pr) => {
                          const p = PATIENTS.find((pat) => pat.id === pr.patientId);
                          return (
                            <SelectItem key={pr.id} value={pr.id}>
                              {pr.id} — {p?.name} ({pr.medicine})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {activePrescription && (
                    <div className="bg-accent/20 border border-border rounded-xl p-3.5 space-y-3 text-xs animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-border pb-1.5">
                        <span className="font-bold text-primary uppercase text-[10px] tracking-wider">Prescription Details</span>
                        <Badge variant="outline" className="text-[9px] h-4">
                          {activePrescription.date.slice(0, 10)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <strong className="text-muted-foreground">Patient:</strong> {patientDetails?.name} ({activePrescription.patientId})
                        </div>
                        <div>
                          <strong className="text-muted-foreground">Doctor:</strong> Dr. {doctorDetails?.name} ({doctorDetails?.specialization})
                        </div>
                        <div>
                          <strong className="text-muted-foreground">Medicine Name:</strong> {activePrescription.medicine}
                        </div>
                        <div>
                          <strong className="text-muted-foreground">Dosage Schedule:</strong> {activePrescription.dosage} - {activePrescription.frequency}
                        </div>
                        <div>
                          <strong className="text-muted-foreground">Course Duration:</strong> {activePrescription.duration}
                        </div>
                        <div>
                          <strong className="text-muted-foreground">Advisory Notes:</strong> {activePrescription.notes}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Quantity to Dispense</Label>
                      <Input
                        type="number"
                        min={1}
                        className="text-xs h-9"
                        value={dispenseQty}
                        onChange={(e) => setDispenseQty(parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Batch Number</Label>
                      <Input
                        className="text-xs h-9"
                        value={batchNum}
                        onChange={(e) => setBatchNum(e.target.value)}
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Dispensing Outcome</Label>
                      <Select value={dispenseStatus} onValueChange={(v: any) => setDispenseStatus(v)}>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Completed">Completed (Full Course)</SelectItem>
                          <SelectItem value="Partial">Partial Dispensing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Dispensing Notes</Label>
                      <Input
                        placeholder="e.g. Advised on empty stomach, compliance verified..."
                        className="text-xs h-9"
                        value={dispenseNotes}
                        onChange={(e) => setDispenseNotes(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" className="w-full text-xs" disabled={!selectedPrId}>
                      Record Dispensing & Deduct Inventory
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar / Stock levels */}
          <div className="lg:col-span-5">
            <Card className="border border-border bg-card">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                  <ShoppingBag className="size-4 text-primary" />
                  Pharmacy Stock Levels
                </CardTitle>
                <CardDescription className="text-xs">
                  Active inventory levels for the selected medicine.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 text-xs space-y-4">
                {activePrescription ? (
                  matchingStock ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-accent/20 p-3 rounded-lg border border-border">
                        <div>
                          <span className="font-bold text-sm block">{matchingStock.name}</span>
                          <span className="text-[10px] text-muted-foreground">ID: {matchingStock.id}</span>
                        </div>
                        <Badge variant="outline" className={`font-semibold ${
                          matchingStock.quantity < matchingStock.reorderLevel 
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        }`}>
                          {matchingStock.quantity} {matchingStock.unit}(s) Left
                        </Badge>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Reorder Threshold:</span>
                          <span className="font-medium">{matchingStock.reorderLevel} units</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">Active Batch Expiry:</span>
                          <span className={`font-medium ${
                            new Date(matchingStock.expiryDate).getTime() < Date.now()
                              ? "text-rose-500"
                              : "text-slate-600 dark:text-slate-400"
                          }`}>
                            {matchingStock.expiryDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                      <AlertCircle className="size-8 text-amber-500/50 mb-1" />
                      <p className="font-medium text-xs text-amber-600 dark:text-amber-400">Medicine Not in Main Inventory</p>
                      <p className="text-[10px] max-w-[180px] mt-0.5">
                        {activePrescription.medicine} does not match any current stock item. A new item will be auto-created upon dispensing.
                      </p>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <Pill className="size-8 text-muted-foreground/30 mb-1" />
                    <p className="font-semibold text-xs">No Medicine Selected</p>
                    <p className="text-[10px] max-w-[150px] mt-0.5">
                      Select a doctor prescription on the left to verify active stock availability.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Returns / Refund form */
        <Card className="border border-border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <RotateCcw className="size-4 text-primary" />
              Patient Returns & Credit Registry
            </CardTitle>
            <CardDescription className="text-xs">
              Increment stock back to pharmacy inventory for unused, returned medicine boxes.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleReturnSubmit} className="space-y-4 max-w-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Select Patient</Label>
                  <Select value={returnPatientId} onValueChange={setReturnPatientId}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select patient..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {PATIENTS.slice(0, 30).map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Returned Medicine Name</Label>
                  <Input
                    placeholder="e.g. Paracetamol 500mg"
                    className="text-xs h-9"
                    value={returnMedName}
                    onChange={(e) => setReturnMedName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Quantity Returned</Label>
                  <Input
                    type="number"
                    min={1}
                    className="text-xs h-9"
                    value={returnQty}
                    onChange={(e) => setReturnQty(parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Reason for Return</Label>
                  <Input
                    placeholder="e.g. Course completed early, doctor altered prescription..."
                    className="text-xs h-9"
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" className="text-xs" disabled={!returnPatientId || !returnMedName}>
                  Record Return & Adjust Stock
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
