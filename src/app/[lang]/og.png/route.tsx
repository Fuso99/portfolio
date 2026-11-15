import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { DEFAULT_LOCALE, hasLocale, LOCALES } from "@/i18n/config";
import { getPublicCv } from "@/lib/public-cv";
import { fullName } from "@/lib/utils";

/**
 * /[lang]/og.png: link preview (og:image) for LinkedIn, WhatsApp, Slack…,
 * drawn at build time from the CV in the page's language. A plain route and
 * not opengraph-image.tsx, whose file has no extension in the static export:
 * GitHub Pages would serve it as application/octet-stream.
 */
export const OG_IMAGE_SIZE = { width: 1200, height: 627 }; // LinkedIn's recommended size

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

const font = (file: string) => readFile(join(process.cwd(), "public/pdf-fonts", file));

export async function GET(_req: Request, { params }: RouteContext<"/[lang]/og.png">) {
  const { lang: raw } = await params;
  const lang = hasLocale(raw) ? raw : DEFAULT_LOCALE;
  const cv = await getPublicCv(lang);
  const p = cv.profile;
  const [display, sans, sansMedium, mono] = await Promise.all([
    font("bricolage-grotesque-latin-700-normal.woff"),
    font("geist-sans-latin-400-normal.woff"),
    font("geist-sans-latin-500-normal.woff"),
    font("geist-mono-latin-400-normal.woff"),
  ]);
  const site = `${(process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/^https?:\/\//, "")}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#06070d",
          backgroundImage:
            "radial-gradient(circle at 88% 12%, rgba(91,86,232,0.55), transparent 45%), radial-gradient(circle at 8% 100%, rgba(67,227,194,0.22), transparent 40%)",
          color: "#e6e8f2",
          fontFamily: "Geist",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "Geist Mono", fontSize: 24, color: "#9195ad" }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: "#43e3c2" }} />
          {p.location}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "Bricolage", fontSize: 96, lineHeight: 1.02, letterSpacing: -2 }}>{fullName(cv)}</div>
          <div style={{ marginTop: 20, fontSize: 44, fontWeight: 500, color: "#9a96ff" }}>{p.title}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 32 }}>
            {p.roles.slice(0, 3).map((role) => (
              <div
                key={role}
                style={{
                  padding: "8px 18px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.16)",
                  background: "rgba(255,255,255,0.04)",
                  fontSize: 24,
                }}
              >
                {role}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", fontFamily: "Geist Mono", fontSize: 24, color: "#5d6178" }}>{site ? `${site}/${lang}` : ""}</div>
      </div>
    ),
    {
      ...OG_IMAGE_SIZE,
      fonts: [
        { name: "Bricolage", data: display, weight: 700, style: "normal" },
        { name: "Geist", data: sans, weight: 400, style: "normal" },
        { name: "Geist", data: sansMedium, weight: 500, style: "normal" },
        { name: "Geist Mono", data: mono, weight: 400, style: "normal" },
      ],
    },
  );
}
