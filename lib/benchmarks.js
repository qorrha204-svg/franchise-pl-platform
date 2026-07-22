import { ACCOUNTS, getAccount } from "./constants";

const COST_CODES = ACCOUNTS.filter((a) => a.type === "cost").map((a) => a.code);

// Average cost-to-revenue ratio per account, computed only from confirmed
// store/month records that were actually profitable (흑자). Used both by
// the 예정 계산기 planner and by the store-detail solution suggestions, so
// both features are grounded in the same "what do healthy stores look
// like" baseline.
export function computeBenchmarkRatios(financials) {
  const byStoreMonth = new Map();
  financials.forEach((f) => {
    if (f.status !== "confirmed") return;
    const key = `${f.store_id}_${f.month}`;
    if (!byStoreMonth.has(key)) byStoreMonth.set(key, []);
    byStoreMonth.get(key).push(f);
  });

  const ratioSums = {};
  COST_CODES.forEach((c) => (ratioSums[c] = 0));
  let sampleCount = 0;

  byStoreMonth.forEach((rows) => {
    const revenue = rows
      .filter((r) => getAccount(r.account_code)?.type === "revenue")
      .reduce((s, r) => s + Number(r.amount), 0);
    if (revenue <= 0) return;

    const byCode = {};
    let cost = 0;
    rows
      .filter((r) => getAccount(r.account_code)?.type === "cost")
      .forEach((r) => {
        byCode[r.account_code] = (byCode[r.account_code] || 0) + Number(r.amount);
        cost += Number(r.amount);
      });

    const profit = revenue - cost;
    if (profit <= 0) return; // only profitable store/months set the benchmark

    sampleCount += 1;
    COST_CODES.forEach((c) => {
      ratioSums[c] += (byCode[c] || 0) / revenue;
    });
  });

  const avgRatios = {};
  COST_CODES.forEach((c) => {
    avgRatios[c] = sampleCount > 0 ? ratioSums[c] / sampleCount : 0;
  });

  return { avgRatios, sampleCount };
}
