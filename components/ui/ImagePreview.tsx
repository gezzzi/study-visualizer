"use client";

interface ImagePreviewProps {
  imageData: string | null;
  mimeType?: string;
  loading: boolean;
  error: string | null;
}

export default function ImagePreview({
  imageData,
  mimeType = "image/png",
  loading,
  error,
}: ImagePreviewProps) {
  if (loading) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
          <p className="text-sm text-gray-500">画像を生成中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-red-200 bg-red-50">
        <div className="px-6 text-center">
          <p className="mb-1 text-sm font-medium text-red-800">
            生成に失敗しました
          </p>
          <p className="text-xs text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (imageData) {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <img
          src={`data:${mimeType};base64,${imageData}`}
          alt="生成されたカード画像"
          className="h-auto w-full"
        />
      </div>
    );
  }

  return (
    <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
      <p className="text-sm text-gray-400">
        フォームを入力して画像を生成してください
      </p>
    </div>
  );
}
