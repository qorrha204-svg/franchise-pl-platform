"use client";

import { useEffect, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { COLORS } from "@/lib/tokens";

// Fetches /api/trade-area for the given lat/lng (existing store) or address
// (prospective site) and renders a compact 상권 정보 summary. Both API keys
// stay server-side; this component only talks to our own route.
export default function TradeAreaPanel({ lat, lng, address }) {
  const [state, setState] = useState({ loading: false, data: null, error: null });

  useEffect(() => {
    const hasCoords = lat != null && lng != null;
    if (!hasCoords && !address) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ loading: true, data: null, error: null });
    const params = hasCoords ? `lat=${lat}&lng=${lng}` : `address=${encodeURIComponent(address)}`;
    fetch(`/api/trade-area?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) setState({ loading: false, data: null, error: data.error });
        else setState({ loading: false, data, error: null });
      })
      .catch((e) => {
        if (!cancelled) setState({ loading: false, data: null, error: e.message || String(e) });
      });
    return () => {
      cancelled = true;
    };
  }, [lat, lng, address]);

  const hasCoords = lat != null && lng != null;
  if (!hasCoords && !address) return null;

  if (state.loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 0", color: COLORS.inkSoft, fontSize: 12.5 }}>
        <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> 상권 정보 조회 중...
      </div>
    );
  }
  if (state.error) {
    return (
      <div style={{ padding: "12px 0", color: COLORS.danger, fontSize: 12.5 }}>
        상권 정보를 불러오지 못했습니다: {state.error}
      </div>
    );
  }
  if (!state.data) return null;

  const { dongName, totalCount, foodCount, topCategories, note, sampledCount } = state.data;

  return (
    <div style={{ border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: "14px 16px", marginTop: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <MapPin size={14} color={COLORS.accent} />
        <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.ink }}>상권 정보 · {dongName}</span>
      </div>
      {note ? (
        <div style={{ fontSize: 12, color: COLORS.inkSoft }}>{note}</div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 20, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: COLORS.inkSoft, marginBottom: 2 }}>전체 상가업소</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.ink }}>{totalCount.toLocaleString("ko-KR")}개</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: COLORS.inkSoft, marginBottom: 2 }}>동일업종(음식점)</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.accent }}>{foodCount.toLocaleString("ko-KR")}개</div>
            </div>
          </div>
          {sampledCount && (
            <div style={{ fontSize: 10.5, color: COLORS.inkSoft, marginBottom: 10 }}>
              업소 수가 많은 지역이라 상위 {sampledCount.toLocaleString("ko-KR")}건 표본 기준으로 업종 분포를 집계했습니다.
            </div>
          )}
          {topCategories?.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: COLORS.inkSoft, marginBottom: 6 }}>업종 분포 (상위 {topCategories.length}개)</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {topCategories.map((c) => (
                  <div key={c.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: COLORS.ink }}>{c.name}</span>
                    <span style={{ color: COLORS.inkSoft, fontFamily: "var(--font-mono-kr)" }}>{c.count}개</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ fontSize: 10.5, color: COLORS.inkSoft, marginTop: 10 }}>
            출처: 소상공인시장진흥공단 상가(상권)정보
          </div>
        </>
      )}
    </div>
  );
}
