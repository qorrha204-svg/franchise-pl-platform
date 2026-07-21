"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { COLORS } from "@/lib/tokens";
import { ACCOUNTS, DELIVERY_CODES, STEPS } from "@/lib/constants";
import { labelStyle, inputStyle, primaryBtn, secondaryBtn } from "@/components/ui";
import { FieldRow, DeliveryFieldRow } from "@/components/fieldInputs";

// Only steps with an account grouping belong here — "basic"/"revenue"/"review"
// are handled elsewhere (revenue has its own hall+delivery layout above).
const EDIT_STEPS = STEPS.filter((s) => s.groups);

function buildInitial(financials, storeId, month) {
  const rows = financials.filter((f) => f.store_id === storeId && f.month === month);
  const values = {};
  const qtys = {};
  ACCOUNTS.forEach((a) => {
    const row = rows.find((r) => r.account_code === a.code);
    values[a.code] = row ? String(row.amount) : "";
    if (DELIVERY_CODES.includes(a.code)) qtys[a.code] = row?.qty ? String(row.qty) : "";
  });
  return { values, qtys };
}

export default function EditStoreEntry({ store, month, financials, onClose, onSubmit, submitting }) {
  const [initial] = useState(() => buildInitial(financials, store.id, month));
  const [editor, setEditor] = useState("");
  const [values, setValues] = useState(initial.values);
  const [qtys, setQtys] = useState(initial.qtys);

  const setVal = (code, v) => setValues((prev) => ({ ...prev, [code]: v }));
  const setQty = (code, v) => setQtys((prev) => ({ ...prev, [code]: v }));

  const changedCodes = ACCOUNTS.filter((a) => {
    const oldAmt = Number(initial.values[a.code] || 0);
    const newAmt = Number(values[a.code] || 0);
    if (oldAmt !== newAmt) return true;
    if (DELIVERY_CODES.includes(a.code)) {
      const oldQty = Number(initial.qtys[a.code] || 0);
      const newQty = Number(qtys[a.code] || 0);
      if (oldQty !== newQty) return true;
    }
    return false;
  }).map((a) => a.code);

  const canSubmit = editor.trim() && changedCodes.length > 0;

  const submit = () => {
    if (!canSubmit) return;
    const changes = changedCodes.map((code) => ({
      accountCode: code,
      oldAmount: Number(initial.values[code] || 0),
      newAmount: Number(values[code] || 0),
      oldQty: DELIVERY_CODES.includes(code) ? Number(initial.qtys[code] || 0) : undefined,
      newQty: DELIVERY_CODES.includes(code) ? Number(qtys[code] || 0) : undefined,
    }));
    onSubmit({ storeId: store.id, month, editor: editor.trim(), changes });
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
          width: "min(640px, 94vw)",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${COLORS.line}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: COLORS.ink }}>
              {store.name} · {month} 손익 수정
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.inkSoft }}>
              <X size={18} />
            </button>
          </div>
          <div style={{ fontSize: 11.5, color: COLORS.inkSoft, marginTop: 6 }}>
            변경한 항목만 승인대기 상태로 다시 제출됩니다. 승인관리에서 재승인이 필요합니다.
          </div>
        </div>
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>수정자</label>
            <input
              value={editor}
              onChange={(e) => setEditor(e.target.value)}
              placeholder="예: 홍길동"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.accent, marginBottom: 4 }}>홀 매출</div>
            <FieldRow name="홀 매출" value={values["REV-HALL"] || ""} onChange={(v) => setVal("REV-HALL", v)} />
          </div>
          <div style={{ marginBottom: 18 }}>
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

          {EDIT_STEPS.map((step) => (
            <div key={step.id} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.ink, margin: "14px 0 6px" }}>{step.title}</div>
              {step.groups.map((g) => (
                <div key={g.label} style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.accent, marginBottom: 4 }}>{g.label}</div>
                  {g.fields.map((f) => (
                    <FieldRow key={f.code} name={f.name} value={values[f.code] || ""} onChange={(v) => setVal(f.code, v)} />
                  ))}
                </div>
              ))}
            </div>
          ))}

          {changedCodes.length > 0 && (
            <div style={{ background: COLORS.accentSoft, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: COLORS.accent, fontWeight: 600 }}>
              {changedCodes.length}개 항목이 변경되었습니다.
            </div>
          )}
        </div>
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${COLORS.line}`, display: "flex", justifyContent: "space-between" }}>
          <button onClick={onClose} style={secondaryBtn}>
            취소
          </button>
          <button
            onClick={submit}
            disabled={!canSubmit || submitting}
            style={{ ...primaryBtn, opacity: canSubmit && !submitting ? 1 : 0.4, cursor: canSubmit && !submitting ? "pointer" : "not-allowed" }}
          >
            <Check size={14} /> {submitting ? "제출 중..." : "수정 제출"}
          </button>
        </div>
      </div>
    </div>
  );
}
