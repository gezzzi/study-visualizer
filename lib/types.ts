export type GenreId = "general" | "toeic" | "fe-exam" | "takken" | "denki2" | "bookkeeping";

export interface Genre {
  id: GenreId;
  name: string;
  promptDescription: string;
  folderId?: string;
}

export type ThemeId =
  | "notebook"
  | "blackboard"
  | "sticky"
  | "whiteboard"
  | "craft"
  | "blueprint";

export interface CardTheme {
  id: ThemeId;
  name: string;
  promptDescription: string;
}

export type ImageSize = "1:1" | "4:3" | "3:4" | "16:9" | "9:16";

export interface ImageSizeOption {
  id: ImageSize;
  name: string;
  description: string;
}

export const imageSizeOptions: ImageSizeOption[] = [
  { id: "1:1", name: "正方形", description: "Instagram / X" },
  { id: "4:3", name: "横長 4:3", description: "一般的な横長" },
  { id: "16:9", name: "横長 16:9", description: "X タイムライン / YouTube" },
  { id: "3:4", name: "縦長 3:4", description: "ポートレート" },
  { id: "9:16", name: "縦長 9:16", description: "ストーリーズ / TikTok" },
];

export interface GenerateRequest {
  content: string;
  themeId: ThemeId;
  imageSize: ImageSize;
  genreId?: GenreId;
  instruction?: string;
}

export interface GenerateResponse {
  image: string;
  mimeType: string;
  publicUrl?: string;
}

export interface GenerateErrorResponse {
  error: string;
}

export interface StoredImage {
  id: string;
  prompt: string;
  theme_id: string;
  image_size: string;
  storage_path: string;
  public_url: string;
  file_size_bytes: number | null;
  folder_ids: string[];
  created_at: string;
}

export interface Folder {
  id: string;
  name: string;
  created_at: string;
  image_count?: number;
}
