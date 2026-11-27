/** Mirrors backend `learningBlockType` (SPA does not import schema modules). */
export const blockType = {
  Text: "text",
  Code: "code",
  Checklist: "checklist",
  Link: "link",
  Assessment: "assessment",
} as const;

export type BlockType = (typeof blockType)[keyof typeof blockType];