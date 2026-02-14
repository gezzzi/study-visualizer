import fs from "fs";
import path from "path";
import { StoredImage, Folder } from "./types";
import { genreList } from "./genres";

export interface DbSchema {
  images: StoredImage[];
  folders: Folder[];
}

const DB_PATH = path.join(process.cwd(), "data", "db.json");

function ensureGenreFolders(db: DbSchema): void {
  const existingIds = new Set(db.folders.map((f) => f.id));
  for (const genre of genreList) {
    if (genre.folderId && !existingIds.has(genre.folderId)) {
      db.folders.push({
        id: genre.folderId,
        name: genre.name,
        created_at: new Date().toISOString(),
      });
    }
  }
}

function migrateImages(db: DbSchema): void {
  for (const img of db.images) {
    // Migrate old folder_id to folder_ids
    if (!Array.isArray(img.folder_ids)) {
      const oldId = (img as any).folder_id;
      img.folder_ids = oldId ? [oldId] : [];
      delete (img as any).folder_id;
    }
  }
}

export function getDb(): DbSchema {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const empty: DbSchema = { images: [], folders: [] };
    ensureGenreFolders(empty);
    fs.writeFileSync(DB_PATH, JSON.stringify(empty, null, 2));
    return empty;
  }
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  const db = JSON.parse(raw) as DbSchema;
  migrateImages(db);
  ensureGenreFolders(db);
  return db;
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
