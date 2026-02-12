"use client";

import { ThemeId } from "@/lib/types";
import { themeList } from "@/lib/themes";

interface ThemeSelectorProps {
  value: ThemeId;
  onChange: (id: ThemeId) => void;
}

const themePreviewColors: Record<ThemeId, string> = {
  notebook: "#f5f0e8",
  blackboard: "#2d5016",
  sticky: "#fef08a",
  whiteboard: "#f8fafc",
  craft: "#b8860b",
  blueprint: "#1e3a5f",
};

export default function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {themeList.map((theme) => (
        <button
          key={theme.id}
          onClick={() => onChange(theme.id)}
          className={`rounded-lg border-2 px-3 py-1.5 text-sm font-medium transition-all ${
            value === theme.id
              ? "border-gray-900 shadow-sm"
              : "border-gray-200 hover:border-gray-400"
          }`}
          style={{
            backgroundColor: themePreviewColors[theme.id],
            color: theme.id === "blackboard" || theme.id === "blueprint" ? "#fff" : "#1a1a1a",
          }}
        >
          {theme.name}
        </button>
      ))}
    </div>
  );
}
