"use client";

import { ImageSize, imageSizeOptions } from "@/lib/types";

interface SizeSelectorProps {
  value: ImageSize;
  onChange: (size: ImageSize) => void;
}

export default function SizeSelector({ value, onChange }: SizeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {imageSizeOptions.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`rounded-lg border-2 px-3 py-1.5 text-left transition-all ${
            value === option.id
              ? "border-gray-900 bg-gray-50 shadow-sm"
              : "border-gray-200 hover:border-gray-400"
          }`}
        >
          <div className="text-sm font-medium text-gray-900">
            {option.name}
          </div>
          <div className="text-xs text-gray-500">{option.description}</div>
        </button>
      ))}
    </div>
  );
}
