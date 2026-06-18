import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { addVital } from "@/mocks/patients";
import { toast } from "sonner";
import type { Patient } from "@/types/patient";

interface VitalsDialogProps {
  patient: Patient;
  onSuccess?: () => void;
}

const vitalsSchema = z.object({
  bp: z.string().regex(/^\d{2,3}\/\d{2,3}$/, "Blood pressure must be in format Systolic/Diastolic (e.g. 120/80)"),
  pulse: z.coerce.number().min(30, "Pulse must be at least 30").max(220, "Pulse cannot exceed 220"),
  temperature: z.coerce.number().min(90, "Temperature must be at least 90°F").max(110, "Temperature cannot exceed 110°F"),
  spo2: z.coerce.number().min(50, "SpO2 must be at least 50%").max(100, "SpO2 cannot exceed 100%"),
  nursingNotes: z.string().optional(),
});

type VitalsFormValues = z.infer<typeof vitalsSchema>;

export function VitalsDialog({ patient, onSuccess }: VitalsDialogProps) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VitalsFormValues>({
    resolver: zodResolver(vitalsSchema),
    defaultValues: {
      bp: "120/80",
      pulse: 72,
      temperature: 98.6,
      spo2: 98,
      nursingNotes: "",
    },
  });

  const onSubmit = async (data: VitalsFormValues) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      addVital({
        patientId: patient.id,
        date: new Date().toISOString(),
        bp: data.bp,
        pulse: data.pulse,
        temperature: data.temperature,
        spo2: data.spo2,
        nursingNotes: data.nursingNotes ?? "",
      });
      toast.success("Vitals and nursing log added successfully");
      reset();
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error("Failed to save vitals");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="mr-1.5 size-4" /> Add Vitals & Notes
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HeartPulse className="size-5 text-primary" />
            Add Vitals & Nursing Notes
          </DialogTitle>
          <DialogDescription>
            Record new vitals measurements and nursing progress notes for {patient.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="bp">Blood Pressure (mmHg)</Label>
                <Input id="bp" placeholder="e.g. 120/80" {...register("bp")} />
                {errors.bp && <p className="text-xs text-danger">{errors.bp.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pulse">Heart Rate (bpm)</Label>
                <Input id="pulse" type="number" placeholder="e.g. 72" {...register("pulse")} />
                {errors.pulse && <p className="text-xs text-danger">{errors.pulse.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="temperature">Temperature (°F)</Label>
                <Input id="temperature" type="number" step="0.1" placeholder="e.g. 98.6" {...register("temperature")} />
                {errors.temperature && <p className="text-xs text-danger">{errors.temperature.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="spo2">Oxygen Saturation (SpO2 %)</Label>
                <Input id="spo2" type="number" placeholder="e.g. 98" {...register("spo2")} />
                {errors.spo2 && <p className="text-xs text-danger">{errors.spo2.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nursingNotes">Nursing Notes</Label>
              <Textarea id="nursingNotes" placeholder="Enter patient general status, complaints, or comfort level..." {...register("nursingNotes")} />
              {errors.nursingNotes && <p className="text-xs text-danger">{errors.nursingNotes.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Vitals"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
