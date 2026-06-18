import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/patients")({
  component: PatientsLayout,
});

function PatientsLayout() {
  return <Outlet />;
}
