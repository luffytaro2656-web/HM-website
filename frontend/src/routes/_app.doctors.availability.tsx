import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { AvailabilityCalendar } from "@/components/modules/doctors/AvailabilityCalendar";

export const Route = createFileRoute("/_app/doctors/availability")({
  head: () => ({ meta: [{ title: "Doctor Availability & Schedules — HMS" }] }),
  component: DoctorAvailabilityPage,
});

function DoctorAvailabilityPage() {
  return (
    <div>
      <PageHeader
        title="Availability Calendar"
        description="View and schedule weekly consulting availability and hospital duty shifts for clinical doctors."
      />
      <div className="px-6 pb-6">
        <AvailabilityCalendar />
      </div>
    </div>
  );
}
