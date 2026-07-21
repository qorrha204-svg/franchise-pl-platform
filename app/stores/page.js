"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Printer } from "lucide-react";
import { COLORS } from "@/lib/tokens";
import { won, pct } from "@/lib/format";
import { computePL, allMonths, buildRawRows } from "@/lib/pl";
import { BRANDS, brandName } from "@/lib/constants";
import { exportCSV } from "@/lib/csv";
import { useFranchiseData } from "@/lib/data-context";
import { Card, Badge, Num, DownloadBtn, selectStyle, secondaryBtn } from "@/components/ui";
import PLBreakdown from "@/components/PLBreakdown";

export default function StoresPage() {
  const { stores, financials, openReport } = useFranchiseData();
  const [brandFilter, setBrandFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const months = useMemo(() => allMonths(financials), [financials]);
  const [month, setMonth] = useState(() => months[months.length - 1]);
  const [selected, setSelected] = useState(null);

  const rows = stores
    .filter((s) => (brandFilter === "ALL" || s.brand_id === brandFilter) && (typeFilter === "ALL" || s.store_type === typeFilter))
    .map((s) => ({ store: s, pl: computePL(s.id, month, financials) }));

  const selectedPL = selected ? computePL(selected.id, month, financials) : null;

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: COLORS.ink, marginBottom: 4 }}>
        매장별 손익계산서
      </h1>
      <p style={{ color: COLORS.inkSoft, fontSize: 13, marginBottom: 16 }}>
        매장을 선택하면 계정 그룹별 상세 내역을 확인할 수 있습니다. ({rows.length}개 매장)
      </p>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} style={selectStyle}>
          <option value="ALL">전체 브랜드</option>
          {BRANDS.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={selectStyle}>
          <option value="ALL">전체 타입</option>
          <option value="가마솥">가마솥</option>
          <option value="배달점">배달점</option>
          <option value="일반">일반</option>
        </select>
        <select value={month} onChange={(e) => setMonth(e.target.value)} style={selectStyle}>
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: selected ? "1.3fr 1fr" : "1fr", gap: 14 }}>
        <Card style={{ padding: 0, overflow: "hidden", maxHeight: 640, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: COLORS.bg, borderBottom: `1px solid ${COLORS.line}`, position: "sticky", top: 0 }}>
                {["매장", "타입", "매출", "영업이익", "이익률", "상태", ""].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      textAlign: i >= 2 && i <= 4 ? "right" : "left",
                      fontSize: 11,
                      color: COLORS.inkSoft,
                      fontWeight: 500,
                      padding: "10px 12px",
                      background: COLORS.bg,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ store, pl }) => (
                <tr
                  key={store.id}
                  onClick={() => setSelected(store)}
                  style={{
                    borderBottom: `1px solid ${COLORS.line}`,
                    cursor: "pointer",
                    background: selected?.id === store.id ? COLORS.accentSoft : "transparent",
                  }}
                >
                  <td style={{ padding: "10px 12px", fontSize: 13, color: COLORS.ink }}>
                    {store.name} <span style={{ fontSize: 11, color: COLORS.inkSoft }}>({store.code})</span>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 12, color: COLORS.inkSoft }}>{store.store_type}</td>
                  <td style={{ padding: "10px 12px", textAlign: "right" }}>
                    {pl.revenue > 0 ? <Num value={won(pl.revenue)} /> : <span style={{ color: COLORS.inkSoft, fontSize: 12 }}>미입력</span>}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "right" }}>
                    {pl.revenue > 0 ? <Num value={won(pl.profit)} tone={pl.profit >= 0 ? undefined : "bad"} /> : "-"}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "right" }}>
                    {pl.revenue > 0 ? (
                      <Badge tone={pl.margin < 0.05 ? "bad" : pl.margin < 0.1 ? "warn" : "good"}>{pct(pl.margin)}</Badge>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {pl.revenue === 0 ? (
                      <Badge>미입력</Badge>
                    ) : pl.hasPending ? (
                      <Badge tone="warn">승인대기</Badge>
                    ) : (
                      <Badge tone="good">확정</Badge>
                    )}
                  </td>
                  <td style={{ padding: "10px 12px", color: COLORS.inkSoft }}>
                    <ChevronRight size={14} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        {selected && selectedPL && (
          <Card>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: COLORS.ink }}>{selected.name}</div>
              <div style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 16 }}>
                {brandName(selected.brand_id)} · {selected.complex_type} · {selected.store_type} · {month}
              </div>
            </div>
            <div style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => openReport(selected, month, selectedPL)} style={{ ...secondaryBtn, padding: "8px 12px", fontSize: 12.5 }}>
                <Printer size={13} /> 가맹점 리포트
              </button>
              <DownloadBtn
                label="이 매장 Raw 데이터"
                onClick={() => exportCSV(buildRawRows(financials, stores, selected.id), `${selected.code}_raw데이터.csv`)}
              />
            </div>
            <PLBreakdown pl={selectedPL} />
          </Card>
        )}
      </div>
    </div>
  );
}
