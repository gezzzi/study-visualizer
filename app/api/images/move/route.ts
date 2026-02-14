import { NextRequest, NextResponse } from "next/server";
import { getDb, saveDb } from "@/lib/local-db";

export async function PATCH(request: NextRequest) {
  const { imageIds, folderId, action = "add" } = await request.json();
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
        if (action === "remove" && folderId) {
          img.folder_ids = img.folder_ids.filter((id) => id !== folderId);
        } else if (action === "add" && folderId) {
          if (!img.folder_ids.includes(folderId)) {
            img.folder_ids.push(folderId);
          }
        } else if (action === "clear") {
          img.folder_ids = [];
        }
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
