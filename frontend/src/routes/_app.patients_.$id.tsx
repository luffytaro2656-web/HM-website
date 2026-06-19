import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, User, HeartPulse, Stethoscope, Pill, Receipt } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPatient } from "@/mocks/patients";
import { PatientDetailsCard } from "@/components/modules/patients/PatientDetailsCard";
import { VitalsTracker } from "@/components/modules/patients/VitalsTracker";
import { VitalsDialog } from "@/components/modules/patients/VitalsDialog";
import { ConsultationLogTimeline } from "@/components/modules/patients/ConsultationLogTimeline";
import { ConsultationLogDialog } from "@/components/modules/patients/ConsultationLogDialog";
import { PrescriptionList } from "@/components/modules/patients/PrescriptionList";
import { PrescriptionDialog } from "@/components/modules/patients/PrescriptionDialog";
import { PatientBillingList } from "@/components/modules/patients/PatientBillingList";

export const Route = createFileRoute("/_app/patients_/$id")({
  head: ({ params }) => {
    const patient = getPatient(params.id);
    return {
      meta: [{ title: `${patient ? patient.name : "Patient Not Found"} — Profile — HMS` }],
    };
  },
  component: PatientDetailPage,
});

function PatientDetailPage() {
  const { id } = Route.useParams();
  const patient = getPatient(id);

  // States to trigger re-renders of list components when new entries are added
  const [vitalsKey, setVitalsKey] = useState(0);
  const [logsKey, setLogsKey] = useState(0);
  const [rxKey, setRxKey] = useState(0);

  if (!patient) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-danger">Patient Not Found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The patient with ID {id} does not exist or has been removed.</p>
        <Link to="/patients" className="mt-4 inline-block">
          <Button variant="outline"><ChevronLeft className="mr-1 size-4" /> Back to Patients</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={patient.name}
        description={`Patient profile management portal for UHID: ${patient.uhid}`}
        actions={
          <Link to="/patients">
            <Button variant="outline" size="sm">
              <ChevronLeft className="mr-1.5 size-4" /> Back to Directory
            </Button>
          </Link>
        }
      />

      <div className="pb-6 space-y-6">
        {/* Basic Info Demographic Card */}
        <PatientDetailsCard patient={patient} />

        {/* Tabbed Detailed View */}
        <Tabs defaultValue="vitals" className="w-full">
          <TabsList className="flex w-full overflow-x-auto justify-start md:grid md:grid-cols-4 max-w-2xl border bg-muted/30 no-scrollbar h-auto md:h-9 p-1 gap-1 md:gap-0">
            <TabsTrigger value="vitals" className="flex shrink-0 items-center gap-1.5 text-xs sm:text-sm py-1.5 md:py-1">
              <HeartPulse className="size-3.5" />
              <span>Vitals & Nursing</span>
            </TabsTrigger>
            <TabsTrigger value="consultations" className="flex shrink-0 items-center gap-1.5 text-xs sm:text-sm py-1.5 md:py-1">
              <Stethoscope className="size-3.5" />
              <span>Consultation Logs</span>
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="flex shrink-0 items-center gap-1.5 text-xs sm:text-sm py-1.5 md:py-1">
              <Pill className="size-3.5" />
              <span>Prescriptions</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex shrink-0 items-center gap-1.5 text-xs sm:text-sm py-1.5 md:py-1">
              <Receipt className="size-3.5" />
              <span>Billing History</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Vitals & Nursing */}
          <TabsContent value="vitals" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Clinical Vitals History</h3>
              <VitalsDialog patient={patient} onSuccess={() => setVitalsKey(k => k + 1)} />
            </div>
            <VitalsTracker patient={patient} key={vitalsKey} />
          </TabsContent>

          {/* Tab 2: Consultation Logs */}
          <TabsContent value="consultations" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Doctor Consultation Log History</h3>
              <ConsultationLogDialog patient={patient} onSuccess={() => setLogsKey(k => k + 1)} />
            </div>
            <ConsultationLogTimeline patient={patient} key={logsKey} />
          </TabsContent>

          {/* Tab 3: Prescriptions */}
          <TabsContent value="prescriptions" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Medications & Prescriptions</h3>
              <PrescriptionDialog patient={patient} onSuccess={() => setRxKey(k => k + 1)} />
            </div>
            <PrescriptionList patient={patient} key={rxKey} />
          </TabsContent>

          {/* Tab 4: Billing History */}
          <TabsContent value="billing" className="mt-4 space-y-4">
            <h3 className="text-base font-bold text-foreground">Patient Ledger & Invoices</h3>
            <PatientBillingList patient={patient} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
