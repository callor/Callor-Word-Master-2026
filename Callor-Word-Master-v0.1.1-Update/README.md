# Callor Word Master — 1단계 패키지 v0.1.1

영문 타자, 한글 타자, 영단어 암기를 결합한 반응형 낙하형 타자 게임입니다.

## 1단계 포함 기능

- 영단어 3개 동시 낙하 및 제한선 판정
- 내려오는 단어 중 원하는 단어를 영문 입력으로 선택
- 영문 철자 입력 후 복수 뜻 중 한글 뜻 하나 무작위 표시
- 표시된 한글 뜻 타이핑 완료 시 불꽃 효과와 10점 지급
- 영단어 15pt, 한글 뜻 12pt 표시
- 콤보, 생명, 클리어, 놓친 단어, 정확도 표시
- PC·태블릿·스마트폰 반응형 레이아웃
- 라이트·다크 테마와 `localStorage` 저장
- 회화 기본 단어 200개
- PostgreSQL·Prisma 7 스키마와 Seed
- Auth.js용 User, Account, Session 모델 기반

Google·GitHub 로그인, 최초 가입자 관리자 권한, 관리자 단어 CRUD와 서버 포인트 저장은 2단계에서 연결합니다. Kakao·Naver 공급자를 추가할 수 있도록 Account 모델은 공급자 중립 구조입니다.

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
