import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HOSPITALS } from "@/mocks/hospitals";
import { DOCTORS } from "@/mocks/doctors";
import { PATIENTS } from "@/mocks/patients";
import { addAppointment } from "@/mocks/appointments";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CalendarDays, Clock, ShieldCheck, ArrowLeft, User, Hospital, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_app/appointments/booking")({
  head: () => ({ meta: [{ title: "Book Appointment — HMS" }] }),
  component: AppointmentBookingPage,
});

function AppointmentBookingPage() {
  const navigate = useNavigate();
  const [selectedHospitalId, setSelectedHospitalId] = useState("H1");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("P00001");
  const [appointmentType, setAppointmentType] = useState<"OPD" | "Emergency" | "Follow-up">("OPD");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeSlot, setTimeSlot] = useState("10:00 AM");
  const [notes, setNotes] = useState("");

  const filteredDoctors = DOCTORS.filter((d) => d.hospitalId === selectedHospitalId);

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM"
  ];

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDoctorId) {
      toast.error("Please select a physician");
      return;
    }

    if (!date) {
      toast.error("Please select a date");
      return;
    }

    const doctor = DOCTORS.find((d) => d.id === selectedDoctorId);
    
    // Construct ISO DateTime
    const dateStr = date.toISOString().split("T")[0];
    // Convert 10:00 AM to 10:00:00.000Z
    const [time, modifier] = timeSlot.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    const isoString = `${dateStr}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00.000Z`;

    addAppointment({
      patientId: selectedPatientId,
      doctorId: selectedDoctorId,
      hospitalId: selectedHospitalId,
      dateTime: isoString,
      type: appointmentType,
      status: "Confirmed",
      notes: notes || `Scheduled booking via appointment panel.`
    });

    toast.success("Appointment booked successfully!", {
      description: `Confirmed with Dr. ${doctor?.name} for ${date.toLocaleDateString()} at ${timeSlot}. Notification sent.`,
    });

    navigate({ to: "/appointments" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/appointments" })} className="h-8 text-xs">
          <ArrowLeft className="size-3.5 mr-1" />
          Back to Overview
        </Button>
      </div>

      <PageHeader
        title="Schedule Appointment"
        description="Book general consults, specialty checks, or follow-ups for patients."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="text-base">Booking Details</CardTitle>
              <CardDescription>Fill out the fields below to dispatch a confirmed clinical slot.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBookAppointment} className="space-y-4">
                {/* Hospital Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold flex items-center gap-1">
                      <Hospital className="size-3.5 text-muted-foreground" />
                      Facility / Hospital
                    </Label>
                    <Select value={selectedHospitalId} onValueChange={(v) => {
                      setSelectedHospitalId(v);
                      setSelectedDoctorId(""); // Reset doctor selection
                    }}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select Hospital" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOSPITALS.map((h) => (
                          <SelectItem key={h.id} value={h.id}>
                            {h.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Patient Selection */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold flex items-center gap-1">
                      <User className="size-3.5 text-muted-foreground" />
                      Patient Profile
                    </Label>
                    <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select Patient" />
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
                </div>

                {/* Doctor Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Attending Doctor</Label>
                    <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select Attending Physician" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {filteredDoctors.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            Dr. {d.name} ({d.specialization})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Triage / Type */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Triage Tier / Type</Label>
                    <Select value={appointmentType} onValueChange={(v: any) => setAppointmentType(v)}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPD">OPD (Outpatient Department)</SelectItem>
                        <SelectItem value="Emergency">Emergency Intake</SelectItem>
                        <SelectItem value="Follow-up">Regular Follow-up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Date and Time selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 flex flex-col">
                    <Label className="text-xs font-semibold mb-1">Appointment Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal text-xs h-9",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
                          {date ? date.toLocaleDateString() : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-popover" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Available Time Slot</Label>
                    <Select value={timeSlot} onValueChange={setTimeSlot}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Consultation Notes (Optional)</Label>
                  <Textarea
                    placeholder="Enter patient chief complaint, referral requests or checkup notes..."
                    className="text-xs min-h-[80px]"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => navigate({ to: "/appointments" })}>
                    Discard
                  </Button>
                  <Button type="submit" size="sm">
                    Book & Confirm Slot
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Info sidebar */}
        <div className="space-y-6">
          <Card className="border border-border bg-accent/10">
            <CardHeader>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary" />
                Scheduling Policies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <p>
                <strong>Double Booking Protection:</strong> Clinicians are flagged automatically if slots overlap on the same day.
              </p>
              <p>
                <strong>Auto Notification:</strong> Confirmations and reschedule links are instantly dispatched to the patient's registered details via Twilio and SMTP.
              </p>
              <p>
                <strong>Cancellation Policy:</strong> Patients can cancel up to 2 hours prior to start time without penalty.
              </p>
            </CardContent>
          </Card>

          {selectedDoctorId && (
            <Card className="border border-border">
              <CardHeader className="p-4">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="size-4 text-primary" />
                  Attending Doctor Check
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-xs">
                {(() => {
                  const doc = DOCTORS.find((d) => d.id === selectedDoctorId);
                  return (
                    <div className="space-y-2">
                      <div className="font-semibold text-sm">Dr. {doc?.name}</div>
                      <div className="text-muted-foreground">{doc?.specialization}</div>
                      <div className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full w-fit">
                        Hospital: {HOSPITALS.find((h) => h.id === doc?.hospitalId)?.name}
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
