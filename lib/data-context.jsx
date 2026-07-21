"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const DataContext = createContext(null);

const PAGE_SIZE = 1000;

// Supabase caps a single select at 1000 rows by default. financial_entries
// can easily exceed that once a few months of data pile up, so page through.
async function fetchAllRows(table, select = "*", orderColumn) {
  let from = 0;
  let all = [];
  for (;;) {
    let query = supabase.from(table).select(select).range(from, from + PAGE_SIZE - 1);
    if (orderColumn) query = query.order(orderColumn, { ascending: true });
    const { data, error } = await query;
    if (error) throw error;
    all = all.concat(data ?? []);
    if (!data || data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return all;
}

export function DataProvider({ children }) {
  const [stores, setStores] = useState([]);
  const [financials, setFinancials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [report, setReport] = useState(null);

  const openReport = useCallback((store, month, pl) => setReport({ store, month, pl }), []);
  const closeReport = useCallback(() => setReport(null), []);

  const flashToast = useCallback((msg, ms = 4000) => {
    setToast(msg);
    if (ms) setTimeout(() => setToast(""), ms);
  }, []);

  const refetchStores = useCallback(async () => {
    const data = await fetchAllRows("stores", "*", "name");
    setStores(data);
    return data;
  }, []);

  const refetchFinancials = useCallback(async () => {
    const data = await fetchAllRows("financial_entries", "*");
    setFinancials(data);
    return data;
  }, []);

  const refetchAll = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError(
        "Supabase 연결 정보가 설정되지 않았습니다. .env.local.example을 .env.local로 복사하고 프로젝트 URL/anon key를 입력한 뒤 서버를 다시 시작하세요."
      );
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      await Promise.all([refetchStores(), refetchFinancials()]);
      setError(null);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [refetchStores, refetchFinancials]);

  useEffect(() => {
    // Initial bootstrap fetch on mount — intentionally run once.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Full replace semantics for a store+month: whatever the wizard submits
  // becomes the complete set of line items for that period.
  const submitEntries = useCallback(
    async ({ storeId, month, writer, records }) => {
      const { error: delErr } = await supabase
        .from("financial_entries")
        .delete()
        .eq("store_id", storeId)
        .eq("month", month);
      if (delErr) throw delErr;
      if (records.length > 0) {
        const rows = records.map((r) => ({
          store_id: storeId,
          month,
          account_code: r.accountCode,
          amount: r.amount,
          qty: r.qty ?? null,
          status: "pending",
          source: "manual",
          writer,
        }));
        const { error: insErr } = await supabase.from("financial_entries").insert(rows);
        if (insErr) throw insErr;
      }
      await refetchFinancials();
    },
    [refetchFinancials]
  );

  const decide = useCallback(
    async (storeId, month, decision, approverName) => {
      if (decision === "reject") {
        const { error: err } = await supabase
          .from("financial_entries")
          .delete()
          .eq("store_id", storeId)
          .eq("month", month)
          .eq("status", "pending");
        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from("financial_entries")
          .update({ status: "confirmed", approved_by: approverName, approved_at: new Date().toISOString() })
          .eq("store_id", storeId)
          .eq("month", month)
          .eq("status", "pending");
        if (err) throw err;
      }
      await refetchFinancials();
    },
    [refetchFinancials]
  );

  const addStore = useCallback(
    async (store) => {
      const { error: err } = await supabase.from("stores").insert({
        code: store.code,
        name: store.name,
        brand_id: store.brandId,
        complex_type: store.complexType,
        store_type: store.storeType,
      });
      if (err) throw err;
      await refetchStores();
    },
    [refetchStores]
  );

  const editStore = useCallback(
    async (store) => {
      const { error: err } = await supabase
        .from("stores")
        .update({
          code: store.code,
          name: store.name,
          brand_id: store.brandId,
          complex_type: store.complexType,
          store_type: store.storeType,
        })
        .eq("id", store.id);
      if (err) throw err;
      await refetchStores();
    },
    [refetchStores]
  );

  const deleteStore = useCallback(
    async (storeId) => {
      // financial_entries.store_id has ON DELETE CASCADE, so this cleans
      // up the store's history automatically.
      const { error: err } = await supabase.from("stores").delete().eq("id", storeId);
      if (err) throw err;
      await Promise.all([refetchStores(), refetchFinancials()]);
    },
    [refetchStores, refetchFinancials]
  );

  const pendingCount = useMemo(
    () =>
      new Set(financials.filter((f) => f.status === "pending").map((f) => `${f.store_id}_${f.month}`))
        .size,
    [financials]
  );

  const value = {
    stores,
    financials,
    loading,
    error,
    toast,
    flashToast,
    wizardOpen,
    setWizardOpen,
    report,
    openReport,
    closeReport,
    refetchAll,
    refetchStores,
    refetchFinancials,
    submitEntries,
    decide,
    addStore,
    editStore,
    deleteStore,
    pendingCount,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useFranchiseData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useFranchiseData must be used within DataProvider");
  return ctx;
}
