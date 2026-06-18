import React, { useState } from "react";
import { Stethoscope, Calendar, Clock, CheckCircle, AlertCircle, RefreshCw, Edit2 } from "lucide-react";
import { DOCTORS } from "@/mocks/doctors";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Mock weekly schedule template
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface DaySchedule {
  day: string;
  hours: string;
  status: "Available" | "Unavailable" | "On Call";
  slotsFilled: number;
}

export function AvailabilityCalendar() {
  const [selectedDoctorId, setSelectedDoctorId] = useState(DOCTORS[0]?.id ?? "");
  const selectedDoctor = DOCTORS.find((d) => d.id === selectedDoctorId);

  // Maintain schedule state in memory for interactive editing
  const [schedules, setSchedules] = useState<Record<string, DaySchedule[]>>({});
  const [editingDay, setEditingDay] = useState<DaySchedule | null>(null);
  const [editHours, setEditHours] = useState("");
  const [editStatus, setEditStatus] = useState<"Available" | "Unavailable" | "On Call">("Available");

  const doctorSchedule = selectedDoctor
    ? schedules[selectedDoctor.id] ||
      DAYS_OF_WEEK.map((day, idx) => ({
        day,
        hours: idx >= 5 ? "Weekend - Off" : selectedDoctor.scheduleToday,
        status: idx >= 5 ? "Unavailable" : ("Available" as const),
        slotsFilled: idx >= 5 ? 0 : (idx * 3 + 2) % 12,
      }))
    : [];

  const handleStatusToggle = (dayName: string) => {
    if (!selectedDoctor) return;
    const current = schedules[selectedDoctor.id] || doctorSchedule;
    const updated = current.map((s) => {
      if (s.day === dayName) {
        const nextStatus: "Available" | "Unavailable" | "On Call" =
          s.status === "Available"
            ? "Unavailable"
            : s.status === "Unavailable"
            ? "On Call"
            : "Available";
        return {
          ...s,
          status: nextStatus,
          hours: nextStatus === "Unavailable" ? "Off" : selectedDoctor.scheduleToday,
        };
      }
      return s;
    });

    setSchedules((prev) => ({ ...prev, [selectedDoctor.id]: updated }));
    toast.success(`Updated availability for ${dayName}`);
  };

  const openEditDialog = (day: DaySchedule) => {
    setEditingDay(day);
    setEditHours(day.hours);
    setEditStatus(day.status);
  };

  const saveDayEdit = () => {
    if (!selectedDoctor || !editingDay) return;
    const current = schedules[selectedDoctor.id] || doctorSchedule;
    const updated = current.map((s) => {
      if (s.day === editingDay.day) {
        return { ...s, hours: editHours, status: editStatus };
      }
      return s;
    });

    setSchedules((prev) => ({ ...prev, [selectedDoctor.id]: updated }));
    setEditingDay(null);
    toast.success(`Successfully saved hours for ${editingDay.day}`);
  };

  if (!selectedDoctor) return null;

  return (
    <div className="space-y-6">
      {/* Selector & Demographic Details */}
      <Card className="shadow-sm border-sidebar-border bg-card">
        <CardHeader className="pb-3 border-b border-sidebar-border">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Calendar className="size-5 text-primary" />
                Schedule & Availability Planner
              </CardTitle>
              <CardDescription>Configure physician weekly availability and clinical slots.</CardDescription>
            </div>
            <div className="w-full sm:w-72">
              <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Choose Doctor" />
                </SelectTrigger>
                <SelectContent>
                  {DOCTORS.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} ({d.specialization})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Physician</p>
              <p className="font-semibold text-foreground mt-0.5">{selectedDoctor.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Primary Specialization</p>
              <p className="font-semibold text-foreground mt-0.5">{selectedDoctor.specialization}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">General Status</p>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 px-2 py-0.5 rounded-full ${
                selectedDoctor.status === "On Duty" 
                  ? "bg-success/10 text-success-foreground" 
                  : selectedDoctor.status === "Off Duty" 
                  ? "bg-muted text-muted-foreground" 
                  : "bg-danger/10 text-danger"
              }`}>
                {selectedDoctor.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Contact</p>
              <p className="font-mono font-medium text-foreground mt-0.5">{selectedDoctor.contact}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
        {doctorSchedule.map((s) => (
          <Card key={s.day} className={`shadow-sm transition-all duration-150 border-sidebar-border ${
            s.status === "Available" 
              ? "bg-success/5 border-success/20 hover:border-success/35" 
              : s.status === "On Call" 
              ? "bg-primary/5 border-primary/20 hover:border-primary/35" 
              : "bg-muted/10 border-muted-foreground/10 hover:border-muted-foreground/20"
          }`}>
            <CardContent className="p-4 flex flex-col justify-between h-[180px]">
              <div>
                <p className="text-xs font-bold text-foreground border-b pb-1 mb-2">{s.day}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  {s.status === "Available" ? (
                    <CheckCircle className="size-4 text-success" />
                  ) : s.status === "On Call" ? (
                    <Clock className="size-4 text-primary" />
                  ) : (
                    <AlertCircle className="size-4 text-muted-foreground" />
                  )}
                  <span className="text-xs font-semibold">{s.status}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                  <Clock className="size-3 shrink-0" />
                  <span className="truncate">{s.hours}</span>
                </p>
              </div>
              <div className="space-y-1.5">
                {s.status !== "Unavailable" && (
                  <p className="text-[10px] text-muted-foreground bg-background border px-2 py-0.5 rounded text-center">
                    {s.slotsFilled} Active Slots
                  </p>
                )}
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" className="w-full text-[10px] h-6 py-0 px-1" onClick={() => handleStatusToggle(s.day)}>
                    Toggle
                  </Button>
                  <Button size="sm" variant="outline" className="w-full text-[10px] h-6 py-0 px-1" onClick={() => openEditDialog(s)}>
                    <Edit2 className="size-2.5 mr-0.5" /> Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Slots dialog */}
      {editingDay && (
        <Dialog open={true} onOpenChange={() => setEditingDay(null)}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Edit Schedule: {editingDay.day}</DialogTitle>
              <DialogDescription>
                Customize hours and availability status override.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="status">Availability Status</Label>
                <Select value={editStatus} onValueChange={(v: any) => setEditStatus(v)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="On Call">On Call</SelectItem>
                    <SelectItem value="Unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="hours">Shift/Consultation Hours</Label>
                <Input id="hours" value={editHours} onChange={(e) => setEditHours(e.target.value)} placeholder="e.g. 09:00 - 13:00" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingDay(null)}>Cancel</Button>
              <Button onClick={saveDayEdit}>Save Schedule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
