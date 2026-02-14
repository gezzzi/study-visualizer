"use client";

import { useState, useEffect, useCallback } from "react";
import { StoredImage, Folder, ThemeId } from "@/lib/types";
import { themes } from "@/lib/themes";
import FolderBar from "./FolderBar";
import FolderDialog from "./FolderDialog";
import EditDialog from "./EditDialog";

interface GalleryResponse {
  images: StoredImage[];
  total: number;
  hasMore: boolean;
}

export default function Gallery() {
  const [images, setImages] = useState<StoredImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [selectedImage, setSelectedImage] = useState<StoredImage | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Folder state
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [allTotal, setAllTotal] = useState(0);
  const [uncategorizedCount, setUncategorizedCount] = useState(0);

  // Folder dialog state
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderDialogMode, setFolderDialogMode] = useState<"create" | "rename">("create");
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

  // Selection mode state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [moveMenuOpen, setMoveMenuOpen] = useState(false);

  // Single image move (from modal)
  const [singleMoveMenuOpen, setSingleMoveMenuOpen] = useState(false);

  // Edit dialog
  const [editingImage, setEditingImage] = useState<StoredImage | null>(null);

  const fetchFolders = useCallback(async () => {
    try {
      const res = await fetch("/api/folders");
      const data = await res.json();
      setFolders(data.folders || []);
    } catch {
      console.error("Failed to fetch folders");
    }
  }, []);

  const fetchUncategorizedCount = useCallback(async () => {
    try {
      const res = await fetch("/api/images?page=1&limit=1&folder_id=none");
      const data: GalleryResponse = await res.json();
      setUncategorizedCount(data.total ?? 0);
    } catch {
      // ignore
    }
  }, []);

  const fetchAllTotal = useCallback(async () => {
    try {
      const res = await fetch("/api/images?page=1&limit=1");
      const data: GalleryResponse = await res.json();
      setAllTotal(data.total ?? 0);
    } catch {
      // ignore
    }
  }, []);

  const fetchImages = useCallback(async (pageNum: number, append = false, folderId?: string | null) => {
    setLoading(true);
    try {
      let url = `/api/images?page=${pageNum}&limit=12`;
      const effectiveId = folderId !== undefined ? folderId : activeFolderId;
      if (effectiveId === "none") {
        url += "&folder_id=none";
      } else if (effectiveId) {
        url += `&folder_id=${effectiveId}`;
      }
      const res = await fetch(url);
      const data: GalleryResponse = await res.json();
      const fetched = data.images ?? [];
      setImages(append ? (prev) => [...prev, ...fetched] : fetched);
      setTotal(data.total ?? 0);
      setHasMore(data.hasMore ?? false);
    } catch {
      console.error("Failed to fetch gallery");
    } finally {
      setLoading(false);
    }
  }, [activeFolderId]);

  const refreshAll = useCallback(() => {
    setPage(1);
    fetchImages(1);
    fetchFolders();
    fetchAllTotal();
    fetchUncategorizedCount();
  }, [fetchImages, fetchFolders, fetchAllTotal, fetchUncategorizedCount]);

  useEffect(() => {
    fetchImages(1);
    fetchFolders();
    fetchAllTotal();
    fetchUncategorizedCount();
  }, [fetchImages, fetchFolders, fetchAllTotal, fetchUncategorizedCount]);

  useEffect(() => {
    const handler = () => refreshAll();
    window.addEventListener("gallery:refresh", handler);
    return () => window.removeEventListener("gallery:refresh", handler);
  }, [refreshAll]);

  const handleFolderChange = (folderId: string | null) => {
    setActiveFolderId(folderId);
    setPage(1);
    setSelectionMode(false);
    setSelectedIds(new Set());
    fetchImages(1, false, folderId);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchImages(next, true);
  };

  // --- Folder CRUD ---
  const handleCreateFolder = async (name: string) => {
    const res = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      fetchFolders();
      setFolderDialogOpen(false);
    }
  };

  const handleRenameFolder = async (name: string) => {
    if (!editingFolder) return;
    const res = await fetch("/api/folders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingFolder.id, name }),
    });
    if (res.ok) {
      fetchFolders();
      setFolderDialogOpen(false);
      setEditingFolder(null);
    }
  };

  const handleDeleteFolder = async (folder: Folder) => {
    if (!confirm(`フォルダ「${folder.name}」を削除しますか？\n中の画像は未分類に移動されます。`)) return;
    const res = await fetch("/api/folders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: folder.id }),
    });
    if (res.ok) {
      fetchFolders();
      fetchUncategorizedCount();
      if (activeFolderId === folder.id) {
        handleFolderChange(null);
      }
    }
  };

  // --- Image actions ---
  const handleDelete = async (img: StoredImage) => {
    if (!confirm("この画像を削除しますか？")) return;
    setDeleting(img.id);
    try {
      const res = await fetch("/api/images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: img.id }),
      });
      if (res.ok) {
        setImages((prev) => prev.filter((i) => i.id !== img.id));
        setTotal((prev) => prev - 1);
        setAllTotal((prev) => prev - 1);
        if (!img.folder_id) setUncategorizedCount((prev) => prev - 1);
        if (selectedImage?.id === img.id) setSelectedImage(null);
        fetchFolders();
      }
    } catch {
      console.error("Failed to delete image");
    } finally {
      setDeleting(null);
    }
  };

  const handleMoveImages = async (targetFolderId: string | null) => {
    const ids = Array.from(selectedIds);
    const res = await fetch("/api/images/move", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageIds: ids, folderId: targetFolderId }),
    });
    if (res.ok) {
      setSelectionMode(false);
      setSelectedIds(new Set());
      setMoveMenuOpen(false);
      refreshAll();
    }
  };

  const handleSingleMove = async (img: StoredImage, targetFolderId: string | null) => {
    const res = await fetch("/api/images/move", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageIds: [img.id], folderId: targetFolderId }),
    });
    if (res.ok) {
      setSingleMoveMenuOpen(false);
      setSelectedImage(null);
      refreshAll();
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const themeName = (id: string) =>
    themes[id as ThemeId]?.name ?? id;

  if (loading && images.length === 0 && folders.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
        読み込み中...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
          過去の画像
        </h2>
        <button
          onClick={() => {
            setSelectionMode(!selectionMode);
            setSelectedIds(new Set());
            setMoveMenuOpen(false);
          }}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            selectionMode
              ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
              : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          {selectionMode ? "キャンセル" : "選択"}
        </button>
      </div>

      {/* Folder Bar */}
      <FolderBar
        folders={folders}
        activeFolderId={activeFolderId}
        onSelectFolder={handleFolderChange}
        onCreateFolder={() => {
          setFolderDialogMode("create");
          setEditingFolder(null);
          setFolderDialogOpen(true);
        }}
        onRenameFolder={(f) => {
          setEditingFolder(f);
          setFolderDialogMode("rename");
          setFolderDialogOpen(true);
        }}
        onDeleteFolder={handleDeleteFolder}
        total={allTotal}
        uncategorizedCount={uncategorizedCount}
      />

      {/* Image Grid */}
      {images.length === 0 && !loading ? (
        <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
          まだ画像がありません
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative overflow-hidden rounded-lg border border-gray-200 transition-shadow hover:shadow-md dark:border-gray-700"
            >
              <button
                onClick={() => {
                  if (selectionMode) {
                    toggleSelection(img.id);
                  } else {
                    setSelectedImage(img);
                  }
                }}
                className="w-full text-left"
              >
                <img
                  src={img.public_url}
                  alt={img.prompt.slice(0, 50)}
                  className="aspect-square w-full object-cover"
                  loading="lazy"
                />
                <div className="p-2">
                  <p className="truncate text-xs text-gray-600 dark:text-gray-400">
                    {img.prompt.slice(0, 40)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {themeName(img.theme_id)} / {img.image_size}
                  </p>
                </div>
              </button>

              {/* Selection checkbox */}
              {selectionMode && (
                <div
                  className={`absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded border-2 pointer-events-none ${
                    selectedIds.has(img.id)
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-white bg-black/30"
                  }`}
                >
                  {selectedIds.has(img.id) && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              )}

              {/* Delete button on card */}
              {!selectionMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(img);
                  }}
                  disabled={deleting === img.id}
                  className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100 disabled:opacity-50"
                  title="削除"
                >
                  {deleting === img.id ? (
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {loading ? "読み込み中..." : "もっと見る"}
        </button>
      )}

      {/* Selection action bar */}
      {selectionMode && selectedIds.size > 0 && (
        <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {selectedIds.size}枚選択中
          </span>
          <div className="relative">
            <button
              onClick={() => setMoveMenuOpen(!moveMenuOpen)}
              className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
            >
              フォルダに移動
            </button>
            {moveMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <button
                  onClick={() => handleMoveImages(null)}
                  className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  未分類に移動
                </button>
                {folders.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleMoveImages(f.id)}
                    className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setSelectionMode(false);
              setSelectedIds(new Set());
              setMoveMenuOpen(false);
            }}
            className="rounded-lg px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            キャンセル
          </button>
        </div>
      )}

      {/* Image detail modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => { setSelectedImage(null); setSingleMoveMenuOpen(false); }}
        >
          <div
            className="max-h-[90vh] max-w-2xl overflow-auto rounded-xl bg-white p-4 shadow-xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.public_url}
              alt={selectedImage.prompt.slice(0, 50)}
              className="w-full rounded-lg"
            />
            <div className="mt-3 space-y-1">
              <p className="text-sm text-gray-700 dark:text-gray-300">{selectedImage.prompt}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {themeName(selectedImage.theme_id)} /{" "}
                {selectedImage.image_size} /{" "}
                {new Date(selectedImage.created_at).toLocaleString("ja-JP")}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(selectedImage.public_url);
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      const ext = selectedImage.public_url.split(".").pop() || "png";
                      const link = document.createElement("a");
                      link.download = `study-memo-${selectedImage.id}.${ext}`;
                      link.href = url;
                      link.style.display = "none";
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      setTimeout(() => URL.revokeObjectURL(url), 1000);
                    } catch {
                      window.open(selectedImage.public_url, "_blank");
                    }
                  }}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  ダウンロード
                </button>
                <button
                  onClick={() => {
                    setEditingImage(selectedImage);
                    setSelectedImage(null);
                    setSingleMoveMenuOpen(false);
                  }}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  編集
                </button>
                <div className="relative">
                  <button
                    onClick={() => setSingleMoveMenuOpen(!singleMoveMenuOpen)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    フォルダに移動
                  </button>
                  {singleMoveMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-2 min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                      <button
                        onClick={() => handleSingleMove(selectedImage, null)}
                        className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          !selectedImage.folder_id
                            ? "font-bold text-gray-900 dark:text-gray-100"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        未分類
                      </button>
                      {folders.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => handleSingleMove(selectedImage, f.id)}
                          className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            selectedImage.folder_id === f.id
                              ? "font-bold text-gray-900 dark:text-gray-100"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(selectedImage)}
                  disabled={deleting === selectedImage.id}
                  className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                >
                  {deleting === selectedImage.id ? "削除中..." : "削除"}
                </button>
              </div>
            </div>
            <button
              onClick={() => { setSelectedImage(null); setSingleMoveMenuOpen(false); }}
              className="mt-3 w-full rounded-lg bg-gray-100 py-2 text-sm text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* Folder dialog */}
      <FolderDialog
        open={folderDialogOpen}
        mode={folderDialogMode}
        initialName={editingFolder?.name || ""}
        onSubmit={folderDialogMode === "create" ? handleCreateFolder : handleRenameFolder}
        onClose={() => {
          setFolderDialogOpen(false);
          setEditingFolder(null);
        }}
      />

      {/* Edit dialog */}
      {editingImage && (
        <EditDialog
          image={editingImage}
          onClose={() => setEditingImage(null)}
          onSaved={() => refreshAll()}
        />
      )}
    </div>
  );
}
