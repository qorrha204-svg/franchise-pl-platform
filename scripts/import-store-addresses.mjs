// One-off importer: fills in stores.address from an HQ-provided store/code/
// address list (matched by store code, the stable unique key).
// Run with: node scripts/import-store-addresses.mjs
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

const ADDRESS_FILE = path.join(__dirname, "store-addresses.tsv");

function parseAddresses() {
  const text = readFileSync(ADDRESS_FILE, "utf8");
  return text
    .trim()
    .split("\n")
    .map((line) => {
      const [name, code, ...rest] = line.split("\t");
      return { name: name.trim(), code: code.trim(), address: rest.join("\t").trim() };
    });
}

async function main() {
  const rows = parseAddresses();
  console.log(`Parsed ${rows.length} address rows`);

  const { data: stores, error } = await supabase.from("stores").select("id, code, name");
  if (error) throw error;
  const byCode = new Map(stores.map((s) => [s.code, s]));

  const unmatched = [];
  const updates = [];
  for (const r of rows) {
    const store = byCode.get(r.code);
    if (!store) {
      unmatched.push(r);
      continue;
    }
    updates.push({ id: store.id, address: r.address });
  }

  if (unmatched.length) {
    console.warn(
      "Unmatched codes (skipped):",
      unmatched.map((u) => `${u.name}(${u.code})`)
    );
  }
  console.log(`Updating ${updates.length} stores...`);

  for (const u of updates) {
    const { error: upErr } = await supabase.from("stores").update({ address: u.address }).eq("id", u.id);
    if (upErr) throw upErr;
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
