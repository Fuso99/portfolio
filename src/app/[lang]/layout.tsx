import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Providers } from "@/components/providers";
import { PersonJsonLd } from "@/components/public/person-json-ld";
import { DEFAULT_LOCALE, hasLocale, LOCALES } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";
import { getPublicCv } from "@/lib/public-cv";
import { fullName, withBase } from "@/lib/utils";
import { fontVariables } from "../fonts";
import { OG_IMAGE_SIZE } from "./og.png/route";
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
  // Search Console ownership check (repository variable in the Pages workflow).
  const googleVerification = process.env.GOOGLE_SITE_VERIFICATION;
  return {
    // Origin only (e.g. https://user.github.io): the subpath is added by withBase.
    ...(site ? { metadataBase: new URL(site) } : {}),
    title: { default: dictionaries[lang].meta.pageTitle(name), template: `%s | ${name}` },
    description: cv.profile.tagline,
    openGraph: {
      title: name,
      description: cv.profile.tagline,
      type: "profile",
      firstName: cv.profile.firstName,
      lastName: cv.profile.lastName,
      locale: lang === "it" ? "it_IT" : "en_GB",
      alternateLocale: lang === "it" ? "en_GB" : "it_IT",
      url: withBase(`/${lang}`),
      images: [{ url: withBase(`/${lang}/og.png`), ...OG_IMAGE_SIZE, alt: `${name}, ${cv.profile.title}` }],
    },
    twitter: { card: "summary_large_image", title: name, description: cv.profile.tagline },
    ...(googleVerification ? { verification: { google: googleVerification } } : {}),
    alternates: {
      canonical: withBase(`/${lang}`),
      // x-default points to a real page: "/" only redirects and is noindex.
      languages: { it: withBase("/it"), en: withBase("/en"), "x-default": withBase(`/${DEFAULT_LOCALE}`) },
    },
  };
}

export const viewport: Viewport = { themeColor: "#06070d" };

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const cv = await getPublicCv(lang);
  return (
    <html lang={lang} className={`${fontVariables} h-full`}>
      <body className="min-h-full">
        <PersonJsonLd cv={cv} lang={lang} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
