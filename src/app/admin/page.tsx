import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AdminEditor } from "@/components/admin/editor";
import { isAdmin } from "@/lib/server-auth";
import { readCv, readMessages } from "@/lib/store";

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
  const [cv, messages] = await Promise.all([readCv(), readMessages()]);
  return <AdminEditor initialCv={cv} initialMessages={messages} />;
}
