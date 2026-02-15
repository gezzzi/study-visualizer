import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { themes } from "@/lib/themes";

import { GenerateRequest } from "@/lib/types";
import { buildPrompt } from "@/lib/prompts";
import { getDb, saveDb, generateId, UPLOADS_DIR } from "@/lib/local-db";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateRequest;
    const { content, themeId, imageSize, instruction, englishLevel } = body;

    if (!content?.trim() && !body.instruction?.trim()) {
      return NextResponse.json(
        { error: "メモの内容または指示を入力してください" },
        { status: 400 }
      );
    }

    const theme = themes[themeId];
    if (!theme) {
      return NextResponse.json(
        { error: "Invalid theme ID" },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(content, theme, imageSize, instruction, englishLevel);

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: prompt,
      config: {
        responseModalities: ["IMAGE"],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    const imagePart = parts?.find((p: any) =>
      p.inlineData?.mimeType?.startsWith("image/")
    );
    if (!imagePart?.inlineData?.data) {
      return NextResponse.json(
        { error: "画像を生成できませんでした" },
        { status: 500 }
      );
    }

    const base64 = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType || "image/png";
    const ext = mimeType === "image/jpeg" ? "jpg" : mimeType === "image/webp" ? "webp" : "png";

    // Save locally
    let publicUrl: string | undefined;
    try {
      const buffer = Buffer.from(base64, "base64");
      const now = new Date();
      const datePath = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
      const fileId = generateId();
      const storagePath = `${datePath}/${fileId}.${ext}`;

      const dir = path.join(UPLOADS_DIR, datePath);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(UPLOADS_DIR, storagePath), buffer);

      publicUrl = `/api/uploads/${storagePath}`;

      const db = getDb();
      db.images.push({
        id: fileId,
        prompt: content,
        theme_id: themeId,
        image_size: imageSize || "1:1",
        storage_path: storagePath,
        public_url: publicUrl,
        file_size_bytes: buffer.length,
        folder_ids: [],
        created_at: now.toISOString(),
      });
      saveDb(db);
    } catch (storageError) {
      console.error("Local storage save error:", storageError);
    }

    return NextResponse.json({
      image: base64,
      mimeType,
      publicUrl,
    });
  } catch (error) {
    console.error("Image generation error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
