// One-off demo-data seeder: populates realistic, varied P&L numbers for a
// curated set of ~20 real stores across three months, for reporting demos.
// Run with: node scripts/seed-demo-financials.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  const p = path.join(__dirname, "..", ".env.local");
  const content = readFileSync(p, "utf8");
  const env = {};
  for (const line of content.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const env = loadEnvLocal();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// 20 real stores from the master list, deliberately mixed across
// 가마솥/배달점/일반 and regions. 가락 is left untouched — it already has a
// hand-verified demo history (entry -> approval -> edit -> re-approval).
const STORE_CODES = [
  "201431", // 강남구청배달점 (배달점)
  "201681", // 여의도 (가마솥)
  "201169", // 신촌 (일반)
  "200577", // 부산광안 (가마솥)
  "201043", // 대구범어 (일반)
  "201687", // 인천송도 (가마솥)
  "201621", // 수원영통 (가마솥)
  "200870", // 일산주엽 (가마솥)
  "201542", // 대전송촌 (가마솥)
  "201052", // 광주수완 (일반)
  "201668", // 울산삼산 (가마솥)
  "200419", // 청주운천 (가마솥)
  "200357", // 전주아중 (일반)
  "201294", // 창원상남 (가마솥)
  "201733", // 천안불당배달점 (배달점)
  "200378", // 김해장유 (일반)
  "201302", // 마곡배달점 (배달점)
  "201293", // 서초 (일반)
  "201573", // 잠실배달점 (배달점)
  "201644", // 목동사거리 (일반)
];

const MONTHS = ["2026-05", "2026-06", "2026-07"];
const WRITERS = ["홍길동", "김철수", "박영희", "이민수", "정다은", "최지훈", "강수진", "윤도현"];
const APPROVERS = ["김대표", "박팀장", "이본부장"];

function seededRand(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function splitAmount(total, weights) {
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => Math.round((total * w) / sum / 1000) * 1000);
}

const ETC_WEIGHTS = {
  "FIX-INS-4DA": 1.5,
  "FIX-INS-FIRE": 0.8,
  "FIX-MGMT": 1.5,
  "FIX-TAXFEE": 0.8,
  "VAR-DELIVERY": 3,
  "VAR-VEHICLE": 1.5,
  "VAR-COMM-PHONE": 0.5,
  "VAR-COMM-NET": 0.5,
  "VAR-COMM-CABLE": 0.3,
  "VAR-UTIL-ELEC": 2,
  "VAR-UTIL-GAS": 1,
  "VAR-UTIL-WATER": 0.5,
  "VAR-PACK": 1.5,
  "VAR-SECURITY": 0.5,
  "VAR-WATERPUR": 0.3,
  "VAR-WELFARE": 1,
  "VAR-SUPPLY": 0.8,
  "VAR-MISC": 1,
  "VAR-APP-BAEMIN": 2,
  "VAR-APP-COUPANG": 1.5,
  "VAR-APP-ETC": 0.5,
  "VAR-CARDFEE": 2.5,
  "VAR-TAX": 1,
  "VAR-DEPR": 2,
};

async function main() {
  const { data: stores, error } = await supabase.from("stores").select("*").in("code", STORE_CODES);
  if (error) throw error;
  if (stores.length !== STORE_CODES.length) {
    const found = new Set(stores.map((s) => s.code));
    console.warn("Missing store codes:", STORE_CODES.filter((c) => !found.has(c)));
  }

  const rows = [];
  stores.forEach((store, sIdx) => {
    const rnd = seededRand(sIdx * 97 + 13);
    const baseRevenue = 18000000 + rnd() * 28000000; // 18M~46M
    const outlierMult = sIdx % 11 === 0 ? 1.25 : 1;

    MONTHS.forEach((month, mIdx) => {
      const monthRnd = seededRand(sIdx * 97 + 13 + mIdx * 733);
      const monthVar = 0.82 + monthRnd() * 0.36;
      const revenue = Math.round((baseRevenue * monthVar) / 1000) * 1000;

      const isDelivery = store.store_type === "배달점";
      const hallRatio = isDelivery ? 0.05 + monthRnd() * 0.1 : 0.55 + monthRnd() * 0.2;
      const hallRev = Math.round((revenue * hallRatio) / 1000) * 1000;
      const deliveryRev = revenue - hallRev;
      const ticket = 11000 + monthRnd() * 3000;
      const [baemin, coupang, etc] = splitAmount(deliveryRev, [0.5, 0.35, 0.15]);

      const isLastMonth = month === MONTHS[MONTHS.length - 1];
      const pending = isLastMonth && monthRnd() < 0.3;
      const status = pending ? "pending" : "confirmed";
      const writer = WRITERS[(sIdx + mIdx) % WRITERS.length];
      const approver = pending ? null : APPROVERS[sIdx % APPROVERS.length];
      const approvedAt = pending ? null : new Date(Date.UTC(2026, 4 + mIdx, 25, 3, 0, 0)).toISOString();

      const push = (code, amount, qty) => {
        if (!amount || amount <= 0) return;
        rows.push({
          store_id: store.id,
          month,
          account_code: code,
          amount,
          qty: qty ?? null,
          status,
          source: "manual",
          writer,
          approved_by: approver,
          approved_at: approvedAt,
        });
      };

      push("REV-HALL", hallRev);
      push("REV-BAEMIN", baemin, Math.round(baemin / ticket));
      push("REV-COUPANG", coupang, Math.round(coupang / ticket));
      push("REV-ETC", etc, Math.round(etc / ticket));

      const cogsTotal = revenue * (0.32 + monthRnd() * 0.06) * outlierMult;
      const [hq, purch] = splitAmount(cogsTotal, [0.7, 0.3]);
      push("COGS-HQ", hq);
      push("COGS-PURCH", purch);

      const laborTotal = revenue * (0.22 + monthRnd() * 0.06) * outlierMult;
      const [hReg, hPt, hDay, kReg, kPt, kDay] = splitAmount(laborTotal, [0.3, 0.1, 0.05, 0.35, 0.12, 0.08]);
      push("FIX-HALL-REG", hReg);
      push("FIX-HALL-PT", hPt);
      push("FIX-HALL-DAY", hDay);
      push("FIX-KITCHEN-REG", kReg);
      push("FIX-KITCHEN-PT", kPt);
      push("FIX-KITCHEN-DAY", kDay);

      push("FIX-RENT", Math.round((revenue * (0.07 + monthRnd() * 0.04)) / 1000) * 1000);
      push("VAR-ROYALTY", Math.round((revenue * 0.05) / 1000) * 1000);

      const [ad, adshare] = splitAmount(revenue * 0.03, [0.6, 0.4]);
      push("VAR-AD", ad);
      push("VAR-ADSHARE", adshare);

      const etcTotal = revenue * (0.05 + monthRnd() * 0.04) * outlierMult;
      const codes = Object.keys(ETC_WEIGHTS);
      const amounts = splitAmount(
        etcTotal,
        codes.map((c) => ETC_WEIGHTS[c])
      );
      codes.forEach((c, i) => push(c, amounts[i]));
    });
  });

  console.log(`Prepared ${rows.length} rows across ${stores.length} stores × ${MONTHS.length} months`);

  const chunkSize = 500;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error: upErr } = await supabase
      .from("financial_entries")
      .upsert(chunk, { onConflict: "store_id,month,account_code" });
    if (upErr) throw upErr;
    console.log(`Upserted ${i + chunk.length}/${rows.length}`);
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
