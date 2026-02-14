"use client";

import { useState, useRef, useEffect } from "react";
import { StoredImage } from "@/lib/types";

interface EditDialogProps {
  image: StoredImage;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditDialog({ image, onClose, onSaved }: EditDialogProps) {
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultMimeType, setResultMimeType] = useState("image/png");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleEdit = async () => {
    if (!instruction.trim()) return;
    setLoading(true);
    setError(null);
    setResultImage(null);
    try {
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storagePath: image.storage_path,
          instruction: instruction.trim(),
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "編集に失敗しました");
        return;
      }
      setResultImage(result.image);
      setResultMimeType(result.mimeType || "image/png");
      onSaved();
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-5 py-3 dark:border-gray-700">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            画像を編集
          </h3>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Images: original and result side by side */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">元画像</p>
              <img
                src={image.public_url}
                alt="元画像"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
              />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">編集結果</p>
              {loading ? (
                <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                  <div className="text-center">
                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-gray-600 dark:border-t-gray-100" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">編集中...</p>
                  </div>
                </div>
              ) : resultImage ? (
                <img
                  src={`data:${resultMimeType};base64,${resultImage}`}
                  alt="編集結果"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-900">
                  <p className="px-4 text-center text-xs text-gray-400 dark:text-gray-500">
                    編集指示を入力して実行してください
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Instruction input */}
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
              編集指示
            </label>
            <textarea
              ref={inputRef}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="例: 背景の色を青に変えてください、文字をもっと大きくしてください"
              rows={3}
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm leading-relaxed focus:border-gray-500 focus:outline-none disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-gray-400"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleEdit();
                }
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Ctrl+Enter で実行
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              閉じる
            </button>
            <button
              onClick={handleEdit}
              disabled={loading || !instruction.trim()}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
            >
              {loading ? "編集中..." : "編集を実行"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
