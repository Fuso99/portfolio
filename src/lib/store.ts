import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { cvSchema, normalizeCv, type CvSource } from "./schema";

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const CV_FILE = path.join(DATA_DIR, "cv-data.json");
const BACKUP_DIR = path.join(DATA_DIR, "backups");
const MAX_BACKUPS = 20;

async function writeAtomic(file: string, content: string) {
  const tmp = `${file}.${randomUUID()}.tmp`;
  await fs.writeFile(tmp, content, "utf8");
  await fs.rename(tmp, file);
}

export async function readCv(): Promise<CvSource> {
  const raw = await fs.readFile(CV_FILE, "utf8");
  return cvSchema.parse(normalizeCv(JSON.parse(raw)));
}

/** Validates, keeps a timestamped backup of the previous version, then saves. */
export async function writeCv(input: unknown): Promise<CvSource> {
  const cv = cvSchema.parse(normalizeCv(input));
  cv.meta.updatedAt = new Date().toISOString();

  await fs.mkdir(BACKUP_DIR, { recursive: true });
  try {
    const previous = await fs.readFile(CV_FILE, "utf8");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    await fs.writeFile(path.join(BACKUP_DIR, `cv-${stamp}.json`), previous, "utf8");
    const backups = (await fs.readdir(BACKUP_DIR)).filter((f) => f.startsWith("cv-")).sort();
    await Promise.all(
      backups.slice(0, Math.max(0, backups.length - MAX_BACKUPS)).map((f) => fs.unlink(path.join(BACKUP_DIR, f))),
    );
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }

  await writeAtomic(CV_FILE, JSON.stringify(cv, null, 2) + "\n");
  return cv;
}
