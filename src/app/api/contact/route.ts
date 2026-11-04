import { contactSchema } from "@/lib/schema";
import { addMessage } from "@/lib/store";
import { clientIp, rateLimit } from "@/lib/server-auth";

export async function POST(req: Request) {
  if (!rateLimit(`contact:${clientIp(req)}`, 5, 10 * 60_000)) {
    return Response.json({ error: "Hai inviato troppi messaggi. Riprova tra qualche minuto." }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Controlla i campi del modulo.", issues: parsed.error.issues }, { status: 400 });
  }
  const { website, ...message } = parsed.data;
  // Honeypot filled: pretend success so bots learn nothing.
  if (website) return Response.json({ ok: true });
  await addMessage(message);
  return Response.json({ ok: true });
}
