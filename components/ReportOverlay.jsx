"use client";

import { Fragment } from "react";
import { Printer, X } from "lucide-react";
import { COLORS, PRINT_CSS } from "@/lib/tokens";
import { won, pct } from "@/lib/format";
import { groupSums } from "@/lib/pl";
import { brandName } from "@/lib/constants";
import { primaryBtn, secondaryBtn } from "@/components/ui";

export default function ReportOverlay({ store, month, pl, onClose }) {
  const groups = groupSums(pl.byCode);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(27,35,31,0.5)",
        zIndex: 150,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        overflowY: "auto",
        padding: "40px 20px",
      }}
    >
      <style>{PRINT_CSS}</style>
      <div style={{ background: "#fff", width: 720, borderRadius: 10, overflow: "hidden" }}>
        <div
          className="no-print"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 20px",
            borderBottom: `1px solid ${COLORS.line}`,
            background: COLORS.bg,
          }}
        >
          <div style={{ fontSize: 13, color: COLORS.inkSoft }}>가맹점 배포용 리포트 미리보기</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => window.print()} style={primaryBtn}>
              <Printer size={14} /> PDF로 저장 / 인쇄
            </button>
            <button onClick={onClose} style={secondaryBtn}>
              <X size={14} /> 닫기
            </button>
          </div>
        </div>
        <div id="print-report" style={{ padding: "40px 44px", fontFamily: "var(--font-sans-kr)", color: COLORS.ink }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottom: `3px solid ${COLORS.ink}`,
              paddingBottom: 16,
              marginBottom: 24,
            }}
          >
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22 }}>{store?.name}</div>
              <div style={{ fontSize: 13, color: COLORS.inkSoft, marginTop: 4 }}>
                {brandName(store?.brand_id)} · 가맹점코드 {store?.code} · {store?.complex_type} · {store?.store_type}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: COLORS.inkSoft }}>정산월</div>
              <div style={{ fontFamily: "var(--font-mono-kr)", fontSize: 18, fontWeight: 600 }}>{month}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 26 }}>
            <div style={{ border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 11.5, color: COLORS.inkSoft, marginBottom: 6 }}>매출</div>
              <div style={{ fontFamily: "var(--font-mono-kr)", fontSize: 17 }}>{won(pl.revenue)}</div>
            </div>
            <div style={{ border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 11.5, color: COLORS.inkSoft, marginBottom: 6 }}>영업이익</div>
              <div style={{ fontFamily: "var(--font-mono-kr)", fontSize: 17, color: pl.profit >= 0 ? COLORS.accent : COLORS.danger }}>
                {won(pl.profit)}
              </div>
            </div>
            <div style={{ border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: 14 }}>
              <div style={{ fontSize: 11.5, color: COLORS.inkSoft, marginBottom: 6 }}>영업이익률</div>
              <div style={{ fontFamily: "var(--font-mono-kr)", fontSize: 17 }}>{pct(pl.margin)}</div>
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <tbody>
              <tr style={{ borderTop: `2px solid ${COLORS.ink}`, borderBottom: `1px solid ${COLORS.line}` }}>
                <td style={{ padding: "8px 4px", fontWeight: 600 }}>매출</td>
                <td style={{ padding: "8px 4px", textAlign: "right", fontFamily: "var(--font-mono-kr)" }}>{won(pl.revenue)}</td>
              </tr>
              {["매출원가", "고정비", "변동비"].map((cat) => {
                const items = groups.filter((g) => g.category === cat);
                const subtotal = items.reduce((s, g) => s + g.amount, 0);
                return (
                  <Fragment key={cat}>
                    <tr>
                      <td style={{ padding: "7px 4px", fontWeight: 600, color: COLORS.inkSoft }}>{cat}</td>
                      <td style={{ padding: "7px 4px", textAlign: "right", fontFamily: "var(--font-mono-kr)", color: COLORS.inkSoft }}>
                        - {won(subtotal)}
                      </td>
                    </tr>
                    {items.map((g) => (
                      <tr key={g.group}>
                        <td style={{ padding: "5px 4px 5px 18px", fontSize: 12, color: COLORS.inkSoft }}>{g.group}</td>
                        <td style={{ padding: "5px 4px", textAlign: "right", fontFamily: "var(--font-mono-kr)", fontSize: 12, color: COLORS.inkSoft }}>
                          - {won(g.amount)}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                );
              })}
              <tr style={{ borderTop: `2px solid ${COLORS.ink}` }}>
                <td style={{ padding: "10px 4px", fontWeight: 700, fontSize: 14 }}>영업이익</td>
                <td style={{ padding: "10px 4px", textAlign: "right", fontFamily: "var(--font-mono-kr)", fontWeight: 700, fontSize: 14 }}>
                  {won(pl.profit)}
                </td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: 30, fontSize: 11, color: COLORS.inkSoft, borderTop: `1px solid ${COLORS.line}`, paddingTop: 12 }}>
            본 리포트는 본사 승인 완료 데이터를 기준으로 자동 생성되었습니다. · 생성일 {new Date().toLocaleDateString("ko-KR")}
          </div>
        </div>
      </div>
    </div>
  );
}
