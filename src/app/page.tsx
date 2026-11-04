import { MeshBackground } from "@/components/background/mesh-background";
import { Navbar } from "@/components/public/navbar";
import { PortfolioSections } from "@/components/public/portfolio";
import { getPublicCv } from "@/lib/public-cv";

export default async function Home() {
  const cv = await getPublicCv();
  const initials = `${cv.profile.firstName[0] ?? ""}${cv.profile.lastName[0] ?? ""}`;
  return (
    <>
      <MeshBackground />
      <Navbar initials={initials} />
      <PortfolioSections cv={cv} />
    </>
  );
}
