import { deleteMessage, readMessages } from "@/lib/store";
import { isAdmin, unauthorized } from "@/lib/server-auth";

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  return Response.json(await readMessages());
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) return unauthorized();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ error: "id mancante" }, { status: 400 });
  const removed = await deleteMessage(id);
  return removed ? Response.json({ ok: true }) : Response.json({ error: "Messaggio non trovato." }, { status: 404 });
}
