import { CardTheme, ThemeId } from "./types";

export const themes: Record<ThemeId, CardTheme> = {
  notebook: {
    id: "notebook",
    name: "ノート",
    promptDescription:
      "a ruled notebook page with slightly off-white paper, faint blue horizontal lines, a red margin line on the left, and handwritten text in dark blue/black ink. Casual, student-like handwriting with some words underlined or circled for emphasis.",
  },
  blackboard: {
    id: "blackboard",
    name: "黒板",
    promptDescription:
      "a dark green chalkboard with chalk handwriting in white and pastel colors (yellow, pink, light blue). Include subtle chalk dust and eraser marks for realism. Bold headings, casual chalk lettering style.",
  },
  sticky: {
    id: "sticky",
    name: "付箋",
    promptDescription:
      "a colorful arrangement of sticky notes (yellow, pink, light blue, light green) on a cork board or desk background. Each sticky note has handwritten text in marker pen. Fun, casual, and colorful with slight paper curl effects.",
  },
  whiteboard: {
    id: "whiteboard",
    name: "ホワイトボード",
    promptDescription:
      "a clean white whiteboard with handwritten text in colorful dry-erase markers (blue, red, green, black). Include arrows, boxes, and underlines drawn by hand. Slightly glossy whiteboard surface with subtle reflections.",
  },
  craft: {
    id: "craft",
    name: "クラフト紙",
    promptDescription:
      "a brown kraft paper / recycled paper background with handwritten text in black felt-tip pen and colored markers. Warm, cozy, organic feel. Some doodles, stars, or simple illustrations around the text.",
  },
  blueprint: {
    id: "blueprint",
    name: "青写真",
    promptDescription:
      "a dark blue blueprint-style background with white handwritten text and diagrams. Technical but approachable feel, with grid lines, arrows, and neat handwritten annotations. Clean and modern.",
  },
};

export const themeList = Object.values(themes);
