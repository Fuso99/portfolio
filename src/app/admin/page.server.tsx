import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminEditor } from "@/components/admin/editor";
import { isAdmin } from "@/lib/server-auth";
import { readCv } from "@/lib/store";

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="grid h-dvh place-items-center text-sm text-muted">Caricamento del backoffice</div>}>
      <AdminLoader />
    </Suspense>
  );
}

async function AdminLoader() {
  // The proxy only does an optimistic check; verify the session here too.
  if (!(await isAdmin())) redirect("/admin/login");
  return <AdminEditor initialCv={await readCv()} />;
}
