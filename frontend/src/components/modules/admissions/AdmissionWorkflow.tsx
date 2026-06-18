import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PATIENTS } from "@/mocks/patients";
import { DOCTORS } from "@/mocks/doctors";
import { BEDS, WARDS, admitPatient, updateBedStatus } from "@/mocks/admissions";
import { toast } from "sonner";
import { Check, Info, ShieldAlert, BedDouble, AlertCircle, PlusCircle } from "lucide-react";

interface AdmissionWorkflowProps {
  onSuccess?: () => void;
}

export function AdmissionWorkflow({ onSuccess }: AdmissionWorkflowProps) {
  const [selectedWard, setSelectedWard] = useState(WARDS[0]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedBedId, setSelectedBedId] = useState("");
  const [admissionNotes, setAdmissionNotes] = useState("");
  const [bedSearchQuery, setBedSearchQuery] = useState("");

  // Manage Bed Status Maintenance Dialog states
  const [maintenanceBedId, setMaintenanceBedId] = useState<string | null>(null);
  const [maintenanceNotes, setMaintenanceNotes] = useState("");
  const [maintenanceStatus, setMaintenanceStatus] = useState<"Vacant" | "Maintenance">("Maintenance");

  // Get eligible outpatients/discharged patients who can be admitted
  const eligiblePatients = PATIENTS.filter(
    (p) => p.status === "Outpatient" || p.status === "Discharged"
  );

  // Get beds for the active selected ward
  const activeWardBeds = BEDS.filter((b) => b.ward === selectedWard);

  const handleSelectBed = (bed: typeof BEDS[0]) => {
    if (bed.status === "Occupied") {
      const occupant = PATIENTS.find((p) => p.id === bed.patientId);
      toast.info(`Bed ${bed.id} is occupied by ${occupant?.name || "another patient"}.`);
      return;
    }
    if (bed.status === "Maintenance") {
      toast.warning(`Bed ${bed.id} is currently under maintenance.`);
      return;
    }
    setSelectedBedId(bed.id);
  };

  const handleAdmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatientId) {
      toast.error("Please select a patient for admission");
      return;
    }
    if (!selectedDoctorId) {
      toast.error("Please select the admitting doctor");
      return;
    }
    if (!selectedBedId) {
      toast.error("Please select an available bed from the grid");
      return;
    }

    const record = admitPatient(selectedPatientId, selectedDoctorId, selectedBedId, admissionNotes);

    if (record) {
      const patient = PATIENTS.find((p) => p.id === selectedPatientId);
      const doctor = DOCTORS.find((d) => d.id === selectedDoctorId);

      toast.success("Patient Admitted Successfully!", {
        description: `${patient?.name} has been assigned to Bed ${selectedBedId} under Dr. ${doctor?.name}.`,
      });

      // Clear states
      setSelectedPatientId("");
      setSelectedDoctorId("");
      setSelectedBedId("");
      setAdmissionNotes("");
      
      if (onSuccess) onSuccess();
    } else {
      toast.error("Failed to process admission. Please check bed occupancy.");
    }
  };

  const handleToggleMaintenance = () => {
    if (!maintenanceBedId) return;
    updateBedStatus(maintenanceBedId, maintenanceStatus, maintenanceNotes || "Scheduled maintenance.");
    toast.success(`Bed ${maintenanceBedId} status updated to ${maintenanceStatus}`);
    setMaintenanceBedId(null);
    setMaintenanceNotes("");
    if (onSuccess) onSuccess();
  };

  const currentSelectedBed = BEDS.find((b) => b.id === selectedBedId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Visual Bed Grid Layout */}
      <div className="lg:col-span-7 space-y-4">
        <Card className="border border-border">
          <CardHeader className="p-4 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <BedDouble className="size-5 text-primary" />
                  Ward Grid & Bed Map
                </CardTitle>
                <CardDescription className="text-xs">
                  Choose a ward and click any green bed to select it for intake.
                </CardDescription>
              </div>
              <Select value={selectedWard} onValueChange={setSelectedWard}>
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <SelectValue placeholder="Select Ward" />
                </SelectTrigger>
                <SelectContent>
                  {WARDS.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Status Legends */}
            <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground pb-2 border-b border-border">
              <div className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm bg-emerald-500/20 border border-emerald-500/50 block"></span>
                <span>Vacant (Available)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm bg-rose-500/20 border border-rose-500/50 block"></span>
                <span>Occupied</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-3 rounded-sm bg-amber-500/20 border border-amber-500/50 block"></span>
                <span>Maintenance</span>
              </div>
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="size-3 rounded-sm bg-primary border border-primary block ring-2 ring-primary/40 animate-pulse"></span>
                <span className="font-semibold text-primary">Selected Bed</span>
              </div>
            </div>

            {/* Bed Layout Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {activeWardBeds.map((bed) => {
                const isSelected = selectedBedId === bed.id;
                const occupant = bed.patientId ? PATIENTS.find((p) => p.id === bed.patientId) : null;
                
                let statusClass = "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20";
                if (bed.status === "Occupied") {
                  statusClass = "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400 hover:bg-rose-500/15 cursor-not-allowed";
                } else if (bed.status === "Maintenance") {
                  statusClass = "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/15 cursor-not-allowed";
                }

                if (isSelected) {
                  statusClass = "bg-primary text-primary-foreground border-primary ring-2 ring-primary/50 ring-offset-2 ring-offset-background";
                }

                return (
                  <div
                    key={bed.id}
                    onClick={() => handleSelectBed(bed)}
                    className={`border rounded-xl p-3 flex flex-col justify-between h-[110px] transition-all cursor-pointer ${statusClass}`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-xs">{bed.id}</span>
                      <span className="text-[9px] uppercase tracking-wider font-semibold opacity-70">
                        {bed.status}
                      </span>
                    </div>

                    <div className="text-[10px] mt-2 flex-1 flex flex-col justify-end">
                      {occupant ? (
                        <>
                          <span className="font-semibold truncate block">{occupant.name}</span>
                          <span className="opacity-70 text-[9px]">{occupant.id}</span>
                        </>
                      ) : bed.status === "Maintenance" ? (
                        <span className="italic opacity-70 text-[9px]">Servicing</span>
                      ) : (
                        <span className="italic opacity-70 text-[9px]">Ready for intake</span>
                      )}
                    </div>

                    {/* Maintenance Tool link for admins */}
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-current/10 text-[9px]">
                      <span>{bed.status === "Occupied" ? "Inpatient" : "Housekeep"}</span>
                      {bed.status !== "Occupied" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMaintenanceBedId(bed.id);
                            setMaintenanceStatus(bed.status === "Maintenance" ? "Vacant" : "Maintenance");
                          }}
                          className="hover:underline font-bold text-[9px]"
                        >
                          Toggle State
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Intake Forms & Selection */}
      <div className="lg:col-span-5">
        <Card className="border border-border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <PlusCircle className="size-5 text-primary" />
              Patient Admission Form
            </CardTitle>
            <CardDescription className="text-xs">
              Link a doctor and assign a visual bed slot to complete patient intake.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleAdmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Patient to Admit</Label>
                <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Outpatient..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {eligiblePatients.length > 0 ? (
                      eligiblePatients.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.id}) — {p.gender}, {p.age} yrs
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No active outpatients available for admission
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Admitting Physician / Specialist</Label>
                <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select Physician..." />
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

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Selected Bed Assignment</Label>
                <Input
                  disabled
                  placeholder="Click a vacant bed in the grid map..."
                  className="text-xs h-9 bg-accent/20"
                  value={
                    currentSelectedBed
                      ? `Bed: ${currentSelectedBed.id} | Ward: ${currentSelectedBed.ward}`
                      : ""
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Admission Reason & Care Notes</Label>
                <Textarea
                  placeholder="Describe details regarding treatment plan, special diets, or critical alerts..."
                  className="text-xs min-h-[80px]"
                  value={admissionNotes}
                  onChange={(e) => setAdmissionNotes(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full text-xs"
                  disabled={!selectedPatientId || !selectedDoctorId || !selectedBedId}
                >
                  Confirm Bed Assignment & Admit
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Bed Maintenance dialog */}
      {maintenanceBedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="max-w-sm w-full bg-card border border-border">
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <AlertCircle className="size-4 text-primary" />
                Change Bed Status ({maintenanceBedId})
              </CardTitle>
              <CardDescription className="text-xs">
                Toggle a bed status between Vacant and Maintenance.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Select Status</Label>
                <Select value={maintenanceStatus} onValueChange={(v: any) => setMaintenanceStatus(v)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vacant">Vacant (Available for Patients)</SelectItem>
                    <SelectItem value="Maintenance">Maintenance (Under Repair/Servicing)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Maintenance Log Remarks</Label>
                <Input
                  className="text-xs h-8"
                  placeholder="e.g. Bed frame issue, housekeeping scheduled..."
                  value={maintenanceNotes}
                  onChange={(e) => setMaintenanceNotes(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setMaintenanceBedId(null)} className="h-8 text-xs">
                  Discard
                </Button>
                <Button size="sm" onClick={handleToggleMaintenance} className="h-8 text-xs">
                  Update Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
