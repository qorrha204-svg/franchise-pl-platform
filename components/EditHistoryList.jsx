"use client";

import { COLORS } from "@/lib/tokens";
import { won } from "@/lib/format";
import { getAccount } from "@/lib/constants";

export default function EditHistoryList({ history }) {
  if (!history.length) return null;
  const sorted = [...history].sort((a, b) => new Date(b.edited_at) - new Date(a.edited_at));
  return (
    <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${COLORS.line}` }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.inkSoft, marginBottom: 8 }}>수정 이력</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto" }}>
        {sorted.map((h) => (
          <div key={h.id} style={{ fontSize: 11.5, color: COLORS.inkSoft, borderBottom: `1px solid ${COLORS.line}`, paddingBottom: 6 }}>
            <span style={{ fontWeight: 600, color: COLORS.ink }}>{h.edited_by}</span>
            {" · "}
            {new Date(h.edited_at).toLocaleString("ko-KR")}
            {" · "}
            {getAccount(h.account_code)?.name || h.account_code}
            {": "}
            {won(h.previous_amount)} → {won(h.new_amount)}
          </div>
        ))}
      </div>
    </div>
  );
}
