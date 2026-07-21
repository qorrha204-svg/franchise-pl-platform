"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  CheckSquare,
  Building2,
  TrendingUp,
  PenLine,
  ClipboardCheck,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import { COLORS } from "@/lib/tokens";
import { useFranchiseData } from "@/lib/data-context";
import { storeById } from "@/lib/stores";
import { Badge } from "@/components/ui";
import EntryWizard from "@/components/EntryWizard";
import ReportOverlay from "@/components/ReportOverlay";

const NAV = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/stores", label: "매장별 손익", icon: Store },
  { href: "/manage", label: "매장 관리", icon: Building2 },
  { href: "/approval", label: "승인관리", icon: CheckSquare, badgeKey: "pending" },
];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { stores, loading, error, toast, flashToast, wizardOpen, setWizardOpen, report, closeReport, submitEntries, pendingCount } =
    useFranchiseData();
  const [submitting, setSubmitting] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleWizardSubmit = async (payload) => {
    setSubmitting(true);
    try {
      await submitEntries(payload);
      setWizardOpen(false);
      const storeName = storeById(stores, payload.storeId)?.name;
      flashToast(`${storeName} · ${payload.month} 손익이 제출되었습니다. 승인관리에서 확인하세요.`);
      router.push("/approval");
    } catch (e) {
      flashToast(`제출 실패: ${e.message || e}`, 5000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          background: COLORS.bg,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-sans-kr)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: COLORS.inkSoft }}>
          <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} />
          <div style={{ fontSize: 13 }}>데이터 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: COLORS.bg,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-sans-kr)",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center", color: COLORS.danger }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>데이터를 불러오지 못했습니다</div>
          <div style={{ fontSize: 13, color: COLORS.inkSoft }}>{error}</div>
          <div style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 12 }}>
            .env.local에 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY가 올바르게 설정되어 있는지, Supabase
            프로젝트에 schema.sql / seed.sql이 적용되었는지 확인해주세요.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "var(--font-sans-kr)" }}>
      <button
        className="app-mobile-menu-btn"
        onClick={() => setMobileNavOpen(true)}
        aria-label="메뉴 열기"
        style={{ color: COLORS.ink }}
      >
        <Menu size={20} />
      </button>
      <div
        className={`app-mobile-backdrop${mobileNavOpen ? " is-open" : ""}`}
        onClick={() => setMobileNavOpen(false)}
      />
      <div className="app-shell-body">
        <div className={`app-sidebar${mobileNavOpen ? " is-open" : ""}`}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px", marginBottom: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  background: COLORS.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TrendingUp size={15} color="#fff" />
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: COLORS.ink }}>
                가족점손익원장
              </div>
            </div>
            <button
              onClick={() => setMobileNavOpen(false)}
              className="app-mobile-close-btn"
              aria-label="메뉴 닫기"
              style={{ color: COLORS.inkSoft, border: "none", background: "none", cursor: "pointer" }}
            >
              <X size={18} />
            </button>
          </div>
          <button
            onClick={() => {
              setWizardOpen(true);
              setMobileNavOpen(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: COLORS.ink,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "11px 12px",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "var(--font-sans-kr)",
              cursor: "pointer",
              marginBottom: 18,
            }}
          >
            <PenLine size={15} /> 매장 손익 입력
          </button>
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = pathname === n.href;
            const badge = n.badgeKey === "pending" ? pendingCount : 0;
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMobileNavOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "9px 10px",
                  borderRadius: 7,
                  cursor: "pointer",
                  marginBottom: 2,
                  textDecoration: "none",
                  background: active ? COLORS.accentSoft : "transparent",
                  color: active ? COLORS.accent : COLORS.inkSoft,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <Icon size={16} />
                  <span style={{ fontSize: 13, fontWeight: active ? 600 : 500 }}>{n.label}</span>
                </div>
                {!!badge && <Badge tone="warn">{badge}</Badge>}
              </Link>
            );
          })}
          <div style={{ marginTop: "auto", padding: "10px 8px", fontSize: 11, color: COLORS.inkSoft, display: "flex", gap: 6, alignItems: "flex-start" }}>
            <ClipboardCheck size={13} style={{ marginTop: 1 }} />
            <span>매장 {stores.length}개 · Supabase 연동</span>
          </div>
        </div>
        <div className="app-main">{children}</div>
      </div>
      {wizardOpen && (
        <EntryWizard stores={stores} onClose={() => setWizardOpen(false)} onSubmit={handleWizardSubmit} submitting={submitting} />
      )}
      {report && <ReportOverlay store={report.store} month={report.month} pl={report.pl} onClose={closeReport} />}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: COLORS.ink,
            color: "#fff",
            padding: "10px 18px",
            borderRadius: 8,
            fontSize: 13,
            fontFamily: "var(--font-sans-kr)",
            zIndex: 200,
            maxWidth: 480,
            textAlign: "center",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
