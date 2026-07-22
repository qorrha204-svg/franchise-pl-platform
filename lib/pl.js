import { ACCOUNTS, getAccount, brandName } from "./constants";
import { currentMonth } from "./date";

export function computePL(storeId, monthOrMonths, financials, statuses = ["confirmed", "pending"]) {
  const months = Array.isArray(monthOrMonths) ? monthOrMonths : [monthOrMonths];
  const rows = financials.filter(
    (f) => f.store_id === storeId && months.includes(f.month) && statuses.includes(f.status)
  );
  const revenue = rows
    .filter((r) => getAccount(r.account_code)?.type === "revenue")
    .reduce((s, r) => s + Number(r.amount), 0);

  let totalCost = 0;
  const byCode = {};
  rows
    .filter((r) => getAccount(r.account_code)?.type === "cost")
    .forEach((r) => {
      byCode[r.account_code] = (byCode[r.account_code] || 0) + Number(r.amount);
      totalCost += Number(r.amount);
    });

  const revenueDetail = ACCOUNTS.filter((a) => a.type === "revenue").map((a) => {
    const matched = rows.filter((r) => r.account_code === a.code);
    return {
      code: a.code,
      name: a.name,
      amount: matched.reduce((s, r) => s + Number(r.amount), 0),
      qty: matched.reduce((s, r) => s + (r.qty || 0), 0),
    };
  });

  const profit = revenue - totalCost;
  return {
    revenue,
    totalCost,
    profit,
    margin: revenue > 0 ? profit / revenue : 0,
    byCode,
    revenueDetail,
    hasPending: rows.some((r) => r.status === "pending"),
    writer: rows.find((r) => r.writer)?.writer,
    approvedBy: rows.find((r) => r.approved_by)?.approved_by,
  };
}

// Rescales a computePL() result from a period total to a per-month average.
// margin is a ratio and stays correct without adjustment (numerator and
// denominator scale together); count<=1 returns pl unchanged.
export function averagePL(pl, count) {
  if (!count || count <= 1) return pl;
  const byCode = {};
  Object.keys(pl.byCode).forEach((code) => {
    byCode[code] = pl.byCode[code] / count;
  });
  const revenueDetail = pl.revenueDetail.map((r) => ({
    ...r,
    amount: r.amount / count,
    qty: r.qty ? Math.round(r.qty / count) : r.qty,
  }));
  return {
    ...pl,
    revenue: pl.revenue / count,
    totalCost: pl.totalCost / count,
    profit: pl.profit / count,
    byCode,
    revenueDetail,
  };
}

export function groupSums(byCode) {
  const groups = {};
  ACCOUNTS.filter((a) => a.type === "cost").forEach((a) => {
    const key = `${a.category}__${a.group}`;
    groups[key] = groups[key] || { category: a.category, group: a.group, amount: 0 };
    groups[key].amount += byCode[a.code] || 0;
  });
  return Object.values(groups);
}

export function categoryTotals(byCode) {
  const totals = { 매출원가: 0, 고정비: 0, 변동비: 0 };
  ACCOUNTS.filter((a) => a.type === "cost").forEach((a) => {
    totals[a.category] += byCode[a.code] || 0;
  });
  return totals;
}

export function allMonths(financials) {
  return Array.from(new Set([currentMonth(), ...financials.map((f) => f.month)])).sort();
}

export function buildRawRows(financials, stores, storeId) {
  const storeById = (id) => stores.find((s) => s.id === id);
  return financials
    .filter((f) => !storeId || f.store_id === storeId)
    .map((f) => {
      const store = storeById(f.store_id);
      const acc = getAccount(f.account_code);
      return {
        매장코드: store?.code,
        매장명: store?.name,
        브랜드: brandName(store?.brand_id),
        타입구분: store?.store_type,
        정산월: f.month,
        대분류: acc?.category,
        중분류: acc?.group,
        계정과목코드: f.account_code,
        계정과목명: acc?.name,
        금액: f.amount,
        건수: f.qty ?? "",
        상태: f.status === "confirmed" ? "확정" : f.status === "pending" ? "승인대기" : f.status,
        작성자: f.writer ?? "",
        승인자: f.approved_by ?? "",
      };
    });
}
