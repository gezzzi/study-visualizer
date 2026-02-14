import fs from "fs";
import path from "path";
import { StoredImage, Folder } from "./types";

export interface DbSchema {
  images: StoredImage[];
  folders: Folder[];
}

const DB_PATH = path.join(process.cwd(), "data", "db.json");

export function getDb(): DbSchema {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const empty: DbSchema = { images: [], folders: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(empty, null, 2));
    return empty;
  }
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw) as DbSchema;
}

export function saveDb(db: DbSchema): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function generateId(): string {
  return crypto.randomUUID();
}

export const UPLOADS_DIR = path.join(process.cwd(), "data", "uploads");
