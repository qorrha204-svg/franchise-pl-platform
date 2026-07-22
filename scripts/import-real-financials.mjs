// One-off real-data importer: replaces the synthetic demo P&L data with
// actual 2026-04~06 figures extracted from two HQ-provided source workbooks.
//   - "26년 6월 원쌈 손익 취합_v5 -남부사업팀.xlsx" (5 rep sheets, June only, southern-region stores)
//   - "260721_(원쌈) 26년 4~6월 손익계산_취합본-백승명 수정.xlsx" (62 per-store sheets, monthly columns)
// Both files share an identical chart-of-accounts row order (the per-store
// file additionally has a "주류" alcohol-COGS row the rep file omits).
// Run with: node scripts/import-real-financials.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import XLSX from "xlsx";

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

const FILE_PER_STORE = "C:/Users/wonandone/Desktop/260721_(원쌈) 26년 4~6월 손익계산_취합본-백승명 수정.xlsx";
const FILE_REGIONAL = "C:/Users/wonandone/Desktop/26년 6월 원쌈 손익 취합_v5 -남부사업팀.xlsx";

// Row order confirmed identical across 가마솥/배달점/일반 templates and both
// files (the regional file just omits the "주류" row). null = subtotal/skip.
// "REV-HALL" absorbs 총매출액 whole (no channel-split data in either source,
// per user decision). 요기요 is merged into VAR-APP-ETC alongside "기타"
// (per user decision — no dedicated 요기요 slot in the app's chart of accounts).
const CODE_SEQ_WITH_ALCOHOL = [
  "REV-HALL", null, "COGS-HQ", "COGS-PURCH", null, null, null, null,
  "FIX-HALL-REG", "FIX-HALL-PT", "FIX-HALL-DAY",
  "FIX-KITCHEN-REG", "FIX-KITCHEN-PT", "FIX-KITCHEN-DAY",
  "FIX-INS-4DA", "FIX-INS-FIRE", "FIX-RENT", "FIX-MGMT", "FIX-TAXFEE",
  null,
  "VAR-DELIVERY", "VAR-VEHICLE",
  "VAR-COMM-PHONE", "VAR-COMM-NET", "VAR-COMM-CABLE",
  "VAR-UTIL-ELEC", "VAR-UTIL-GAS", "VAR-UTIL-WATER",
  "VAR-AD", "VAR-PACK",
  "VAR-APP-BAEMIN", "VAR-APP-ETC", "VAR-APP-COUPANG", "VAR-APP-ETC",
  "VAR-CARDFEE", "VAR-SECURITY", "VAR-WATERPUR", "VAR-WELFARE", "VAR-SUPPLY", "VAR-MISC",
  "VAR-TAX", "VAR-DEPR", "VAR-ADSHARE", "VAR-ROYALTY",
  null, // 영업이익(세전) - computed, not stored
];
// Regional file: identical order minus the "주류" slot at index 4.
const CODE_SEQ_NO_ALCOHOL = CODE_SEQ_WITH_ALCOHOL.filter((_, i) => i !== 4);

// Store names that appear truncated/abbreviated in the source workbooks.
const NAME_FIX = {
  "대구연경": "대구연경배달점",
  "천안불당배달": "천안불당배달점",
  "천안신부배달": "천안신부배달점",
  "서산배달": "서산배달점",
  "충남당진배달": "충남당진배달점",
  "천안두정배달": "천안두정배달점",
};

function fixName(raw) {
  const trimmed = raw.trim();
  return NAME_FIX[trimmed] || trimmed;
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// Reads consecutive rows starting at `startRow` per `codeSeq`, reading
// column `col`, and returns { code: sumOfAmounts }. Sums when the same
// code appears twice in the sequence (VAR-APP-ETC 요기요+기타).
function extractAccounts(rows, startRow, codeSeq, col) {
  const out = {};
  for (let i = 0; i < codeSeq.length; i++) {
    const code = codeSeq[i];
    if (!code) continue;
    const v = num(rows[startRow + i]?.[col]);
    out[code] = (out[code] || 0) + v;
  }
  return out;
}

function toRecords(accountMap) {
  return Object.entries(accountMap)
    .filter(([, amount]) => amount > 0)
    .map(([accountCode, amount]) => ({ accountCode, amount: Math.round(amount) }));
}

/* ---------------- file2: per-store sheets, monthly columns ---------------- */
function extractPerStoreFile() {
  const wb = XLSX.readFile(FILE_PER_STORE, { cellDates: true });
  const skip = new Set(["통합", "데이터raw", "가족점raw"]);
  const results = []; // { storeName, month, records }

  const MONTH_COLS = [
    ["2026-04", 10],
    ["2026-05", 12],
    ["2026-06", 14],
  ];

  for (const sheetName of wb.SheetNames) {
    if (skip.has(sheetName)) continue;
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: "" });
    // Sheet name is authoritative (not the A2 label inside the sheet): at
    // least two sheets in this workbook were cloned from another store's
    // template and kept the old store's name in A2 (e.g. "인천검단_가마솥"
    // sheet's A2 still reads "인천가좌"). Strip the "_가마솥[ N.N]"/"_일반"
    // suffix; 배달점 sheets have no suffix to strip.
    const storeName = fixName(sheetName.replace(/_(가마솥(\s+[\d.]+)?|일반)$/, ""));
    if (!storeName) {
      console.warn(`[per-store] sheet "${sheetName}": empty store name, skipped`);
      continue;
    }
    const startRow = rows.findIndex((r) => r[0] === "총매출액");
    if (startRow === -1) {
      console.warn(`[per-store] sheet "${sheetName}": 총매출액 row not found, skipped`);
      continue;
    }
    for (const [month, col] of MONTH_COLS) {
      const revenueCell = rows[startRow]?.[col];
      if (revenueCell === "" || revenueCell === undefined) continue; // month not populated
      const accountMap = extractAccounts(rows, startRow, CODE_SEQ_WITH_ALCOHOL, col);
      results.push({ storeName, month, records: toRecords(accountMap) });
    }
  }
  return results;
}

/* ---------------- file1: rep sheets, store-as-column, June only ---------------- */
function extractRegionalFile() {
  const wb = XLSX.readFile(FILE_REGIONAL, { cellDates: true });
  const repSheets = ["우대원 9", "이태화 8", "안상욱 8", "노양은 10", "권기현 10"];
  const results = [];

  for (const sheetName of repSheets) {
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: "" });
    const startRow = rows.findIndex((r) => r.slice(0, 3).includes("총매출액"));
    if (startRow === -1) {
      console.warn(`[regional] sheet "${sheetName}": 총매출액 row not found, skipped`);
      continue;
    }
    const headerRowIdx = rows.findIndex((r) => r.includes("구 분"));
    const gubunCol = rows[headerRowIdx].indexOf("구 분");
    const storeStartCol = gubunCol + 4;

    for (let col = storeStartCol; col < rows[headerRowIdx].length; col += 2) {
      const storeNameRaw = String(rows[headerRowIdx][col] || "").trim();
      if (!storeNameRaw || storeNameRaw === "평균" || storeNameRaw === "비율") continue;
      const storeName = fixName(storeNameRaw);
      const accountMap = extractAccounts(rows, startRow, CODE_SEQ_NO_ALCOHOL, col);
      results.push({ storeName, month: "2026-06", records: toRecords(accountMap) });
    }
  }
  return results;
}

async function main() {
  const perStore = extractPerStoreFile();
  const regional = extractRegionalFile();
  const all = [...perStore, ...regional];
  console.log(`Extracted ${all.length} store-month entries (${perStore.length} from per-store file, ${regional.length} from regional file)`);

  const { data: stores, error: storesErr } = await supabase.from("stores").select("id, code, name");
  if (storesErr) throw storesErr;
  const byName = new Map(stores.map((s) => [s.name, s]));

  const unmatched = new Set();
  const rows = [];
  const now = new Date().toISOString();

  for (const { storeName, month, records } of all) {
    const store = byName.get(storeName);
    if (!store) {
      unmatched.add(storeName);
      continue;
    }
    for (const { accountCode, amount } of records) {
      rows.push({
        store_id: store.id,
        month,
        account_code: accountCode,
        amount,
        qty: null,
        status: "confirmed",
        source: "manual",
        writer: "본사 취합",
        approved_by: "본사 취합",
        approved_at: now,
      });
    }
  }

  if (unmatched.size > 0) {
    console.warn("Unmatched store names (skipped):", [...unmatched]);
  }

  const storeMonthCount = new Set(all.map((r) => `${r.storeName}_${r.month}`)).size;
  console.log(`Prepared ${rows.length} account rows across ${storeMonthCount} store-months`);

  if (process.argv.includes("--dry-run")) {
    const seen = new Map();
    for (const { storeName, month } of all) {
      const key = `${storeName}_${month}`;
      seen.set(key, (seen.get(key) || 0) + 1);
    }
    const dupes = [...seen.entries()].filter(([, c]) => c > 1);
    if (dupes.length) console.log("--- DUPLICATE store-month keys ---", dupes);

    console.log("--- DRY RUN: sample rows ---");
    console.log(JSON.stringify(rows.slice(0, 8), null, 2));
    const revByStoreMonth = {};
    for (const { storeName, month, records } of all) {
      const rev = records.find((r) => r.accountCode === "REV-HALL")?.amount || 0;
      const cost = records.filter((r) => r.accountCode !== "REV-HALL").reduce((s, r) => s + r.amount, 0);
      revByStoreMonth[`${storeName} ${month}`] = { revenue: rev, cost, profit: rev - cost };
    }
    console.log("--- sample store-month P&L (first 10) ---");
    console.log(JSON.stringify(Object.fromEntries(Object.entries(revByStoreMonth).slice(0, 10)), null, 2));
    console.log("No writes performed (dry run).");
    return;
  }

  console.log("Clearing existing financial_entries / financial_entry_edits...");
  const del1 = await supabase.from("financial_entry_edits").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (del1.error) throw del1.error;
  const del2 = await supabase.from("financial_entries").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (del2.error) throw del2.error;

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
