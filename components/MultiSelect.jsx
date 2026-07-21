"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { COLORS } from "@/lib/tokens";

export default function MultiSelect({ label, options, selected, onChange, searchable = false, width = 150 }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const toggle = (value) => {
    if (selected.includes(value)) onChange(selected.filter((v) => v !== value));
    else onChange([...selected, value]);
  };

  const filteredOptions =
    searchable && query.trim() ? options.filter((o) => o.label.includes(query.trim())) : options;

  const buttonLabel = selected.length === 0 ? `${label} 전체` : `${label} ${selected.length}개 선택`;

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          width,
          fontFamily: "var(--font-sans-kr)",
          fontSize: 13,
          padding: "8px 10px",
          borderRadius: 7,
          border: `1px solid ${selected.length ? COLORS.accent : COLORS.line}`,
          background: selected.length ? COLORS.accentSoft : COLORS.surface,
          color: selected.length ? COLORS.accent : COLORS.ink,
          cursor: "pointer",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{buttonLabel}</span>
        <ChevronDown size={13} />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            zIndex: 50,
            background: "#fff",
            border: `1px solid ${COLORS.line}`,
            borderRadius: 8,
            width: Math.max(width, 220),
            maxHeight: 320,
            overflowY: "auto",
            boxShadow: "0 8px 24px rgba(27,35,31,0.12)",
          }}
        >
          {searchable && (
            <div style={{ padding: 8, borderBottom: `1px solid ${COLORS.line}`, position: "sticky", top: 0, background: "#fff" }}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="검색"
                style={{
                  width: "100%",
                  fontSize: 12.5,
                  padding: "6px 8px",
                  border: `1px solid ${COLORS.line}`,
                  borderRadius: 6,
                  fontFamily: "var(--font-sans-kr)",
                }}
              />
            </div>
          )}
          {selected.length > 0 && (
            <div
              onClick={() => onChange([])}
              style={{
                padding: "8px 12px",
                fontSize: 12,
                color: COLORS.accent,
                cursor: "pointer",
                fontWeight: 600,
                borderBottom: `1px solid ${COLORS.line}`,
              }}
            >
              선택 초기화
            </div>
          )}
          <div style={{ padding: "4px 0" }}>
            {filteredOptions.map((o) => (
              <label
                key={o.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  fontSize: 13,
                  cursor: "pointer",
                  color: COLORS.ink,
                }}
              >
                <input type="checkbox" checked={selected.includes(o.value)} onChange={() => toggle(o.value)} />
                {o.label}
              </label>
            ))}
            {filteredOptions.length === 0 && (
              <div style={{ padding: "10px 12px", fontSize: 12, color: COLORS.inkSoft }}>결과 없음</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
