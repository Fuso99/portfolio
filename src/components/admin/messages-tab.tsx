"use client";

import { Inbox, Mail, RefreshCw, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button, buttonClass } from "@/components/ui/primitives";
import type { ContactMessage } from "@/lib/schema";
import { Panel } from "./content-tabs";

export function MessagesTab({ messages, setMessages }: { messages: ContactMessage[]; setMessages: (m: ContactMessage[]) => void }) {
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    const res = await fetch("/api/admin/messages").catch(() => null);
    setLoading(false);
    if (!res?.ok) return toast.error("Messaggi non aggiornati", { description: "Controlla la connessione o accedi di nuovo." });
    setMessages(await res.json());
  }

  async function remove(id: string) {
    if (!window.confirm("Eliminare definitivamente questo messaggio?")) return;
    const res = await fetch(`/api/admin/messages?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => null);
    if (!res?.ok) return toast.error("Messaggio non eliminato");
    setMessages(messages.filter((m) => m.id !== id));
    toast.success("Messaggio eliminato");
  }

  return (
    <Panel
      title="Messaggi"
      lead="Ciò che arriva dal modulo contatti del sito."
      action={
        <Button size="sm" variant="ghost" onClick={refresh} disabled={loading}>
          <RefreshCw className={loading ? "size-3.5 animate-spin" : "size-3.5"} /> Aggiorna
        </Button>
      }
    >
      {messages.length === 0 ? (
        <div className="grid place-items-center rounded-xl border border-dashed border-line-strong py-16 text-center">
          <Inbox className="size-8 text-faint" aria-hidden />
          <p className="mt-3 text-ink">Nessun messaggio</p>
          <p className="mt-1 text-sm text-muted">I messaggi inviati dal modulo contatti compariranno qui.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li key={m.id} className="rounded-xl border border-line bg-white/[0.02] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink">
                    {m.name} <span className="font-normal text-muted">&lt;{m.email}&gt;</span>
                  </p>
                  <p className="text-xs text-faint">
                    {new Date(m.createdAt).toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <div className="flex gap-1">
                  <a
                    href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "il tuo messaggio"}`)}`}
                    className={buttonClass("quiet", "sm")}
                  >
                    <Mail className="size-3.5" /> Rispondi
                  </a>
                  <Button size="sm" variant="danger" onClick={() => remove(m.id)} aria-label="Elimina messaggio">
                    <Trash className="size-3.5" />
                  </Button>
                </div>
              </div>
              {m.subject ? <p className="mt-3 text-sm font-medium text-ink">{m.subject}</p> : null}
              <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-muted">{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
