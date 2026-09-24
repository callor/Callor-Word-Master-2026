# Callor Word Master v1

## 새 개발 기준

- 시작일: 2026-09-24
- 원본: `../Callor-Word-Master-v0.1.8-Phase1-Final`
- 패키지 버전: `1.0.0`. 기존 게임의 복제 시작점이며 2단계 기능 완료를 의미하지 않습니다.
- 기획 및 변경 이력: `../READMEme`의 1차 기획부터 v0.1.8 후속 수정까지 참조합니다.
- 원본을 보존하고 이 폴더에서 후속 개발을 진행합니다.
- 소스와 설정을 복제했습니다. `.next`, 의존성, 생성된 Prisma Client, 타입 검사 캐시는 제외했습니다.
- 기존 `.env`도 복사되어 같은 DB 연결 설정을 사용합니다. DB 작업은 실행하지 않았습니다.

## 실행 준비

```powershell
npm ci
npm run db:generate
npm run dev
```

개발 접속 주소는 http://localhost:3000 입니다. 게임 자체는 DB 없이 동작합니다.
`db:generate`는 클라이언트 코드를 생성하며 DB 마이그레이션이나 Seed를 실행하지 않습니다.
배포용 실행은 `npm run build` 후 `npm start`이며 12320번 포트를 사용합니다.

## 이어서 처리할 사항

- 재시작 시 `setLives(3)`과 `MAX_LIVES = 5`의 불일치 수정
- 게임 종료 콤보 표시와 창 포커스 이탈 시 자동 정지 보완
- 패키지 설치 후 린트, 타입, 빌드 및 브라우저 동작 검증
- 이후 Auth.js, Google/GitHub 로그인, 최초 관리자, 단어 관리, 서버 기록 및 포인트 저장 연결

위 사항은 복제 시 수정하지 않았습니다. 아래는 원본 README 기록입니다.

# Callor Word Master — 1단계 최종 패키지 v0.1.8

영문 타자, 한글 타자, 영단어 암기를 결합한 반응형 낙하형 타자 게임입니다.

## 1단계 포함 기능

- 영단어 6개 동시 낙하 및 제한선 판정
- 내려오는 단어 중 원하는 단어를 영문 입력으로 선택
- 영문 철자 입력 후 복수 뜻 중 한글 뜻 하나 무작위 표시
- 표시된 한글 뜻 타이핑 완료 시 불꽃 효과와 10점 지급
- 영문·한글 기본 12pt, 10·12·15·18pt 선택 및 기기 저장
- 낙하 속도 향상과 최근 출제 단어 30개 반복 억제
- PC 중앙 게임 영역 확대
- 왼쪽 영역을 Callor Word Master 브랜드 패널로 구성
- PC에서 좌우 여백을 거의 제거하고 게임창을 전체 폭·높이로 확장
- PC 전체 화면 모드에서는 보조 패널을 숨기고 글자 크기 선택을 점수 영역으로 이동
- 단어의 X 위치, 시작 높이, 낙하 속도와 재등장 간격을 매번 무작위 적용
- PC 전체 화면 위에 좌우 브랜드·상태 박스를 반투명 오버레이로 복원
- 하단 고정 Copyright 및 이메일 문구 추가
- 정답 단어에 팽창·섬광·충격파·16개 파티클 폭발 효과 적용
- 단어별 낙하 속도를 느림·보통·빠름 구간에서 무작위 선택
- 상단 중복 FONT 설정을 제거하고 오른쪽 글자 크기 설정으로 통합
- 글자 크기 선택값을 10·12·15·20·25pt로 변경
- PC 화면을 좌측 브랜드·중앙 게임·우측 상태의 독립적인 3열 구조로 변경
- 좌우 패널과 낙하 영역이 겹치지 않아 단어 가림 현상 제거
- 화면 폭에 따라 좌우 열은 제한적으로 조정하고 중앙 게임 영역에 남은 폭을 모두 배정
- Enter 입력 후 다음 단계에서도 타이핑 입력창 포커스 유지
- 단계에 따라 `lang="en"`·`lang="ko"`와 ENG·한글 입력 안내 자동 전환
- 콤보, 생명, 클리어, 놓친 단어, 정확도 표시
- PC·태블릿·스마트폰 반응형 레이아웃
- 라이트·다크 테마와 `localStorage` 저장
- 생명 소진 시 최종 점수·클리어 수를 보여주는 게임 오버와 즉시 재시작
- 탭 또는 창을 벗어나면 자동 일시정지
- 소리·폭발 효과 선택과 브라우저 전체화면, 모든 설정의 기기 저장
- 최초 실행 게임 방법 안내와 도움말 다시 보기
- 모바일 정답 완료 진동 피드백(지원 기기)
- 회화 기본 단어 200개
- PostgreSQL·Prisma 7 스키마와 Seed
- Auth.js용 User, Account, Session 모델 기반

Google·GitHub 로그인, 최초 가입자 관리자 권한, 관리자 단어 CRUD와 서버 포인트 저장은 2단계에서 연결합니다. Kakao·Naver 공급자를 추가할 수 있도록 Account 모델은 공급자 중립 구조입니다.

> 웹 브라우저는 운영체제의 한/영 IME를 강제로 변경할 권한이 없습니다. 게임은 단계별 언어 속성과 상태 배지를 자동 전환하며, 실제 한/영 키보드 전환은 운영체제에서 수행합니다.

## 실행

Node.js 20.9 이상이 필요합니다.

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

## PostgreSQL 및 초기 단어 등록

```bash
cp .env.example .env
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
```

`DATABASE_URL`은 실제 PostgreSQL 접속 정보로 변경하십시오. 게임 프로토타입은 데이터베이스 없이도 바로 실행됩니다.

## 주요 경로

```text
src/components/game/word-game.tsx     핵심 게임 로직
src/data/conversation-words.ts        기본 회화 단어 200개
prisma/schema.prisma                  PostgreSQL 데이터 모델
prisma/seed.ts                        중복 방지 초기 데이터 등록
src/app/globals.css                   반응형 UI와 테마
```

## 2026-09-24 설치 및 실행 검증

- TypeScript 7 유지가 사용자 지정 개발 방침입니다. 경고 해소를 이유로 6으로 대체하지 않습니다.
- `@typescript/native`는 TypeScript 7.0.2의 npm 별칭입니다. npm의 tsc 연결 충돌을 피하기 위해 typecheck는 해당 패키지의 실행 파일을 직접 호출합니다. 일반 npx tsc 대신 npm run typecheck를 사용합니다.
- `typescript`는 `@typescript/typescript6` 6.0.2의 호환 별칭입니다. ESLint 등 기존 API를 필요로 하는 도구와 Next.js 내부 검사에 사용됩니다. 기본 컴파일러를 6으로 낮춘 구성이 아닙니다.
- `npm run typecheck`는 TypeScript 7을 사용합니다. `npm run build`는 이 검사를 통과한 뒤 Next.js 빌드를 실행합니다.
- 참고: https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6-0
- ESLint는 기존 플러그인 호환 범위에 맞춘 9.39.5, Next.js와 eslint-config-next는 보안 수정 버전 16.3.6을 사용합니다.
- 설치, Prisma Client 생성, Prisma 스키마 검사, ESLint, TypeScript 7 타입 검사, production build 통과.
- 로컬 production 서버 12320 포트에서 페이지 HTTP 200 및 JS/CSS 8개 HTTP 200 확인.
- 브라우저 자동화 도구 환경 오류로 실제 화면 조작과 한글 입력은 미검증입니다.
- npm audit에는 high 6건이 남아 있습니다. 자동 강제 변경이나 Prisma 메이저 버전 변경은 하지 않았습니다.
- DB 마이그레이션과 Seed는 실행하지 않았습니다. 게임 로직의 기존 후속 과제도 그대로 남아 있습니다.

## 2026-09-24 시작 화면 개선

- 요청: ../UPDATE/2026-09-24-시작화면.md
- 초록색 아케이드 로비, 단어 카드 연출, 게임 시작 버튼, 3단계 게임 안내 및 반응형 스타일 추가.
- 시작 버튼을 누른 후에만 WordGame이 마운트되어 로비 대기 중 생명 차감이나 낙하가 발생하지 않습니다.
- 게임 상단 시작 화면 버튼으로 로비에 돌아갈 수 있습니다. 돌아가면 현재 플레이는 종료되며, 다시 시작할 때 새 게임으로 진입합니다.
- 재시작 생명을 MAX_LIVES로 통일했습니다.
- ESLint, TypeScript 7 검사, 배포용 빌드 통과. HTTP 200 및 초기 HTML에 로비가 있고 게임 입력창/낙하 영역이 없는 것을 확인했습니다.
- 브라우저 자동화 환경 오류로 실제 클릭, 시각적 레이아웃 및 모바일 조작 검증은 미완료입니다.
