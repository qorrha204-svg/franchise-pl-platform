"use client";

import { useMemo, useState } from "react";
import { Building2, Check, X } from "lucide-react";
import { COLORS } from "@/lib/tokens";
import { won } from "@/lib/format";
import { computePL } from "@/lib/pl";
import { brandName } from "@/lib/constants";
import { storeById } from "@/lib/stores";
import { useFranchiseData } from "@/lib/data-context";
import { Card, Num, primaryBtn, secondaryBtn } from "@/components/ui";

export default function ApprovalPage() {
  const { stores, financials, decide, flashToast } = useFranchiseData();
  const [approverNames, setApproverNames] = useState({});
  const [busyKey, setBusyKey] = useState(null);

  const batches = useMemo(() => {
    const map = new Map();
    financials.forEach((f) => {
      if (f.status !== "pending") return;
      const key = `${f.store_id}_${f.month}`;
      if (!map.has(key)) map.set(key, { storeId: f.store_id, month: f.month, writer: f.writer, rows: [] });
      map.get(key).rows.push(f);
    });
    return Array.from(map.values()).map((b) => ({
      ...b,
      pl: computePL(b.storeId, b.month, financials, ["pending"]),
      store: storeById(stores, b.storeId),
    }));
  }, [financials, stores]);

  const handleDecision = async (storeId, month, decision, approverName) => {
    const key = `${storeId}_${month}`;
    setBusyKey(key);
    try {
      await decide(storeId, month, decision, approverName);
      flashToast(decision === "confirmed" ? "승인 처리되었습니다." : "반려 처리되었습니다.", 3000);
    } catch (e) {
      flashToast(`처리 실패: ${e.message || e}`, 5000);
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: COLORS.ink, marginBottom: 4 }}>
        승인 관리
      </h1>
      <p style={{ color: COLORS.inkSoft, fontSize: 13, marginBottom: 20 }}>승인자 이름을 입력해야 승인 처리됩니다.</p>
      {batches.length === 0 ? (
        <Card>
          <div style={{ textAlign: "center", padding: "30px 0", color: COLORS.inkSoft, fontSize: 13 }}>
            승인 대기 중인 항목이 없습니다.
          </div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {batches.map((b) => {
            const key = `${b.storeId}_${b.month}`;
            const approver = approverNames[key] || "";
            const busy = busyKey === key;
            return (
              <Card key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <Building2 size={18} color={COLORS.accent} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.ink }}>{b.store?.name}</div>
                    <div style={{ fontSize: 12, color: COLORS.inkSoft }}>
                      {b.month} · {brandName(b.store?.brand_id)} · 작성자 {b.writer || "-"} · {b.rows.length}개 항목
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: COLORS.inkSoft }}>매출 / 영업이익</div>
                    <div style={{ fontSize: 13 }}>
                      <Num value={won(b.pl.revenue)} /> <span style={{ color: COLORS.inkSoft }}>/</span>{" "}
                      <Num value={won(b.pl.profit)} tone={b.pl.profit >= 0 ? "good" : "bad"} />
                    </div>
                  </div>
                  <input
                    value={approver}
                    onChange={(e) => setApproverNames({ ...approverNames, [key]: e.target.value })}
                    placeholder="승인자 이름"
                    style={{ width: 110, fontFamily: "var(--font-sans-kr)", fontSize: 12.5, padding: "8px 10px", borderRadius: 6, border: `1px solid ${COLORS.line}` }}
                  />
                  <button
                    onClick={() => approver.trim() && handleDecision(b.storeId, b.month, "confirmed", approver.trim())}
                    disabled={!approver.trim() || busy}
                    style={{ ...primaryBtn, opacity: approver.trim() && !busy ? 1 : 0.4, cursor: approver.trim() && !busy ? "pointer" : "not-allowed" }}
                  >
                    <Check size={14} /> 승인
                  </button>
                  <button
                    onClick={() => handleDecision(b.storeId, b.month, "reject")}
                    disabled={busy}
                    style={{ ...secondaryBtn, color: COLORS.danger, borderColor: COLORS.danger, opacity: busy ? 0.5 : 1 }}
                  >
                    <X size={14} /> 반려
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
