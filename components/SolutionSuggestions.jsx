"use client";

import { Lightbulb } from "lucide-react";
import { COLORS } from "@/lib/tokens";
import { pct } from "@/lib/format";
import { shouldShowSolutions, getFlaggedAccounts } from "@/lib/solutions";

export default function SolutionSuggestions({ pl, avgRatios, sampleCount }) {
  if (!shouldShowSolutions(pl)) return null;

  const flagged = getFlaggedAccounts(pl, avgRatios, sampleCount);

  return (
    <div style={{ marginTop: 20, paddingTop: 14, borderTop: `1px solid ${COLORS.line}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <Lightbulb size={14} color={COLORS.warn} />
        <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.ink }}>영업이익 개선 제안</span>
      </div>
      <p style={{ fontSize: 11, color: COLORS.inkSoft, marginTop: 0, marginBottom: 10 }}>
        영업이익이 저조한 매장이라 흑자 매장 평균 비용 구조와 비교해봤습니다.
      </p>
      {sampleCount === 0 ? (
        <div style={{ fontSize: 12, color: COLORS.inkSoft }}>비교할 흑자 매장 데이터가 아직 없습니다.</div>
      ) : flagged.length === 0 ? (
        <div style={{ fontSize: 12, color: COLORS.inkSoft }}>
          비용 항목들이 흑자 매장 평균과 비슷한 수준입니다. 매출 자체를 끌어올리는 방안을 검토해보세요.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {flagged.map((f) => (
            <div
              key={f.code}
              style={{
                background: COLORS.warnSoft,
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 3, fontWeight: 600, color: COLORS.warn }}>
                <span>{f.name}</span>
                <span style={{ fontFamily: "var(--font-mono-kr)" }}>
                  {pct(f.storeRatio)} (평균 {pct(f.avgRatio)})
                </span>
              </div>
              <div style={{ color: COLORS.ink }}>{f.message}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
