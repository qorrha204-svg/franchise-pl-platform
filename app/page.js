"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Clock, Printer } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { COLORS } from "@/lib/tokens";
import { won, pct } from "@/lib/format";
import { computePL, categoryTotals, allMonths, buildRawRows } from "@/lib/pl";
import { BRANDS, STORE_TYPES, brandName } from "@/lib/constants";
import { storeById } from "@/lib/stores";
import { currentMonth, formatMonthShort } from "@/lib/date";
import { exportCSV } from "@/lib/csv";
import { useFranchiseData } from "@/lib/data-context";
import { Card, Num, Badge, DownloadBtn, selectStyle, secondaryBtn, kpiLabel, cardTitle } from "@/components/ui";
import MultiSelect from "@/components/MultiSelect";
import PLBreakdown from "@/components/PLBreakdown";

const numFmt = (v) => Math.round(v).toLocaleString("ko-KR");

function PeriodRangeSelect({ months, start, end, onChangeStart, onChangeEnd }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <select value={start} onChange={(e) => onChangeStart(e.target.value)} style={selectStyle}>
        {months.map((m) => (
          <option key={m} value={m}>
            {formatMonthShort(m)}
          </option>
        ))}
      </select>
      <span style={{ color: COLORS.inkSoft, fontSize: 13 }}>~</span>
      <select value={end} onChange={(e) => onChangeEnd(e.target.value)} style={selectStyle}>
        {months.map((m) => (
          <option key={m} value={m}>
            {formatMonthShort(m)}
          </option>
        ))}
      </select>
    </div>
  );
}

function DashHeader({
  stores,
  months,
  periodLo,
  periodHi,
  setPeriodStart,
  setPeriodEnd,
  periodLabel,
  selectedBrandIds,
  setSelectedBrandIds,
  selectedTypes,
  setSelectedTypes,
  selectedStoreIds,
  setSelectedStoreIds,
  onExport,
}) {
  const brandOptions = BRANDS.map((b) => ({ value: b.id, label: b.name }));
  const typeOptions = STORE_TYPES.map((t) => ({ value: t, label: t }));
  const storeOptions = stores.map((s) => ({ value: s.id, label: `${s.name} (${s.code})` }));

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: COLORS.ink, margin: 0 }}>
          경영 대시보드
        </h1>
        <p style={{ color: COLORS.inkSoft, fontSize: 13, marginTop: 4 }}>{periodLabel} · 승인 완료 데이터 기준</p>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <MultiSelect label="브랜드" options={brandOptions} selected={selectedBrandIds} onChange={setSelectedBrandIds} />
        <MultiSelect label="타입" options={typeOptions} selected={selectedTypes} onChange={setSelectedTypes} />
        <MultiSelect
          label="매장"
          options={storeOptions}
          selected={selectedStoreIds}
          onChange={setSelectedStoreIds}
          searchable
          width={180}
        />
        <PeriodRangeSelect months={months} start={periodLo} end={periodHi} onChangeStart={setPeriodStart} onChangeEnd={setPeriodEnd} />
        <DownloadBtn label="전체 Raw 데이터" onClick={onExport} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { stores, financials, openReport } = useFranchiseData();
  const [selectedBrandIds, setSelectedBrandIds] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedStoreIds, setSelectedStoreIds] = useState([]);
  const [periodStart, setPeriodStart] = useState(null);
  const [periodEnd, setPeriodEnd] = useState(null);

  const months = useMemo(() => allMonths(financials), [financials]);
  const latestConfirmedMonth = useMemo(() => {
    const c = financials.filter((f) => f.status === "confirmed").map((f) => f.month);
    return c.length ? c.sort().slice(-1)[0] : currentMonth();
  }, [financials]);

  const effectiveStart = periodStart ?? latestConfirmedMonth;
  const effectiveEnd = periodEnd ?? latestConfirmedMonth;
  const periodLo = effectiveStart <= effectiveEnd ? effectiveStart : effectiveEnd;
  const periodHi = effectiveStart <= effectiveEnd ? effectiveEnd : effectiveStart;
  const periodMonths = useMemo(
    () => months.filter((m) => m >= periodLo && m <= periodHi),
    [months, periodLo, periodHi]
  );
  const periodRangeText = periodLo === periodHi ? periodLo : `${periodLo}~${periodHi}`;
  const periodLabel = periodLo === periodHi ? `기준월 ${periodLo}` : `기간 ${periodLo}~${periodHi}`;

  const filteredStores = useMemo(
    () =>
      stores.filter(
        (s) =>
          (selectedBrandIds.length === 0 || selectedBrandIds.includes(s.brand_id)) &&
          (selectedTypes.length === 0 || selectedTypes.includes(s.store_type)) &&
          (selectedStoreIds.length === 0 || selectedStoreIds.includes(s.id))
      ),
    [stores, selectedBrandIds, selectedTypes, selectedStoreIds]
  );

  const singleStore = selectedStoreIds.length === 1 ? storeById(stores, selectedStoreIds[0]) : null;

  const handleExportAll = () => exportCSV(buildRawRows(financials, stores), "전체_손익_raw데이터.csv");

  const filterProps = {
    stores,
    months,
    periodLo,
    periodHi,
    setPeriodStart,
    setPeriodEnd,
    periodLabel,
    selectedBrandIds,
    setSelectedBrandIds,
    selectedTypes,
    setSelectedTypes,
    selectedStoreIds,
    setSelectedStoreIds,
  };

  if (!singleStore) {
    const kpi = (() => {
      let revenueSum = 0;
      let profitSum = 0;
      let storeCount = 0;
      const pendingBatches = new Set();
      filteredStores.forEach((s) => {
        const pl = computePL(s.id, periodMonths, financials, ["confirmed"]);
        if (pl.revenue > 0) {
          revenueSum += pl.revenue;
          profitSum += pl.profit;
          storeCount += 1;
        }
      });
      const filteredIds = new Set(filteredStores.map((s) => s.id));
      financials.forEach((f) => {
        if (f.status === "pending" && filteredIds.has(f.store_id)) pendingBatches.add(`${f.store_id}_${f.month}`);
      });
      return {
        revenue: storeCount ? revenueSum / storeCount : 0,
        profit: storeCount ? profitSum / storeCount : 0,
        margin: revenueSum ? profitSum / revenueSum : 0,
        pending: pendingBatches.size,
        storeCount,
      };
    })();

    const brandsToShow = selectedBrandIds.length ? BRANDS.filter((b) => selectedBrandIds.includes(b.id)) : BRANDS;
    const brandChart = brandsToShow.map((b) => {
      let revenueSum = 0;
      let profitSum = 0;
      let cnt = 0;
      filteredStores
        .filter((s) => s.brand_id === b.id)
        .forEach((s) => {
          const pl = computePL(s.id, periodMonths, financials, ["confirmed"]);
          if (pl.revenue > 0) {
            revenueSum += pl.revenue;
            profitSum += pl.profit;
            cnt += 1;
          }
        });
      return {
        name: b.name,
        매출: Math.round((cnt ? revenueSum / cnt : 0) / 1000),
        영업이익: Math.round((cnt ? profitSum / cnt : 0) / 1000),
      };
    });

    const trendChart = periodMonths.map((m) => {
      let profitSum = 0;
      let cnt = 0;
      filteredStores.forEach((s) => {
        const p = computePL(s.id, m, financials, ["confirmed"]);
        if (p.revenue > 0) {
          profitSum += p.profit;
          cnt += 1;
        }
      });
      return { month: m, 영업이익: Math.round((cnt ? profitSum / cnt : 0) / 1000) };
    });

    const worstStores = filteredStores
      .map((s) => ({ store: s, pl: computePL(s.id, periodMonths, financials, ["confirmed"]) }))
      .filter((x) => x.pl.revenue > 0)
      .sort((a, b) => a.pl.margin - b.pl.margin)
      .slice(0, 5);

    return (
      <div>
        <DashHeader {...filterProps} onExport={handleExportAll} />
        <div className="grid-kpi-4" style={{ marginBottom: 20 }}>
          <Card>
            <div style={kpiLabel}>평균 매출 ({kpi.storeCount}개 매장)</div>
            <div style={{ fontSize: 22 }}>
              <Num value={won(kpi.revenue)} />
            </div>
          </Card>
          <Card>
            <div style={kpiLabel}>평균 영업이익</div>
            <div style={{ fontSize: 22 }}>
              <Num value={won(kpi.profit)} tone={kpi.profit >= 0 ? "good" : "bad"} />
            </div>
          </Card>
          <Card>
            <div style={kpiLabel}>평균 영업이익률</div>
            <div style={{ fontSize: 22 }}>
              <Num value={pct(kpi.margin)} tone={kpi.margin >= 0.1 ? "good" : "warn"} />
            </div>
          </Card>
          <Card>
            <div style={{ ...kpiLabel, display: "flex", alignItems: "center", gap: 6 }}>
              <Clock size={13} /> 승인 대기
            </div>
            <div style={{ fontSize: 22 }}>
              <Num value={`${kpi.pending}건`} tone={kpi.pending > 0 ? "warn" : undefined} />
            </div>
          </Card>
        </div>
        <div className="grid-2col" style={{ marginBottom: 14 }}>
          <Card>
            <div style={cardTitle}>브랜드별 매출 · 영업이익 (천원)</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={brandChart}>
                <CartesianGrid stroke={COLORS.line} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: "Pretendard" }} />
                <YAxis tick={{ fontSize: 11, fontFamily: "Pretendard" }} tickFormatter={numFmt} />
                <Tooltip contentStyle={{ fontFamily: "Pretendard", fontSize: 12, borderRadius: 8 }} formatter={(value) => numFmt(value)} />
                <Legend
                  wrapperStyle={{ fontSize: 12, fontFamily: "Pretendard" }}
                  formatter={(value) => <span style={{ color: COLORS.ink }}>{value}</span>}
                />
                <Bar dataKey="매출" fill={COLORS.accentSoft} stroke={COLORS.accent} radius={[4, 4, 0, 0]} />
                <Bar dataKey="영업이익" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <div style={cardTitle}>월별 영업이익 추이 (천원)</div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendChart}>
                <CartesianGrid stroke={COLORS.line} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "Pretendard" }} />
                <YAxis tick={{ fontSize: 11, fontFamily: "Pretendard" }} tickFormatter={numFmt} />
                <Tooltip contentStyle={{ fontFamily: "Pretendard", fontSize: 12, borderRadius: 8 }} formatter={(value) => numFmt(value)} />
                <Line type="monotone" dataKey="영업이익" stroke={COLORS.accent} strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
        <Card>
          <div style={{ ...cardTitle, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={16} color={COLORS.warn} /> 이익률 하위 매장 (주의 관찰)
          </div>
          <p style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 0, marginBottom: 14 }}>
            {periodRangeText} 기준 영업이익률이 낮은 매장입니다.
          </p>
          <div className="table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                {["매장", "브랜드", "매출", "영업이익", "이익률"].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      textAlign: i > 1 ? "right" : "left",
                      fontSize: 11,
                      color: COLORS.inkSoft,
                      fontWeight: 500,
                      padding: "6px 4px",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {worstStores.map(({ store, pl }) => (
                <tr key={store.id} style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                  <td style={{ padding: "8px 4px", fontSize: 13, color: COLORS.ink, whiteSpace: "nowrap" }}>{store.name}</td>
                  <td style={{ padding: "8px 4px", fontSize: 13, color: COLORS.inkSoft, whiteSpace: "nowrap" }}>{brandName(store.brand_id)}</td>
                  <td style={{ padding: "8px 4px", textAlign: "right" }}>
                    <Num value={won(pl.revenue)} />
                  </td>
                  <td style={{ padding: "8px 4px", textAlign: "right" }}>
                    <Num value={won(pl.profit)} tone={pl.profit >= 0 ? undefined : "bad"} />
                  </td>
                  <td style={{ padding: "8px 4px", textAlign: "right" }}>
                    <Badge tone={pl.margin < 0.05 ? "bad" : pl.margin < 0.1 ? "warn" : "good"}>{pct(pl.margin)}</Badge>
                  </td>
                </tr>
              ))}
              {worstStores.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: "16px 4px", textAlign: "center", fontSize: 12.5, color: COLORS.inkSoft }}>
                    {periodRangeText} 기준 승인 완료된 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </Card>
      </div>
    );
  }

  const store = singleStore;
  const pl = computePL(store.id, periodMonths, financials, ["confirmed"]);
  const catTotals = categoryTotals(pl.byCode);
  const catChart = [
    { name: "매출원가", 금액: Math.round(catTotals["매출원가"] / 10000) },
    { name: "고정비", 금액: Math.round(catTotals["고정비"] / 10000) },
    { name: "변동비", 금액: Math.round(catTotals["변동비"] / 10000) },
  ];
  const trendChart = periodMonths.map((m) => ({
    month: m,
    영업이익: Math.round(computePL(store.id, m, financials, ["confirmed"]).profit / 1000),
  }));

  return (
    <div>
      <DashHeader {...filterProps} onExport={handleExportAll} />
      <div className="grid-kpi-3" style={{ marginBottom: 20 }}>
        <Card>
          <div style={kpiLabel}>매출 ({periodRangeText})</div>
          <div style={{ fontSize: 22 }}>
            <Num value={won(pl.revenue)} />
          </div>
        </Card>
        <Card>
          <div style={kpiLabel}>영업이익</div>
          <div style={{ fontSize: 22 }}>
            <Num value={won(pl.profit)} tone={pl.profit >= 0 ? "good" : "bad"} />
          </div>
        </Card>
        <Card>
          <div style={kpiLabel}>영업이익률</div>
          <div style={{ fontSize: 22 }}>
            <Num value={pct(pl.margin)} tone={pl.margin >= 0.1 ? "good" : "warn"} />
          </div>
        </Card>
      </div>
      <div className="grid-2col-rev">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <div style={cardTitle}>비용 구조 (만원)</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={catChart}>
                <CartesianGrid stroke={COLORS.line} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: "Pretendard" }} />
                <YAxis tick={{ fontSize: 11, fontFamily: "Pretendard" }} />
                <Tooltip contentStyle={{ fontFamily: "Pretendard", fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="금액" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <div style={cardTitle}>월별 영업이익 추이 (천원)</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendChart}>
                <CartesianGrid stroke={COLORS.line} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "Pretendard" }} />
                <YAxis tick={{ fontSize: 11, fontFamily: "Pretendard" }} tickFormatter={numFmt} />
                <Tooltip contentStyle={{ fontFamily: "Pretendard", fontSize: 12, borderRadius: 8 }} formatter={(value) => numFmt(value)} />
                <Line type="monotone" dataKey="영업이익" stroke={COLORS.accent} strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
            <div style={cardTitle}>{store?.name} 손익 상세</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => openReport(store, periodRangeText, pl)} style={{ ...secondaryBtn, padding: "8px 12px", fontSize: 12.5 }}>
                <Printer size={13} /> 가맹점 리포트
              </button>
              <DownloadBtn
                label="이 매장 Raw 데이터"
                onClick={() => exportCSV(buildRawRows(financials, stores, store.id), `${store?.code}_raw데이터.csv`)}
              />
            </div>
          </div>
          <PLBreakdown pl={pl} />
        </Card>
      </div>
    </div>
  );
}
