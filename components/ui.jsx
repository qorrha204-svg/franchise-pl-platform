"use client";

import { Download } from "lucide-react";
import { COLORS, FONT_SANS, FONT_MONO, FONT_DISPLAY } from "@/lib/tokens";
import { fmtNum } from "@/lib/format";

export function Badge({ tone = "neutral", children }) {
  const tones = {
    neutral: { bg: COLORS.line, fg: COLORS.inkSoft },
    good: { bg: COLORS.accentSoft, fg: COLORS.accent },
    warn: { bg: COLORS.warnSoft, fg: COLORS.warn },
    bad: { bg: COLORS.dangerSoft, fg: COLORS.danger },
  };
  const t = tones[tone];
  return (
    <span
      style={{
        background: t.bg,
        color: t.fg,
        fontFamily: FONT_SANS,
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: 5,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function Num({ value, tone }) {
  const color = tone === "good" ? COLORS.accent : tone === "bad" ? COLORS.danger : COLORS.ink;
  return (
    <span style={{ fontFamily: FONT_MONO, fontVariantNumeric: "tabular-nums", color }}>
      {value}
    </span>
  );
}

export function Card({ children, style }) {
  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.line}`,
        borderRadius: 10,
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export const selectStyle = {
  fontFamily: FONT_SANS,
  fontSize: 13,
  padding: "8px 10px",
  borderRadius: 7,
  border: `1px solid ${COLORS.line}`,
  background: COLORS.surface,
  color: COLORS.ink,
};

export function MoneyInput({ value, onChange, width = 140 }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      value={fmtNum(value)}
      onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
      placeholder="0"
      style={{
        width,
        textAlign: "right",
        fontFamily: FONT_MONO,
        fontSize: 13.5,
        border: `1px solid ${COLORS.line}`,
        borderRadius: 6,
        padding: "6px 8px",
        color: COLORS.ink,
      }}
    />
  );
}

export function DownloadBtn({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "#fff",
        color: COLORS.ink,
        border: `1px solid ${COLORS.line}`,
        borderRadius: 7,
        padding: "8px 12px",
        fontSize: 12.5,
        fontWeight: 600,
        fontFamily: FONT_SANS,
        cursor: "pointer",
      }}
    >
      <Download size={13} /> {label}
    </button>
  );
}

export const primaryBtn = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  background: COLORS.accent,
  color: "#fff",
  border: "none",
  borderRadius: 7,
  padding: "9px 16px",
  fontSize: 13,
  fontWeight: 600,
  fontFamily: FONT_SANS,
  cursor: "pointer",
};
export const secondaryBtn = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  background: "#fff",
  color: COLORS.inkSoft,
  border: `1px solid ${COLORS.line}`,
  borderRadius: 7,
  padding: "9px 16px",
  fontSize: 13,
  fontWeight: 600,
  fontFamily: FONT_SANS,
  cursor: "pointer",
};
export const dangerBtn = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  background: COLORS.danger,
  color: "#fff",
  border: "none",
  borderRadius: 7,
  padding: "8px 12px",
  fontSize: 12.5,
  fontWeight: 600,
  fontFamily: FONT_SANS,
  cursor: "pointer",
};
export const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: COLORS.inkSoft,
  marginBottom: 6,
};
export const inputStyle = {
  width: "100%",
  fontFamily: FONT_SANS,
  fontSize: 13.5,
  padding: "9px 10px",
  borderRadius: 7,
  border: `1px solid ${COLORS.line}`,
  color: COLORS.ink,
  boxSizing: "border-box",
};
export const kpiLabel = { fontSize: 12, color: COLORS.inkSoft, marginBottom: 8 };
export const cardTitle = { fontFamily: FONT_DISPLAY, fontWeight: 600, marginBottom: 12, color: COLORS.ink };
