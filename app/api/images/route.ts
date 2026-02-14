import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getDb, saveDb, UPLOADS_DIR } from "@/lib/local-db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "12", 10);
  const offset = (page - 1) * limit;
  const folderId = searchParams.get("folder_id");

  try {
    const db = getDb();
    let filtered = db.images;

    if (folderId === "none") {
      filtered = filtered.filter((img) => img.folder_id === null);
    } else if (folderId) {
      filtered = filtered.filter((img) => img.folder_id === folderId);
    }

    filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const total = filtered.length;
    const images = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      images,
      total,
      hasMore: total > offset + limit,
    });
  } catch (error) {
    console.error("Gallery fetch error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "id は必須です" }, { status: 400 });
  }

  try {
    const db = getDb();
    const imageIndex = db.images.findIndex((img) => img.id === id);

    if (imageIndex === -1) {
      return NextResponse.json(
        { error: "画像が見つかりません" },
        { status: 404 }
      );
    }

    const image = db.images[imageIndex];

    // Delete file from disk
    const filePath = path.join(UPLOADS_DIR, image.storage_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    db.images.splice(imageIndex, 1);
    saveDb(db);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
