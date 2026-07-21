import React, { useState, useMemo, useEffect } from "react";
import Papa from "papaparse";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import {
  LayoutDashboard, Store, CheckSquare, AlertTriangle, ChevronRight,
  TrendingUp, Clock, Building2, Check, X, PenLine, ArrowLeft, ArrowRight,
  ClipboardCheck, Download, Plus, Printer, Pencil, Trash2, Loader2
} from "lucide-react";

/* ============================== Tokens ============================== */
const COLORS = {
  bg: "#F5F6F3", surface: "#FFFFFF", ink: "#1B231F", inkSoft: "#5B655F", line: "#DBDED6",
  accent: "#1F6F54", accentSoft: "#E6F0EA", warn: "#B8722A", warnSoft: "#F5E9DA",
  danger: "#B23A3A", dangerSoft: "#F5E1E1",
};
const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans+KR:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');`;
const PRINT_CSS = `@media print {
  body * { visibility: hidden; }
  #print-report, #print-report * { visibility: visible; }
  #print-report { position: absolute; left: 0; top: 0; width: 100%; }
  .no-print { display: none !important; }
}`;

/* ============================== Brands ============================== */
const BRANDS = [
  { id: "WONSSAM", name: "원쌈" },
  { id: "PARKGA", name: "박가부대" },
  { id: "GAMTAN", name: "감탄계" },
];
const brandName = (id) => BRANDS.find((b) => b.id === id)?.name || "-";
const storeById = (stores, id) => stores.find((s) => s.id === id);

/* ============================== Real store master (원쌈) ============================== */
const RAW_STORES = `가락,200059,원쌈,단독점,가마솥
가재울배달점,201255,원쌈,단독점,배달점
가평,200344,원쌈,단독점,일반
가평설악배달점,201718,원쌈,단독점,배달점
강남구청배달점,201431,원쌈,단독점,배달점
강북미아배달점,201689,원쌈,단독점,배달점
강원랜드,200874,원쌈,복합점,가마솥
강원삼척,201552,원쌈,단독점,가마솥
강원속초,201471,원쌈,단독점,가마솥
개봉,200614,원쌈,복합점,일반
개포,200820,원쌈,단독점,가마솥
거여역,200920,원쌈,복합점,가마솥
경기광주신현배달점,201271,원쌈,단독점,배달점
경기광주태전배달점,201459,원쌈,단독점,배달점
경산압량,201264,원쌈,단독점,가마솥
경산하양,201548,원쌈,단독점,가마솥
경주황성,201159,원쌈,복합점,가마솥
계산,201637,원쌈,단독점,가마솥
고덕배달점,201286,원쌈,단독점,배달점
곤지암,200630,원쌈,단독점,가마솥
공덕,201599,원쌈,단독점,가마솥
과천,200507,원쌈,단독점,일반
광명,200055,원쌈,단독점,일반
광양금호,201725,원쌈,단독점,가마솥
광양읍,200837,원쌈,단독점,가마솥
광양중마,200871,원쌈,단독점,일반
광주수완,201052,원쌈,복합점,일반
광주첨단,201612,원쌈,복합점,일반
구리갈매배달점,201667,원쌈,단독점,배달점
구리수택배달점,201258,원쌈,단독점,배달점
구의역,200178,원쌈,단독점,가마솥
구파발배달점,201348,원쌈,단독점,배달점
군산나운,200433,원쌈,단독점,일반
군산수송,201735,원쌈,단독점,가마솥
군포산본,201193,원쌈,단독점,가마솥
금천,201061,원쌈,단독점,일반
김천신음,201676,원쌈,복합점,가마솥
김포구래배달점,201739,원쌈,단독점,배달점
김포사우,201740,원쌈,단독점,가마솥
김포장기,201301,원쌈,단독점,가마솥
김해내외,201763,원쌈,단독점,가마솥
김해북부,201594,원쌈,단독점,가마솥
김해율하배달점,201495,원쌈,단독점,배달점
김해장유,200378,원쌈,단독점,일반
김해진영배달점,201688,원쌈,단독점,배달점
남동탄배달점,201695,원쌈,단독점,배달점
남양주덕소배달점,201575,원쌈,단독점,배달점
남양주마석배달점,201365,원쌈,단독점,배달점
남양주별내배달점,201344,원쌈,단독점,배달점
남양주오남배달점,201378,원쌈,단독점,배달점
남양주진접배달점,201409,원쌈,단독점,배달점
남양주평내배달점,201525,원쌈,단독점,배달점
남영,200279,원쌈,단독점,가마솥
남원도통,200960,원쌈,복합점,일반
녹번,200150,원쌈,단독점,가마솥
논산,201728,원쌈,단독점,가마솥
다산신도시배달점,201375,원쌈,단독점,배달점
대구경대배달점,201400,원쌈,단독점,배달점
대구다사,200923,원쌈,복합점,가마솥
대구범어,201043,원쌈,복합점,일반
대구본리배달점,201748,원쌈,단독점,배달점
대구사수,201343,원쌈,단독점,가마솥
대구상인,201551,원쌈,단독점,가마솥
대구시지배달점,201655,원쌈,단독점,배달점
대구신서혁신배달점,201371,원쌈,단독점,배달점
대구연경배달점,201440,원쌈,단독점,배달점
대구월성,201313,원쌈,복합점,가마솥
대구이곡,201538,원쌈,단독점,배달점
대구칠곡,201720,원쌈,단독점,가마솥
대구침산,200231,원쌈,단독점,가마솥
대구현풍,201081,원쌈,복합점,일반
대림,200314,원쌈,복합점,일반
대전가오,201123,원쌈,단독점,일반
대전송촌,201542,원쌈,복합점,가마솥
대치배달점,201233,원쌈,단독점,배달점
도당,200133,원쌈,단독점,일반
독산,201510,원쌈,복합점,가마솥
돈암,200093,원쌈,단독점,가마솥
동김해배달점,201492,원쌈,단독점,배달점
동탄1신도시,201096,원쌈,단독점,일반
동해나안,201742,원쌈,단독점,가마솥
등촌,200159,원쌈,단독점,가마솥
마곡배달점,201302,원쌈,단독점,배달점
망원배달점,201491,원쌈,단독점,배달점
먹골역,201565,원쌈,단독점,가마솥
명동,201146,원쌈,복합점,가마솥
목동사거리,201644,원쌈,단독점,일반
미사강변배달점,201351,원쌈,단독점,배달점
미아역배달점,201712,원쌈,단독점,배달점
반포,201447,원쌈,복합점,가마솥
방이배달점,201678,원쌈,단독점,배달점
보라매,201675,원쌈,단독점,가마솥
봉천현대시장배달점,201281,원쌈,단독점,배달점
부산광안,200577,원쌈,복합점,가마솥
부산명지배달점,201484,원쌈,단독점,배달점
부산사직배달점,201328,원쌈,단독점,배달점
부산온천배달점,201496,원쌈,단독점,배달점
부산하단배달점,201323,원쌈,단독점,배달점
부산해운대중동배달점,201760,원쌈,단독점,배달점
부천상동,200319,원쌈,단독점,일반
부천심곡배달점,201694,원쌈,단독점,배달점
부천역곡,201684,원쌈,단독점,가마솥
부천옥길배달점,201216,원쌈,단독점,배달점
부천원종배달점,201303,원쌈,단독점,배달점
부평시장역,201078,원쌈,단독점,가마솥
북동탄배달점,201553,원쌈,단독점,배달점
상계역,201682,원쌈,단독점,가마솥
상도배달점,201412,원쌈,단독점,배달점
서산대산,201506,원쌈,단독점,가마솥
서산배달점,201741,원쌈,단독점,배달점
서산테크노밸리,201090,원쌈,복합점,가마솥
서초,201293,원쌈,단독점,일반
서판교배달점,201299,원쌈,단독점,배달점
성남수진역배달점,201716,원쌈,단독점,배달점
성내배달점,201479,원쌈,단독점,배달점
수원권선배달점,201406,원쌈,단독점,배달점
수원매탄배달점,201508,원쌈,단독점,배달점
수원영통,201621,원쌈,단독점,가마솥
수원천천배달점,201417,원쌈,단독점,배달점
수원화서,201327,원쌈,단독점,가마솥
수유역,200482,원쌈,복합점,일반
순천신대,201050,원쌈,복합점,가마솥
순천연향,201608,원쌈,단독점,일반
순천오천,201449,원쌈,복합점,일반
시흥능곡배달점,201757,원쌈,단독점,배달점
시흥대야,200492,원쌈,복합점,가마솥
시흥목감배달점,201541,원쌈,단독점,배달점
시흥배곧신도시배달점,201221,원쌈,단독점,배달점
시흥장곡배달점,201277,원쌈,단독점,배달점
신길,201102,원쌈,복합점,가마솥
신내,200145,원쌈,단독점,가마솥
신도림배달점,201762,원쌈,단독점,배달점
신정,200943,원쌈,단독점,일반
신촌,201169,원쌈,단독점,일반
쌍문배달점,201647,원쌈,단독점,배달점
아산배방,201578,원쌈,단독점,가마솥
아산온천배달점,201727,원쌈,단독점,배달점
안산반달섬,201685,원쌈,단독점,가마솥
안산상록수,201691,원쌈,단독점,가마솥
안산선부,200818,원쌈,단독점,일반
안양관양배달점,201672,원쌈,단독점,배달점
안양대교배달점,201275,원쌈,단독점,배달점
안양명학역배달점,201345,원쌈,단독점,배달점
안양평촌배달점,201425,원쌈,단독점,배달점
안양호계배달점,201753,원쌈,단독점,배달점
암사,200472,원쌈,복합점,일반
압구정배달점,201332,원쌈,단독점,배달점
약수역남산타운배달점,201289,원쌈,단독점,배달점
양산물금,201729,원쌈,단독점,가마솥
양산평산배달점,201737,원쌈,단독점,배달점
양주백석배달점,201392,원쌈,단독점,배달점
양주옥정배달점,201325,원쌈,단독점,배달점
여수여서,200689,원쌈,단독점,일반
여수여천,201520,원쌈,단독점,가마솥
여의도,201681,원쌈,단독점,가마솥
연희,201706,원쌈,단독점,가마솥
영등포시장역배달점,201726,원쌈,단독점,배달점
영종도배달점,201307,원쌈,단독점,배달점
영천동부,200692,원쌈,단독점,가마솥
오목교역,200187,원쌈,단독점,일반
오산배달점,201274,원쌈,단독점,배달점
용답답십리,201164,원쌈,단독점,가마솥
용인기흥구청,201557,원쌈,단독점,가마솥
용인남사,201736,원쌈,단독점,가마솥
용인동백배달점,201341,원쌈,단독점,배달점
용인동천역배달점,201550,원쌈,단독점,배달점
용인모현,201398,원쌈,단독점,가마솥
용인상현,200760,원쌈,단독점,일반
용인서천배달점,201704,원쌈,단독점,배달점
울산무거배달점,201466,원쌈,단독점,배달점
울산삼산,201668,원쌈,단독점,가마솥
원주기업도시,201710,원쌈,단독점,가마솥
원주단관,201574,원쌈,단독점,가마솥
원주문막,201217,원쌈,단독점,가마솥
위례신도시배달점,201585,원쌈,단독점,배달점
응암,200164,원쌈,단독점,가마솥
의정부금오배달점,201424,원쌈,단독점,배달점
의정부신곡배달점,201714,원쌈,단독점,배달점
의정부신시가지,200623,원쌈,복합점,일반
이수역,201605,원쌈,단독점,일반
이천,201721,원쌈,단독점,가마솥
익산영등,201730,원쌈,단독점,가마솥
인제기린,201493,원쌈,단독점,가마솥
인천가정배달점,201373,원쌈,단독점,배달점
인천가좌,200475,원쌈,단독점,가마솥
인천검단,200708,원쌈,단독점,가마솥
인천논현배달점,201657,원쌈,단독점,배달점
인천도화배달점,201397,원쌈,단독점,배달점
인천만수,201527,원쌈,단독점,가마솥
인천부개배달점,201545,원쌈,단독점,배달점
인천삼산배달점,201420,원쌈,단독점,배달점
인천서창배달점,201540,원쌈,단독점,배달점
인천송도,201687,원쌈,단독점,가마솥
인천송도8공구배달점,201452,원쌈,단독점,배달점
인천송림배달점,201338,원쌈,단독점,배달점
인천시청배달점,201764,원쌈,단독점,배달점
인천십정배달점,201444,원쌈,단독점,배달점
인천연수,200311,원쌈,단독점,일반
인천옥련,200084,원쌈,단독점,일반
인천용현,201650,원쌈,복합점,가마솥
인천원당배달점,201336,원쌈,단독점,배달점
인천주안,201693,원쌈,단독점,가마솥
인천청라,201105,원쌈,단독점,일반
인천효성배달점,201615,원쌈,단독점,배달점
일산주엽,200870,원쌈,복합점,가마솥
자곡배달점,201387,원쌈,단독점,배달점
잠실배달점,201573,원쌈,단독점,배달점
장위배달점,201437,원쌈,단독점,배달점
전남보성,201607,원쌈,단독점,가마솥
전북고창,201250,원쌈,단독점,가마솥
전주아중,200357,원쌈,단독점,일반
종로5가,201747,원쌈,단독점,가마솥
종암배달점,201679,원쌈,단독점,배달점
중곡,200701,원쌈,단독점,가마솥
진도,201640,원쌈,단독점,가마솥
진주평거,201722,원쌈,단독점,일반
진해석동,200299,원쌈,단독점,가마솥
진해용원배달점,201719,원쌈,단독점,배달점
창동역,201070,원쌈,복합점,일반
창원상남,201294,원쌈,복합점,가마솥
창원양덕배달점,201442,원쌈,단독점,배달점
천안두정배달점,201475,원쌈,단독점,배달점
천안불당배달점,201733,원쌈,단독점,배달점
천안신부배달점,201619,원쌈,단독점,배달점
청주가경,200353,원쌈,단독점,일반
청주운천,200419,원쌈,복합점,가마솥
청평,201468,원쌈,단독점,일반
춘천후평배달점,201481,원쌈,단독점,배달점
충남당진배달점,201268,원쌈,단독점,배달점
충남부여,200529,원쌈,단독점,일반
충남서천장항,200887,원쌈,단독점,일반
충북증평배달점,201546,원쌈,단독점,배달점
충주호암,201768,원쌈,단독점,가마솥
탄현,200113,원쌈,단독점,가마솥
통영,200677,원쌈,단독점,일반
파주교하배달점,201606,원쌈,단독점,배달점
파주금촌배달점,201358,원쌈,단독점,배달점
파주문산배달점,201361,원쌈,단독점,배달점
파주운정,201769,원쌈,단독점,가마솥
평택안중,201283,원쌈,단독점,가마솥
평택용이배달점,201273,원쌈,단독점,배달점
평택이충,200457,원쌈,단독점,일반
평택청북,201756,원쌈,단독점,가마솥
평택포승배달점,201617,원쌈,단독점,배달점
포항대이,201765,원쌈,단독점,가마솥
포항두호배달점,201767,원쌈,단독점,배달점
홍대역,200491,원쌈,단독점,가마솥
홍천,201166,원쌈,단독점,가마솥
홍천대명비발디파크,200809,원쌈,단독점,일반
화곡역,200468,원쌈,복합점,가마솥
화성새솔배달점,201454,원쌈,단독점,배달점
화성향남,200598,원쌈,단독점,일반
회기배달점,201298,원쌈,단독점,배달점
고양향동배달점,201776,원쌈,단독점,배달점`;

function parseStores(raw) {
  return raw.trim().split("\n").map((line, i) => {
    const [name, code, brand, complexType, storeType] = line.split(",").map((s) => s.trim());
    const brandId = BRANDS.find((b) => b.name === brand)?.id || BRANDS[0].id;
    return { id: `S${i + 1}`, code, name, brandId, complexType, storeType };
  });
}
const INITIAL_STORES = parseStores(RAW_STORES);

/* ============================== Chart of accounts ============================== */
const ACCOUNTS = [
  { code: "REV-HALL", name: "홀 매출", type: "revenue", category: "매출", group: "홀 매출" },
  { code: "REV-BAEMIN", name: "배달의민족", type: "revenue", category: "매출", group: "배달 매출" },
  { code: "REV-COUPANG", name: "쿠팡이츠", type: "revenue", category: "매출", group: "배달 매출" },
  { code: "REV-ETC", name: "기타 배달", type: "revenue", category: "매출", group: "배달 매출" },
  { code: "COGS-HQ", name: "본사식재", type: "cost", category: "매출원가", group: "매출원가" },
  { code: "COGS-PURCH", name: "사입식재", type: "cost", category: "매출원가", group: "매출원가" },
  { code: "FIX-HALL-REG", name: "직원", type: "cost", category: "고정비", group: "홀 인건비" },
  { code: "FIX-HALL-PT", name: "파트타임", type: "cost", category: "고정비", group: "홀 인건비" },
  { code: "FIX-HALL-DAY", name: "일용직", type: "cost", category: "고정비", group: "홀 인건비" },
  { code: "FIX-KITCHEN-REG", name: "직원", type: "cost", category: "고정비", group: "주방 인건비" },
  { code: "FIX-KITCHEN-PT", name: "파트타임", type: "cost", category: "고정비", group: "주방 인건비" },
  { code: "FIX-KITCHEN-DAY", name: "일용직", type: "cost", category: "고정비", group: "주방 인건비" },
  { code: "FIX-INS-4DA", name: "4대보험", type: "cost", category: "고정비", group: "보험료" },
  { code: "FIX-INS-FIRE", name: "화재/음식물/가스/영업배상", type: "cost", category: "고정비", group: "보험료" },
  { code: "FIX-RENT", name: "임차료", type: "cost", category: "고정비", group: "임차료" },
  { code: "FIX-MGMT", name: "관리비", type: "cost", category: "고정비", group: "관리비" },
  { code: "FIX-TAXFEE", name: "수수료(세무기장료)", type: "cost", category: "고정비", group: "수수료(세무기장료)" },
  { code: "VAR-DELIVERY", name: "배달대행", type: "cost", category: "변동비", group: "배달/차량" },
  { code: "VAR-VEHICLE", name: "차량유지비", type: "cost", category: "변동비", group: "배달/차량" },
  { code: "VAR-COMM-PHONE", name: "전화료", type: "cost", category: "변동비", group: "통신비" },
  { code: "VAR-COMM-NET", name: "인터넷", type: "cost", category: "변동비", group: "통신비" },
  { code: "VAR-COMM-CABLE", name: "케이블방송", type: "cost", category: "변동비", group: "통신비" },
  { code: "VAR-UTIL-ELEC", name: "전기", type: "cost", category: "변동비", group: "수도광열비" },
  { code: "VAR-UTIL-GAS", name: "가스", type: "cost", category: "변동비", group: "수도광열비" },
  { code: "VAR-UTIL-WATER", name: "수도", type: "cost", category: "변동비", group: "수도광열비" },
  { code: "VAR-AD", name: "광고/홍보비", type: "cost", category: "변동비", group: "매장 운영" },
  { code: "VAR-PACK", name: "포장용기", type: "cost", category: "변동비", group: "매장 운영" },
  { code: "VAR-SECURITY", name: "점포보안", type: "cost", category: "변동비", group: "매장 운영" },
  { code: "VAR-WATERPUR", name: "정수기", type: "cost", category: "변동비", group: "매장 운영" },
  { code: "VAR-WELFARE", name: "복리후생비", type: "cost", category: "변동비", group: "매장 운영" },
  { code: "VAR-SUPPLY", name: "소모품비", type: "cost", category: "변동비", group: "매장 운영" },
  { code: "VAR-MISC", name: "기타/잡비", type: "cost", category: "변동비", group: "매장 운영" },
  { code: "VAR-APP-BAEMIN", name: "배달의민족", type: "cost", category: "변동비", group: "어플수수료 (결제 수수료 + 중개 수수료)" },
  { code: "VAR-APP-COUPANG", name: "쿠팡이츠", type: "cost", category: "변동비", group: "어플수수료 (결제 수수료 + 중개 수수료)" },
  { code: "VAR-APP-ETC", name: "기타", type: "cost", category: "변동비", group: "어플수수료 (결제 수수료 + 중개 수수료)" },
  { code: "VAR-CARDFEE", name: "카드 수수료", type: "cost", category: "변동비", group: "수수료·세금 등" },
  { code: "VAR-TAX", name: "국세/지방세", type: "cost", category: "변동비", group: "수수료·세금 등" },
  { code: "VAR-DEPR", name: "감가상각비", type: "cost", category: "변동비", group: "수수료·세금 등" },
  { code: "VAR-ADSHARE", name: "광고비분담금", type: "cost", category: "변동비", group: "수수료·세금 등" },
  { code: "VAR-ROYALTY", name: "로열티", type: "cost", category: "변동비", group: "수수료·세금 등" },
];
const getAccount = (code) => ACCOUNTS.find((a) => a.code === code);
const DELIVERY_CODES = ["REV-BAEMIN", "REV-COUPANG", "REV-ETC"];
const MONTHS = ["2026-04", "2026-05", "2026-06"];
const OPEN_MONTH = "2026-06";

/* ============================== Mock seed ============================== */
function seededRand(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
const BASE_REV = { WONSSAM: 32000000, PARKGA: 30000000, GAMTAN: 28000000 };
const AVG_TICKET = { WONSSAM: 13000, PARKGA: 12000, GAMTAN: 11500 };
function splitAmount(total, weights) { const sum = weights.reduce((a, b) => a + b, 0); return weights.map((w) => Math.round((total * w) / sum / 1000) * 1000); }

function buildSeedFinancials(stores) {
  const rows = []; let rid = 0;
  const seedMonths = MONTHS.filter((m) => m !== OPEN_MONTH);
  stores.forEach((store, sIdx) => {
    const rnd = seededRand(sIdx * 97 + 13);
    seedMonths.forEach((month) => {
      const monthVar = 0.85 + rnd() * 0.3;
      const outlierMult = sIdx % 11 === 0 ? 1.2 : 1;
      const revenue = Math.round((BASE_REV[store.brandId] * monthVar) / 1000) * 1000;
      const ticket = AVG_TICKET[store.brandId] * (0.9 + rnd() * 0.2);
      const push = (code, amount, qty) => rows.push({ id: `F${++rid}`, storeId: store.id, month, accountCode: code, amount, qty, status: "confirmed", source: "manual", writer: "본사 초기데이터", approvedBy: "본사(자동승인)" });
      const isDeliveryOnly = store.storeType === "배달점";
      const hallRatio = isDeliveryOnly ? 0.05 + rnd() * 0.1 : 0.55 + rnd() * 0.15;
      const hallRev = Math.round((revenue * hallRatio) / 1000) * 1000;
      const deliveryRev = revenue - hallRev;
      const [baemin, coupang, etc] = splitAmount(deliveryRev, [0.5, 0.35, 0.15]);
      push("REV-HALL", hallRev); push("REV-BAEMIN", baemin, Math.round(baemin / ticket)); push("REV-COUPANG", coupang, Math.round(coupang / ticket)); push("REV-ETC", etc, Math.round(etc / ticket));
      const cogsTotal = revenue * (0.32 + rnd() * 0.06) * outlierMult;
      const [hq, purch] = splitAmount(cogsTotal, [0.7, 0.3]); push("COGS-HQ", hq); push("COGS-PURCH", purch);
      const laborTotal = revenue * (0.22 + rnd() * 0.06) * outlierMult;
      const [hReg, hPt, hDay, kReg, kPt, kDay] = splitAmount(laborTotal, [0.3, 0.1, 0.05, 0.35, 0.12, 0.08]);
      push("FIX-HALL-REG", hReg); push("FIX-HALL-PT", hPt); push("FIX-HALL-DAY", hDay); push("FIX-KITCHEN-REG", kReg); push("FIX-KITCHEN-PT", kPt); push("FIX-KITCHEN-DAY", kDay);
      push("FIX-RENT", Math.round((revenue * (0.07 + rnd() * 0.04)) / 1000) * 1000);
      push("VAR-ROYALTY", Math.round((revenue * 0.05) / 1000) * 1000);
      const [ad, adshare] = splitAmount(revenue * 0.03, [0.6, 0.4]); push("VAR-AD", ad); push("VAR-ADSHARE", adshare);
      const etcTotal = revenue * (0.05 + rnd() * 0.04) * outlierMult;
      const etcWeights = { "FIX-INS-4DA": 1.5, "FIX-INS-FIRE": 0.8, "FIX-MGMT": 1.5, "FIX-TAXFEE": 0.8, "VAR-DELIVERY": 3, "VAR-VEHICLE": 1.5, "VAR-COMM-PHONE": 0.5, "VAR-COMM-NET": 0.5, "VAR-COMM-CABLE": 0.3, "VAR-UTIL-ELEC": 2, "VAR-UTIL-GAS": 1, "VAR-UTIL-WATER": 0.5, "VAR-PACK": 1.5, "VAR-SECURITY": 0.5, "VAR-WATERPUR": 0.3, "VAR-WELFARE": 1, "VAR-SUPPLY": 0.8, "VAR-MISC": 1, "VAR-APP-BAEMIN": 2, "VAR-APP-COUPANG": 1.5, "VAR-APP-ETC": 0.5, "VAR-CARDFEE": 2.5, "VAR-TAX": 1, "VAR-DEPR": 2 };
      const codes = Object.keys(etcWeights); const amounts = splitAmount(etcTotal, codes.map((c) => etcWeights[c])); codes.forEach((c, i) => push(c, amounts[i]));
    });
  });
  return rows;
}
const INITIAL_FINANCIALS = buildSeedFinancials(INITIAL_STORES);
const SEED_MONTHS = Array.from(new Set(INITIAL_FINANCIALS.map((f) => f.month)));

/* ============================== Shared storage layer ============================== */
async function storageGet(key) {
  try { const r = await window.storage.get(key, true); return r ? JSON.parse(r.value) : null; } catch (e) { return null; }
}
async function storageSet(key, value) {
  try { await window.storage.set(key, JSON.stringify(value), true); return true; } catch (e) { return false; }
}
async function loadSharedData() {
  let stores = await storageGet("stores-master");
  if (!stores) { stores = INITIAL_STORES; await storageSet("stores-master", stores); }

  let monthsIndex = await storageGet("months-index");
  let financials = [];
  if (!monthsIndex) {
    monthsIndex = SEED_MONTHS;
    for (const m of SEED_MONTHS) {
      const rows = INITIAL_FINANCIALS.filter((f) => f.month === m);
      await storageSet(`financials-${m}`, rows);
      financials = financials.concat(rows);
    }
    await storageSet("months-index", monthsIndex);
  } else {
    for (const m of monthsIndex) {
      const rows = await storageGet(`financials-${m}`);
      if (rows) financials = financials.concat(rows);
    }
  }
  return { stores, financials, monthsIndex };
}
async function saveMonthFinancials(financials, month, monthsIndex) {
  const rows = financials.filter((f) => f.month === month);
  await storageSet(`financials-${month}`, rows);
  if (!monthsIndex.includes(month)) {
    const updated = [...monthsIndex, month];
    await storageSet("months-index", updated);
    return updated;
  }
  return monthsIndex;
}

/* ============================== Helpers ============================== */
const won = (n) => `₩${Math.round(n || 0).toLocaleString("ko-KR")}`;
const pct = (n) => `${((n || 0) * 100).toFixed(1)}%`;
const fmtNum = (v) => { const n = Number(v); return !v || isNaN(n) ? "" : n.toLocaleString("ko-KR"); };
function allMonths(financials) { return Array.from(new Set([...MONTHS, ...financials.map((f) => f.month)])).sort(); }

function computePL(storeId, month, financials, statuses = ["confirmed", "pending"]) {
  const rows = financials.filter((f) => f.storeId === storeId && f.month === month && statuses.includes(f.status));
  const revenue = rows.filter((r) => getAccount(r.accountCode)?.type === "revenue").reduce((s, r) => s + r.amount, 0);
  let totalCost = 0; const byCode = {};
  rows.filter((r) => getAccount(r.accountCode)?.type === "cost").forEach((r) => { byCode[r.accountCode] = (byCode[r.accountCode] || 0) + r.amount; totalCost += r.amount; });
  const revenueDetail = ACCOUNTS.filter((a) => a.type === "revenue").map((a) => { const matched = rows.filter((r) => r.accountCode === a.code); return { code: a.code, name: a.name, amount: matched.reduce((s, r) => s + r.amount, 0), qty: matched.reduce((s, r) => s + (r.qty || 0), 0) }; });
  const profit = revenue - totalCost;
  return { revenue, totalCost, profit, margin: revenue > 0 ? profit / revenue : 0, byCode, revenueDetail, hasPending: rows.some((r) => r.status === "pending"), writer: rows.find((r) => r.writer)?.writer, approvedBy: rows.find((r) => r.approvedBy)?.approvedBy };
}
function groupSums(byCode) {
  const groups = {};
  ACCOUNTS.filter((a) => a.type === "cost").forEach((a) => { const key = `${a.category}__${a.group}`; groups[key] = groups[key] || { category: a.category, group: a.group, amount: 0 }; groups[key].amount += byCode[a.code] || 0; });
  return Object.values(groups);
}
function categoryTotals(byCode) { const totals = { 매출원가: 0, 고정비: 0, 변동비: 0 }; ACCOUNTS.filter((a) => a.type === "cost").forEach((a) => { totals[a.category] += byCode[a.code] || 0; }); return totals; }
function buildRawRows(financials, stores, storeId) {
  return financials.filter((f) => !storeId || f.storeId === storeId).map((f) => {
    const store = storeById(stores, f.storeId); const acc = getAccount(f.accountCode);
    return { 매장코드: store?.code, 매장명: store?.name, 브랜드: brandName(store?.brandId), 타입구분: store?.storeType, 정산월: f.month, 대분류: acc?.category, 중분류: acc?.group, 계정과목코드: f.accountCode, 계정과목명: acc?.name, 금액: f.amount, 건수: f.qty ?? "", 상태: f.status === "confirmed" ? "확정" : f.status === "pending" ? "승인대기" : f.status, 작성자: f.writer ?? "", 승인자: f.approvedBy ?? "" };
  });
}
async function exportCSV(rows, filename, setToast) {
  const csv = Papa.unparse(rows); let downloadOk = false;
  try {
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = filename; a.style.display = "none";
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    downloadOk = true;
  } catch (e) { downloadOk = false; }
  try {
    await navigator.clipboard.writeText(csv);
    setToast(downloadOk ? "다운로드를 시도했습니다. 파일이 보이지 않으면 클립보드 내용을 엑셀에 붙여넣어 사용하세요." : "미리보기 환경이라 자동 다운로드가 제한됩니다. 대신 클립보드에 복사했으니 엑셀에 붙여넣으세요.");
  } catch (e) { setToast(downloadOk ? "다운로드를 시도했습니다." : "이 미리보기 환경에서는 다운로드가 제한됩니다. 실제 배포 후에는 정상 동작합니다."); }
}

/* ============================== Small UI atoms ============================== */
function Badge({ tone = "neutral", children }) {
  const tones = { neutral: { bg: COLORS.line, fg: COLORS.inkSoft }, good: { bg: COLORS.accentSoft, fg: COLORS.accent }, warn: { bg: COLORS.warnSoft, fg: COLORS.warn }, bad: { bg: COLORS.dangerSoft, fg: COLORS.danger } };
  const t = tones[tone];
  return <span style={{ background: t.bg, color: t.fg, fontFamily: "'IBM Plex Sans KR', sans-serif", fontSize: 12, fontWeight: 600, padding: "3px 9px", borderRadius: 5, whiteSpace: "nowrap" }}>{children}</span>;
}
function Num({ value, tone }) { const color = tone === "good" ? COLORS.accent : tone === "bad" ? COLORS.danger : COLORS.ink; return <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontVariantNumeric: "tabular-nums", color }}>{value}</span>; }
function Card({ children, style }) { return <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 20, ...style }}>{children}</div>; }
const selectStyle = { fontFamily: "'IBM Plex Sans KR', sans-serif", fontSize: 13, padding: "8px 10px", borderRadius: 7, border: `1px solid ${COLORS.line}`, background: COLORS.surface, color: COLORS.ink };
function MoneyInput({ value, onChange, width = 140 }) { return <input type="text" inputMode="numeric" value={fmtNum(value)} onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))} placeholder="0" style={{ width, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13.5, border: `1px solid ${COLORS.line}`, borderRadius: 6, padding: "6px 8px", color: COLORS.ink }} />; }
function DownloadBtn({ onClick, label }) { return <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", color: COLORS.ink, border: `1px solid ${COLORS.line}`, borderRadius: 7, padding: "8px 12px", fontSize: 12.5, fontWeight: 600, fontFamily: "'IBM Plex Sans KR', sans-serif", cursor: "pointer" }}><Download size={13} /> {label}</button>; }
const primaryBtn = { display: "flex", alignItems: "center", gap: 6, background: COLORS.accent, color: "#fff", border: "none", borderRadius: 7, padding: "9px 16px", fontSize: 13, fontWeight: 600, fontFamily: "'IBM Plex Sans KR', sans-serif", cursor: "pointer" };
const secondaryBtn = { display: "flex", alignItems: "center", gap: 6, background: "#fff", color: COLORS.inkSoft, border: `1px solid ${COLORS.line}`, borderRadius: 7, padding: "9px 16px", fontSize: 13, fontWeight: 600, fontFamily: "'IBM Plex Sans KR', sans-serif", cursor: "pointer" };
const dangerBtn = { display: "flex", alignItems: "center", gap: 6, background: COLORS.danger, color: "#fff", border: "none", borderRadius: 7, padding: "8px 12px", fontSize: 12.5, fontWeight: 600, fontFamily: "'IBM Plex Sans KR', sans-serif", cursor: "pointer" };
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: COLORS.inkSoft, marginBottom: 6 };
const inputStyle = { width: "100%", fontFamily: "'IBM Plex Sans KR', sans-serif", fontSize: 13.5, padding: "9px 10px", borderRadius: 7, border: `1px solid ${COLORS.line}`, color: COLORS.ink, boxSizing: "border-box" };

/* ============================== Shared P&L breakdown ============================== */
function PLBreakdown({ pl }) {
  const groups = groupSums(pl.byCode);
  if (pl.revenue === 0 && pl.totalCost === 0) return <div style={{ padding: "20px 0", textAlign: "center", color: COLORS.inkSoft, fontSize: 13 }}>입력된 손익 데이터가 없습니다.</div>;
  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.accent, marginBottom: 4 }}>매출</div>
        {pl.revenueDetail.filter((r) => r.amount > 0).map((r) => (<div key={r.code} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0 5px 10px", fontSize: 12.5, color: COLORS.inkSoft }}><span>{r.name}{r.qty ? ` · ${r.qty.toLocaleString("ko-KR")}건` : ""}</span><Num value={won(r.amount)} /></div>))}
      </div>
      <div style={{ borderTop: `2px solid ${COLORS.ink}`, borderBottom: `1px solid ${COLORS.line}`, padding: "10px 0", display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 13, fontWeight: 600 }}>매출 합계</span><Num value={won(pl.revenue)} /></div>
      {["매출원가", "고정비", "변동비"].map((cat) => {
        const items = groups.filter((g) => g.category === cat); const subtotal = items.reduce((s, g) => s + g.amount, 0);
        return (<div key={cat}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 0 4px", fontSize: 12, fontWeight: 600, color: COLORS.inkSoft }}><span>{cat}</span><Num value={`- ${won(subtotal)}`} /></div>
          {items.map((g) => (<div key={g.group} style={{ borderBottom: `1px solid ${COLORS.line}`, padding: "6px 0 6px 10px", display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 12.5, color: COLORS.inkSoft }}>{g.group} <span style={{ fontSize: 11 }}>({pct(pl.revenue ? g.amount / pl.revenue : 0)})</span></span><Num value={`- ${won(g.amount)}`} /></div>))}
        </div>);
      })}
      <div style={{ borderTop: `2px solid ${COLORS.ink}`, padding: "10px 0", display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 14, fontWeight: 700 }}>영업이익</span><span style={{ fontSize: 15 }}><Num value={won(pl.profit)} tone={pl.profit >= 0 ? "good" : "bad"} /></span></div>
      <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: COLORS.inkSoft }}><span>{pl.writer ? `작성 ${pl.writer}` : ""}{pl.approvedBy ? ` · 승인 ${pl.approvedBy}` : ""}</span><Badge tone={pl.margin < 0.05 ? "bad" : pl.margin < 0.1 ? "warn" : "good"}>영업이익률 {pct(pl.margin)}</Badge></div>
    </>
  );
}

/* ============================== Franchisee Report ============================== */
function ReportOverlay({ store, month, pl, onClose }) {
  const groups = groupSums(pl.byCode);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(27,35,31,0.5)", zIndex: 150, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "40px 20px" }}>
      <style>{PRINT_CSS}</style>
      <div style={{ background: "#fff", width: 720, borderRadius: 10, overflow: "hidden" }}>
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${COLORS.line}`, background: COLORS.bg }}>
          <div style={{ fontSize: 13, color: COLORS.inkSoft }}>가맹점 배포용 리포트 미리보기</div>
          <div style={{ display: "flex", gap: 8 }}><button onClick={() => window.print()} style={primaryBtn}><Printer size={14} /> PDF로 저장 / 인쇄</button><button onClick={onClose} style={secondaryBtn}><X size={14} /> 닫기</button></div>
        </div>
        <div id="print-report" style={{ padding: "40px 44px", fontFamily: "'IBM Plex Sans KR', sans-serif", color: COLORS.ink }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `3px solid ${COLORS.ink}`, paddingBottom: 16, marginBottom: 24 }}>
            <div><div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22 }}>{store?.name}</div><div style={{ fontSize: 13, color: COLORS.inkSoft, marginTop: 4 }}>{brandName(store?.brandId)} · 가맹점코드 {store?.code} · {store?.complexType} · {store?.storeType}</div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 12, color: COLORS.inkSoft }}>정산월</div><div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, fontWeight: 600 }}>{month}</div></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 26 }}>
            <div style={{ border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: 14 }}><div style={{ fontSize: 11.5, color: COLORS.inkSoft, marginBottom: 6 }}>매출</div><div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 17 }}>{won(pl.revenue)}</div></div>
            <div style={{ border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: 14 }}><div style={{ fontSize: 11.5, color: COLORS.inkSoft, marginBottom: 6 }}>영업이익</div><div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 17, color: pl.profit >= 0 ? COLORS.accent : COLORS.danger }}>{won(pl.profit)}</div></div>
            <div style={{ border: `1px solid ${COLORS.line}`, borderRadius: 8, padding: 14 }}><div style={{ fontSize: 11.5, color: COLORS.inkSoft, marginBottom: 6 }}>영업이익률</div><div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 17 }}>{pct(pl.margin)}</div></div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <tbody>
              <tr style={{ borderTop: `2px solid ${COLORS.ink}`, borderBottom: `1px solid ${COLORS.line}` }}><td style={{ padding: "8px 4px", fontWeight: 600 }}>매출</td><td style={{ padding: "8px 4px", textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{won(pl.revenue)}</td></tr>
              {["매출원가", "고정비", "변동비"].map((cat) => {
                const items = groups.filter((g) => g.category === cat); const subtotal = items.reduce((s, g) => s + g.amount, 0);
                return (<React.Fragment key={cat}><tr><td style={{ padding: "7px 4px", fontWeight: 600, color: COLORS.inkSoft }}>{cat}</td><td style={{ padding: "7px 4px", textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", color: COLORS.inkSoft }}>- {won(subtotal)}</td></tr>{items.map((g) => <tr key={g.group}><td style={{ padding: "5px 4px 5px 18px", fontSize: 12, color: COLORS.inkSoft }}>{g.group}</td><td style={{ padding: "5px 4px", textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: COLORS.inkSoft }}>- {won(g.amount)}</td></tr>)}</React.Fragment>);
              })}
              <tr style={{ borderTop: `2px solid ${COLORS.ink}` }}><td style={{ padding: "10px 4px", fontWeight: 700, fontSize: 14 }}>영업이익</td><td style={{ padding: "10px 4px", textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 14 }}>{won(pl.profit)}</td></tr>
            </tbody>
          </table>
          <div style={{ marginTop: 30, fontSize: 11, color: COLORS.inkSoft, borderTop: `1px solid ${COLORS.line}`, paddingTop: 12 }}>본 리포트는 본사 승인 완료 데이터를 기준으로 자동 생성되었습니다. · 생성일 {new Date().toLocaleDateString("ko-KR")}</div>
        </div>
      </div>
    </div>
  );
}

/* ============================== Dashboard ============================== */
function Dashboard({ financials, stores, onExport, onOpenReport }) {
  const [storeFilter, setStoreFilter] = useState("ALL");
  const months = useMemo(() => allMonths(financials), [financials]);
  const latestConfirmedMonth = useMemo(() => { const c = financials.filter((f) => f.status === "confirmed").map((f) => f.month); return c.length ? c.sort().slice(-1)[0] : MONTHS[0]; }, [financials]);

  if (storeFilter === "ALL") {
    const kpi = (() => { let revenue = 0, profit = 0; const pendingBatches = new Set(); stores.forEach((s) => { const pl = computePL(s.id, latestConfirmedMonth, financials, ["confirmed"]); revenue += pl.revenue; profit += pl.profit; }); financials.forEach((f) => { if (f.status === "pending") pendingBatches.add(`${f.storeId}_${f.month}`); }); return { revenue, profit, margin: revenue ? profit / revenue : 0, pending: pendingBatches.size }; })();
    const brandChart = BRANDS.map((b) => { let revenue = 0, profit = 0; stores.filter((s) => s.brandId === b.id).forEach((s) => { const pl = computePL(s.id, latestConfirmedMonth, financials, ["confirmed"]); revenue += pl.revenue; profit += pl.profit; }); return { name: b.name, 매출: Math.round(revenue / 10000), 영업이익: Math.round(profit / 10000) }; });
    const trendChart = months.map((m) => { let profit = 0; stores.forEach((s) => { profit += computePL(s.id, m, financials, ["confirmed"]).profit; }); return { month: m, 영업이익: Math.round(profit / 10000) }; });
    const worstStores = stores.map((s) => ({ store: s, pl: computePL(s.id, latestConfirmedMonth, financials, ["confirmed"]) })).filter((x) => x.pl.revenue > 0).sort((a, b) => a.pl.margin - b.pl.margin).slice(0, 5);
    return (
      <div>
        <DashHeader stores={stores} storeFilter={storeFilter} setStoreFilter={setStoreFilter} refMonth={latestConfirmedMonth} onExport={() => onExport(buildRawRows(financials, stores), "전체_손익_raw데이터.csv")} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
          <Card><div style={kpiLabel}>전체 매출</div><div style={{ fontSize: 22 }}><Num value={won(kpi.revenue)} /></div></Card>
          <Card><div style={kpiLabel}>전체 영업이익</div><div style={{ fontSize: 22 }}><Num value={won(kpi.profit)} tone={kpi.profit >= 0 ? "good" : "bad"} /></div></Card>
          <Card><div style={kpiLabel}>평균 영업이익률</div><div style={{ fontSize: 22 }}><Num value={pct(kpi.margin)} tone={kpi.margin >= 0.1 ? "good" : "warn"} /></div></Card>
          <Card><div style={{ ...kpiLabel, display: "flex", alignItems: "center", gap: 6 }}><Clock size={13} /> 승인 대기</div><div style={{ fontSize: 22 }}><Num value={`${kpi.pending}건`} tone={kpi.pending > 0 ? "warn" : undefined} /></div></Card>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 14, marginBottom: 14 }}>
          <Card><div style={cardTitle}>브랜드별 매출 · 영업이익 (만원)</div><ResponsiveContainer width="100%" height={240}><BarChart data={brandChart}><CartesianGrid stroke={COLORS.line} vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: "IBM Plex Sans KR" }} /><YAxis tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} /><Tooltip contentStyle={{ fontFamily: "IBM Plex Sans KR", fontSize: 12, borderRadius: 8 }} /><Legend wrapperStyle={{ fontSize: 12, fontFamily: "IBM Plex Sans KR" }} /><Bar dataKey="매출" fill={COLORS.accentSoft} stroke={COLORS.accent} radius={[4, 4, 0, 0]} /><Bar dataKey="영업이익" fill={COLORS.accent} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></Card>
          <Card><div style={cardTitle}>월별 영업이익 추이 (만원)</div><ResponsiveContainer width="100%" height={240}><LineChart data={trendChart}><CartesianGrid stroke={COLORS.line} vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} /><YAxis tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} /><Tooltip contentStyle={{ fontFamily: "IBM Plex Sans KR", fontSize: 12, borderRadius: 8 }} /><Line type="monotone" dataKey="영업이익" stroke={COLORS.accent} strokeWidth={2.5} dot={{ r: 4 }} /></LineChart></ResponsiveContainer></Card>
        </div>
        <Card>
          <div style={{ ...cardTitle, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}><AlertTriangle size={16} color={COLORS.warn} /> 이익률 하위 매장 (주의 관찰)</div>
          <p style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 0, marginBottom: 14 }}>{latestConfirmedMonth} 기준 영업이익률이 낮은 매장입니다.</p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ borderBottom: `1px solid ${COLORS.line}` }}>{["매장", "브랜드", "매출", "영업이익", "이익률"].map((h, i) => <th key={h} style={{ textAlign: i > 1 ? "right" : "left", fontSize: 11, color: COLORS.inkSoft, fontWeight: 500, padding: "6px 4px" }}>{h}</th>)}</tr></thead>
            <tbody>{worstStores.map(({ store, pl }) => (<tr key={store.id} style={{ borderBottom: `1px solid ${COLORS.line}` }}><td style={{ padding: "8px 4px", fontSize: 13, color: COLORS.ink }}>{store.name}</td><td style={{ padding: "8px 4px", fontSize: 13, color: COLORS.inkSoft }}>{brandName(store.brandId)}</td><td style={{ padding: "8px 4px", textAlign: "right" }}><Num value={won(pl.revenue)} /></td><td style={{ padding: "8px 4px", textAlign: "right" }}><Num value={won(pl.profit)} tone={pl.profit >= 0 ? undefined : "bad"} /></td><td style={{ padding: "8px 4px", textAlign: "right" }}><Badge tone={pl.margin < 0.05 ? "bad" : pl.margin < 0.1 ? "warn" : "good"}>{pct(pl.margin)}</Badge></td></tr>))}</tbody>
          </table>
        </Card>
      </div>
    );
  }

  const store = storeById(stores, storeFilter);
  const pl = computePL(storeFilter, latestConfirmedMonth, financials, ["confirmed"]);
  const catTotals = categoryTotals(pl.byCode);
  const catChart = [{ name: "매출원가", 금액: Math.round(catTotals["매출원가"] / 10000) }, { name: "고정비", 금액: Math.round(catTotals["고정비"] / 10000) }, { name: "변동비", 금액: Math.round(catTotals["변동비"] / 10000) }];
  const trendChart = months.map((m) => ({ month: m, 영업이익: Math.round(computePL(storeFilter, m, financials, ["confirmed"]).profit / 10000) }));
  return (
    <div>
      <DashHeader stores={stores} storeFilter={storeFilter} setStoreFilter={setStoreFilter} refMonth={latestConfirmedMonth} onExport={() => onExport(buildRawRows(financials, stores), "전체_손익_raw데이터.csv")} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
        <Card><div style={kpiLabel}>매출 ({latestConfirmedMonth})</div><div style={{ fontSize: 22 }}><Num value={won(pl.revenue)} /></div></Card>
        <Card><div style={kpiLabel}>영업이익</div><div style={{ fontSize: 22 }}><Num value={won(pl.profit)} tone={pl.profit >= 0 ? "good" : "bad"} /></div></Card>
        <Card><div style={kpiLabel}>영업이익률</div><div style={{ fontSize: 22 }}><Num value={pct(pl.margin)} tone={pl.margin >= 0.1 ? "good" : "warn"} /></div></Card>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card><div style={cardTitle}>비용 구조 (만원)</div><ResponsiveContainer width="100%" height={200}><BarChart data={catChart}><CartesianGrid stroke={COLORS.line} vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: "IBM Plex Sans KR" }} /><YAxis tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} /><Tooltip contentStyle={{ fontFamily: "IBM Plex Sans KR", fontSize: 12, borderRadius: 8 }} /><Bar dataKey="금액" fill={COLORS.accent} radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></Card>
          <Card><div style={cardTitle}>월별 영업이익 추이 (만원)</div><ResponsiveContainer width="100%" height={180}><LineChart data={trendChart}><CartesianGrid stroke={COLORS.line} vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} /><YAxis tick={{ fontSize: 11, fontFamily: "IBM Plex Mono" }} /><Tooltip contentStyle={{ fontFamily: "IBM Plex Sans KR", fontSize: 12, borderRadius: 8 }} /><Line type="monotone" dataKey="영업이익" stroke={COLORS.accent} strokeWidth={2.5} dot={{ r: 4 }} /></LineChart></ResponsiveContainer></Card>
        </div>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
            <div style={cardTitle}>{store?.name} 손익 상세</div>
            <div style={{ display: "flex", gap: 8 }}><button onClick={() => onOpenReport(store, latestConfirmedMonth, pl)} style={{ ...secondaryBtn, padding: "8px 12px", fontSize: 12.5 }}><Printer size={13} /> 가맹점 리포트</button><DownloadBtn label="이 매장 Raw 데이터" onClick={() => onExport(buildRawRows(financials, stores, storeFilter), `${store?.code}_raw데이터.csv`)} /></div>
          </div>
          <PLBreakdown pl={pl} />
        </Card>
      </div>
    </div>
  );
}
function DashHeader({ stores, storeFilter, setStoreFilter, refMonth, onExport }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
      <div><h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: COLORS.ink, margin: 0 }}>경영 대시보드</h1><p style={{ color: COLORS.inkSoft, fontSize: 13, marginTop: 4 }}>기준월 {refMonth} · 승인 완료 데이터 기준</p></div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}><select value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)} style={{ ...selectStyle, maxWidth: 200 }}><option value="ALL">전체 매장</option>{stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select><DownloadBtn label="전체 Raw 데이터" onClick={onExport} /></div>
    </div>
  );
}
const kpiLabel = { fontSize: 12, color: COLORS.inkSoft, marginBottom: 8 };
const cardTitle = { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: 12, color: COLORS.ink };

/* ============================== Stores Tab ============================== */
function StoresTab({ financials, stores, onExport, onOpenReport }) {
  const [brandFilter, setBrandFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const months = useMemo(() => allMonths(financials), [financials]);
  const [month, setMonth] = useState(MONTHS[1]);
  const [selected, setSelected] = useState(null);
  const rows = stores.filter((s) => (brandFilter === "ALL" || s.brandId === brandFilter) && (typeFilter === "ALL" || s.storeType === typeFilter)).map((s) => ({ store: s, pl: computePL(s.id, month, financials) }));
  const selectedPL = selected ? computePL(selected.id, month, financials) : null;
  return (
    <div>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: COLORS.ink, marginBottom: 4 }}>매장별 손익계산서</h1>
      <p style={{ color: COLORS.inkSoft, fontSize: 13, marginBottom: 16 }}>매장을 선택하면 계정 그룹별 상세 내역을 확인할 수 있습니다. ({rows.length}개 매장)</p>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} style={selectStyle}><option value="ALL">전체 브랜드</option>{BRANDS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={selectStyle}><option value="ALL">전체 타입</option><option value="가마솥">가마솥</option><option value="배달점">배달점</option><option value="일반">일반</option></select>
        <select value={month} onChange={(e) => setMonth(e.target.value)} style={selectStyle}>{months.map((m) => <option key={m} value={m}>{m}</option>)}</select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: selected ? "1.3fr 1fr" : "1fr", gap: 14 }}>
        <Card style={{ padding: 0, overflow: "hidden", maxHeight: 640, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: COLORS.bg, borderBottom: `1px solid ${COLORS.line}`, position: "sticky", top: 0 }}>{["매장", "타입", "매출", "영업이익", "이익률", "상태", ""].map((h, i) => <th key={h} style={{ textAlign: i >= 2 && i <= 4 ? "right" : "left", fontSize: 11, color: COLORS.inkSoft, fontWeight: 500, padding: "10px 12px", background: COLORS.bg }}>{h}</th>)}</tr></thead>
            <tbody>{rows.map(({ store, pl }) => (<tr key={store.id} onClick={() => setSelected(store)} style={{ borderBottom: `1px solid ${COLORS.line}`, cursor: "pointer", background: selected?.id === store.id ? COLORS.accentSoft : "transparent" }}><td style={{ padding: "10px 12px", fontSize: 13, color: COLORS.ink }}>{store.name} <span style={{ fontSize: 11, color: COLORS.inkSoft }}>({store.code})</span></td><td style={{ padding: "10px 12px", fontSize: 12, color: COLORS.inkSoft }}>{store.storeType}</td><td style={{ padding: "10px 12px", textAlign: "right" }}>{pl.revenue > 0 ? <Num value={won(pl.revenue)} /> : <span style={{ color: COLORS.inkSoft, fontSize: 12 }}>미입력</span>}</td><td style={{ padding: "10px 12px", textAlign: "right" }}>{pl.revenue > 0 ? <Num value={won(pl.profit)} tone={pl.profit >= 0 ? undefined : "bad"} /> : "-"}</td><td style={{ padding: "10px 12px", textAlign: "right" }}>{pl.revenue > 0 ? <Badge tone={pl.margin < 0.05 ? "bad" : pl.margin < 0.1 ? "warn" : "good"}>{pct(pl.margin)}</Badge> : "-"}</td><td style={{ padding: "10px 12px" }}>{pl.revenue === 0 ? <Badge>미입력</Badge> : pl.hasPending ? <Badge tone="warn">승인대기</Badge> : <Badge tone="good">확정</Badge>}</td><td style={{ padding: "10px 12px", color: COLORS.inkSoft }}><ChevronRight size={14} /></td></tr>))}</tbody>
          </table>
        </Card>
        {selected && selectedPL && (
          <Card>
            <div><div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.ink }}>{selected.name}</div><div style={{ fontSize: 12, color: COLORS.inkSoft, marginBottom: 16 }}>{brandName(selected.brandId)} · {selected.complexType} · {selected.storeType} · {month}</div></div>
            <div style={{ marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap" }}><button onClick={() => onOpenReport(selected, month, selectedPL)} style={{ ...secondaryBtn, padding: "8px 12px", fontSize: 12.5 }}><Printer size={13} /> 가맹점 리포트</button><DownloadBtn label="이 매장 Raw 데이터" onClick={() => onExport(buildRawRows(financials, stores, selected.id), `${selected.code}_raw데이터.csv`)} /></div>
            <PLBreakdown pl={selectedPL} />
          </Card>
        )}
      </div>
    </div>
  );
}

/* ============================== Store Manage Tab ============================== */
function StoreManageTab({ stores, onAdd, onEdit, onDelete }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [brandFilter, setBrandFilter] = useState("ALL");
  const [query, setQuery] = useState("");

  const rows = stores.filter((s) => (brandFilter === "ALL" || s.brandId === brandFilter) && (query.trim() === "" || s.name.includes(query.trim()) || s.code.includes(query.trim())));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: COLORS.ink, marginBottom: 4 }}>매장 관리</h1>
          <p style={{ color: COLORS.inkSoft, fontSize: 13 }}>총 {stores.length}개 매장 · 매장 정보 수정 및 삭제</p>
        </div>
        <button onClick={() => { setEditing(null); setFormOpen(true); }} style={primaryBtn}><Plus size={14} /> 매장 추가</button>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} style={selectStyle}><option value="ALL">전체 브랜드</option>{BRANDS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="매장명 또는 코드 검색" style={{ ...selectStyle, width: 220 }} />
      </div>
      <Card style={{ padding: 0, overflow: "hidden", maxHeight: 640, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: COLORS.bg, borderBottom: `1px solid ${COLORS.line}`, position: "sticky", top: 0 }}>{["매장", "가맹점코드", "브랜드", "복합점", "타입구분", ""].map((h) => <th key={h} style={{ textAlign: "left", fontSize: 11, color: COLORS.inkSoft, fontWeight: 500, padding: "10px 12px", background: COLORS.bg }}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} style={{ borderBottom: `1px solid ${COLORS.line}` }}>
                <td style={{ padding: "9px 12px", fontSize: 13, color: COLORS.ink }}>{s.name}</td>
                <td style={{ padding: "9px 12px", fontSize: 12.5, fontFamily: "'IBM Plex Mono', monospace", color: COLORS.inkSoft }}>{s.code}</td>
                <td style={{ padding: "9px 12px", fontSize: 12.5, color: COLORS.inkSoft }}>{brandName(s.brandId)}</td>
                <td style={{ padding: "9px 12px" }}><Badge>{s.complexType}</Badge></td>
                <td style={{ padding: "9px 12px" }}><Badge tone={s.storeType === "배달점" ? "warn" : "neutral"}>{s.storeType}</Badge></td>
                <td style={{ padding: "9px 12px" }}>
                  {confirmingId === s.id ? (
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: COLORS.danger }}>정말 삭제할까요?</span>
                      <button onClick={() => { onDelete(s.id); setConfirmingId(null); }} style={{ ...dangerBtn, padding: "6px 10px" }}>삭제</button>
                      <button onClick={() => setConfirmingId(null)} style={{ ...secondaryBtn, padding: "6px 10px" }}>취소</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { setEditing(s); setFormOpen(true); }} style={{ ...secondaryBtn, padding: "6px 10px" }}><Pencil size={12} /> 수정</button>
                      <button onClick={() => setConfirmingId(s.id)} style={{ ...secondaryBtn, padding: "6px 10px", color: COLORS.danger, borderColor: COLORS.danger }}><Trash2 size={12} /> 삭제</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {formOpen && <StoreFormModal initial={editing} onClose={() => setFormOpen(false)} onSave={(store) => { editing ? onEdit(store) : onAdd(store); setFormOpen(false); }} />}
    </div>
  );
}

/* ============================== Store Form Modal (add/edit) ============================== */
function StoreFormModal({ initial, onClose, onSave }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(initial ? { ...initial } : { name: "", code: "", brandId: "WONSSAM", complexType: "단독점", storeType: "일반" });
  const canSubmit = form.name.trim() && form.code.trim();
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(27,35,31,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: COLORS.surface, borderRadius: 14, width: 420, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${COLORS.line}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.ink }}>{isEdit ? "매장 수정" : "매장 추가"}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.inkSoft }}><X size={18} /></button>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <div style={{ marginBottom: 14 }}><label style={labelStyle}>매장</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="예: 가락" style={inputStyle} /></div>
          <div style={{ marginBottom: 14 }}><label style={labelStyle}>가맹점코드</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="예: 200059" style={inputStyle} /></div>
          <div style={{ marginBottom: 14 }}><label style={labelStyle}>브랜드</label><select value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })} style={{ ...inputStyle, appearance: "auto" }}>{BRANDS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
          <div style={{ marginBottom: 14 }}><label style={labelStyle}>복합점</label><select value={form.complexType} onChange={(e) => setForm({ ...form, complexType: e.target.value })} style={{ ...inputStyle, appearance: "auto" }}><option value="단독점">단독점</option><option value="복합점">복합점</option></select></div>
          <div><label style={labelStyle}>타입구분</label><select value={form.storeType} onChange={(e) => setForm({ ...form, storeType: e.target.value })} style={{ ...inputStyle, appearance: "auto" }}><option value="가마솥">가마솥</option><option value="배달점">배달점</option><option value="일반">일반</option></select></div>
        </div>
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${COLORS.line}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={secondaryBtn}>취소</button>
          <button onClick={() => canSubmit && onSave({ id: isEdit ? initial.id : `S${Date.now()}`, name: form.name.trim(), code: form.code.trim(), brandId: form.brandId, complexType: form.complexType, storeType: form.storeType })} disabled={!canSubmit} style={{ ...primaryBtn, opacity: canSubmit ? 1 : 0.4, cursor: canSubmit ? "pointer" : "not-allowed" }}>{isEdit ? <><Check size={14} /> 저장</> : <><Plus size={14} /> 추가</>}</button>
        </div>
      </div>
    </div>
  );
}

/* ============================== Entry Wizard ============================== */
const STEPS = [
  { id: "basic", title: "기본 정보" },
  { id: "revenue", title: "매출 정보" },
  { id: "cogs", title: "매출원가", groups: [{ label: "매출원가", fields: [{ code: "COGS-HQ", name: "본사식재" }, { code: "COGS-PURCH", name: "사입식재" }] }] },
  { id: "fixed", title: "고정비", groups: [
      { label: "홀 인건비", fields: [{ code: "FIX-HALL-REG", name: "직원" }, { code: "FIX-HALL-PT", name: "파트타임" }, { code: "FIX-HALL-DAY", name: "일용직" }] },
      { label: "주방 인건비", fields: [{ code: "FIX-KITCHEN-REG", name: "직원" }, { code: "FIX-KITCHEN-PT", name: "파트타임" }, { code: "FIX-KITCHEN-DAY", name: "일용직" }] },
      { label: "보험료", fields: [{ code: "FIX-INS-4DA", name: "4대보험" }, { code: "FIX-INS-FIRE", name: "화재/음식물/가스/영업배상" }] },
      { label: "기타 고정비", fields: [{ code: "FIX-RENT", name: "임차료" }, { code: "FIX-MGMT", name: "관리비" }, { code: "FIX-TAXFEE", name: "수수료(세무기장료)" }] },
    ] },
  { id: "var1", title: "변동비 · 운영비용", groups: [
      { label: "배달/차량", fields: [{ code: "VAR-DELIVERY", name: "배달대행" }, { code: "VAR-VEHICLE", name: "차량유지비" }] },
      { label: "통신비", fields: [{ code: "VAR-COMM-PHONE", name: "전화료" }, { code: "VAR-COMM-NET", name: "인터넷" }, { code: "VAR-COMM-CABLE", name: "케이블방송" }] },
      { label: "수도광열비", fields: [{ code: "VAR-UTIL-ELEC", name: "전기" }, { code: "VAR-UTIL-GAS", name: "가스" }, { code: "VAR-UTIL-WATER", name: "수도" }] },
      { label: "매장 운영", fields: [{ code: "VAR-AD", name: "광고/홍보비" }, { code: "VAR-PACK", name: "포장용기" }, { code: "VAR-SECURITY", name: "점포보안" }, { code: "VAR-WATERPUR", name: "정수기" }, { code: "VAR-WELFARE", name: "복리후생비" }, { code: "VAR-SUPPLY", name: "소모품비" }, { code: "VAR-MISC", name: "기타/잡비" }] },
    ] },
  { id: "var2", title: "변동비 · 수수료·세금", groups: [
      { label: "어플수수료 (결제 수수료 + 중개 수수료)", fields: [{ code: "VAR-APP-BAEMIN", name: "배달의민족" }, { code: "VAR-APP-COUPANG", name: "쿠팡이츠" }, { code: "VAR-APP-ETC", name: "기타" }] },
      { label: "기타", fields: [{ code: "VAR-CARDFEE", name: "카드 수수료" }, { code: "VAR-TAX", name: "국세/지방세" }, { code: "VAR-DEPR", name: "감가상각비" }, { code: "VAR-ADSHARE", name: "광고비분담금" }, { code: "VAR-ROYALTY", name: "로열티" }] },
    ] },
  { id: "review", title: "확인 및 제출" },
];
function FieldRow({ name, value, onChange }) { return <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${COLORS.line}` }}><span style={{ fontSize: 13.5, color: COLORS.ink }}>{name}</span><div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: COLORS.inkSoft }}>₩</span><MoneyInput value={value} onChange={onChange} /></div></div>; }
function DeliveryFieldRow({ name, qty, onQty, amount, onAmount }) {
  const q = Number(qty || 0), a = Number(amount || 0); const avg = q > 0 ? Math.round(a / q) : 0;
  return (<div style={{ padding: "9px 0", borderBottom: `1px solid ${COLORS.line}` }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
      <span style={{ fontSize: 13.5, color: COLORS.ink }}>{name}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 11.5, color: COLORS.inkSoft }}>건수</span><input type="text" inputMode="numeric" value={fmtNum(qty)} onChange={(e) => onQty(e.target.value.replace(/[^0-9]/g, ""))} placeholder="0" style={{ width: 70, textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, border: `1px solid ${COLORS.line}`, borderRadius: 6, padding: "6px 8px", color: COLORS.ink }} /><span style={{ fontSize: 11.5, color: COLORS.inkSoft }}>건</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ fontSize: 11.5, color: COLORS.inkSoft }}>매출</span><span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: COLORS.inkSoft }}>₩</span><MoneyInput value={amount} onChange={onAmount} /></div>
      </div>
    </div>
    {avg > 0 && <div style={{ textAlign: "right", fontSize: 11, color: COLORS.inkSoft, marginTop: 3 }}>평균 객단가 약 {won(avg)}</div>}
  </div>);
}
function EntryWizard({ stores, onClose, onSubmit }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [basic, setBasic] = useState({ writer: "", storeId: "", month: OPEN_MONTH });
  const [values, setValues] = useState({});
  const [qtys, setQtys] = useState({});
  const step = STEPS[stepIdx];
  const setVal = (code, v) => setValues((prev) => ({ ...prev, [code]: v }));
  const setQty = (code, v) => setQtys((prev) => ({ ...prev, [code]: v }));
  const num = (code) => Number(values[code] || 0);
  const hallRev = num("REV-HALL");
  const deliveryRev = DELIVERY_CODES.reduce((s, c) => s + num(c), 0);
  const totalRev = hallRev + deliveryRev;
  const cogsTotal = num("COGS-HQ") + num("COGS-PURCH");
  const fixedCodes = STEPS.find((s) => s.id === "fixed").groups.flatMap((g) => g.fields.map((f) => f.code));
  const varCodes = [...STEPS.find((s) => s.id === "var1").groups, ...STEPS.find((s) => s.id === "var2").groups].flatMap((g) => g.fields.map((f) => f.code));
  const fixedTotal = fixedCodes.reduce((s, c) => s + num(c), 0);
  const varTotal = varCodes.reduce((s, c) => s + num(c), 0);
  const totalCost = cogsTotal + fixedTotal + varTotal;
  const profit = totalRev - totalCost;
  const canNext = step.id !== "basic" || (basic.writer.trim() && basic.storeId);
  const goNext = () => setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  const goPrev = () => setStepIdx((i) => Math.max(i - 1, 0));
  const submit = () => { const records = ACCOUNTS.map((a) => ({ accountCode: a.code, amount: num(a.code), qty: DELIVERY_CODES.includes(a.code) ? Number(qtys[a.code] || 0) : undefined })).filter((r) => r.amount > 0); onSubmit({ storeId: basic.storeId, month: basic.month, writer: basic.writer, records }); };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(27,35,31,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: COLORS.surface, borderRadius: 14, width: 640, maxHeight: "88vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${COLORS.line}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.ink }}>매장 손익 입력</div><button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.inkSoft }}><X size={18} /></button></div>
          <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>{STEPS.map((s, i) => <div key={s.id} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= stepIdx ? COLORS.accent : COLORS.line }} />)}</div>
          <div style={{ fontSize: 12, color: COLORS.inkSoft }}>{stepIdx + 1} / {STEPS.length} · {step.title}</div>
        </div>
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {step.id === "basic" && (<div>
            <div style={{ marginBottom: 16 }}><label style={labelStyle}>작성자</label><input value={basic.writer} onChange={(e) => setBasic({ ...basic, writer: e.target.value })} placeholder="예: 홍길동" style={inputStyle} /><div style={{ fontSize: 11, color: COLORS.inkSoft, marginTop: 4 }}>직책 없이 이름만 입력해주세요.</div></div>
            <div style={{ marginBottom: 16 }}><label style={labelStyle}>매장</label><select value={basic.storeId} onChange={(e) => setBasic({ ...basic, storeId: e.target.value })} style={{ ...inputStyle, appearance: "auto" }}><option value="">매장을 선택하세요</option>{stores.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}</select></div>
            <div><label style={labelStyle}>정산월</label><input type="month" value={basic.month} onChange={(e) => setBasic({ ...basic, month: e.target.value })} style={{ ...inputStyle, appearance: "auto" }} /><div style={{ fontSize: 11, color: COLORS.inkSoft, marginTop: 4 }}>다음 달로 넘어가면 여기서 새 달을 바로 선택해 입력할 수 있습니다.</div></div>
          </div>)}
          {step.id === "revenue" && (<div>
            <div style={{ marginBottom: 18 }}><div style={{ fontSize: 12, fontWeight: 600, color: COLORS.accent, marginBottom: 4 }}>홀 매출</div><FieldRow name="홀 매출" value={values["REV-HALL"] || ""} onChange={(v) => setVal("REV-HALL", v)} /></div>
            <div style={{ marginBottom: 4 }}><div style={{ fontSize: 12, fontWeight: 600, color: COLORS.accent, marginBottom: 4 }}>배달 매출 (건수 + 매출 함께 입력)</div>
              <DeliveryFieldRow name="배달의민족" qty={qtys["REV-BAEMIN"] || ""} onQty={(v) => setQty("REV-BAEMIN", v)} amount={values["REV-BAEMIN"] || ""} onAmount={(v) => setVal("REV-BAEMIN", v)} />
              <DeliveryFieldRow name="쿠팡이츠" qty={qtys["REV-COUPANG"] || ""} onQty={(v) => setQty("REV-COUPANG", v)} amount={values["REV-COUPANG"] || ""} onAmount={(v) => setVal("REV-COUPANG", v)} />
              <DeliveryFieldRow name="기타" qty={qtys["REV-ETC"] || ""} onQty={(v) => setQty("REV-ETC", v)} amount={values["REV-ETC"] || ""} onAmount={(v) => setVal("REV-ETC", v)} />
            </div>
            <div style={{ background: COLORS.accentSoft, borderRadius: 8, padding: "12px 14px", marginTop: 12 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}><span style={{ color: COLORS.inkSoft }}>배달 매출 합계</span><Num value={won(deliveryRev)} /></div><div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700 }}><span>총매출 (홀 + 배달)</span><Num value={won(totalRev)} tone="good" /></div></div>
          </div>)}
          {step.groups && step.groups.map((g) => (<div key={g.label} style={{ marginBottom: 18 }}><div style={{ fontSize: 12, fontWeight: 600, color: COLORS.accent, marginBottom: 4 }}>{g.label}</div>{g.fields.map((f) => <FieldRow key={f.code} name={f.name} value={values[f.code] || ""} onChange={(v) => setVal(f.code, v)} />)}</div>))}
          {step.id === "review" && (<div>
            <div style={{ fontSize: 13, color: COLORS.inkSoft, marginBottom: 14 }}>{basic.storeId && storeById(stores, basic.storeId)?.name} · {basic.month} · 작성자 {basic.writer}</div>
            {[{ label: "총매출", value: totalRev, bold: true }, { label: "매출원가", value: -cogsTotal }, { label: "고정비", value: -fixedTotal }, { label: "변동비", value: -varTotal }].map((r) => (<div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${COLORS.line}`, fontWeight: r.bold ? 600 : 400 }}><span style={{ fontSize: 13.5 }}>{r.label}</span><Num value={`${r.value < 0 ? "- " : ""}${won(Math.abs(r.value))}`} /></div>))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 4px", borderTop: `2px solid ${COLORS.ink}`, marginTop: 6 }}><span style={{ fontSize: 15, fontWeight: 700 }}>예상 영업이익</span><span style={{ fontSize: 16 }}><Num value={won(profit)} tone={profit >= 0 ? "good" : "bad"} /></span></div>
            <p style={{ fontSize: 11.5, color: COLORS.inkSoft, marginTop: 14 }}>제출하면 본사 승인 대기 상태로 등록됩니다.</p>
          </div>)}
        </div>
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${COLORS.line}`, display: "flex", justifyContent: "space-between" }}>
          <button onClick={stepIdx === 0 ? onClose : goPrev} style={secondaryBtn}>{stepIdx === 0 ? "취소" : <><ArrowLeft size={14} /> 이전</>}</button>
          {step.id === "review" ? <button onClick={submit} style={primaryBtn}><Check size={14} /> 제출하기</button> : <button onClick={goNext} disabled={!canNext} style={{ ...primaryBtn, opacity: canNext ? 1 : 0.4, cursor: canNext ? "pointer" : "not-allowed" }}>다음 <ArrowRight size={14} /></button>}
        </div>
      </div>
    </div>
  );
}

/* ============================== Approval Tab ============================== */
function ApprovalTab({ financials, stores, onDecision }) {
  const [approverNames, setApproverNames] = useState({});
  const batches = useMemo(() => {
    const map = new Map();
    financials.forEach((f) => { if (f.status !== "pending") return; const key = `${f.storeId}_${f.month}`; if (!map.has(key)) map.set(key, { storeId: f.storeId, month: f.month, writer: f.writer, rows: [] }); map.get(key).rows.push(f); });
    return Array.from(map.values()).map((b) => ({ ...b, pl: computePL(b.storeId, b.month, financials, ["pending"]), store: storeById(stores, b.storeId) }));
  }, [financials, stores]);
  return (
    <div>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: COLORS.ink, marginBottom: 4 }}>승인 관리</h1>
      <p style={{ color: COLORS.inkSoft, fontSize: 13, marginBottom: 20 }}>승인자 이름을 입력해야 승인 처리됩니다.</p>
      {batches.length === 0 ? <Card><div style={{ textAlign: "center", padding: "30px 0", color: COLORS.inkSoft, fontSize: 13 }}>승인 대기 중인 항목이 없습니다.</div></Card> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {batches.map((b) => { const key = `${b.storeId}_${b.month}`; const approver = approverNames[key] || "";
            return (<Card key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}><Building2 size={18} color={COLORS.accent} /><div><div style={{ fontSize: 14, fontWeight: 600, color: COLORS.ink }}>{b.store?.name}</div><div style={{ fontSize: 12, color: COLORS.inkSoft }}>{b.month} · {brandName(b.store?.brandId)} · 작성자 {b.writer || "-"} · {b.rows.length}개 항목</div></div></div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: COLORS.inkSoft }}>매출 / 영업이익</div><div style={{ fontSize: 13 }}><Num value={won(b.pl.revenue)} /> <span style={{ color: COLORS.inkSoft }}>/</span> <Num value={won(b.pl.profit)} tone={b.pl.profit >= 0 ? "good" : "bad"} /></div></div>
                <input value={approver} onChange={(e) => setApproverNames({ ...approverNames, [key]: e.target.value })} placeholder="승인자 이름" style={{ width: 110, fontFamily: "'IBM Plex Sans KR', sans-serif", fontSize: 12.5, padding: "8px 10px", borderRadius: 6, border: `1px solid ${COLORS.line}` }} />
                <button onClick={() => approver.trim() && onDecision(b.storeId, b.month, "confirmed", approver.trim())} disabled={!approver.trim()} style={{ ...primaryBtn, opacity: approver.trim() ? 1 : 0.4, cursor: approver.trim() ? "pointer" : "not-allowed" }}><Check size={14} /> 승인</button>
                <button onClick={() => onDecision(b.storeId, b.month, "reject")} style={{ ...secondaryBtn, color: COLORS.danger, borderColor: COLORS.danger }}><X size={14} /> 반려</button>
              </div>
            </Card>);
          })}
        </div>
      )}
    </div>
  );
}

/* ============================== App Shell ============================== */
export default function App() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [stores, setStores] = useState([]);
  const [financials, setFinancials] = useState([]);
  const [monthsIndex, setMonthsIndex] = useState([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [report, setReport] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let mounted = true;
    loadSharedData().then((data) => { if (!mounted) return; setStores(data.stores); setFinancials(data.financials); setMonthsIndex(data.monthsIndex); setLoading(false); }).catch(() => {
      setStores(INITIAL_STORES); setFinancials(INITIAL_FINANCIALS); setMonthsIndex(SEED_MONTHS); setLoading(false);
      setToast("공유 저장소 연결에 실패해 이 화면에서만 보이는 임시 데이터로 시작합니다.");
    });
    return () => { mounted = false; };
  }, []);

  const flashToast = (msg, ms = 4000) => { setToast(msg); setTimeout(() => setToast(""), ms); };

  const handleSubmit = async ({ storeId, month, writer, records }) => {
    const newFinancials = (() => {
      const filtered = financials.filter((f) => !(f.storeId === storeId && f.month === month));
      const added = records.map((r, i) => ({ id: `M${Date.now()}_${i}`, storeId, month, accountCode: r.accountCode, amount: r.amount, qty: r.qty, status: "pending", source: "manual", writer }));
      return [...filtered, ...added];
    })();
    setFinancials(newFinancials); setWizardOpen(false); setTab("approval");
    const updatedIndex = await saveMonthFinancials(newFinancials, month, monthsIndex);
    setMonthsIndex(updatedIndex);
    flashToast(`${storeById(stores, storeId)?.name} · ${month} 손익이 제출되었습니다. 승인관리에서 확인하세요.`);
  };
  const decide = async (storeId, month, decision, approverName) => {
    const newFinancials = decision === "reject" ? financials.filter((f) => !(f.storeId === storeId && f.month === month && f.status === "pending")) : financials.map((f) => (f.storeId === storeId && f.month === month && f.status === "pending" ? { ...f, status: "confirmed", approvedBy: approverName } : f));
    setFinancials(newFinancials);
    const updatedIndex = await saveMonthFinancials(newFinancials, month, monthsIndex);
    setMonthsIndex(updatedIndex);
  };
  const addStore = async (store) => { const updated = [...stores, store]; setStores(updated); await storageSet("stores-master", updated); flashToast(`${store.name} 매장이 추가되었습니다.`, 3000); };
  const editStore = async (store) => { const updated = stores.map((s) => (s.id === store.id ? store : s)); setStores(updated); await storageSet("stores-master", updated); flashToast(`${store.name} 매장 정보가 수정되었습니다.`, 3000); };
  const deleteStore = async (storeId) => {
    const store = storeById(stores, storeId);
    const updatedStores = stores.filter((s) => s.id !== storeId);
    setStores(updatedStores); await storageSet("stores-master", updatedStores);
    const affectedMonths = Array.from(new Set(financials.filter((f) => f.storeId === storeId).map((f) => f.month)));
    const newFinancials = financials.filter((f) => f.storeId !== storeId);
    setFinancials(newFinancials);
    for (const m of affectedMonths) await storageSet(`financials-${m}`, newFinancials.filter((f) => f.month === m));
    flashToast(`${store?.name || "매장"}이(가) 삭제되었습니다.`, 3000);
  };
  const handleExport = (rows, filename) => exportCSV(rows, filename, (msg) => flashToast(msg, 5000));

  const pendingCount = new Set(financials.filter((f) => f.status === "pending").map((f) => `${f.storeId}_${f.month}`)).size;
  const nav = [
    { id: "dashboard", label: "대시보드", icon: LayoutDashboard },
    { id: "stores", label: "매장별 손익", icon: Store },
    { id: "manage", label: "매장 관리", icon: Building2 },
    { id: "approval", label: "승인관리", icon: CheckSquare, badge: pendingCount },
  ];

  if (loading) {
    return (
      <div style={{ background: COLORS.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Sans KR', sans-serif" }}>
        <style>{FONT_IMPORT}</style>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: COLORS.inkSoft }}><Loader2 size={22} className="spin" style={{ animation: "spin 1s linear infinite" }} /><style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style><div style={{ fontSize: 13 }}>공유 데이터 불러오는 중...</div></div>
      </div>
    );
  }

  return (
    <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'IBM Plex Sans KR', sans-serif" }}>
      <style>{FONT_IMPORT}</style>
      <div style={{ display: "flex" }}>
        <div style={{ width: 220, minHeight: "100vh", background: COLORS.surface, borderRight: `1px solid ${COLORS.line}`, padding: "22px 14px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 8px", marginBottom: 22 }}><div style={{ width: 26, height: 26, borderRadius: 6, background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><TrendingUp size={15} color="#fff" /></div><div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: COLORS.ink }}>가맹손익원장</div></div>
          <button onClick={() => setWizardOpen(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: COLORS.ink, color: "#fff", border: "none", borderRadius: 8, padding: "11px 12px", fontSize: 13, fontWeight: 600, fontFamily: "'IBM Plex Sans KR', sans-serif", cursor: "pointer", marginBottom: 18 }}><PenLine size={15} /> 매장 손익 입력</button>
          {nav.map((n) => { const Icon = n.icon; const active = tab === n.id;
            return (<div key={n.id} onClick={() => setTab(n.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "9px 10px", borderRadius: 7, cursor: "pointer", marginBottom: 2, background: active ? COLORS.accentSoft : "transparent", color: active ? COLORS.accent : COLORS.inkSoft }}><div style={{ display: "flex", alignItems: "center", gap: 9 }}><Icon size={16} /><span style={{ fontSize: 13, fontWeight: active ? 600 : 500 }}>{n.label}</span></div>{!!n.badge && <Badge tone="warn">{n.badge}</Badge>}</div>);
          })}
          <div style={{ marginTop: "auto", padding: "10px 8px", fontSize: 11, color: COLORS.inkSoft, display: "flex", gap: 6, alignItems: "flex-start" }}><ClipboardCheck size={13} style={{ marginTop: 1 }} /><span>매장 {stores.length}개 · 공유 저장소 연동</span></div>
        </div>
        <div style={{ flex: 1, padding: "28px 34px", maxWidth: 1180 }}>
          {tab === "dashboard" && <Dashboard financials={financials} stores={stores} onExport={handleExport} onOpenReport={(store, month, pl) => setReport({ store, month, pl })} />}
          {tab === "stores" && <StoresTab financials={financials} stores={stores} onExport={handleExport} onOpenReport={(store, month, pl) => setReport({ store, month, pl })} />}
          {tab === "manage" && <StoreManageTab stores={stores} onAdd={addStore} onEdit={editStore} onDelete={deleteStore} />}
          {tab === "approval" && <ApprovalTab financials={financials} stores={stores} onDecision={decide} />}
        </div>
      </div>
      {wizardOpen && <EntryWizard stores={stores} onClose={() => setWizardOpen(false)} onSubmit={handleSubmit} />}
      {report && <ReportOverlay store={report.store} month={report.month} pl={report.pl} onClose={() => setReport(null)} />}
      {toast && <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: COLORS.ink, color: "#fff", padding: "10px 18px", borderRadius: 8, fontSize: 13, fontFamily: "'IBM Plex Sans KR', sans-serif", zIndex: 200, maxWidth: 480, textAlign: "center" }}>{toast}</div>}
    </div>
  );
}
