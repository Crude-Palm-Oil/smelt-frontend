export const theme = {
  bg: "#0c0c0c",
  surface: "#141414",
  surfaceAlt: "#1a1a1a",
  border: "#252525",
  borderActive: "#3a3a3a",
  text: "#c8c8c8",
  textDim: "#666666",
  textMuted: "#444444",
  accent: "#00d4aa",
  accentDim: "rgba(0, 212, 170, 0.13)",
  warn: "#e8a832",
  warnDim: "rgba(232, 168, 50, 0.13)",
  danger: "#e84040",
  dangerDim: "rgba(232, 64, 64, 0.13)",
  success: "#2ecc71",
  successDim: "rgba(46, 204, 113, 0.13)",
} as const;

export type ThemeColor = keyof typeof theme;
