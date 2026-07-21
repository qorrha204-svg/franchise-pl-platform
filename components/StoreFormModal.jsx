"use client";

import { useState } from "react";
import { X, Check, Plus } from "lucide-react";
import { COLORS } from "@/lib/tokens";
import { BRANDS } from "@/lib/constants";
import { primaryBtn, secondaryBtn, labelStyle, inputStyle } from "@/components/ui";

export default function StoreFormModal({ initial, onClose, onSave, saving }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    initial
      ? { ...initial, brandId: initial.brand_id, complexType: initial.complex_type, storeType: initial.store_type }
      : { name: "", code: "", brandId: "WONSSAM", complexType: "단독점", storeType: "일반" }
  );
  const canSubmit = form.name.trim() && form.code.trim();

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
      <div style={{ background: COLORS.surface, borderRadius: 14, width: "min(420px, 92vw)", overflow: "hidden" }}>
        <div
          style={{
            padding: "18px 24px",
            borderBottom: `1px solid ${COLORS.line}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: COLORS.ink }}>
            {isEdit ? "매장 수정" : "매장 추가"}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.inkSoft }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>매장</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="예: 가락" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>가맹점코드</label>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="예: 200059" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>브랜드</label>
            <select value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })} style={{ ...inputStyle, appearance: "auto" }}>
              {BRANDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>복합점</label>
            <select
              value={form.complexType}
              onChange={(e) => setForm({ ...form, complexType: e.target.value })}
              style={{ ...inputStyle, appearance: "auto" }}
            >
              <option value="단독점">단독점</option>
              <option value="복합점">복합점</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>타입구분</label>
            <select value={form.storeType} onChange={(e) => setForm({ ...form, storeType: e.target.value })} style={{ ...inputStyle, appearance: "auto" }}>
              <option value="가마솥">가마솥</option>
              <option value="배달점">배달점</option>
              <option value="일반">일반</option>
            </select>
          </div>
        </div>
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${COLORS.line}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={secondaryBtn}>
            취소
          </button>
          <button
            onClick={() =>
              canSubmit &&
              onSave({
                id: isEdit ? initial.id : undefined,
                name: form.name.trim(),
                code: form.code.trim(),
                brandId: form.brandId,
                complexType: form.complexType,
                storeType: form.storeType,
              })
            }
            disabled={!canSubmit || saving}
            style={{ ...primaryBtn, opacity: canSubmit && !saving ? 1 : 0.4, cursor: canSubmit && !saving ? "pointer" : "not-allowed" }}
          >
            {isEdit ? (
              <>
                <Check size={14} /> 저장
              </>
            ) : (
              <>
                <Plus size={14} /> 추가
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
