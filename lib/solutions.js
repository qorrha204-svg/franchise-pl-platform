import { getAccount } from "./constants";

// Actionable, account-specific suggestions shown when a store's ratio for
// that account runs meaningfully above the profitable-store benchmark.
const SOLUTION_MESSAGES = {
  "COGS-HQ": "본사식재 비중이 평균보다 높습니다. 발주량과 폐기율을 점검하고 재고관리를 개선해보세요.",
  "COGS-PURCH": "사입식재 비중이 평균보다 높습니다. 사입 품목을 본사 매입으로 전환하거나 거래처 단가를 재협상해보세요.",
  "FIX-HALL-REG": "홀 직원 인건비가 평균보다 높습니다. 피크타임 기준으로 근무 스케줄을 재조정해보세요.",
  "FIX-HALL-PT": "홀 파트타임 인건비가 평균보다 높습니다. 시간대별 필요 인원을 재산정해보세요.",
  "FIX-HALL-DAY": "홀 일용직 비용이 평균보다 높습니다. 일용직 투입 빈도와 사유를 점검해보세요.",
  "FIX-KITCHEN-REG": "주방 직원 인건비가 평균보다 높습니다. 조리 동선과 인력 배치를 재검토해보세요.",
  "FIX-KITCHEN-PT": "주방 파트타임 인건비가 평균보다 높습니다. 피크타임 외 인력을 조정해보세요.",
  "FIX-KITCHEN-DAY": "주방 일용직 비용이 평균보다 높습니다. 일용직 투입 빈도와 사유를 점검해보세요.",
  "FIX-INS-4DA": "4대보험 부담이 평균보다 높습니다. 근무 형태별 가입 현황을 재점검해보세요.",
  "FIX-INS-FIRE": "화재/영업배상 등 보험료가 평균보다 높습니다. 보장 항목을 재검토하고 여러 보험사 견적을 비교해보세요.",
  "FIX-RENT": "임차료 비중이 평균보다 높습니다. 재계약 시점에 임대료 조정을 협상하거나 관리비 항목을 재검토해보세요.",
  "FIX-MGMT": "관리비가 평균보다 높습니다. 공용 관리비 산정 내역을 확인하고 절감 가능한 항목이 있는지 문의해보세요.",
  "FIX-TAXFEE": "세무기장료가 평균보다 높습니다. 기장 대행 계약 조건을 재검토해보세요.",
  "VAR-DELIVERY": "배달대행비가 평균보다 높습니다. 배달 권역과 대행사 요율을 재점검해보세요.",
  "VAR-VEHICLE": "차량유지비가 평균보다 높습니다. 차량 정비 주기와 연료비를 점검해보세요.",
  "VAR-COMM-PHONE": "전화료가 평균보다 높습니다. 요금제를 재점검해보세요.",
  "VAR-COMM-NET": "인터넷 비용이 평균보다 높습니다. 요금제와 회선 수를 재점검해보세요.",
  "VAR-COMM-CABLE": "케이블방송 비용이 평균보다 높습니다. 불필요한 채널·회선을 정리해보세요.",
  "VAR-UTIL-ELEC": "전기료가 평균보다 높습니다. 영업 외 시간 전력 사용과 설비 노후 여부를 점검해보세요.",
  "VAR-UTIL-GAS": "가스요금이 평균보다 높습니다. 조리 설비 효율과 사용 패턴을 점검해보세요.",
  "VAR-UTIL-WATER": "수도요금이 평균보다 높습니다. 누수나 과다 사용 여부를 점검해보세요.",
  "VAR-AD": "광고/홍보비가 평균보다 높습니다. 채널별 광고 효율을 분석해 저성과 채널 예산을 줄여보세요.",
  "VAR-PACK": "포장용기 비용이 평균보다 높습니다. 포장재 단가와 배달 비중을 점검해보세요.",
  "VAR-SECURITY": "점포보안 비용이 평균보다 높습니다. 계약 조건을 재검토해보세요.",
  "VAR-WATERPUR": "정수기 렌탈비가 평균보다 높습니다. 렌탈 조건이나 대수를 재검토해보세요.",
  "VAR-WELFARE": "복리후생비가 평균보다 높습니다. 지급 항목과 기준을 재점검해보세요.",
  "VAR-SUPPLY": "소모품비가 평균보다 높습니다. 구매처와 구매 주기를 재점검해보세요.",
  "VAR-MISC": "기타/잡비가 평균보다 높습니다. 세부 항목을 확인해 불필요한 지출이 있는지 점검해보세요.",
  "VAR-APP-BAEMIN": "배달의민족 수수료가 평균보다 높습니다. 매출 채널 비중과 프로모션 참여 여부를 조정해보세요.",
  "VAR-APP-COUPANG": "쿠팡이츠 수수료가 평균보다 높습니다. 매출 채널 비중과 프로모션 참여 여부를 조정해보세요.",
  "VAR-APP-ETC": "기타 배달앱 수수료가 평균보다 높습니다. 매출 채널 비중을 재점검해보세요.",
  "VAR-CARDFEE": "카드 수수료가 평균보다 높습니다. 결제대행사 수수료율을 재협상해보세요.",
  "VAR-TAX": "국세/지방세 비중이 평균보다 높습니다. 세무 신고 내역과 감면 항목을 점검해보세요.",
  "VAR-DEPR": "감가상각비가 평균보다 높습니다. 설비 투자 계획과 내용연수를 재점검해보세요.",
  "VAR-ADSHARE": "광고비분담금이 평균보다 높습니다. 본사와 분담 비율을 재확인해보세요.",
  "VAR-ROYALTY": "로열티가 평균보다 높습니다. 매출 대비 로열티 산정 기준을 본사와 확인해보세요.",
};

// A store's ratio must exceed the benchmark by this factor (and be more
// than a trivial share of revenue) before it's worth flagging — avoids
// surfacing noise from tiny accounts or minor month-to-month variance.
const RATIO_THRESHOLD = 1.15;
const MIN_RATIO = 0.003;

export function shouldShowSolutions(pl) {
  if (!pl || pl.revenue <= 0) return false;
  return pl.profit < 5000000 || pl.margin < 0.1;
}

export function getFlaggedAccounts(pl, avgRatios, sampleCount) {
  if (!pl || pl.revenue <= 0 || sampleCount === 0) return [];
  const flagged = [];
  Object.keys(pl.byCode).forEach((code) => {
    const amount = pl.byCode[code] || 0;
    const storeRatio = amount / pl.revenue;
    const avgRatio = avgRatios[code] || 0;
    if (storeRatio < MIN_RATIO) return;
    if (avgRatio <= 0 || storeRatio <= avgRatio * RATIO_THRESHOLD) return;
    const account = getAccount(code);
    flagged.push({
      code,
      name: account?.name || code,
      group: account?.group,
      storeRatio,
      avgRatio,
      amount,
      message: SOLUTION_MESSAGES[code] || `${account?.name || code} 비중이 평균보다 높습니다. 세부 내역을 점검해보세요.`,
    });
  });
  return flagged.sort((a, b) => (b.storeRatio - b.avgRatio) - (a.storeRatio - a.avgRatio));
}
