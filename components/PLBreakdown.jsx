"use client";

import { COLORS } from "@/lib/tokens";
import { won, pct } from "@/lib/format";
import { groupSums } from "@/lib/pl";
import { Badge, Num } from "@/components/ui";

export default function PLBreakdown({ pl }) {
  const groups = groupSums(pl.byCode);
  if (pl.revenue === 0 && pl.totalCost === 0) {
    return (
      <div style={{ padding: "20px 0", textAlign: "center", color: COLORS.inkSoft, fontSize: 13 }}>
        입력된 손익 데이터가 없습니다.
      </div>
    );
  }
  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.accent, marginBottom: 4 }}>매출</div>
        {pl.revenueDetail
          .filter((r) => r.amount > 0)
          .map((r) => (
            <div
              key={r.code}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "5px 0 5px 10px",
                fontSize: 12.5,
                color: COLORS.inkSoft,
              }}
            >
              <span>
                {r.name}
                {r.qty ? ` · ${r.qty.toLocaleString("ko-KR")}건` : ""}
              </span>
              <Num value={won(r.amount)} />
            </div>
          ))}
      </div>
      <div
        style={{
          borderTop: `2px solid ${COLORS.ink}`,
          borderBottom: `1px solid ${COLORS.line}`,
          padding: "10px 0",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600 }}>매출 합계</span>
        <Num value={won(pl.revenue)} />
      </div>
      {["매출원가", "고정비", "변동비"].map((cat) => {
        const items = groups.filter((g) => g.category === cat);
        const subtotal = items.reduce((s, g) => s + g.amount, 0);
        return (
          <div key={cat}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "9px 0 4px",
                fontSize: 12,
                fontWeight: 600,
                color: COLORS.inkSoft,
              }}
            >
              <span>{cat}</span>
              <Num value={`- ${won(subtotal)}`} />
            </div>
            {items.map((g) => (
              <div
                key={g.group}
                style={{
                  borderBottom: `1px solid ${COLORS.line}`,
                  padding: "6px 0 6px 10px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 12.5, color: COLORS.inkSoft }}>
                  {g.group} <span style={{ fontSize: 11 }}>({pct(pl.revenue ? g.amount / pl.revenue : 0)})</span>
                </span>
                <Num value={`- ${won(g.amount)}`} />
              </div>
            ))}
          </div>
        );
      })}
      <div
        style={{
          borderTop: `2px solid ${COLORS.ink}`,
          padding: "10px 0",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700 }}>영업이익</span>
        <span style={{ fontSize: 15 }}>
          <Num value={won(pl.profit)} tone={pl.profit >= 0 ? "good" : "bad"} />
        </span>
      </div>
      <div
        style={{
          marginTop: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 11,
          color: COLORS.inkSoft,
        }}
      >
        <span>
          {pl.writer ? `작성 ${pl.writer}` : ""}
          {pl.approvedBy ? ` · 승인 ${pl.approvedBy}` : ""}
        </span>
        <Badge tone={pl.margin < 0.05 ? "bad" : pl.margin < 0.1 ? "warn" : "good"}>
          영업이익률 {pct(pl.margin)}
        </Badge>
      </div>
    </>
  );
}
