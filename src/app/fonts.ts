import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });

/** CSS variables for the three families, shared by every root layout. */
export const fontVariables = `${geist.variable} ${geistMono.variable} ${bricolage.variable}`;
