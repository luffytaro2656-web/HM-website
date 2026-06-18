import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PATIENTS } from "@/mocks/patients";
import { DOCTORS } from "@/mocks/doctors";
import { ADMISSIONS, BEDS, dischargePatient } from "@/mocks/admissions";
import { toast } from "sonner";
import { ClipboardList, Printer, CheckCircle, ShieldAlert, Heart, Calendar, BadgeAlert, FileSpreadsheet } from "lucide-react";

interface DischargeFormProps {
  onSuccess?: () => void;
}

export function DischargeForm({ onSuccess }: DischargeFormProps) {
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [dischargeNotes, setDischargeNotes] = useState("");
  const [billingStatus, setBillingStatus] = useState<"Pending" | "Cleared">("Pending");
  const [medications, setMedications] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  // Print summary preview state
  const [summaryRecord, setSummaryRecord] = useState<any | null>(null);

  // Active inpatients
  const inpatients = PATIENTS.filter((p) => p.status === "Inpatient");

  // Get active admission record for selected patient
  const activeAdmission = ADMISSIONS.find(
    (a) => a.patientId === selectedPatientId && !a.dischargeDate
  );

  const patientDetails = PATIENTS.find((p) => p.id === selectedPatientId);
  const doctorDetails = activeAdmission ? DOCTORS.find((d) => d.id === activeAdmission.doctorId) : null;
  const bedDetails = activeAdmission ? BEDS.find((b) => b.id === activeAdmission.bedId) : null;

  // Length of stay calculation
  const getLengthOfStay = (startDateIso: string) => {
    const start = new Date(startDateIso);
    const end = new Date();
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const handleDischarge = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatientId) {
      toast.error("Please select an inpatient to discharge");
      return;
    }

    const fullNotes = `
Outcome: ${dischargeNotes}
Prescribed Medications: ${medications || "None"}
Follow-up Schedule: ${followUpDate ? `Scheduled for ${followUpDate}` : "PRN (As required)"}
    `.trim();

    const record = dischargePatient(selectedPatientId, fullNotes, billingStatus);

    if (record) {
      toast.success("Patient Discharged!", {
        description: `Admission record closed. Bed ${record.bedId} has been vacated. Billing audit: ${billingStatus}.`,
      });

      // Save summary record context for printable preview
      setSummaryRecord({
        ...record,
        patientName: patientDetails?.name,
        patientAge: patientDetails?.age,
        patientGender: patientDetails?.gender,
        patientUhid: patientDetails?.id,
        doctorName: doctorDetails?.name,
        doctorSpecialization: doctorDetails?.specialization,
        wardName: bedDetails?.ward,
        bedNumber: bedDetails?.id,
        duration: getLengthOfStay(record.admissionDate),
        medications,
        followUpDate
      });

      // Clear selection
      setSelectedPatientId("");
      setDischargeNotes("");
      setMedications("");
      setFollowUpDate("");

      if (onSuccess) onSuccess();
    } else {
      toast.error("Error processing discharge.");
    }
  };

  const printSummary = () => {
    const printContent = document.getElementById("discharge-summary-printable");
    if (!printContent) return;
    
    const windowUrl = "about:blank";
    const uniqueName = new Date().getTime();
    const printWindow = window.open(windowUrl, `_blank`, `left=100,top=100,width=800,height=900`);
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Discharge Summary Report</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
              .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { margin: 0; color: #1e3a8a; font-size: 24px; }
              .header p { margin: 5px 0 0 0; font-size: 12px; color: #666; }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
              .section { border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; background: #f9fafb; }
              .section h3 { margin-top: 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; color: #1f2937; }
              .row { display: flex; justify-content: justify; margin: 6px 0; font-size: 13px; }
              .label { font-weight: bold; color: #4b5563; min-width: 150px; }
              .value { color: #111827; }
              .footer { text-align: center; margin-top: 50px; font-size: 11px; color: #888; border-top: 1px solid #e5e7eb; padding-top: 20px; }
              .notes { white-space: pre-wrap; font-size: 13px; line-height: 1.5; color: #374151; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Discharge Form & Admissions Detail */}
      <div className="lg:col-span-7 space-y-4">
        <Card className="border border-border">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <ClipboardList className="size-5 text-primary" />
              Active Inpatient Discharge Form
            </CardTitle>
            <CardDescription className="text-xs">
              Complete discharge notes, request clinical clearance, and trigger billing team.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleDischarge} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Select Admitted Patient</Label>
                <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select active inpatient..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {inpatients.length > 0 ? (
                      inpatients.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.id}) — Bed: {p.bed || "N/A"}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No active inpatients currently registered
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {activeAdmission && (
                <div className="bg-accent/20 border border-border rounded-xl p-4 space-y-3 animate-fadeIn">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider">
                    Admission Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Date of Admission</span>
                      <span className="font-semibold">
                        {new Date(activeAdmission.admissionDate).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Length of Stay</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        {getLengthOfStay(activeAdmission.admissionDate)} Day(s)
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Assigned Physician</span>
                      <span className="font-semibold">Dr. {doctorDetails?.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Bed Location</span>
                      <span className="font-semibold">
                        Bed {bedDetails?.id} ({bedDetails?.ward})
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Discharge Diagnosis & Condition</Label>
                <Textarea
                  required
                  placeholder="Summarize the diagnosis details, clinical course, condition on discharge..."
                  className="text-xs min-h-[80px]"
                  value={dischargeNotes}
                  onChange={(e) => setDischargeNotes(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Medications & Prescriptions on Discharge</Label>
                <Textarea
                  placeholder="e.g. Paracetamol 500mg TDS, Amoxicillin 250mg BD..."
                  className="text-xs min-h-[60px]"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Follow-up Consult Date (Optional)</Label>
                  <Input
                    type="date"
                    className="text-xs h-9"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Billing Clearance Path</Label>
                  <Select value={billingStatus} onValueChange={(v: any) => setBillingStatus(v)}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Request Audit (Triggers Billing Team)</SelectItem>
                      <SelectItem value="Cleared">Auto-Approve (VIP / Insurance Pre-Clear)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full text-xs" disabled={!selectedPatientId}>
                  Finalize Discharge Workflow
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Printable Preview of the summary */}
      <div className="lg:col-span-5 space-y-4">
        {summaryRecord ? (
          <Card className="border border-border relative overflow-hidden animate-fadeIn">
            <CardHeader className="p-4 pb-2 bg-primary/5 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                    <Printer className="size-4 text-primary" />
                    Summary Generated
                  </CardTitle>
                  <CardDescription className="text-[10px]">
                    Click print to output the hardcopy summary certificate.
                  </CardDescription>
                </div>
                <Button size="sm" onClick={printSummary} className="h-8 text-xs gap-1.5">
                  <Printer className="size-3.5" />
                  Print Summary
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {/* This is the printable target container */}
              <div id="discharge-summary-printable" className="p-3 bg-white text-slate-800 rounded-lg border border-slate-200">
                <div className="header text-center border-b border-primary/20 pb-3 mb-3">
                  <h1 className="text-base font-bold text-slate-900 tracking-wide uppercase">
                    Hospital Management System (HMS)
                  </h1>
                  <p className="text-[9px] text-slate-500 font-medium">
                    Admission & Discharge Clinical Summary Certificate
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Patient Info */}
                  <div className="border border-slate-200 rounded-md p-2 bg-slate-50/50">
                    <h3 className="font-bold text-slate-700 text-[10px] uppercase border-b border-slate-200 pb-1 mb-1.5">
                      I. Patient Registration Profile
                    </h3>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      <div><strong className="text-slate-500">Name:</strong> {summaryRecord.patientName}</div>
                      <div><strong className="text-slate-500">UHID ID:</strong> {summaryRecord.patientUhid}</div>
                      <div><strong className="text-slate-500">Age/Gender:</strong> {summaryRecord.patientAge} Yrs / {summaryRecord.patientGender}</div>
                      <div><strong className="text-slate-500">Admitting Ward:</strong> {summaryRecord.wardName} - {summaryRecord.bedNumber}</div>
                    </div>
                  </div>

                  {/* Stay Info */}
                  <div className="border border-slate-200 rounded-md p-2 bg-slate-50/50">
                    <h3 className="font-bold text-slate-700 text-[10px] uppercase border-b border-slate-200 pb-1 mb-1.5">
                      II. Admission Details
                    </h3>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      <div><strong className="text-slate-500">Date Admitted:</strong> {new Date(summaryRecord.admissionDate).toLocaleString()}</div>
                      <div><strong className="text-slate-500">Date Discharged:</strong> {new Date(summaryRecord.dischargeDate).toLocaleString()}</div>
                      <div><strong className="text-slate-500">Total Duration:</strong> {summaryRecord.duration} Day(s)</div>
                      <div><strong className="text-slate-500">Attending Doctor:</strong> Dr. {summaryRecord.doctorName} ({summaryRecord.doctorSpecialization})</div>
                    </div>
                  </div>

                  {/* Notes Info */}
                  <div className="border border-slate-200 rounded-md p-2 bg-slate-50/50">
                    <h3 className="font-bold text-slate-700 text-[10px] uppercase border-b border-slate-200 pb-1 mb-1.5">
                      III. Treatment Outcome & Discharge Plan
                    </h3>
                    <div className="text-[10px] notes">
                      {summaryRecord.dischargeNotes}
                    </div>
                  </div>

                  {/* Billing Clearance */}
                  <div className="border border-slate-200 rounded-md p-2 bg-slate-50/50">
                    <h3 className="font-bold text-slate-700 text-[10px] uppercase border-b border-slate-200 pb-1 mb-1.5">
                      IV. Financial & Clearance Auditing
                    </h3>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      <div><strong className="text-slate-500">Total Accrued:</strong> ₹{summaryRecord.totalBillAmount.toLocaleString()}</div>
                      <div>
                        <strong className="text-slate-500">Billing Clear:</strong>{" "}
                        <span className={`font-bold ${summaryRecord.billingStatus === "Cleared" ? "text-emerald-600" : "text-amber-600"}`}>
                          {summaryRecord.billingStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="footer text-center border-t border-slate-200 pt-3 mt-4 text-[8px] text-slate-400">
                  This summary certificate has been digitally signed by Dr. {summaryRecord.doctorName} and verified by HMS.
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-dashed border-border flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-[350px]">
            <Printer className="size-10 text-muted-foreground/30 mb-2" />
            <p className="text-xs font-semibold">No Discharge Summary Loaded</p>
            <p className="text-[10px] max-w-[200px] mt-1">
              Select an inpatient and click Discharge to generate the printable clinical certificate here.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
