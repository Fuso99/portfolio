import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Providers } from "@/components/providers";
import { hasLocale, LOCALES } from "@/i18n/config";
import { getPublicCv } from "@/lib/public-cv";
import { fullName, withBase } from "@/lib/utils";
import { fontVariables } from "../fonts";
import "../globals.css";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const cv = await getPublicCv(lang);
  const name = fullName(cv);
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  return {
    // Origin only (e.g. https://user.github.io): the subpath is added by withBase.
    ...(site ? { metadataBase: new URL(site) } : {}),
    title: { default: `${name}, ${cv.profile.title}`, template: `%s | ${name}` },
    description: cv.profile.tagline,
    openGraph: { title: name, description: cv.profile.tagline, type: "profile", locale: lang === "it" ? "it_IT" : "en_GB" },
    alternates: {
      canonical: withBase(`/${lang}`),
      languages: { it: withBase("/it"), en: withBase("/en"), "x-default": withBase("/") },
    },
  };
}

export const viewport: Viewport = { themeColor: "#06070d" };

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <html lang={lang} className={`${fontVariables} h-full`}>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
