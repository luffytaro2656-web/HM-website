import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { StaffForm } from "@/components/modules/staff/StaffForm";
import { ArrowLeft, UserPlus } from "lucide-react";

export const Route = createFileRoute("/_app/staff/create")({
  head: () => ({ meta: [{ title: "Register Staff Profile — HMS" }] }),
  component: StaffCreatePage,
});

function StaffCreatePage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.navigate({ to: "/staff" });
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <Link to="/staff" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-3" /> Back to Staff Directory
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <UserPlus className="size-6 text-primary" />
          Enroll Staff Profile
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Add new clinic staff, register employment details, and create system login accounts.
        </p>
      </div>

      <StaffForm onSuccess={handleSuccess} />
    </div>
  );
}
