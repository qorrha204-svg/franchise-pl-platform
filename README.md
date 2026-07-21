# 가족점손익원장

외식 프랜차이즈 매장별 손익계산서를 수기입력 → 본사 승인 → 대시보드/가맹점 리포트로 관리하는
웹앱입니다. `franchise-pl-platform-spec.md` 스펙과 `FranchisePLPlatform.jsx` 프로토타입을
Next.js + Supabase로 옮긴 정식 버전입니다.

배포: GitHub main 브랜치에 push하면 Vercel이 자동으로 재배포합니다.

- 프런트: Next.js 16 (App Router) + Tailwind, 원본 프로토타입과 동일한 디자인 토큰
- 백엔드: Supabase (Postgres + RLS). **인증은 아직 없습니다** — 이 앱 URL과 Supabase anon
  key를 아는 사람은 누구나 전체 데이터를 읽고 쓸 수 있습니다 (스펙 6번 항목, 의도된 설계).

## 1. Supabase 프로젝트 만들기

1. https://supabase.com 접속 후 로그인/가입 (본인이 직접 진행해야 합니다).
2. "New project" 생성 — 리전은 Seoul(ap-northeast-2) 권장, DB 비밀번호는 안전하게 보관.
3. 프로젝트 생성 후 좌측 메뉴 **SQL Editor** 로 이동.
4. 이 저장소의 [`supabase/schema.sql`](supabase/schema.sql) 내용을 그대로 붙여넣고 실행 (테이블 4개 + RLS 정책 생성).
5. 이어서 [`supabase/seed.sql`](supabase/seed.sql) 내용을 붙여넣고 실행 (브랜드 3개, 계정과목
   40개, 매장 254개가 들어갑니다). 이 파일은 `lib/constants.js`에서 자동 생성된 것이므로 직접
   수정하지 말고, 마스터 데이터를 바꿔야 하면 `lib/constants.js`를 고친 뒤
   `node scripts/generate-seed-sql.mjs`로 다시 생성하세요.
6. 좌측 메뉴 **Project Settings → API** 에서 **Project URL** 과 **anon public key** 를 복사합니다.

## 2. 로컬 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local`을 열어 방금 복사한 값을 채워 넣습니다.

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## 3. 실행

```bash
npm install   # 이미 실행되어 있다면 생략
npm run dev
```

http://localhost:3000 에서 확인합니다.

## 화면 구성

- `/` 대시보드 — 전체/매장별 KPI, 브랜드 비교, 월별 추이, 이익률 하위 매장
- `/stores` 매장별 손익계산서 — 브랜드/타입/월 필터, 매장 상세 손익
- `/manage` 매장 관리 — 매장 추가/수정/삭제
- `/approval` 승인관리 — 제출된 손익을 매장·월 단위로 승인/반려
- 좌측 상단 "매장 손익 입력" 버튼 — 7단계 입력 위저드 (제출 시 승인대기 상태로 저장)

## 배포 (Vercel)

Vercel에 이 저장소를 연결한 뒤 프로젝트 설정의 Environment Variables에
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 등록하면 됩니다.

## 다음 단계 (스펙 6번, 아직 구현 안 됨)

- 로그인 / 역할(대표이사·SV·매장담당자) 기반 권한 분리 — Supabase Auth + `profiles` 테이블 + RLS
- 이상치·승인대기 알림
- POS/카드사 자동연동
- 가맹점 리포트의 서버사이드 PDF 생성 (현재는 브라우저 인쇄/PDF 저장 방식)
