import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DOCTORS } from "@/mocks/doctors";
import { addPrescription } from "@/mocks/patients";
import { toast } from "sonner";
import type { Patient } from "@/types/patient";

interface PrescriptionDialogProps {
  patient: Patient;
  onSuccess?: () => void;
}

const prescriptionSchema = z.object({
  doctorId: z.string().min(1, "Doctor selection is required"),
  medicine: z.string().min(2, "Medicine name must be at least 2 characters"),
  dosage: z.string().min(1, "Dosage is required (e.g. 1 tab, 5ml)"),
  frequency: z.string().min(1, "Frequency is required (e.g. Twice daily)"),
  duration: z.string().min(1, "Duration is required (e.g. 5 days, 1 month)"),
  notes: z.string().optional(),
});

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;

export function PrescriptionDialog({ patient, onSuccess }: PrescriptionDialogProps) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      doctorId: patient.doctorId,
      medicine: "",
      dosage: "",
      frequency: "",
      duration: "",
      notes: "",
    },
  });

  const onSubmit = async (data: PrescriptionFormValues) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      addPrescription({
        patientId: patient.id,
        doctorId: data.doctorId,
        date: new Date().toISOString(),
        medicine: data.medicine,
        dosage: data.dosage,
        frequency: data.frequency,
        duration: data.duration,
        notes: data.notes ?? "",
      });
      toast.success("Prescription added successfully");
      reset();
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error("Failed to save prescription");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 size-4" /> Add Prescription
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="size-5 text-primary" />
            Add Prescription
          </DialogTitle>
          <DialogDescription>
            Prescribe medications for patient {patient.name} ({patient.uhid}).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="doctorId">Prescribing Doctor</Label>
              <Select defaultValue={patient.doctorId} onValueChange={(v) => setValue("doctorId", v)}>
                <SelectTrigger id="doctorId">
                  <SelectValue placeholder="Select Doctor" />
                </SelectTrigger>
                <SelectContent>
                  {DOCTORS.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name} ({d.specialization})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.doctorId && <p className="text-xs text-danger">{errors.doctorId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="medicine">Medicine Name</Label>
              <Input id="medicine" placeholder="e.g. Paracetamol 650mg, Amoxicillin 500mg" {...register("medicine")} />
              {errors.medicine && <p className="text-xs text-danger">{errors.medicine.message}</p>}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dosage">Dosage</Label>
                <Input id="dosage" placeholder="e.g. 1 tab, 5ml" {...register("dosage")} />
                {errors.dosage && <p className="text-xs text-danger">{errors.dosage.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="frequency">Frequency</Label>
                <Input id="frequency" placeholder="e.g. 3 times daily" {...register("frequency")} />
                {errors.frequency && <p className="text-xs text-danger">{errors.frequency.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" placeholder="e.g. 5 days, 1 week" {...register("duration")} />
                {errors.duration && <p className="text-xs text-danger">{errors.duration.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Instructions / Notes</Label>
              <Textarea id="notes" placeholder="e.g. Take after meals, complete the entire course..." {...register("notes")} />
              {errors.notes && <p className="text-xs text-danger">{errors.notes.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Prescribing..." : "Save Prescription"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
