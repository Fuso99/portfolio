import type { Metadata } from "next";
import { buttonClass } from "@/components/ui/primitives";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = { title: "404" };

/** Unmatched URLs. Several root layouts exist (/[lang], /admin), so this page brings its own <html>. */
export default function GlobalNotFound() {
  return (
    <html lang="it" className={`${fontVariables} h-full`}>
      <body className="grid min-h-full place-items-center px-5">
        <main className="max-w-md text-center">
          <p className="font-mono text-sm text-ion">404</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">Pagina non trovata</h1>
          <p className="mt-1 text-lg text-muted" lang="en">
            Page not found
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <a href="/it" className={buttonClass("primary")}>
              Vai al sito
            </a>
            <a href="/en" lang="en" className={buttonClass("ghost")}>
              Go to the site
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
