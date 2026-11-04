import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { getPublicCv } from "@/lib/public-cv";
import { fullName } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const cv = await getPublicCv();
  const name = fullName(cv);
  return {
    title: { default: `${name}, ${cv.profile.title}`, template: `%s | ${name}` },
    description: cv.profile.tagline,
    openGraph: { title: name, description: cv.profile.tagline, type: "profile" },
  };
}

export const viewport: Viewport = { themeColor: "#06070d" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${geist.variable} ${geistMono.variable} ${bricolage.variable} h-full`}>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
