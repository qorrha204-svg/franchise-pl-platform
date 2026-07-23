// One-off geocoder: fills in stores.lat/lng from stores.address using the
// Kakao Local API (address search, falling back to keyword search for
// addresses too messy for exact address matching).
// Run with: node scripts/geocode-store-addresses.mjs
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
const KAKAO_KEY = env.KAKAO_REST_API_KEY;
if (!KAKAO_KEY) throw new Error("KAKAO_REST_API_KEY missing from .env.local");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function kakaoGet(url) {
  const res = await fetch(url, { headers: { Authorization: `KakaoAK ${KAKAO_KEY}` } });
  if (!res.ok) throw new Error(`Kakao API ${res.status}: ${await res.text()}`);
  return res.json();
}

async function geocode(address) {
  // 1) exact address search
  const addrUrl = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`;
  const addrData = await kakaoGet(addrUrl);
  if (addrData.documents?.length) {
    const d = addrData.documents[0];
    return { lat: Number(d.y), lng: Number(d.x), via: "address" };
  }
  // 2) fallback: keyword search (more forgiving of messy/annotated address text)
  const kwUrl = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(address)}`;
  const kwData = await kakaoGet(kwUrl);
  if (kwData.documents?.length) {
    const d = kwData.documents[0];
    return { lat: Number(d.y), lng: Number(d.x), via: "keyword" };
  }
  return null;
}

async function main() {
  const { data: allStores, error } = await supabase
    .from("stores")
    .select("id, name, code, address, lat, lng")
    .not("address", "is", null);
  if (error) throw error;

  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const stores = limitArg ? allStores.slice(0, Number(limitArg.split("=")[1])) : allStores;

  console.log(`Geocoding ${stores.length} stores...`);
  const failed = [];
  let viaAddress = 0;
  let viaKeyword = 0;

  for (let i = 0; i < stores.length; i++) {
    const s = stores[i];
    if (!s.address) continue;
    try {
      const result = await geocode(s.address);
      if (!result) {
        failed.push(s);
        console.warn(`[${i + 1}/${stores.length}] NO MATCH: ${s.name} (${s.code}) - ${s.address}`);
      } else {
        const { error: upErr } = await supabase
          .from("stores")
          .update({ lat: result.lat, lng: result.lng })
          .eq("id", s.id);
        if (upErr) throw upErr;
        if (result.via === "address") viaAddress++;
        else viaKeyword++;
        if ((i + 1) % 25 === 0) console.log(`[${i + 1}/${stores.length}] done`);
      }
    } catch (e) {
      failed.push(s);
      console.error(`[${i + 1}/${stores.length}] ERROR: ${s.name} (${s.code}) - ${e.message}`);
    }
    await sleep(120);
  }

  console.log(`\nDone. address-match: ${viaAddress}, keyword-fallback: ${viaKeyword}, failed: ${failed.length}`);
  if (failed.length) {
    console.log("Failed stores:", failed.map((s) => `${s.name}(${s.code})`).join(", "));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
