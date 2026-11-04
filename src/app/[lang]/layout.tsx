import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Providers } from "@/components/providers";
import { hasLocale, LOCALES } from "@/i18n/config";
import { getPublicCv } from "@/lib/public-cv";
import { fullName } from "@/lib/utils";
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
  return {
    title: { default: `${name}, ${cv.profile.title}`, template: `%s | ${name}` },
    description: cv.profile.tagline,
    openGraph: { title: name, description: cv.profile.tagline, type: "profile", locale: lang === "it" ? "it_IT" : "en_GB" },
    alternates: {
      canonical: `/${lang}`,
      languages: { it: "/it", en: "/en", "x-default": "/" },
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
