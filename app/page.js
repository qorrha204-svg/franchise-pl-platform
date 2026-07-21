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
import { BRANDS, brandName } from "@/lib/constants";
import { storeById } from "@/lib/stores";
import { currentMonth } from "@/lib/date";
import { exportCSV } from "@/lib/csv";
import { useFranchiseData } from "@/lib/data-context";
import { Card, Num, Badge, DownloadBtn, selectStyle, secondaryBtn, kpiLabel, cardTitle } from "@/components/ui";
import PLBreakdown from "@/components/PLBreakdown";

function DashHeader({ stores, storeFilter, setStoreFilter, refMonth, onExport }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: COLORS.ink, margin: 0 }}>
          경영 대시보드
        </h1>
        <p style={{ color: COLORS.inkSoft, fontSize: 13, marginTop: 4 }}>기준월 {refMonth} · 승인 완료 데이터 기준</p>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <select value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)} style={{ ...selectStyle, maxWidth: 200 }}>
          <option value="ALL">전체 매장</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <DownloadBtn label="전체 Raw 데이터" onClick={onExport} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { stores, financials, openReport } = useFranchiseData();
  const [storeFilter, setStoreFilter] = useState("ALL");

  const months = useMemo(() => allMonths(financials), [financials]);
  const latestConfirmedMonth = useMemo(() => {
    const c = financials.filter((f) => f.status === "confirmed").map((f) => f.month);
    return c.length ? c.sort().slice(-1)[0] : currentMonth();
  }, [financials]);

  const handleExportAll = () => exportCSV(buildRawRows(financials, stores), "전체_손익_raw데이터.csv");

  if (storeFilter === "ALL") {
    const kpi = (() => {
      let revenue = 0;
      let profit = 0;
      const pendingBatches = new Set();
      stores.forEach((s) => {
        const pl = computePL(s.id, latestConfirmedMonth, financials, ["confirmed"]);
        revenue += pl.revenue;
        profit += pl.profit;
      });
      financials.forEach((f) => {
        if (f.status === "pending") pendingBatches.add(`${f.store_id}_${f.month}`);
      });
      return { revenue, profit, margin: revenue ? profit / revenue : 0, pending: pendingBatches.size };
    })();

    const brandChart = BRANDS.map((b) => {
      let revenue = 0;
      let profit = 0;
      stores
        .filter((s) => s.brand_id === b.id)
        .forEach((s) => {
          const pl = computePL(s.id, latestConfirmedMonth, financials, ["confirmed"]);
          revenue += pl.revenue;
          profit += pl.profit;
        });
      return { name: b.name, 매출: Math.round(revenue / 10000), 영업이익: Math.round(profit / 10000) };
    });

    const trendChart = months.map((m) => {
      let profit = 0;
      stores.forEach((s) => {
        profit += computePL(s.id, m, financials, ["confirmed"]).profit;
      });
      return { month: m, 영업이익: Math.round(profit / 10000) };
    });

    const worstStores = stores
      .map((s) => ({ store: s, pl: computePL(s.id, latestConfirmedMonth, financials, ["confirmed"]) }))
      .filter((x) => x.pl.revenue > 0)
      .sort((a, b) => a.pl.margin - b.pl.margin)
      .slice(0, 5);

    return (
      <div>
        <DashHeader stores={stores} storeFilter={storeFilter} setStoreFilter={setStoreFilter} refMonth={latestConfirmedMonth} onExport={handleExportAll} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
          <Card>
            <div style={kpiLabel}>전체 매출</div>
            <div style={{ fontSize: 22 }}>
              <Num value={won(kpi.revenue)} />
            </div>
          </Card>
          <Card>
            <div style={kpiLabel}>전체 영업이익</div>
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
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 14, marginBottom: 14 }}>
          <Card>
            <div style={cardTitle}>브랜드별 매출 · 영업이익 (만원)</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={brandChart}>
                <CartesianGrid stroke={COLORS.line} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: "IBM Plex Sans KR" }} />
                <YAxis tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} />
                <Tooltip contentStyle={{ fontFamily: "IBM Plex Sans KR", fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12, fontFamily: "IBM Plex Sans KR" }} />
                <Bar dataKey="매출" fill={COLORS.accentSoft} stroke={COLORS.accent} radius={[4, 4, 0, 0]} />
                <Bar dataKey="영업이익" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <div style={cardTitle}>월별 영업이익 추이 (만원)</div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendChart}>
                <CartesianGrid stroke={COLORS.line} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} />
                <YAxis tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} />
                <Tooltip contentStyle={{ fontFamily: "IBM Plex Sans KR", fontSize: 12, borderRadius: 8 }} />
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
            {latestConfirmedMonth} 기준 영업이익률이 낮은 매장입니다.
          </p>
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
                  <td style={{ padding: "8px 4px", fontSize: 13, color: COLORS.ink }}>{store.name}</td>
                  <td style={{ padding: "8px 4px", fontSize: 13, color: COLORS.inkSoft }}>{brandName(store.brand_id)}</td>
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
                    {latestConfirmedMonth} 기준 승인 완료된 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    );
  }

  const store = storeById(stores, storeFilter);
  const pl = computePL(storeFilter, latestConfirmedMonth, financials, ["confirmed"]);
  const catTotals = categoryTotals(pl.byCode);
  const catChart = [
    { name: "매출원가", 금액: Math.round(catTotals["매출원가"] / 10000) },
    { name: "고정비", 금액: Math.round(catTotals["고정비"] / 10000) },
    { name: "변동비", 금액: Math.round(catTotals["변동비"] / 10000) },
  ];
  const trendChart = months.map((m) => ({
    month: m,
    영업이익: Math.round(computePL(storeFilter, m, financials, ["confirmed"]).profit / 10000),
  }));

  return (
    <div>
      <DashHeader stores={stores} storeFilter={storeFilter} setStoreFilter={setStoreFilter} refMonth={latestConfirmedMonth} onExport={handleExportAll} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
        <Card>
          <div style={kpiLabel}>매출 ({latestConfirmedMonth})</div>
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <div style={cardTitle}>비용 구조 (만원)</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={catChart}>
                <CartesianGrid stroke={COLORS.line} vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: "IBM Plex Sans KR" }} />
                <YAxis tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} />
                <Tooltip contentStyle={{ fontFamily: "IBM Plex Sans KR", fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="금액" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <div style={cardTitle}>월별 영업이익 추이 (만원)</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendChart}>
                <CartesianGrid stroke={COLORS.line} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} />
                <YAxis tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} />
                <Tooltip contentStyle={{ fontFamily: "IBM Plex Sans KR", fontSize: 12, borderRadius: 8 }} />
                <Line type="monotone" dataKey="영업이익" stroke={COLORS.accent} strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
            <div style={cardTitle}>{store?.name} 손익 상세</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => openReport(store, latestConfirmedMonth, pl)} style={{ ...secondaryBtn, padding: "8px 12px", fontSize: 12.5 }}>
                <Printer size={13} /> 가맹점 리포트
              </button>
              <DownloadBtn
                label="이 매장 Raw 데이터"
                onClick={() => exportCSV(buildRawRows(financials, stores, storeFilter), `${store?.code}_raw데이터.csv`)}
              />
            </div>
          </div>
          <PLBreakdown pl={pl} />
        </Card>
      </div>
    </div>
  );
}
