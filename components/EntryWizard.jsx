"use client";

import { useState } from "react";
import { X, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { COLORS } from "@/lib/tokens";
import { won, fmtNum } from "@/lib/format";
import { ACCOUNTS, DELIVERY_CODES, STEPS } from "@/lib/constants";
import { storeById } from "@/lib/stores";
import { currentMonth } from "@/lib/date";
import { primaryBtn, secondaryBtn, labelStyle, inputStyle, MoneyInput, Num } from "@/components/ui";

function FieldRow({ name, value, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "9px 0",
        borderBottom: `1px solid ${COLORS.line}`,
      }}
    >
      <span style={{ fontSize: 13.5, color: COLORS.ink }}>{name}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontFamily: "var(--font-mono-kr)", fontSize: 13, color: COLORS.inkSoft }}>₩</span>
        <MoneyInput value={value} onChange={onChange} />
      </div>
    </div>
  );
}

function DeliveryFieldRow({ name, qty, onQty, amount, onAmount }) {
  const q = Number(qty || 0);
  const a = Number(amount || 0);
  const avg = q > 0 ? Math.round(a / q) : 0;
  return (
    <div style={{ padding: "9px 0", borderBottom: `1px solid ${COLORS.line}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 13.5, color: COLORS.ink }}>{name}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 11.5, color: COLORS.inkSoft }}>건수</span>
            <input
              type="text"
              inputMode="numeric"
              value={fmtNum(qty)}
              onChange={(e) => onQty(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="0"
              style={{
                width: 70,
                textAlign: "right",
                fontFamily: "var(--font-mono-kr)",
                fontSize: 13,
                border: `1px solid ${COLORS.line}`,
                borderRadius: 6,
                padding: "6px 8px",
                color: COLORS.ink,
              }}
            />
            <span style={{ fontSize: 11.5, color: COLORS.inkSoft }}>건</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 11.5, color: COLORS.inkSoft }}>매출</span>
            <span style={{ fontFamily: "var(--font-mono-kr)", fontSize: 13, color: COLORS.inkSoft }}>₩</span>
            <MoneyInput value={amount} onChange={onAmount} />
          </div>
        </div>
      </div>
      {avg > 0 && (
        <div style={{ textAlign: "right", fontSize: 11, color: COLORS.inkSoft, marginTop: 3 }}>
          평균 객단가 약 {won(avg)}
        </div>
      )}
    </div>
  );
}

export default function EntryWizard({ stores, onClose, onSubmit, submitting }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [basic, setBasic] = useState({ writer: "", storeId: "", month: currentMonth() });
  const [values, setValues] = useState({});
  const [qtys, setQtys] = useState({});
  const step = STEPS[stepIdx];

  const setVal = (code, v) => setValues((prev) => ({ ...prev, [code]: v }));
  const setQty = (code, v) => setQtys((prev) => ({ ...prev, [code]: v }));
  const num = (code) => Number(values[code] || 0);

  const hallRev = num("REV-HALL");
  const deliveryRev = DELIVERY_CODES.reduce((s, c) => s + num(c), 0);
  const totalRev = hallRev + deliveryRev;
  const cogsTotal = num("COGS-HQ") + num("COGS-PURCH");
  const fixedCodes = STEPS.find((s) => s.id === "fixed").groups.flatMap((g) => g.fields.map((f) => f.code));
  const varCodes = [...STEPS.find((s) => s.id === "var1").groups, ...STEPS.find((s) => s.id === "var2").groups].flatMap(
    (g) => g.fields.map((f) => f.code)
  );
  const fixedTotal = fixedCodes.reduce((s, c) => s + num(c), 0);
  const varTotal = varCodes.reduce((s, c) => s + num(c), 0);
  const totalCost = cogsTotal + fixedTotal + varTotal;
  const profit = totalRev - totalCost;

  const canNext = step.id !== "basic" || (basic.writer.trim() && basic.storeId);
  const goNext = () => setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  const goPrev = () => setStepIdx((i) => Math.max(i - 1, 0));

  const submit = () => {
    const records = ACCOUNTS.map((a) => ({
      accountCode: a.code,
      amount: num(a.code),
      qty: DELIVERY_CODES.includes(a.code) ? Number(qtys[a.code] || 0) : undefined,
    })).filter((r) => r.amount > 0);
    onSubmit({ storeId: basic.storeId, month: basic.month, writer: basic.writer, records });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(27,35,31,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: COLORS.surface,
          borderRadius: 14,
          width: 640,
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${COLORS.line}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: COLORS.ink }}>
              매장 손익 입력
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.inkSoft }}>
              <X size={18} />
            </button>
          </div>
          <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                style={{ flex: 1, height: 4, borderRadius: 2, background: i <= stepIdx ? COLORS.accent : COLORS.line }}
              />
            ))}
          </div>
          <div style={{ fontSize: 12, color: COLORS.inkSoft }}>
            {stepIdx + 1} / {STEPS.length} · {step.title}
          </div>
        </div>
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {step.id === "basic" && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>작성자</label>
                <input
                  value={basic.writer}
                  onChange={(e) => setBasic({ ...basic, writer: e.target.value })}
                  placeholder="예: 홍길동"
                  style={inputStyle}
                />
                <div style={{ fontSize: 11, color: COLORS.inkSoft, marginTop: 4 }}>직책 없이 이름만 입력해주세요.</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>매장</label>
                <select
                  value={basic.storeId}
                  onChange={(e) => setBasic({ ...basic, storeId: e.target.value })}
                  style={{ ...inputStyle, appearance: "auto" }}
                >
                  <option value="">매장을 선택하세요</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>정산월</label>
                <input
                  type="month"
                  value={basic.month}
                  onChange={(e) => setBasic({ ...basic, month: e.target.value })}
                  style={{ ...inputStyle, appearance: "auto" }}
                />
                <div style={{ fontSize: 11, color: COLORS.inkSoft, marginTop: 4 }}>
                  다음 달로 넘어가면 여기서 새 달을 바로 선택해 입력할 수 있습니다.
                </div>
              </div>
            </div>
          )}
          {step.id === "revenue" && (
            <div>
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.accent, marginBottom: 4 }}>홀 매출</div>
                <FieldRow name="홀 매출" value={values["REV-HALL"] || ""} onChange={(v) => setVal("REV-HALL", v)} />
              </div>
              <div style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.accent, marginBottom: 4 }}>
                  배달 매출 (건수 + 매출 함께 입력)
                </div>
                <DeliveryFieldRow
                  name="배달의민족"
                  qty={qtys["REV-BAEMIN"] || ""}
                  onQty={(v) => setQty("REV-BAEMIN", v)}
                  amount={values["REV-BAEMIN"] || ""}
                  onAmount={(v) => setVal("REV-BAEMIN", v)}
                />
                <DeliveryFieldRow
                  name="쿠팡이츠"
                  qty={qtys["REV-COUPANG"] || ""}
                  onQty={(v) => setQty("REV-COUPANG", v)}
                  amount={values["REV-COUPANG"] || ""}
                  onAmount={(v) => setVal("REV-COUPANG", v)}
                />
                <DeliveryFieldRow
                  name="기타"
                  qty={qtys["REV-ETC"] || ""}
                  onQty={(v) => setQty("REV-ETC", v)}
                  amount={values["REV-ETC"] || ""}
                  onAmount={(v) => setVal("REV-ETC", v)}
                />
              </div>
              <div style={{ background: COLORS.accentSoft, borderRadius: 8, padding: "12px 14px", marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                  <span style={{ color: COLORS.inkSoft }}>배달 매출 합계</span>
                  <Num value={won(deliveryRev)} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700 }}>
                  <span>총매출 (홀 + 배달)</span>
                  <Num value={won(totalRev)} tone="good" />
                </div>
              </div>
            </div>
          )}
          {step.groups &&
            step.groups.map((g) => (
              <div key={g.label} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.accent, marginBottom: 4 }}>{g.label}</div>
                {g.fields.map((f) => (
                  <FieldRow key={f.code} name={f.name} value={values[f.code] || ""} onChange={(v) => setVal(f.code, v)} />
                ))}
              </div>
            ))}
          {step.id === "review" && (
            <div>
              <div style={{ fontSize: 13, color: COLORS.inkSoft, marginBottom: 14 }}>
                {basic.storeId && storeById(stores, basic.storeId)?.name} · {basic.month} · 작성자 {basic.writer}
              </div>
              {[
                { label: "총매출", value: totalRev, bold: true },
                { label: "매출원가", value: -cogsTotal },
                { label: "고정비", value: -fixedTotal },
                { label: "변동비", value: -varTotal },
              ].map((r) => (
                <div
                  key={r.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "9px 0",
                    borderBottom: `1px solid ${COLORS.line}`,
                    fontWeight: r.bold ? 600 : 400,
                  }}
                >
                  <span style={{ fontSize: 13.5 }}>{r.label}</span>
                  <Num value={`${r.value < 0 ? "- " : ""}${won(Math.abs(r.value))}`} />
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 0 4px",
                  borderTop: `2px solid ${COLORS.ink}`,
                  marginTop: 6,
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 700 }}>예상 영업이익</span>
                <span style={{ fontSize: 16 }}>
                  <Num value={won(profit)} tone={profit >= 0 ? "good" : "bad"} />
                </span>
              </div>
              <p style={{ fontSize: 11.5, color: COLORS.inkSoft, marginTop: 14 }}>
                제출하면 본사 승인 대기 상태로 등록됩니다.
              </p>
            </div>
          )}
        </div>
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${COLORS.line}`, display: "flex", justifyContent: "space-between" }}>
          <button onClick={stepIdx === 0 ? onClose : goPrev} style={secondaryBtn}>
            {stepIdx === 0 ? "취소" : (
              <>
                <ArrowLeft size={14} /> 이전
              </>
            )}
          </button>
          {step.id === "review" ? (
            <button onClick={submit} disabled={submitting} style={{ ...primaryBtn, opacity: submitting ? 0.6 : 1 }}>
              <Check size={14} /> {submitting ? "제출 중..." : "제출하기"}
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={!canNext}
              style={{ ...primaryBtn, opacity: canNext ? 1 : 0.4, cursor: canNext ? "pointer" : "not-allowed" }}
            >
              다음 <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
