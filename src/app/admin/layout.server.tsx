import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import { fontVariables } from "../fonts";
import "../globals.css";

/** The backoffice has its own root layout: it is in Italian only, outside the /[lang] routes. */
export const metadata: Metadata = {
  title: { default: "Backoffice", template: "%s | Backoffice" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#06070d" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${fontVariables} h-full`}>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
