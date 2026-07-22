"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { COLORS } from "@/lib/tokens";

export default function SearchableSelect({ value, onChange, options, placeholder = "선택하세요", searchPlaceholder = "검색" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selected = options.find((o) => o.value === value);
  const filtered = query.trim() ? options.filter((o) => o.label.includes(query.trim())) : options;

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          width: "100%",
          fontFamily: "var(--font-sans-kr)",
          fontSize: 13.5,
          padding: "9px 10px",
          borderRadius: 7,
          border: `1px solid ${COLORS.line}`,
          background: COLORS.surface,
          color: selected ? COLORS.ink : COLORS.inkSoft,
          cursor: "pointer",
          boxSizing: "border-box",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 50,
            background: "#fff",
            border: `1px solid ${COLORS.line}`,
            borderRadius: 8,
            maxHeight: 280,
            overflowY: "auto",
            boxShadow: "0 8px 24px rgba(27,35,31,0.12)",
          }}
        >
          <div style={{ padding: 8, borderBottom: `1px solid ${COLORS.line}`, position: "sticky", top: 0, background: "#fff" }}>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              style={{
                width: "100%",
                fontSize: 12.5,
                padding: "6px 8px",
                border: `1px solid ${COLORS.line}`,
                borderRadius: 6,
                fontFamily: "var(--font-sans-kr)",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            {filtered.map((o) => (
              <div
                key={o.value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                  setQuery("");
                }}
                style={{
                  padding: "8px 12px",
                  fontSize: 13,
                  cursor: "pointer",
                  background: o.value === value ? COLORS.accentSoft : "transparent",
                  color: COLORS.ink,
                }}
              >
                {o.label}
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: "10px 12px", fontSize: 12, color: COLORS.inkSoft }}>검색 결과 없음</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
