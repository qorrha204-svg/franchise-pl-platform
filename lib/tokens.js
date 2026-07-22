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

// Two separate problems were stacking on top of each other here:
// 1. #print-report's ancestors (the modal backdrop + card) are
//    position:fixed / overflow:hidden for on-screen modal behavior.
//    Chromium repeats position:fixed elements on every printed page and
//    clips them to one page's height, so multi-page reports showed only
//    the first page's content over and over and cut off anything further
//    down (e.g. solution suggestions). Fixed by resetting the ancestor
//    chain to normal flow (position: static) for print.
// 2. `visibility: hidden` hides the rest of the app (sidebar + dashboard,
//    via .app-shell-body) but does NOT remove it from layout - it still
//    reserves its full height, which pushed the now-static report down by
//    that entire amount, showing as a large blank area before the report
//    content on every printed page. Fixed by `display: none`-ing the app
//    shell outright for print instead of relying on visibility alone.
export const PRINT_CSS = `@media print {
  body * { visibility: hidden; }
  .app-shell-body, .app-mobile-menu-btn, .app-mobile-backdrop { display: none !important; }
  #print-report, #print-report * { visibility: visible; }
  .report-overlay-backdrop { position: static !important; display: block !important; overflow: visible !important; padding: 0 !important; }
  .report-overlay-card { width: 100% !important; overflow: visible !important; }
  #print-report { position: static !important; width: 100% !important; }
  .no-print { display: none !important; }
}`;
