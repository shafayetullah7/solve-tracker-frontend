/** Mirrors backend `learningImportSourceKind` writable import/export formats. */
export const importFormat = {
  Markdown: "markdown",
  Json: "json",
} as const;

export type ImportFormat = (typeof importFormat)[keyof typeof importFormat];