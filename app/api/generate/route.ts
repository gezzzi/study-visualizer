import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { themes } from "@/lib/themes";
import { GenerateRequest } from "@/lib/types";
import { buildPrompt } from "@/lib/prompts";
import { supabase, STORAGE_BUCKET } from "@/lib/supabase";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateRequest;
    const { content, themeId, imageSize } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "内容を入力してください" },
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

    const prompt = buildPrompt(content, theme, imageSize);

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

    // Save to Supabase if configured
    let publicUrl: string | undefined;
    if (supabase) {
      try {
        const buffer = Buffer.from(base64, "base64");
        const now = new Date();
        const datePath = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
        const fileId = crypto.randomUUID();
        const storagePath = `${datePath}/${fileId}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(storagePath, buffer, {
            contentType: mimeType,
            upsert: false,
          });

        if (uploadError) {
          console.error("Supabase upload error:", uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(storagePath);
          publicUrl = urlData.publicUrl;

          await supabase.from("images").insert({
            prompt: content,
            theme_id: themeId,
            image_size: imageSize || "1:1",
            storage_path: storagePath,
            public_url: publicUrl,
            file_size_bytes: buffer.length,
          });
        }
      } catch (storageError) {
        console.error("Storage save error:", storageError);
      }
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
