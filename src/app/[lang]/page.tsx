import { notFound } from "next/navigation";
import { MeshBackground } from "@/components/background/mesh-background";
import { Navbar } from "@/components/public/navbar";
import { PortfolioSections } from "@/components/public/portfolio";
import { hasLocale } from "@/i18n/config";
import { getPublicCv } from "@/lib/public-cv";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const cv = await getPublicCv(lang);
  const initials = `${cv.profile.firstName[0] ?? ""}${cv.profile.lastName[0] ?? ""}`;
  return (
    <>
      <MeshBackground />
      <Navbar cv={cv} initials={initials} lang={lang} />
      <PortfolioSections cv={cv} lang={lang} />
    </>
  );
}
