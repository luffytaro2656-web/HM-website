import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PATIENTS } from "@/mocks/patients";
import { DOCTORS } from "@/mocks/doctors";
import { addAppointment } from "@/mocks/appointments";
import { toast } from "sonner";
import { UserPlus, Search } from "lucide-react";

interface WalkInDialogProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function WalkInDialog({ onSuccess, trigger }: WalkInDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  
  // New patient temporary fields if patient not found
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAge, setNewAge] = useState("");
  const [newGender, setNewGender] = useState<"Male" | "Female" | "Other">("Male");

  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [appointmentType, setAppointmentType] = useState<"OPD" | "Emergency" | "Follow-up">("OPD");
  const [notes, setNotes] = useState("");

  const filteredPatients = searchQuery
    ? PATIENTS.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.phone.includes(searchQuery) ||
          p.id.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setIsNewPatient(false);
    setSearchQuery("");
  };

  const handleRegisterWalkIn = (e: React.FormEvent) => {
    e.preventDefault();

    let finalPatientId = selectedPatientId;

    if (isNewPatient) {
      if (!newName || !newPhone || !newAge) {
        toast.error("Please fill in all new patient fields");
        return;
      }
      // Create a temporary mock patient id
      finalPatientId = `P-TEMP-${Date.now()}`;
      // In a real app we'd push to PATIENTS list
      PATIENTS.push({
        id: finalPatientId,
        uhid: `UHID-${Date.now().toString().slice(-6)}`,
        name: newName,
        phone: newPhone,
        age: parseInt(newAge, 10),
        gender: newGender,
        bloodGroup: "O+",
        email: `${newName.toLowerCase().replace(/\s+/g, "")}@walkin.com`,
        hospitalId: DOCTORS.find(d => d.id === selectedDoctorId)?.hospitalId || "H1",
        doctorId: selectedDoctorId,
        status: "Outpatient",
        lastVisit: new Date().toISOString()
      });
    }

    if (!finalPatientId) {
      toast.error("Please select a patient or fill in new patient details");
      return;
    }

    if (!selectedDoctorId) {
      toast.error("Please select an available doctor");
      return;
    }

    const doctor = DOCTORS.find((d) => d.id === selectedDoctorId);
    
    // Create appointment
    const newApt = addAppointment({
      patientId: finalPatientId,
      doctorId: selectedDoctorId,
      hospitalId: doctor?.hospitalId || "H1",
      dateTime: new Date().toISOString(),
      type: appointmentType,
      status: "Confirmed",
      notes: notes || `Walk-in registration. ${isNewPatient ? "New Patient created." : ""}`
    });

    const queueToken = `${appointmentType}-${newApt.id.slice(-3)}`;

    toast.success(`Walk-in appointment created! Queue Token: ${queueToken}`, {
      description: `Assigned to Dr. ${doctor?.name || "Physician"}. SMS/email notification dispatched.`,
      duration: 5000,
    });

    // Reset form states
    setSelectedPatientId("");
    setSelectedDoctorId("");
    setAppointmentType("OPD");
    setNotes("");
    setIsNewPatient(false);
    setNewName("");
    setNewPhone("");
    setNewAge("");
    setOpen(false);

    if (onSuccess) onSuccess();
  };

  const selectedPatient = PATIENTS.find((p) => p.id === selectedPatientId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" className="gap-2">
            <UserPlus className="size-4" />
            Walk-in Registration
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md md:max-w-lg bg-card text-card-foreground border border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Walk-in & Queue Intake</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleRegisterWalkIn} className="space-y-4 py-3">
          {/* Patient lookup or registration selection */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patient Selection</Label>
            
            {!selectedPatientId && !isNewPatient && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by Patient Name, Phone or ID..."
                    className="pl-9 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {searchQuery && (
                  <div className="border border-border rounded-lg max-h-[160px] overflow-y-auto divide-y divide-border bg-popover text-popover-foreground shadow-md">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectPatient(p.id)}
                          className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground text-xs flex justify-between items-center"
                        >
                          <div>
                            <span className="font-medium">{p.name}</span>
                            <span className="text-[10px] text-muted-foreground block">{p.phone} | {p.id}</span>
                          </div>
                          <span className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{p.gender}, {p.age} yrs</span>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs text-muted-foreground">
                        No matches found.
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">Or register a new walk-in patient:</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsNewPatient(true)}
                    className="h-7 text-xs gap-1"
                  >
                    <UserPlus className="size-3.5" />
                    New Patient Intake
                  </Button>
                </div>
              </div>
            )}

            {selectedPatientId && selectedPatient && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30 border border-accent/50">
                <div>
                  <p className="text-sm font-semibold">{selectedPatient.name}</p>
                  <p className="text-[11px] text-muted-foreground">{selectedPatient.id} | {selectedPatient.phone}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPatientId("")}
                  className="text-xs text-destructive hover:bg-destructive/10"
                >
                  Change
                </Button>
              </div>
            )}

            {isNewPatient && (
              <div className="p-4 rounded-lg border border-border bg-accent/10 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-1.5 mb-1">
                  <span className="text-xs font-semibold">New Patient Intake Details</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsNewPatient(false)}
                    className="h-6 text-[10px] text-muted-foreground"
                  >
                    Cancel / Search
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="wp-name" className="text-xs">Full Name</Label>
                    <Input id="wp-name" size={20} className="h-8 text-xs" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. John Doe" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="wp-phone" className="text-xs">Phone Number</Label>
                    <Input id="wp-phone" className="h-8 text-xs" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="e.g. +91 9876543210" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="wp-age" className="text-xs">Age</Label>
                    <Input id="wp-age" type="number" className="h-8 text-xs" value={newAge} onChange={(e) => setNewAge(e.target.value)} placeholder="e.g. 35" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="wp-gender" className="text-xs">Gender</Label>
                    <Select value={newGender} onValueChange={(v: any) => setNewGender(v)}>
                      <SelectTrigger id="wp-gender" className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Allocation details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Assign Department / Doctor</Label>
              <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Doctor..." />
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
              <Label className="text-xs font-medium">Triage Priority</Label>
              <Select value={appointmentType} onValueChange={(v: any) => setAppointmentType(v)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPD">OPD (Routine)</SelectItem>
                  <SelectItem value="Emergency">Emergency (High Priority)</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Admission Reason / Chief Complaint</Label>
            <Input
              placeholder="e.g. Severe headache, persistent cough, joint swelling..."
              className="text-xs"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Discard
            </Button>
            <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
              Book & Queue Patient
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
