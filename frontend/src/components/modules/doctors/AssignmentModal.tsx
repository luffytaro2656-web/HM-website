import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserPlus, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DOCTORS } from "@/mocks/doctors";
import { PATIENTS } from "@/mocks/patients";
import { toast } from "sonner";
import type { Patient } from "@/types/patient";
import type { Doctor } from "@/types/doctor";

interface AssignmentModalProps {
  initialDoctor?: Doctor;
  initialPatient?: Patient;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

const assignmentSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  doctorId: z.string().min(1, "Please select a doctor"),
  role: z.enum(["Primary Care", "Consulting Specialist", "On-Call Consultant", "Attending Physician", "Surgery Lead"] as const),
  notes: z.string().optional(),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

export function AssignmentModal({ initialDoctor, initialPatient, onSuccess, trigger }: AssignmentModalProps) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      patientId: initialPatient?.id ?? "",
      doctorId: initialDoctor?.id ?? "",
      role: "Primary Care",
      notes: "",
    },
  });

  const onSubmit = async (data: AssignmentFormValues) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      
      // Update patient's assigned doctor in-memory
      const patientObj = PATIENTS.find((p) => p.id === data.patientId);
      if (patientObj) {
        patientObj.doctorId = data.doctorId;
        
        // Also add a consultation log or toast update
        toast.success(`Assigned ${patientObj.name} to physician successfully!`);
      } else {
        toast.error("Selected patient could not be found");
        return;
      }

      reset();
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error("Failed to complete assignment");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <UserPlus className="mr-1.5 size-4" /> Assign Case
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clipboard className="size-5 text-primary" />
            Assign Case Assignment
          </DialogTitle>
          <DialogDescription>
            Assign or update the assigned clinical physician for a patient case.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            {/* Patient Selector */}
            <div className="space-y-1.5">
              <Label htmlFor="patientId">Patient / Case</Label>
              {initialPatient ? (
                <div className="rounded border bg-muted p-2 text-xs font-semibold text-foreground">
                  {initialPatient.name} ({initialPatient.uhid})
                </div>
              ) : (
                <Select onValueChange={(v) => setValue("patientId", v)}>
                  <SelectTrigger id="patientId">
                    <SelectValue placeholder="Select Patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {PATIENTS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.uhid})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.patientId && <p className="text-xs text-danger">{errors.patientId.message}</p>}
            </div>

            {/* Doctor Selector */}
            <div className="space-y-1.5">
              <Label htmlFor="doctorId">Assigned Doctor</Label>
              {initialDoctor ? (
                <div className="rounded border bg-muted p-2 text-xs font-semibold text-foreground">
                  {initialDoctor.name} ({initialDoctor.specialization})
                </div>
              ) : (
                <Select onValueChange={(v) => setValue("doctorId", v)}>
                  <SelectTrigger id="doctorId">
                    <SelectValue placeholder="Select Doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCTORS.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} ({d.specialization})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.doctorId && <p className="text-xs text-danger">{errors.doctorId.message}</p>}
            </div>

            {/* Care Role */}
            <div className="space-y-1.5">
              <Label htmlFor="role">Clinical Care Role</Label>
              <Select defaultValue="Primary Care" onValueChange={(v: any) => setValue("role", v)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Primary Care">Primary Care Physician</SelectItem>
                  <SelectItem value="Consulting Specialist">Consulting Specialist</SelectItem>
                  <SelectItem value="On-Call Consultant">On-Call Consultant</SelectItem>
                  <SelectItem value="Attending Physician">Attending Physician</SelectItem>
                  <SelectItem value="Surgery Lead">Surgery Lead</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-xs text-danger">{errors.role.message}</p>}
            </div>

            {/* Assignment Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes">Case Notes / Admission Directive</Label>
              <Textarea id="notes" placeholder="Enter diagnostic instructions, clinical handoff reasons, or emergency notes..." {...register("notes")} />
              {errors.notes && <p className="text-xs text-danger">{errors.notes.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Assigning..." : "Assign Case"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
