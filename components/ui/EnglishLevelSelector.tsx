"use client";

import { EnglishLevel } from "@/lib/types";

const options: { id: EnglishLevel; name: string }[] = [
  { id: "none", name: "日本語のみ" },
  { id: "low", name: "英語少なめ" },
  { id: "medium", name: "英語普通" },
];

interface EnglishLevelSelectorProps {
  value: EnglishLevel;
  onChange: (level: EnglishLevel) => void;
}

export default function EnglishLevelSelector({ value, onChange }: EnglishLevelSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition-all ${
            value === option.id
              ? "border-gray-900 bg-gray-900 text-white shadow-sm dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
              : "border-gray-200 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-400"
          }`}
        >
          {option.name}
        </button>
      ))}
    </div>
  );
}
