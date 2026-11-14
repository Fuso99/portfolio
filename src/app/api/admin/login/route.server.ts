import { cookies } from "next/headers";
import { z } from "zod";
import { createSessionToken, isAuthConfigured, SESSION_COOKIE, SESSION_TTL_SECONDS } from "@/lib/auth";
import { checkPassword, clientIp, rateLimit } from "@/lib/server-auth";

const body = z.object({ password: z.string().min(1).max(200) });

export async function POST(req: Request) {
  if (!isAuthConfigured()) {
    return Response.json(
      { error: "Accesso non configurato: imposta ADMIN_PASSWORD e AUTH_SECRET (32+ caratteri) in .env.local." },
      { status: 503 },
    );
  }
  if (!rateLimit(`login:${clientIp(req)}`, 8, 15 * 60_000)) {
    return Response.json({ error: "Troppi tentativi. Riprova tra 15 minuti." }, { status: 429 });
  }
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success || !checkPassword(parsed.data.password)) {
    return Response.json({ error: "Password errata." }, { status: 401 });
  }
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return Response.json({ ok: true });
}
