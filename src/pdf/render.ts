import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import type { Cv } from "@/lib/schema";
import { filterCvBySkills, fullName } from "@/lib/utils";
import { CvDocument } from "./cv-document";

export async function renderCvPdf(cv: Cv, skillIds: string[]) {
  const { cv: filtered, selected } = filterCvBySkills(cv, skillIds);
  const generatedAt = new Date().toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  // renderToBuffer's typings expect a <Document> element; CvDocument renders one.
  const element = createElement(CvDocument, { cv: filtered, selected, generatedAt }) as unknown as Parameters<
    typeof renderToBuffer
  >[0];
  const buffer = await renderToBuffer(element);
  const slug = fullName(cv).toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const suffix = selected.length ? `-${selected.map((x) => x.id).join("-")}`.slice(0, 60) : "";
  return { buffer, filename: `cv-${slug}${suffix}.pdf` };
}

export function pdfResponse({ buffer, filename }: { buffer: Buffer; filename: string }, inline = false) {
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
