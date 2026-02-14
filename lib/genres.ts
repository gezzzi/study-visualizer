import { Genre, GenreId } from "./types";

export const genres: Record<GenreId, Genre> = {
  general: {
    id: "general",
    name: "指定なし",
    promptDescription: "general study notes",
  },
  toeic: {
    id: "toeic",
    name: "TOEIC",
    folderId: "genre-toeic",
    promptDescription:
      "TOEIC test preparation study notes, focusing on English vocabulary, grammar, reading comprehension, and listening skills commonly tested in TOEIC",
  },
  "fe-exam": {
    id: "fe-exam",
    name: "基本情報技術者",
    folderId: "genre-fe-exam",
    promptDescription:
      "Fundamental Information Technology Engineer Examination (基本情報技術者試験) study notes, covering algorithms, programming, databases, networks, security, and system development commonly tested in the Japanese national IT certification",
  },
  takken: {
    id: "takken",
    name: "宅建",
    folderId: "genre-takken",
    promptDescription:
      "Real Estate Transaction Agent (宅地建物取引士) exam study notes, covering civil law, building standards act, urban planning law, real estate registration, and real estate transaction regulations",
  },
  denki2: {
    id: "denki2",
    name: "第二種電気工事士",
    folderId: "genre-denki2",
    promptDescription:
      "Class 2 Electrician (第二種電気工事士) exam study notes, covering electrical theory, wiring methods, electrical equipment, circuit diagrams, and electrical safety regulations",
  },
  bookkeeping: {
    id: "bookkeeping",
    name: "簿記",
    folderId: "genre-bookkeeping",
    promptDescription:
      "bookkeeping (簿記) exam study notes, covering accounting terminology, journal entries, financial statements, and double-entry bookkeeping concepts",
  },
};

export const genreList = Object.values(genres);
