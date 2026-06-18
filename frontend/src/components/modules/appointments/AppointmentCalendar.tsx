import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/common/StatusBadge";
import { APPOINTMENTS, updateAppointmentStatus, cancelAppointment, rescheduleAppointment } from "@/mocks/appointments";
import { DOCTORS } from "@/mocks/doctors";
import { PATIENTS } from "@/mocks/patients";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { WalkInDialog } from "./WalkInDialog";
import {
  CalendarDays, Clock, User, Stethoscope, Check, X,
  RefreshCw, Send, ShieldAlert, Eye, AlertCircle, Sparkles, Plus
} from "lucide-react";
import { addAppointment } from "@/mocks/appointments";

const formatTime = (iso: string) => {
  try {
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
};


export function AppointmentCalendar() {
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<"scheduler" | "list">("scheduler");
  const [refreshKey, setRefreshKey] = useState(0);

  // Role simulation switcher (so the user can demo receptionist, doctor, patient easily)
  const [simulatedRole, setSimulatedRole] = useState<"receptionist" | "doctor" | "patient">(
    user?.role === "doctor" || user?.role === "nurse" ? "doctor" :
    user?.role === "patient" ? "patient" : "receptionist"
  );

  // Selected appointment details dialog
  const [viewAptId, setViewAptId] = useState<string | null>(null);
  
  // Reschedule temporary states
  const [rescheduleAptId, setRescheduleAptId] = useState<string | null>(null);
  const [newTime, setNewTime] = useState("10:00");
  const [newDate, setNewDate] = useState<Date>(new Date());

  // Quick Schedule states
  const [quickScheduleTime, setQuickScheduleTime] = useState<string | null>(null);
  const [quickPatientId, setQuickPatientId] = useState("P00001");
  const [quickDoctorId, setQuickDoctorId] = useState("");
  const [quickType, setQuickType] = useState<"OPD" | "Emergency" | "Follow-up">("OPD");
  const [quickNotes, setQuickNotes] = useState("");

  const forceRefresh = () => setRefreshKey((k) => k + 1);

  const handleQuickScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickScheduleTime) return;
    
    const docId = quickDoctorId || (filterDoctor !== "all" ? filterDoctor : DOCTORS[0].id);
    const doctor = DOCTORS.find(d => d.id === docId);

    const dateStr = selectedDate.toISOString().split("T")[0];
    const isoString = `${dateStr}T${quickScheduleTime}:00.000Z`;

    addAppointment({
      patientId: quickPatientId,
      doctorId: docId,
      hospitalId: doctor?.hospitalId || "H1",
      dateTime: isoString,
      type: quickType,
      status: "Confirmed",
      notes: quickNotes || "Quick scheduled via empty timeline slot."
    });

    toast.success(`Slot quick scheduled!`, {
      description: `Confirmed for ${selectedDate.toLocaleDateString()} at ${quickScheduleTime} with Dr. ${doctor?.name}.`,
    });

    setQuickScheduleTime(null);
    setQuickNotes("");
    forceRefresh();
  };

  // Filters
  const [filterDoctor, setFilterDoctor] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Filtered appointments
  const filteredAppointments = APPOINTMENTS.filter((apt) => {
    const aptDate = new Date(apt.dateTime);
    const dateMatch = aptDate >= startOfDay && aptDate <= endOfDay;
    const docMatch = filterDoctor === "all" || apt.doctorId === filterDoctor;
    const statusMatch = filterStatus === "all" || apt.status === filterStatus;
    
    // If simulated role is Patient, restrict to patient's appointments (we assume P00001 or similar)
    const patientMatch = simulatedRole !== "patient" || apt.patientId === "P00001";

    return dateMatch && docMatch && statusMatch && patientMatch;
  });

  // Schedule slots mapping
  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  const handleUpdateStatus = (id: string, status: any) => {
    updateAppointmentStatus(id, status);
    toast.success(`Appointment status updated to ${status}`);
    forceRefresh();
  };

  const handleCancel = (id: string) => {
    cancelAppointment(id);
    toast.success("Appointment successfully cancelled");
    forceRefresh();
  };

  const handleTriggerNotification = (id: string) => {
    const apt = APPOINTMENTS.find((a) => a.id === id);
    const patient = PATIENTS.find((p) => p.id === apt?.patientId);
    toast.success(`Notification Dispatched!`, {
      description: `SMS to ${patient?.phone || "registered number"} & Email to ${patient?.email || "patient inbox"} containing secure check-in PIN.`,
    });
  };

  const handleRescheduleSubmit = () => {
    if (!rescheduleAptId) return;
    const dateStr = newDate.toISOString().split("T")[0];
    const updatedIso = `${dateStr}T${newTime}:00.000Z`;

    rescheduleAppointment(rescheduleAptId, updatedIso);
    toast.success("Appointment rescheduled successfully");
    setRescheduleAptId(null);
    forceRefresh();
  };

  const selectedApt = APPOINTMENTS.find((a) => a.id === viewAptId);
  const selectedAptPatient = selectedApt ? PATIENTS.find((p) => p.id === selectedApt.patientId) : null;
  const selectedAptDoctor = selectedApt ? DOCTORS.find((d) => d.id === selectedApt.doctorId) : null;

  return (
    <div className="space-y-6" key={refreshKey}>
      {/* Simulation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20 gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary animate-pulse shrink-0" />
          <div>
            <h4 className="text-sm font-semibold">HMS Role Simulator</h4>
            <p className="text-xs text-muted-foreground">Toggle role modes below to test respective interface experiences.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs font-semibold mr-1">Active Persona:</Label>
          <Tabs value={simulatedRole} onValueChange={(v: any) => setSimulatedRole(v)} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-3 w-[300px] sm:w-[320px] h-8 p-1">
              <TabsTrigger value="receptionist" className="text-[10px] sm:text-xs">Receptionist</TabsTrigger>
              <TabsTrigger value="doctor" className="text-[10px] sm:text-xs">Doctor/Nurse</TabsTrigger>
              <TabsTrigger value="patient" className="text-[10px] sm:text-xs">Patient (P00001)</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Calendar selector, Walk-in tool, Quick stats */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <CalendarDays className="size-4 text-primary" />
                Select Operations Date
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                className="rounded-md border-0 bg-transparent"
              />
            </CardContent>
          </Card>

          {simulatedRole === "receptionist" && (
            <Card className="border border-dashed border-primary/40 bg-accent/10">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-bold">Walk-in Intake</CardTitle>
                <CardDescription className="text-xs">Instantly slot incoming general walk-ins or emergencies.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <WalkInDialog onSuccess={forceRefresh} />
              </CardContent>
            </Card>
          )}

          {/* Quick stats for active date */}
          <Card className="border border-border">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold">Active Date Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 divide-y divide-border text-xs">
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Scheduled Appointments</span>
                <span className="font-semibold">{filteredAppointments.length}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Emergency Cases</span>
                <span className="font-semibold text-destructive">
                  {filteredAppointments.filter((a) => a.type === "Emergency").length}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Confirmed / Waiting</span>
                <span className="font-semibold text-emerald-500">
                  {filteredAppointments.filter((a) => a.status === "Confirmed" || a.status === "Scheduled").length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Visual scheduler or List view */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* View selectors and search filters */}
            <div className="flex items-center gap-2">
              <Button
                variant={activeTab === "scheduler" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("scheduler")}
                className="text-xs h-8"
              >
                Scheduler Timeline
              </Button>
              <Button
                variant={activeTab === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("list")}
                className="text-xs h-8"
              >
                List Directory
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Select value={filterDoctor} onValueChange={setFilterDoctor}>
                <SelectTrigger className="w-[130px] sm:w-[150px] h-8 text-xs">
                  <SelectValue placeholder="All Doctors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {DOCTORS.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      Dr. {d.name.split(" ")[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[110px] sm:w-[120px] h-8 text-xs">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="No-show">No-show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {activeTab === "scheduler" ? (
            /* Hourly Scheduler View */
            <div className="border border-border rounded-xl bg-card overflow-hidden">
              <div className="p-4 bg-accent/20 border-b border-border">
                <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                  Timeline — {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </h3>
              </div>
              <div className="divide-y divide-border">
                {timeSlots.map((time) => {
                  const [hour, minute] = time.split(":").map(Number);
                  
                  // Find appointments falling in this hour slot
                  const slotAppointments = filteredAppointments.filter((apt) => {
                    const aptTime = new Date(apt.dateTime);
                    return aptTime.getHours() === hour;
                  });

                  return (
                    <div key={time} className="grid grid-cols-12 min-h-[70px] hover:bg-accent/5">
                      {/* Hour Indicator */}
                      <div className="col-span-2 sm:col-span-1 border-r border-border p-3 flex flex-col items-center justify-start text-[11px] font-medium text-muted-foreground">
                        <Clock className="size-3.5 mb-1 text-muted-foreground/60" />
                        <span>{time}</span>
                      </div>

                      {/* Slots Cards */}
                      <div className="col-span-10 sm:col-span-11 p-3 flex flex-wrap gap-2 items-center">
                        {slotAppointments.length > 0 ? (
                          slotAppointments.map((apt) => {
                            const patient = PATIENTS.find((p) => p.id === apt.patientId);
                            const doctor = DOCTORS.find((d) => d.id === apt.doctorId);

                            return (
                              <div
                                key={apt.id}
                                className={`flex-1 min-w-[200px] max-w-[320px] rounded-lg border p-2.5 transition-all text-left shadow-sm ${
                                  apt.type === "Emergency"
                                    ? "bg-destructive/10 border-destructive/30 hover:bg-destructive/15"
                                    : "bg-background border-border hover:shadow-md"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-1 mb-1">
                                  <span className="font-semibold text-xs truncate max-w-[120px] block">
                                    {patient?.name ?? "Walk-in Patient"}
                                  </span>
                                  <StatusBadge status={apt.status} />
                                </div>
                                <div className="text-[10px] text-muted-foreground flex flex-col gap-0.5">
                                  <span className="flex items-center gap-1">
                                    <Stethoscope className="size-3 text-muted-foreground/70" />
                                    Dr. {doctor?.name}
                                  </span>
                                  <span className="flex items-center gap-1 font-mono text-[9px] mt-0.5">
                                    <Clock className="size-2.5" />
                                    {formatTime(apt.dateTime)} | {apt.type}
                                  </span>
                                </div>

                                {/* Quick inline role-based actions */}
                                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewAptId(apt.id)}
                                    className="h-6 px-1.5 text-[9px] gap-1"
                                  >
                                    <Eye className="size-2.5" />
                                    Details
                                  </Button>

                                  {simulatedRole === "doctor" && (apt.status === "Scheduled" || apt.status === "Confirmed") && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleUpdateStatus(apt.id, "Completed")}
                                        className="h-6 px-1.5 text-[9px] text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 gap-0.5"
                                      >
                                        <Check className="size-2.5" />
                                        Complete
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleUpdateStatus(apt.id, "No-show")}
                                        className="h-6 px-1.5 text-[9px] text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 gap-0.5"
                                      >
                                        <X className="size-2.5" />
                                        No-Show
                                      </Button>
                                    </>
                                  )}

                                  {simulatedRole === "receptionist" && apt.status !== "Cancelled" && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setRescheduleAptId(apt.id);
                                          setNewDate(new Date(apt.dateTime));
                                        }}
                                        className="h-6 px-1.5 text-[9px] text-primary hover:text-primary hover:bg-primary/10 gap-0.5"
                                      >
                                        <RefreshCw className="size-2.5" />
                                        Reschedule
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleTriggerNotification(apt.id)}
                                        className="h-6 px-1.5 text-[9px] text-orange-500 hover:text-orange-600 hover:bg-orange-500/10 gap-0.5"
                                      >
                                        <Send className="size-2.5" />
                                        Notify
                                      </Button>
                                    </>
                                  )}

                                  {simulatedRole === "patient" && (apt.status === "Scheduled" || apt.status === "Confirmed") && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCancel(apt.id)}
                                      className="h-6 px-1.5 text-[9px] text-destructive hover:bg-destructive/10 gap-0.5"
                                    >
                                      <X className="size-2.5" />
                                      Cancel
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground/60 italic">No scheduled appointments</span>
                            {simulatedRole !== "patient" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 px-2 text-[9px] gap-1 hover:bg-primary/10 border-dashed"
                                onClick={() => {
                                  setQuickScheduleTime(time);
                                  setQuickDoctorId(filterDoctor !== "all" ? filterDoctor : DOCTORS[0].id);
                                }}
                              >
                                <Plus className="size-2.5" />
                                Schedule Slot
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* List View */
            <div className="border border-border rounded-xl bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-accent/20 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="p-3 pl-4">Patient</th>
                      <th className="p-3">Doctor</th>
                      <th className="p-3">Time</th>
                      <th className="p-3">Triage / Type</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map((apt) => {
                        const patient = PATIENTS.find((p) => p.id === apt.patientId);
                        const doctor = DOCTORS.find((d) => d.id === apt.doctorId);
                        
                        return (
                          <tr key={apt.id} className="hover:bg-accent/5">
                            <td className="p-3 pl-4">
                              <span className="font-semibold block">{patient?.name ?? "Walk-in Patient"}</span>
                              <span className="text-[10px] text-muted-foreground">{apt.patientId}</span>
                            </td>
                            <td className="p-3">
                              <span>Dr. {doctor?.name}</span>
                            </td>
                            <td className="p-3">
                              <span className="font-mono">{new Date(apt.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                apt.type === "Emergency" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" :
                                apt.type === "Follow-up" ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400" :
                                "bg-secondary text-secondary-foreground"
                              }`}>
                                {apt.type}
                              </span>
                            </td>
                            <td className="p-3">
                              <StatusBadge status={apt.status} />
                            </td>
                            <td className="p-3 pr-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setViewAptId(apt.id)}
                                  className="h-7 w-7 rounded-md"
                                >
                                  <Eye className="size-3.5" />
                                </Button>
                                {simulatedRole === "receptionist" && apt.status !== "Cancelled" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleCancel(apt.id)}
                                    className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-md"
                                  >
                                    <X className="size-3.5" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-muted-foreground">
                          No appointments scheduled for this date.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Appointment Details Dialog */}
      <Dialog open={!!viewAptId} onOpenChange={(open) => !open && setViewAptId(null)}>
        <DialogContent className="max-w-md bg-card text-card-foreground border border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Appointment Demographics</DialogTitle>
          </DialogHeader>

          {selectedApt && (
            <div className="space-y-4 py-2">
              <div className="flex justify-between items-start border-b border-border pb-3">
                <div>
                  <h4 className="text-base font-bold text-foreground">{selectedAptPatient?.name}</h4>
                  <p className="text-xs text-muted-foreground">UHID: {selectedAptPatient?.uhid ?? "N/A"} | ID: {selectedApt.patientId}</p>
                </div>
                <StatusBadge status={selectedApt.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-muted-foreground block">Demographics</span>
                  <span className="font-medium">{selectedAptPatient?.gender}, {selectedAptPatient?.age} Years</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-muted-foreground block">Phone Contact</span>
                  <span className="font-medium font-mono">{selectedAptPatient?.phone}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-muted-foreground block">Assigned Doctor</span>
                  <span className="font-medium">Dr. {selectedAptDoctor?.name} ({selectedAptDoctor?.specialization})</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-muted-foreground block">Schedule Time</span>
                  <span className="font-medium font-mono">
                    {new Date(selectedApt.dateTime).toLocaleDateString()} at{" "}
                    {new Date(selectedApt.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-accent/20 rounded-lg border border-border text-xs">
                <span className="font-bold flex items-center gap-1 mb-1 text-[11px] text-muted-foreground uppercase tracking-wider">
                  <AlertCircle className="size-3.5 text-primary" />
                  Chief Complaint / Clinician Notes
                </span>
                <p className="italic text-muted-foreground">
                  {selectedApt.notes || "Routine walk-in consultation without specific clinical pre-notes."}
                </p>
              </div>

              {simulatedRole === "doctor" && (selectedApt.status === "Scheduled" || selectedApt.status === "Confirmed") && (
                <div className="pt-3 border-t border-border flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleUpdateStatus(selectedApt.id, "No-show");
                      setViewAptId(null);
                    }}
                    className="text-xs h-8 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                  >
                    No-Show
                  </Button>
                  <Button
                    onClick={() => {
                      handleUpdateStatus(selectedApt.id, "Completed");
                      setViewAptId(null);
                    }}
                    className="text-xs h-8 bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Mark as Completed
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={!!rescheduleAptId} onOpenChange={(open) => !open && setRescheduleAptId(null)}>
        <DialogContent className="max-w-sm bg-card text-card-foreground border border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Reschedule Appointment</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Select New Date</Label>
              <Input
                type="date"
                className="text-xs"
                value={newDate.toISOString().split("T")[0]}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => e.target.value && setNewDate(new Date(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Select Time Slot</Label>
              <Select value={newTime} onValueChange={setNewTime}>
                <SelectTrigger className="text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((ts) => (
                    <SelectItem key={ts} value={ts}>
                      {ts} AM/PM
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" size="sm" onClick={() => setRescheduleAptId(null)}>
                Discard
              </Button>
              <Button size="sm" onClick={handleRescheduleSubmit}>
                Confirm Reschedule
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Schedule Dialog */}
      <Dialog open={!!quickScheduleTime} onOpenChange={(open) => !open && setQuickScheduleTime(null)}>
        <DialogContent className="max-w-md bg-card text-card-foreground border border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-1.5">
              <CalendarDays className="size-4 text-primary" />
              Quick Schedule Slot ({quickScheduleTime})
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleQuickScheduleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Patient</Label>
              <Select value={quickPatientId} onValueChange={setQuickPatientId}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Select Patient..." />
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
              <Label className="text-xs">Attending Doctor</Label>
              <Select value={quickDoctorId} onValueChange={setQuickDoctorId}>
                <SelectTrigger className="text-xs h-9">
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
              <Label className="text-xs">Triage Priority</Label>
              <Select value={quickType} onValueChange={(v: any) => setQuickType(v)}>
                <SelectTrigger className="text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPD">OPD (Routine)</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Chief Complaint / Notes</Label>
              <Input
                placeholder="e.g. Regular consult, checkup..."
                className="text-xs"
                value={quickNotes}
                onChange={(e) => setQuickNotes(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setQuickScheduleTime(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Confirm Booking
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
