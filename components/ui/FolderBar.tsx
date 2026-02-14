"use client";

import { useState, useRef, useEffect } from "react";
import { Folder } from "@/lib/types";

interface FolderBarProps {
  folders: Folder[];
  activeFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: () => void;
  onRenameFolder: (folder: Folder) => void;
  onDeleteFolder: (folder: Folder) => void;
  total: number;
  uncategorizedCount: number;
}

function FolderMenu({
  folder,
  onRename,
  onDelete,
  onClose,
}: {
  folder: Folder;
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-20 mt-1 w-32 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <button
        onClick={() => { onRename(); onClose(); }}
        className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        名前を変更
      </button>
      <button
        onClick={() => { onDelete(); onClose(); }}
        className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
      >
        削除
      </button>
    </div>
  );
}

export default function FolderBar({
  folders,
  activeFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  total,
  uncategorizedCount,
}: FolderBarProps) {
  const [menuFolderId, setMenuFolderId] = useState<string | null>(null);

  const pillClass = (active: boolean) =>
    `flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
      active
        ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
    }`;

  return (
    <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1">
      {/* All */}
      <button
        onClick={() => onSelectFolder(null)}
        className={pillClass(activeFolderId === null)}
      >
        すべて ({total})
      </button>

      {/* Uncategorized */}
      <button
        onClick={() => onSelectFolder("none")}
        className={pillClass(activeFolderId === "none")}
      >
        未分類 ({uncategorizedCount})
      </button>

      {/* Folders */}
      {folders.map((folder) => (
        <div key={folder.id} className="relative flex-shrink-0">
          <div className="group flex items-center">
            <button
              onClick={() => onSelectFolder(folder.id)}
              className={pillClass(activeFolderId === folder.id)}
            >
              {folder.name} ({folder.image_count ?? 0})
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuFolderId(menuFolderId === folder.id ? null : folder.id);
              }}
              className="ml-0.5 flex-shrink-0 rounded p-0.5 text-gray-400 opacity-0 transition-opacity hover:text-gray-600 group-hover:opacity-100 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
          </div>
          {menuFolderId === folder.id && (
            <FolderMenu
              folder={folder}
              onRename={() => onRenameFolder(folder)}
              onDelete={() => onDeleteFolder(folder)}
              onClose={() => setMenuFolderId(null)}
            />
          )}
        </div>
      ))}

      {/* Create button */}
      <button
        onClick={onCreateFolder}
        className="flex flex-shrink-0 items-center gap-1 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700 dark:border-gray-600 dark:text-gray-500 dark:hover:border-gray-500 dark:hover:text-gray-300"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        新規フォルダ
      </button>
    </div>
  );
}
