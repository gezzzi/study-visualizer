"use client";

import { useState } from "react";
import { ThemeId, ImageSize, GenreId } from "@/lib/types";
import GenreSelector from "@/components/ui/GenreSelector";
import ThemeSelector from "@/components/ui/ThemeSelector";
import SizeSelector from "@/components/ui/SizeSelector";
import ImagePreview from "@/components/ui/ImagePreview";
import { GenerateButton, DownloadButton } from "@/components/ui/ExportButton";

const placeholder = `例:
"break the ice" = 場の雰囲気を和ませる

直訳: 氷を割る
実際の意味: 初対面の人と打ち解ける`;

export default function Home() {
  const [content, setContent] = useState("");
  const [instruction, setInstruction] = useState("");
  const [genreId, setGenreId] = useState<GenreId>("general");
  const [themeId, setThemeId] = useState<ThemeId>("notebook");
  const [imageSize, setImageSize] = useState<ImageSize>("1:1");
  const [imageData, setImageData] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/png");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!content.trim() && !instruction.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, themeId, imageSize, genreId, instruction: instruction.trim() || undefined }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "生成に失敗しました");
        return;
      }
      setImageData(result.image);
      setMimeType(result.mimeType || "image/png");
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Input */}
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              メモの内容（任意）
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              rows={5}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm leading-relaxed focus:border-gray-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-gray-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              指示（任意）
            </label>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="例: 手書き文字をもっと大きくしてください、背景を暖色系にしてください"
              rows={5}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm leading-relaxed focus:border-gray-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-gray-400"
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              画像の生成方法に関する指示です。この内容は画像には表示されません。
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              ジャンル
            </label>
            <GenreSelector value={genreId} onChange={setGenreId} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              スタイル
            </label>
            <ThemeSelector value={themeId} onChange={setThemeId} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              サイズ
            </label>
            <SizeSelector value={imageSize} onChange={setImageSize} />
          </div>

          <GenerateButton
            onGenerate={handleGenerate}
            loading={loading}
          />
        </div>

        {/* Right: Preview */}
        <div className="space-y-4">
          <ImagePreview
            imageData={imageData}
            mimeType={mimeType}
            loading={loading}
            error={error}
          />
          <DownloadButton
            imageData={imageData}
            mimeType={mimeType}
            filename="study-memo"
          />
        </div>
      </div>
    </div>
  );
}
