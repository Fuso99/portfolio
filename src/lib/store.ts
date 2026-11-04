import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { cvSchema, type ContactMessage, type Cv } from "./schema";

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const CV_FILE = path.join(DATA_DIR, "cv-data.json");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");
const BACKUP_DIR = path.join(DATA_DIR, "backups");
const MAX_BACKUPS = 20;

async function writeAtomic(file: string, content: string) {
  const tmp = `${file}.${randomUUID()}.tmp`;
  await fs.writeFile(tmp, content, "utf8");
  await fs.rename(tmp, file);
}

export async function readCv(): Promise<Cv> {
  const raw = await fs.readFile(CV_FILE, "utf8");
  return cvSchema.parse(JSON.parse(raw));
}

/** Validates, keeps a timestamped backup of the previous version, then saves. */
export async function writeCv(input: unknown): Promise<Cv> {
  const cv = cvSchema.parse(input);
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

export async function readMessages(): Promise<ContactMessage[]> {
  try {
    return JSON.parse(await fs.readFile(MESSAGES_FILE, "utf8")) as ContactMessage[];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

// Serialises read-modify-write cycles on messages.json within this process.
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

export function addMessage(msg: Omit<ContactMessage, "id" | "createdAt">) {
  return serial(async () => {
    const messages = await readMessages();
    const entry: ContactMessage = { ...msg, id: randomUUID(), createdAt: new Date().toISOString() };
    messages.unshift(entry);
    await fs.mkdir(DATA_DIR, { recursive: true });
    await writeAtomic(MESSAGES_FILE, JSON.stringify(messages.slice(0, 1000), null, 2));
    return entry;
  });
}

export function deleteMessage(id: string) {
  return serial(async () => {
    const messages = await readMessages();
    const next = messages.filter((m) => m.id !== id);
    await writeAtomic(MESSAGES_FILE, JSON.stringify(next, null, 2));
    return messages.length !== next.length;
  });
}
