import { NextRequest, NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/local-db";

export async function PATCH(request: NextRequest) {
  const { imageIds, folderId } = await request.json();
  if (!Array.isArray(imageIds) || imageIds.length === 0) {
    return NextResponse.json(
      { error: "imageIds は必須です" },
      { status: 400 }
    );
  }

  try {
    const db = getDb();
    const idSet = new Set(imageIds);
    for (const img of db.images) {
      if (idSet.has(img.id)) {
        img.folder_id = folderId ?? null;
      }
    }
    saveDb(db);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Move images error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
