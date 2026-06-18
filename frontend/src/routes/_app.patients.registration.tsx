import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { RegistrationForm } from "@/components/modules/patients/RegistrationForm";

export const Route = createFileRoute("/_app/patients/registration")({
  head: () => ({ meta: [{ title: "Patient Registration — HMS" }] }),
  component: PatientRegistrationPage,
});

function PatientRegistrationPage() {
  return (
    <div>
      <PageHeader
        title="Patient Registration"
        description="Register a new patient and automatically generate their unique hospital identification (UHID) badge."
      />
      <div className="px-6 pb-6">
        <RegistrationForm />
      </div>
    </div>
  );
}
