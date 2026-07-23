// Server-side trade-area lookup: given a lat/lng, resolves the 행정동
// (via Kakao's coord2regioncode) then pulls the 소상공인시장진흥공단
// 상가업소 list for that 행정동 and returns a small aggregate summary.
// Keeps both API keys server-only (never sent to the client).
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let lat = searchParams.get("lat");
  let lng = searchParams.get("lng");
  const address = searchParams.get("address");

  if ((!lat || !lng) && !address) {
    return Response.json({ error: "lat/lng 또는 address 파라미터가 필요합니다." }, { status: 400 });
  }

  const kakaoKey = process.env.KAKAO_REST_API_KEY;
  const sbizKey = process.env.SBIZ_API_KEY;
  if (!kakaoKey || !sbizKey) {
    return Response.json({ error: "API 키가 서버에 설정되어 있지 않습니다." }, { status: 500 });
  }

  try {
    if ((!lat || !lng) && address) {
      const addrRes = await fetch(
        `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(address)}`,
        { headers: { Authorization: `KakaoAK ${kakaoKey}` } }
      );
      const addrData = await addrRes.json();
      const hit = addrData.documents?.[0];
      if (!hit) {
        return Response.json({ error: "주소를 찾을 수 없습니다. 주소를 다시 확인해주세요." }, { status: 404 });
      }
      lat = hit.y;
      lng = hit.x;
    }

    const regionRes = await fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${lng}&y=${lat}`,
      { headers: { Authorization: `KakaoAK ${kakaoKey}` } }
    );
    if (!regionRes.ok) throw new Error(`Kakao API ${regionRes.status}`);
    const regionData = await regionRes.json();
    const hDong = regionData.documents?.find((d) => d.region_type === "H");
    if (!hDong) {
      return Response.json({ error: "해당 위치의 행정동을 찾을 수 없습니다." }, { status: 404 });
    }
    const adongCd = hDong.code.slice(0, 8);

    // The API caps each call at 1000 rows, and dense 행정동 can hold several
    // thousand businesses - paginate (up to a sane cap) so the counts below
    // reflect the real 행정동, not just its first page.
    const PAGE_SIZE = 1000;
    const MAX_ROWS = 5000;
    const sbizBase = `https://apis.data.go.kr/B553077/api/open/sdsc2/storeListInDong?serviceKey=${sbizKey}&key=${adongCd}&type=json&divId=adongCd`;

    const firstRes = await fetch(`${sbizBase}&numOfRows=${PAGE_SIZE}&pageNo=1`);
    const firstData = await firstRes.json();

    if (firstData.header?.resultCode !== "00") {
      return Response.json({
        dongName: hDong.region_3depth_name,
        lat: Number(lat),
        lng: Number(lng),
        totalCount: 0,
        foodCount: 0,
        topCategories: [],
        note: firstData.header?.resultMsg || "데이터 없음",
      });
    }

    const totalCount = firstData.body?.totalCount || 0;
    const items = [...(firstData.body?.items || [])];
    const rowsToFetch = Math.min(totalCount, MAX_ROWS);
    for (let page = 2; items.length < rowsToFetch; page++) {
      const res = await fetch(`${sbizBase}&numOfRows=${PAGE_SIZE}&pageNo=${page}`);
      const data = await res.json();
      const pageItems = data.body?.items || [];
      if (!pageItems.length) break;
      items.push(...pageItems);
    }

    const categoryCounts = {};
    let foodCount = 0;
    items.forEach((it) => {
      const cat = it.indsLclsNm || "기타";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      if (cat === "음식") foodCount++;
    });
    const topCategories = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return Response.json({
      dongName: hDong.region_3depth_name,
      lat: Number(lat),
      lng: Number(lng),
      totalCount,
      foodCount,
      topCategories,
      sampledCount: totalCount > items.length ? items.length : null,
    });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}
