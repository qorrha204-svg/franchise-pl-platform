import { ACCOUNTS } from "./constants";

const COST_CODES = ACCOUNTS.filter((a) => a.type === "cost").map((a) => a.code);
const OTHER_CODES = COST_CODES.filter((c) => c !== "FIX-RENT");

function roundTo1000(n) {
  return Math.round(n / 1000) * 1000;
}

// Suggests a per-account cost plan for a target revenue, grounded in the
// profitable-store benchmark ratios. Rent is treated separately (real
// rent is location-specific and not well predicted by a revenue ratio):
// if the user supplies it, it's used as-is. When a target operating
// profit is also supplied, every other cost category is scaled up or
// down (preserving their relative proportions from the benchmark) so the
// plan hits that target exactly, rent included.
export function suggestPlan({ targetRevenue, rentOverride, targetProfit, avgRatios }) {
  const rentRatio = avgRatios["FIX-RENT"] || 0;
  const rent = rentOverride != null ? rentOverride : roundTo1000(targetRevenue * rentRatio);

  const flatOthers = {};
  let flatOthersTotal = 0;
  OTHER_CODES.forEach((c) => {
    const v = roundTo1000(targetRevenue * (avgRatios[c] || 0));
    flatOthers[c] = v;
    flatOthersTotal += v;
  });

  let byCode = { "FIX-RENT": rent, ...flatOthers };
  let scaled = false;

  if (targetProfit != null) {
    const availableForOthers = targetRevenue - rent - targetProfit;
    if (flatOthersTotal > 0 && availableForOthers >= 0) {
      const scale = availableForOthers / flatOthersTotal;
      const scaledOthers = {};
      OTHER_CODES.forEach((c) => {
        scaledOthers[c] = roundTo1000(flatOthers[c] * scale);
      });
      byCode = { "FIX-RENT": rent, ...scaledOthers };
      scaled = true;
    }
  }

  const totalCost = Object.values(byCode).reduce((s, v) => s + v, 0);
  const profit = targetRevenue - totalCost;
  const margin = targetRevenue > 0 ? profit / targetRevenue : 0;

  return {
    revenue: targetRevenue,
    totalCost,
    profit,
    margin,
    byCode,
    revenueDetail: [],
    hasPending: false,
    writer: null,
    approvedBy: null,
    rent,
    scaled,
  };
}
