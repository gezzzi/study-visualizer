"use client";

import { GenreId } from "@/lib/types";
import { genreList } from "@/lib/genres";

interface GenreSelectorProps {
  value: GenreId;
  onChange: (id: GenreId) => void;
}

export default function GenreSelector({ value, onChange }: GenreSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {genreList.map((genre) => (
        <button
          key={genre.id}
          onClick={() => onChange(genre.id)}
          className={`rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition-all ${
            value === genre.id
              ? "border-gray-900 bg-gray-900 text-white shadow-sm dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
              : "border-gray-200 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-400"
          }`}
        >
          {genre.name}
        </button>
      ))}
    </div>
  );
}
