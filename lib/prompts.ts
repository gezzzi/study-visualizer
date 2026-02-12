import { CardTheme, ImageSize } from "./types";

const aspectRatioDescriptions: Record<ImageSize, string> = {
  "1:1": "a square (1:1 aspect ratio)",
  "4:3": "a landscape 4:3 aspect ratio (wider than tall)",
  "16:9": "a wide landscape 16:9 aspect ratio (much wider than tall)",
  "3:4": "a portrait 3:4 aspect ratio (taller than wide)",
  "9:16": "a tall portrait 9:16 aspect ratio (much taller than wide)",
};

export function buildPrompt(content: string, theme: CardTheme, imageSize: ImageSize = "1:1"): string {
  const sizeDesc = aspectRatioDescriptions[imageSize] || "a square (1:1 aspect ratio)";
  return `Create ${sizeDesc} image of a handwritten study memo about English learning for social media (like Twitter/X). The image should look like someone's real study notes - casual, authentic, and visually engaging.

Visual style: ${theme.promptDescription}

Content to include in the memo (write this text EXACTLY as provided, do not change or omit any characters):
${content}

Important rules:
- All text must be handwritten style, NOT typed/digital font
- Write the text EXACTLY as provided above - every word, every character must appear accurately including Japanese characters
- Use visual hierarchy: make key English words/phrases bigger and bolder
- Add hand-drawn decorations like underlines, circles, arrows, stars, or simple doodles to make it eye-catching
- The overall feel should be like a real student's study notes that someone would want to save or share
- Make it visually dense but not cluttered - the kind of aesthetic study notes that go viral on social media
- Keep the layout natural and organic, not rigid or grid-like`;
}
