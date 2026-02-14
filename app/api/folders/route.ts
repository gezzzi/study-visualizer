import { NextRequest, NextResponse } from "next/server";
import { getDb, saveDb, generateId } from "@/lib/local-db";

export async function GET() {
  try {
    const db = getDb();

    const countMap: Record<string, number> = {};
    for (const img of db.images) {
      if (img.folder_id) {
        countMap[img.folder_id] = (countMap[img.folder_id] || 0) + 1;
      }
    }

    const foldersWithCounts = db.folders
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((f) => ({
        ...f,
        image_count: countMap[f.id] || 0,
      }));

    return NextResponse.json({ folders: foldersWithCounts });
  } catch (error) {
    console.error("Folders fetch error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { name } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json(
      { error: "フォルダ名を入力してください" },
      { status: 400 }
    );
  }

  try {
    const db = getDb();
    const folder = {
      id: generateId(),
      name: name.trim(),
      created_at: new Date().toISOString(),
    };
    db.folders.push(folder);
    saveDb(db);
    return NextResponse.json({ folder: { ...folder, image_count: 0 } });
  } catch (error) {
    console.error("Folder create error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const { id, name } = await request.json();
  if (!id || !name?.trim()) {
    return NextResponse.json(
      { error: "id とフォルダ名は必須です" },
      { status: 400 }
    );
  }

  try {
    const db = getDb();
    const folder = db.folders.find((f) => f.id === id);
    if (!folder) {
      return NextResponse.json(
        { error: "フォルダが見つかりません" },
        { status: 404 }
      );
    }
    folder.name = name.trim();
    saveDb(db);
    return NextResponse.json({ folder });
  } catch (error) {
    console.error("Folder rename error:", error);
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
    const folderIndex = db.folders.findIndex((f) => f.id === id);
    if (folderIndex === -1) {
      return NextResponse.json(
        { error: "フォルダが見つかりません" },
        { status: 404 }
      );
    }

    // Move images in this folder to uncategorized
    for (const img of db.images) {
      if (img.folder_id === id) {
        img.folder_id = null;
      }
    }

    db.folders.splice(folderIndex, 1);
    saveDb(db);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Folder delete error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
