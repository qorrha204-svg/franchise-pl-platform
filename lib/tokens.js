export const COLORS = {
  bg: "#F5F6F3",
  surface: "#FFFFFF",
  ink: "#1B231F",
  inkSoft: "#5B655F",
  line: "#DBDED6",
  accent: "#1F6F54",
  accentSoft: "#E6F0EA",
  warn: "#B8722A",
  warnSoft: "#F5E9DA",
  danger: "#B23A3A",
  dangerSoft: "#F5E1E1",
};

// Populated by next/font in app/layout.js (CSS custom properties).
export const FONT_DISPLAY = "var(--font-display)";
export const FONT_SANS = "var(--font-sans-kr)";
export const FONT_MONO = "var(--font-mono-kr)";

export const PRINT_CSS = `@media print {
  body * { visibility: hidden; }
  #print-report, #print-report * { visibility: visible; }
  #print-report { position: absolute; left: 0; top: 0; width: 100%; }
  .no-print { display: none !important; }
}`;
