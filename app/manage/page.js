"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { COLORS } from "@/lib/tokens";
import { BRANDS, brandName } from "@/lib/constants";
import { useFranchiseData } from "@/lib/data-context";
import { Card, Badge, primaryBtn, secondaryBtn, dangerBtn, selectStyle } from "@/components/ui";
import StoreFormModal from "@/components/StoreFormModal";

export default function ManagePage() {
  const { stores, addStore, editStore, deleteStore, flashToast } = useFranchiseData();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [brandFilter, setBrandFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const rows = stores.filter(
    (s) =>
      (brandFilter === "ALL" || s.brand_id === brandFilter) &&
      (query.trim() === "" || s.name.includes(query.trim()) || s.code.includes(query.trim()))
  );

  const handleSave = async (store) => {
    setSaving(true);
    try {
      if (editing) {
        await editStore(store);
        flashToast(`${store.name} 매장 정보가 수정되었습니다.`, 3000);
      } else {
        await addStore(store);
        flashToast(`${store.name} 매장이 추가되었습니다.`, 3000);
      }
      setFormOpen(false);
    } catch (e) {
      flashToast(`저장 실패: ${e.message || e}`, 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (store) => {
    try {
      await deleteStore(store.id);
      flashToast(`${store.name}이(가) 삭제되었습니다.`, 3000);
    } catch (e) {
      flashToast(`삭제 실패: ${e.message || e}`, 5000);
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: COLORS.ink, marginBottom: 4 }}>
            매장 관리
          </h1>
          <p style={{ color: COLORS.inkSoft, fontSize: 13 }}>총 {stores.length}개 매장 · 매장 정보 수정 및 삭제</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          style={primaryBtn}
        >
          <Plus size={14} /> 매장 추가
        </button>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} style={selectStyle}>
          <option value="ALL">전체 브랜드</option>
          {BRANDS.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="매장명 또는 코드 검색"
          style={{ ...selectStyle, width: 220 }}
        />
      </div>
      <Card style={{ padding: 0, maxHeight: 640, overflowY: "auto", overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: COLORS.bg, borderBottom: `1px solid ${COLORS.line}`, position: "sticky", top: 0 }}>
              {["매장", "가맹점코드", "브랜드", "복합점", "타입구분", "주소", ""].map((h) => (
                <th key={h} style={{ textAlign: "left", fontSize: 11, color: COLORS.inkSoft, fontWeight: 500, padding: "10px 12px", background: COLORS.bg }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                <td style={{ padding: "9px 12px", fontSize: 13, color: COLORS.ink, whiteSpace: "nowrap" }}>{s.name}</td>
                <td style={{ padding: "9px 12px", fontSize: 12.5, fontFamily: "var(--font-mono-kr)", color: COLORS.inkSoft, whiteSpace: "nowrap" }}>{s.code}</td>
                <td style={{ padding: "9px 12px", fontSize: 12.5, color: COLORS.inkSoft, whiteSpace: "nowrap" }}>{brandName(s.brand_id)}</td>
                <td style={{ padding: "9px 12px" }}>
                  <Badge>{s.complex_type}</Badge>
                </td>
                <td style={{ padding: "9px 12px" }}>
                  <Badge tone={s.store_type === "배달점" ? "warn" : "neutral"}>{s.store_type}</Badge>
                </td>
                <td
                  style={{
                    padding: "9px 12px",
                    fontSize: 12,
                    color: COLORS.inkSoft,
                    maxWidth: 260,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={s.address || ""}
                >
                  {s.address || <span style={{ color: COLORS.line }}>-</span>}
                </td>
                <td style={{ padding: "9px 12px" }}>
                  {confirmingId === s.id ? (
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: COLORS.danger }}>정말 삭제할까요?</span>
                      <button onClick={() => handleDelete(s)} style={{ ...dangerBtn, padding: "6px 10px" }}>
                        삭제
                      </button>
                      <button onClick={() => setConfirmingId(null)} style={{ ...secondaryBtn, padding: "6px 10px" }}>
                        취소
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => {
                          setEditing(s);
                          setFormOpen(true);
                        }}
                        style={{ ...secondaryBtn, padding: "6px 10px" }}
                      >
                        <Pencil size={12} /> 수정
                      </button>
                      <button
                        onClick={() => setConfirmingId(s.id)}
                        style={{ ...secondaryBtn, padding: "6px 10px", color: COLORS.danger, borderColor: COLORS.danger }}
                      >
                        <Trash2 size={12} /> 삭제
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {formOpen && <StoreFormModal initial={editing} onClose={() => setFormOpen(false)} onSave={handleSave} saving={saving} />}
    </div>
  );
}
