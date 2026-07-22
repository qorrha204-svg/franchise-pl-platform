"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Printer, Pencil, Search, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { COLORS } from "@/lib/tokens";
import { won, pct } from "@/lib/format";
import { computePL, allMonths, buildRawRows } from "@/lib/pl";
import { BRANDS, brandName } from "@/lib/constants";
import { computeBenchmarkRatios } from "@/lib/benchmarks";
import { exportCSV } from "@/lib/csv";
import { useFranchiseData } from "@/lib/data-context";
import { Card, Badge, Num, DownloadBtn, selectStyle, secondaryBtn } from "@/components/ui";
import PLBreakdown from "@/components/PLBreakdown";
import EditStoreEntry from "@/components/EditStoreEntry";
import EditHistoryList from "@/components/EditHistoryList";
import SolutionSuggestions from "@/components/SolutionSuggestions";

export default function StoresPage() {
  const { stores, financials, editHistory, editEntries, openReport, flashToast } = useFranchiseData();
  const { avgRatios, sampleCount } = useMemo(() => computeBenchmarkRatios(financials), [financials]);
  const [brandFilter, setBrandFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const months = useMemo(() => allMonths(financials), [financials]);
  const [month, setMonth] = useState(() => months[months.length - 1]);
  const [selected, setSelected] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortValue = (key, store, pl) => {
    switch (key) {
      case "name":
        return store.name;
      case "store_type":
        return store.store_type;
      case "revenue":
        return pl.revenue;
      case "profit":
        return pl.profit;
      case "margin":
        return pl.margin;
      case "status":
        return pl.revenue === 0 ? 0 : pl.hasPending ? 1 : 2;
      default:
        return 0;
    }
  };

  const q = query.trim();
  const rows = stores
    .filter(
      (s) =>
        (brandFilter === "ALL" || s.brand_id === brandFilter) &&
        (typeFilter === "ALL" || s.store_type === typeFilter) &&
        (!q || s.name.includes(q) || s.code.includes(q))
    )
    .map((s) => ({ store: s, pl: computePL(s.id, month, financials) }));

  if (sortKey) {
    const dir = sortDir === "asc" ? 1 : -1;
    rows.sort((a, b) => {
      const av = sortValue(sortKey, a.store, a.pl);
      const bv = sortValue(sortKey, b.store, b.pl);
      if (typeof av === "string") return av.localeCompare(bv, "ko") * dir;
      return (av - bv) * dir;
    });
  }

  const selectedPL = selected ? computePL(selected.id, month, financials) : null;
  const selectedHistory = selected
    ? editHistory.filter((h) => h.store_id === selected.id && h.month === month)
    : [];

  const handleEditSubmit = async ({ storeId, month: m, editor, changes }) => {
    setEditSubmitting(true);
    try {
      await editEntries({ storeId, month: m, editor, changes });
      setEditOpen(false);
      flashToast(`${selected?.name} · ${m} 손익이 수정되어 승인대기 상태로 등록되었습니다.`);
    } catch (e) {
      flashToast(`수정 실패: ${e.message || e}`, 5000);
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: COLORS.ink, marginBottom: 4 }}>
        매장별 손익계산서
      </h1>
      <p style={{ color: COLORS.inkSoft, fontSize: 13, marginBottom: 16 }}>
        매장을 선택하면 계정 그룹별 상세 내역을 확인할 수 있습니다. ({rows.length}개 매장)
      </p>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: COLORS.inkSoft }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="매장명 또는 코드 검색"
            style={{ ...selectStyle, paddingLeft: 30, width: 200 }}
          />
        </div>
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
      <div className={selected ? "grid-split-double" : ""} style={selected ? undefined : { display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
        <Card style={{ padding: 0, maxHeight: 640, overflowY: "auto", overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 560, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: COLORS.bg, borderBottom: `1px solid ${COLORS.line}`, position: "sticky", top: 0 }}>
                {[
                  { key: "name", label: "매장" },
                  { key: "store_type", label: "타입" },
                  { key: "revenue", label: "매출" },
                  { key: "profit", label: "영업이익" },
                  { key: "margin", label: "이익률" },
                  { key: "status", label: "상태" },
                  { key: null, label: "" },
                ].map(({ key, label }, i) => {
                  const active = sortKey === key;
                  const SortIcon = !key ? null : active ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
                  return (
                    <th
                      key={label || "chevron"}
                      onClick={key ? () => toggleSort(key) : undefined}
                      style={{
                        textAlign: i >= 2 && i <= 4 ? "right" : "left",
                        fontSize: 11,
                        color: active ? COLORS.accent : COLORS.inkSoft,
                        fontWeight: active ? 700 : 500,
                        padding: "10px 12px",
                        background: COLORS.bg,
                        cursor: key ? "pointer" : "default",
                        userSelect: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, flexDirection: i >= 2 && i <= 4 ? "row-reverse" : "row" }}>
                        {label}
                        {SortIcon && <SortIcon size={11} />}
                      </span>
                    </th>
                  );
                })}
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
                  <td style={{ padding: "10px 12px", fontSize: 13, color: COLORS.ink, whiteSpace: "nowrap" }}>
                    {store.name} <span style={{ fontSize: 11, color: COLORS.inkSoft }}>({store.code})</span>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 12, color: COLORS.inkSoft, whiteSpace: "nowrap" }}>{store.store_type}</td>
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
              <button onClick={() => setEditOpen(true)} style={{ ...secondaryBtn, padding: "8px 12px", fontSize: 12.5 }}>
                <Pencil size={13} /> 수치 수정
              </button>
              <button onClick={() => openReport(selected, month, selectedPL)} style={{ ...secondaryBtn, padding: "8px 12px", fontSize: 12.5 }}>
                <Printer size={13} /> 가족점 리포트
              </button>
              <DownloadBtn
                label="이 매장 Raw 데이터"
                onClick={() => exportCSV(buildRawRows(financials, stores, selected.id), `${selected.code}_raw데이터.csv`)}
              />
            </div>
            <PLBreakdown pl={selectedPL} />
            <SolutionSuggestions pl={selectedPL} avgRatios={avgRatios} sampleCount={sampleCount} />
            <EditHistoryList history={selectedHistory} />
          </Card>
        )}
      </div>
      {editOpen && selected && (
        <EditStoreEntry
          store={selected}
          month={month}
          financials={financials}
          onClose={() => setEditOpen(false)}
          onSubmit={handleEditSubmit}
          submitting={editSubmitting}
        />
      )}
    </div>
  );
}
