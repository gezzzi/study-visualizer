import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { getDb, saveDb, generateId, UPLOADS_DIR } from "@/lib/local-db";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export async function POST(request: NextRequest) {
  try {
    const { storagePath, instruction } = await request.json();

    if (!storagePath || !instruction?.trim()) {
      return NextResponse.json(
        { error: "画像と編集指示を指定してください" },
        { status: 400 }
      );
    }

    // Read the original image from local storage
    const filePath = path.join(UPLOADS_DIR, storagePath);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "元画像が見つかりません" },
        { status: 404 }
      );
    }

    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString("base64");
    const ext = path.extname(filePath).toLowerCase();
    const inputMimeType = MIME_TYPES[ext] || "image/png";

    // Call Gemini with the image + edit instruction
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: [
        { text: instruction },
        {
          inlineData: {
            mimeType: inputMimeType,
            data: base64Image,
          },
        },
      ],
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
        { error: "画像の編集に失敗しました" },
        { status: 500 }
      );
    }

    const base64 = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType || "image/png";
    const outExt = mimeType === "image/jpeg" ? "jpg" : mimeType === "image/webp" ? "webp" : "png";

    // Save the edited image as a new file
    let publicUrl: string | undefined;
    try {
      const buffer = Buffer.from(base64, "base64");
      const now = new Date();
      const datePath = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
      const fileId = generateId();
      const newStoragePath = `${datePath}/${fileId}.${outExt}`;

      const dir = path.join(UPLOADS_DIR, datePath);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(UPLOADS_DIR, newStoragePath), buffer);

      publicUrl = `/api/uploads/${newStoragePath}`;

      // Find the original image to copy metadata
      const db = getDb();
      const original = db.images.find((img) => img.storage_path === storagePath);

      db.images.push({
        id: fileId,
        prompt: `[編集] ${instruction}`,
        theme_id: original?.theme_id || "notebook",
        image_size: original?.image_size || "1:1",
        storage_path: newStoragePath,
        public_url: publicUrl,
        file_size_bytes: buffer.length,
        folder_id: original?.folder_id || null,
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
    console.error("Image edit error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
