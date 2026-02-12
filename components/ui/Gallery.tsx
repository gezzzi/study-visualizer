"use client";

import { useState, useEffect, useCallback } from "react";
import { StoredImage, ThemeId } from "@/lib/types";
import { themes } from "@/lib/themes";

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

  const fetchImages = useCallback(async (pageNum: number, append = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/images?page=${pageNum}&limit=12`);
      const data: GalleryResponse = await res.json();
      setImages(append ? (prev) => [...prev, ...data.images] : data.images);
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch {
      console.error("Failed to fetch gallery");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages(1);
  }, [fetchImages]);

  useEffect(() => {
    const handler = () => {
      setPage(1);
      fetchImages(1);
    };
    window.addEventListener("gallery:refresh", handler);
    return () => window.removeEventListener("gallery:refresh", handler);
  }, [fetchImages]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchImages(next, true);
  };

  const themeName = (id: string) =>
    themes[id as ThemeId]?.name ?? id;

  if (loading && images.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-400">
        読み込み中...
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-400">
        まだ画像がありません
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-base font-bold text-gray-900">
        過去の画像 ({total})
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img) => (
          <button
            key={img.id}
            onClick={() => setSelectedImage(img)}
            className="group overflow-hidden rounded-lg border border-gray-200 text-left transition-shadow hover:shadow-md"
          >
            <img
              src={img.public_url}
              alt={img.prompt.slice(0, 50)}
              className="aspect-square w-full object-cover"
              loading="lazy"
            />
            <div className="p-2">
              <p className="truncate text-xs text-gray-600">
                {img.prompt.slice(0, 40)}
              </p>
              <p className="text-xs text-gray-400">
                {themeName(img.theme_id)} / {img.image_size}
              </p>
            </div>
          </button>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? "読み込み中..." : "もっと見る"}
        </button>
      )}

      {/* Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="max-h-[90vh] max-w-2xl overflow-auto rounded-xl bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.public_url}
              alt={selectedImage.prompt.slice(0, 50)}
              className="w-full rounded-lg"
            />
            <div className="mt-3 space-y-1">
              <p className="text-sm text-gray-700">{selectedImage.prompt}</p>
              <p className="text-xs text-gray-400">
                {themeName(selectedImage.theme_id)} /{" "}
                {selectedImage.image_size} /{" "}
                {new Date(selectedImage.created_at).toLocaleString("ja-JP")}
              </p>
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
                className="mt-2 inline-block rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                ダウンロード
              </button>
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="mt-3 w-full rounded-lg bg-gray-100 py-2 text-sm text-gray-600 hover:bg-gray-200"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
