# 가맹손익원장 — Claude Code 인수인계 스펙

이 문서는 `FranchisePLPlatform.jsx` 프로토타입(claude.ai 아티팩트)의 기능과 데이터모델을
그대로 정식 웹앱으로 옮기기 위한 스펙입니다. Claude Code에서 이 문서 + jsx 파일을 같이
참고해서 진행하면 됩니다.

## 1. 무엇을 만드는가
외식 프랜차이즈 본사가 매장별 손익계산서를 수기입력 → 본사 승인 → 대시보드/가맹점 리포트로
관리하는 웹앱. 현재 자동 데이터 연동(POS 등)은 없음. 전 항목 수기입력 기준.

## 2. 추천 기술 스택
- 프런트: Next.js (React) + Tailwind
- 백엔드/DB: Supabase (Postgres + Auth + Row Level Security) — 별도 서버 없이 권한 관리까지 가능해서 이 프로젝트에 적합
- 인증: Supabase Auth (이메일/비밀번호 또는 사내 SSO)
- 배포: Vercel

## 3. 데이터 모델 (프로토타입 기준, 그대로 테이블화하면 됨)

### brands
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | text (PK) | WONSSAM / PARKGA / GAMTAN |
| name | text | 원쌈 / 박가부대 / 감탄계 |

### stores
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid (PK) | |
| code | text (unique) | 가맹점코드 |
| name | text | 매장명 |
| brand_id | text (FK brands) | |
| complex_type | text | 단독점 / 복합점 |
| store_type | text | 가마솥 / 배달점 / 일반 |
| created_at, updated_at | timestamp | |

### accounts (계정과목 마스터, 코드는 고정 seed 데이터)
| 컬럼 | 타입 | 비고 |
|---|---|---|
| code | text (PK) | 예: FIX-HALL-REG |
| name | text | |
| type | text | revenue / cost |
| category | text | 매출 / 매출원가 / 고정비 / 변동비 |
| group_label | text | 홀 인건비, 통신비 등 중분류 |

총 41개 계정과목 (jsx 파일의 `ACCOUNTS` 배열 그대로 seed). 매출 4개(홀매출, 배달의민족,
쿠팡이츠, 기타배달) + 매출원가 2개 + 고정비 11개 + 변동비 24개.

### financial_entries (손익 원장, 핵심 테이블)
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid (PK) | |
| store_id | uuid (FK stores) | |
| month | text | 'YYYY-MM' |
| account_code | text (FK accounts) | |
| amount | numeric | |
| qty | integer null | 배달 매출 3종(REV-BAEMIN/COUPANG/ETC)에만 사용, 건수 |
| status | text | pending / confirmed |
| source | text | manual (현재 항상 manual) |
| writer | text | 작성자명 |
| approved_by | text null | 승인자명 |
| approved_at | timestamp null | |
| created_at | timestamp | |

**unique 제약**: (store_id, month, account_code) — 같은 매장·월·계정과목은 1건만 존재해야 함
(재제출 시 upsert).

## 4. 핵심 화면 / 기능 (프로토타입에서 이미 동작 확인됨)

1. **대시보드**: 전체/매장 선택 토글. KPI(매출/영업이익/이익률/승인대기), 브랜드별 비교,
   월별 추이, 이익률 하위 매장 경고. 단일 매장 선택 시 비용구조·추이·상세손익.
2. **매장별 손익계산서**: 브랜드/타입 필터, 매장 클릭 시 계정 그룹별(대분류→중분류) 상세
   내역 + 매출 상세(건수 포함).
3. **매장 손익 입력 (7단계 스텝 위저드)**: 기본정보(작성자/매장/정산월) → 매출(홀+배달,
   배달은 건수+매출 동시입력, 배달합계·총매출 자동계산) → 매출원가 → 고정비 → 변동비(2단계)
   → 확인/제출. 제출 시 상태 `pending`으로 저장.
4. **승인관리**: `pending` 상태 배치를 매장·월 단위로 묶어서 표시. 승인자 이름을 입력해야
   승인 버튼 활성화. 승인 시 해당 매장·월의 모든 항목이 `confirmed`로 전환.
5. **매장 관리**: 매장 목록 CRUD(추가/수정/삭제). 삭제 시 연관 financial_entries도 정리.
6. **가맹점 리포트**: 매장+월 선택 후 1장짜리 브랜딩 리포트를 인쇄/PDF저장(`window.print()`).
   실제 웹앱에서는 서버사이드 PDF 생성(react-pdf 또는 puppeteer)으로 바꾸는 걸 추천 — 브라우저
   인쇄 의존은 안정성이 떨어짐.
7. **Raw 데이터 다운로드**: 전체/매장별 CSV export (계정과목, 금액, 건수, 작성자, 승인자 포함).

## 5. 프로토타입에서 "가짜"였던 부분 (실제 구현 필요)

- **파일 다운로드 / 인쇄**: 아티팩트 iframe 샌드박스 때문에 브라우저 다운로드·인쇄가 불안정했음.
  정식 웹앱(Vercel 등에 배포된 독립 페이지)에서는 이 문제가 사라짐 — 일반적인
  `<a download>` / 서버사이드 CSV·PDF 생성으로 정상 구현 가능.
- **공유 저장소**: 아티팩트의 `window.storage`(공유 key-value)로 임시 흉내만 냈음. 실제로는
  위 Postgres 테이블로 대체.
- **실시간 동기화**: 지금은 새로고침해야 남의 변경이 보임. 필요하면 Supabase Realtime
  구독으로 실시간 반영 가능 (선택 사항, 초기 버전에서는 생략해도 무방).

## 6. 이번에 미룬 것 (다음 단계로 명시적으로 남겨둠)

- **로그인 / 역할(Role) 기반 화면 분리**: 대표이사 / SV / 매장담당자별로 다른 뷰·권한.
  Supabase Auth + `profiles` 테이블(user_id, role, 담당 매장/브랜드 범위) + RLS 정책으로 구현.
  예: SV는 자기 담당 매장만 조회/입력 가능, 대표이사는 전체 조회만 가능(입력 불가) 등 —
  이 규칙은 아직 미정이므로 Claude Code 진행 시 먼저 확정 필요.
- 알림(이상치 자동 경고, 승인 대기 알림 등)
- POS/카드사 자동연동

## 7. Claude Code에 요청할 때 추천 문구

> "이 스펙 문서와 jsx 파일을 참고해서 Next.js + Supabase로 정식 웹앱을 만들어줘.
> 먼저 DB 스키마(4번 섹션)부터 Supabase에 만들고, 그 다음 jsx의 화면들을 Next.js 페이지로
> 옮겨줘. 로그인/권한은 아직 필요 없고, 지금은 링크 아는 사람은 누구나 전체 데이터에
> 접근 가능한 상태로 먼저 완성해줘."

