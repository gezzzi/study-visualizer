"use client";

interface GenerateButtonProps {
  onGenerate: () => void;
  loading: boolean;
}

export function GenerateButton({ onGenerate, loading }: GenerateButtonProps) {
  return (
    <button
      onClick={onGenerate}
      disabled={loading}
      className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
    >
      {loading ? "生成中..." : "画像を生成"}
    </button>
  );
}

interface DownloadButtonProps {
  imageData: string | null;
  mimeType?: string;
  filename?: string;
}

export function DownloadButton({ imageData, mimeType = "image/png", filename = "study-memo" }: DownloadButtonProps) {
  const handleDownload = () => {
    if (!imageData) return;
    const byteChars = atob(imageData);
    const byteArray = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteArray[i] = byteChars.charCodeAt(i);
    }
    const blob = new Blob([byteArray], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const ext = mimeType === "image/jpeg" ? "jpg" : mimeType === "image/webp" ? "webp" : "png";
    const link = document.createElement("a");
    link.download = `${filename}.${ext}`;
    link.href = url;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={!imageData}
      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
    >
      画像をダウンロード
    </button>
  );
}
