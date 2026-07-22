"use client";

import { useMemo, useState } from "react";
import { Calculator, TrendingUp } from "lucide-react";
import { COLORS } from "@/lib/tokens";
import { won, pct, fmtNum } from "@/lib/format";
import { computeBenchmarkRatios } from "@/lib/benchmarks";
import { suggestPlan } from "@/lib/planner";
import { useFranchiseData } from "@/lib/data-context";
import { Card, Num, Badge, MoneyInput, primaryBtn, labelStyle } from "@/components/ui";
import PLBreakdown from "@/components/PLBreakdown";

function Field({ label, value, onChange, hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontFamily: "var(--font-mono-kr)", fontSize: 13, color: COLORS.inkSoft }}>₩</span>
        <MoneyInput value={value} onChange={onChange} width={200} />
      </div>
      {hint && <div style={{ fontSize: 11, color: COLORS.inkSoft, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

export default function CalculatorPage() {
  const { financials } = useFranchiseData();
  const { avgRatios, sampleCount } = useMemo(() => computeBenchmarkRatios(financials), [financials]);

  const [revenueInput, setRevenueInput] = useState("");
  const [rentInput, setRentInput] = useState("");
  const [profitInput, setProfitInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const targetRevenue = Number(revenueInput || 0);
  const rentOverride = rentInput ? Number(rentInput) : null;
  const targetProfit = profitInput ? Number(profitInput) : null;

  const canSubmit = targetRevenue > 0 && sampleCount > 0;

  const plan = submitted && canSubmit ? suggestPlan({ targetRevenue, rentOverride, targetProfit, avgRatios }) : null;
  const gap = plan && targetProfit != null ? plan.profit - targetProfit : null;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <Calculator size={22} color={COLORS.accent} />
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: COLORS.ink, margin: 0 }}>
          예정 계산기
        </h1>
      </div>
      <p style={{ color: COLORS.inkSoft, fontSize: 13, marginBottom: 20 }}>
        예비 점주·상담자를 위한 영업이익 계산기입니다. 목표매출을 입력하면 실제로 흑자를 내고 있는 매장들의 평균
        비용 구조를 기준으로 계정과목별 적정 수치를 제안합니다.
      </p>

      <div className="grid-2col-rev">
        <Card style={{ alignSelf: "flex-start" }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.ink, marginBottom: 14 }}>입력값</div>
          <Field label="목표매출 (월, 필수)" value={revenueInput} onChange={setRevenueInput} hint="이 매장이 목표로 하는 월 매출입니다." />
          <Field
            label="임차료 (선택)"
            value={rentInput}
            onChange={setRentInput}
            hint="입력하지 않으면 평균 비율로 추정합니다. 임차료는 입지별 편차가 커서 알고 있다면 직접 입력하는 것이 정확합니다."
          />
          <Field
            label="목표 영업이익 (선택)"
            value={profitInput}
            onChange={setProfitInput}
            hint="입력하면 임차료를 제외한 나머지 비용 항목들을 이 목표에 맞춰 비례 조정해서 제안합니다."
          />
          <button
            onClick={() => setSubmitted(true)}
            disabled={!canSubmit}
            style={{ ...primaryBtn, opacity: canSubmit ? 1 : 0.4, cursor: canSubmit ? "pointer" : "not-allowed", width: "100%", justifyContent: "center" }}
          >
            <TrendingUp size={14} /> 적정 수치 계산하기
          </button>
          {sampleCount === 0 && (
            <div style={{ marginTop: 12, fontSize: 12, color: COLORS.danger }}>
              계산에 사용할 흑자 매장 데이터가 아직 없습니다. 매장 손익이 승인 확정되면 계산할 수 있습니다.
            </div>
          )}
          {sampleCount > 0 && (
            <div style={{ marginTop: 12, fontSize: 11.5, color: COLORS.inkSoft }}>
              흑자를 기록한 매장·월 데이터 {fmtNum(sampleCount)}건을 기준으로 계산합니다.
            </div>
          )}
        </Card>

        <div>
          {!plan && (
            <Card>
              <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.inkSoft, fontSize: 13 }}>
                목표매출을 입력하고 계산하기를 누르면 이 자리에 추천 손익 구조가 표시됩니다.
              </div>
            </Card>
          )}
          {plan && (
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.ink, fontFamily: "var(--font-display)" }}>
                  제안 손익 구조
                </div>
                <Badge tone={plan.profit >= 0 ? "good" : "bad"}>예상 영업이익률 {pct(plan.margin)}</Badge>
              </div>
              {targetProfit != null && (
                <div
                  style={{
                    background: gap >= 0 ? COLORS.accentSoft : COLORS.dangerSoft,
                    borderRadius: 8,
                    padding: "10px 14px",
                    marginBottom: 14,
                    fontSize: 12.5,
                  }}
                >
                  목표 영업이익 <Num value={won(targetProfit)} /> 대비 예상 영업이익 <Num value={won(plan.profit)} />
                  {" · "}
                  <Num value={`${gap >= 0 ? "+" : ""}${won(gap)}`} tone={gap >= 0 ? "good" : "bad"} />
                  {gap >= 0 ? " 여유" : " 부족"}
                  {!plan.scaled && (
                    <div style={{ marginTop: 6, color: COLORS.danger }}>
                      ⚠ 임차료와 목표 영업이익만으로 이미 매출을 초과해 나머지 비용을 목표에 정확히 맞출 수 없습니다.
                      아래는 평균 비율 기준 추정치입니다.
                    </div>
                  )}
                </div>
              )}
              <PLBreakdown pl={plan} />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
