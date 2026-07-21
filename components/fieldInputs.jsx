"use client";

import { COLORS } from "@/lib/tokens";
import { won, fmtNum } from "@/lib/format";
import { MoneyInput } from "@/components/ui";

export function FieldRow({ name, value, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "9px 0",
        borderBottom: `1px solid ${COLORS.line}`,
      }}
    >
      <span style={{ fontSize: 13.5, color: COLORS.ink }}>{name}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontFamily: "var(--font-mono-kr)", fontSize: 13, color: COLORS.inkSoft }}>₩</span>
        <MoneyInput value={value} onChange={onChange} />
      </div>
    </div>
  );
}

export function DeliveryFieldRow({ name, qty, onQty, amount, onAmount }) {
  const q = Number(qty || 0);
  const a = Number(amount || 0);
  const avg = q > 0 ? Math.round(a / q) : 0;
  return (
    <div style={{ padding: "9px 0", borderBottom: `1px solid ${COLORS.line}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 13.5, color: COLORS.ink }}>{name}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 11.5, color: COLORS.inkSoft }}>건수</span>
            <input
              type="text"
              inputMode="numeric"
              value={fmtNum(qty)}
              onChange={(e) => onQty(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="0"
              style={{
                width: 70,
                textAlign: "right",
                fontFamily: "var(--font-mono-kr)",
                fontSize: 13,
                border: `1px solid ${COLORS.line}`,
                borderRadius: 6,
                padding: "6px 8px",
                color: COLORS.ink,
              }}
            />
            <span style={{ fontSize: 11.5, color: COLORS.inkSoft }}>건</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 11.5, color: COLORS.inkSoft }}>매출</span>
            <span style={{ fontFamily: "var(--font-mono-kr)", fontSize: 13, color: COLORS.inkSoft }}>₩</span>
            <MoneyInput value={amount} onChange={onAmount} />
          </div>
        </div>
      </div>
      {avg > 0 && (
        <div style={{ textAlign: "right", fontSize: 11, color: COLORS.inkSoft, marginTop: 3 }}>
          평균 객단가 약 {won(avg)}
        </div>
      )}
    </div>
  );
}
