# Callor Word Master — 1단계 패키지 v0.1.6

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
- Enter 입력 후 다음 단계에서도 타이핑 입력창 포커스 유지
- 단계에 따라 `lang="en"`·`lang="ko"`와 ENG·한글 입력 안내 자동 전환
- 콤보, 생명, 클리어, 놓친 단어, 정확도 표시
- PC·태블릿·스마트폰 반응형 레이아웃
- 라이트·다크 테마와 `localStorage` 저장
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
