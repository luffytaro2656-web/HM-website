import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DOCTORS } from "@/mocks/doctors";
import { addConsultationLog } from "@/mocks/patients";
import { toast } from "sonner";
import type { Patient } from "@/types/patient";

interface ConsultationLogDialogProps {
  patient: Patient;
  onSuccess?: () => void;
}

const logSchema = z.object({
  doctorId: z.string().min(1, "Doctor selection is required"),
  symptoms: z.string().min(3, "Symptoms description must be at least 3 characters"),
  diagnosis: z.string().min(3, "Diagnosis must be at least 3 characters"),
  notes: z.string().optional(),
});

type LogFormValues = z.infer<typeof logSchema>;

export function ConsultationLogDialog({ patient, onSuccess }: ConsultationLogDialogProps) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LogFormValues>({
    resolver: zodResolver(logSchema),
    defaultValues: {
      doctorId: patient.doctorId,
      symptoms: "",
      diagnosis: "",
      notes: "",
    },
  });

  const onSubmit = async (data: LogFormValues) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      addConsultationLog({
        patientId: patient.id,
        doctorId: data.doctorId,
        date: new Date().toISOString(),
        symptoms: data.symptoms,
        diagnosis: data.diagnosis,
        notes: data.notes ?? "",
      });
      toast.success("Consultation log added successfully");
      reset();
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error("Failed to save consultation log");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 size-4" /> Add Consultation Log
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Consultation Log</DialogTitle>
          <DialogDescription>
            Record diagnostic details for patient {patient.name} ({patient.uhid}).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="doctorId">Consulting Doctor</Label>
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
              <Label htmlFor="symptoms">Symptoms</Label>
              <Input id="symptoms" placeholder="e.g. Mild headache, congestion, chest congestion" {...register("symptoms")} />
              {errors.symptoms && <p className="text-xs text-danger">{errors.symptoms.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Input id="diagnosis" placeholder="e.g. Acute bronchitis, common cold" {...register("diagnosis")} />
              {errors.diagnosis && <p className="text-xs text-danger">{errors.diagnosis.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Clinical Notes</Label>
              <Textarea id="notes" placeholder="Enter patient advice, rest durations, precautions..." {...register("notes")} />
              {errors.notes && <p className="text-xs text-danger">{errors.notes.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Log"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
