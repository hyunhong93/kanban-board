# TASKS — 작업 목록

## 완료된 작업 (v1.0.0)

### 기반 구조
- [x] `index.html` — 보드 레이아웃 마크업 작성
- [x] `style.css` — CSS 변수 및 기본 스타일 정의
- [x] `app.js` — 모듈 뼈대 및 `'use strict'` 적용

### 데이터 & 렌더링
- [x] `uid()` — 고유 ID 생성 함수 구현
- [x] `loadCards()` / `saveCards()` — localStorage 읽기/쓰기
- [x] `getDefaultCards()` — 최초 실행 시 샘플 카드 4개 제공
- [x] `render()` — 상태→DOM 전체 재렌더
- [x] `buildCard()` — 카드 DOM 요소 생성 + 이벤트 연결
- [x] 컬럼별 카드 수 뱃지 갱신

### 카드 CRUD
- [x] `addCard()` — 텍스트 입력 + 컬럼 선택 후 카드 추가
- [x] Enter 키로 카드 추가
- [x] 공백 입력 시 추가 거부
- [x] `deleteCard()` — 호버 시 X 버튼으로 카드 삭제
- [x] 빈 컬럼 안내 텍스트 표시

### 드래그 앤 드롭
- [x] `handleDragStart` — dragId 저장, `.dragging` 클래스 (setTimeout 0ms 지연)
- [x] `handleDragEnd` — 드래그 종료 시 클래스 정리
- [x] `handleCardDragOver` — 마우스 Y 위치로 drop-above/below 인디케이터
- [x] `handleCardDrop` — 카드 간 정밀 삽입 + order 재정규화
- [x] `setupColumnDropZones()` — 빈 컬럼 드롭 + drag-over glow
- [x] `dragleave` 오발사 방지 (`contains` 체크)
- [x] `clearDropStyles()` — 드래그 관련 클래스 일괄 제거

### 스타일
- [x] Material Design 다크 테마 CSS 변수
- [x] 컬럼별 헤더 색상 (파랑/앰버/초록)
- [x] 카드 hover, dragging, drop-above/below 상태
- [x] 삭제 버튼 hover 시만 노출
- [x] 커스텀 스크롤바 (4px, 다크)
- [x] 700px 이하 반응형 레이아웃

### 문서화
- [x] `PLAN.md` — 프로젝트 계획서
- [x] `PRD.md` — 제품 요구사항 정의서
- [x] `TRD.md` — 기술 요구사항 정의서
- [x] `USER_FLOW.md` — 사용자 흐름도 (Mermaid)
- [x] `DATABASE_DESIGN.md` — 데이터베이스 설계 (Mermaid ERD)
- [x] `DESIGN_SYSTEM.md` — 기초 디자인 시스템
- [x] `TASKS.md` — 이 파일
- [x] `CONVENTION.md` — 컨벤션 & 협업 가이드
- [x] `CLAUDE.md` — Claude Code 가이드 (실행 방법, 아키텍처, ID 패턴, 문서 링크)

---

## 완료된 작업 (v2.0.0 — 인증 + 배포)

### Supabase 인증
- [x] `auth.js` — Supabase 클라이언트 초기화 및 세션 관리
- [x] Google OAuth 로그인 (`signInWithGoogle`)
- [x] GitHub OAuth 로그인 (`signInWithGithub`)
- [x] 이메일/비밀번호 로그인 및 회원가입 (`handleEmailSubmit`, `toggleMode`)
- [x] 로그인 오버레이 UI (소셜 버튼 + 이메일 폼 + 모드 전환)
- [x] 헤더 사용자 정보 표시 (아바타/이름) + 로그아웃 버튼
- [x] 페이지 새로고침 후 세션 유지 (`getSession`)
- [x] localStorage 키 사용자별 스코핑 (`kanban-cards-{userId}`)
- [x] `appInitialized` 플래그로 이벤트 리스너 중복 등록 방지
- [x] `window.getAuthUser()` 인터페이스로 auth.js → app.js 연결

### 배포
- [x] GitHub 레포지토리 생성 (`hyunhong93/kanban-board`)
- [x] GitHub Pages 배포 (`https://hyunhong93.github.io/kanban-board`)
- [x] 배포 URL 커밋 로그에 기록

### 스타일
- [x] 인증 오버레이 스타일 (`.auth-overlay`, `.auth-card`, `.social-btn` 등)
- [x] 헤더 우측 사용자 정보 영역 (`.app-bar-right`, `.user-info`, `.logout-btn`)
- [x] 모바일 반응형 auth 카드 패딩 조정

### 문서
- [x] `TRD.md` — Supabase Auth 아키텍처, 스키마, 배포 섹션 추가
- [x] `PRD.md` — v2.0.0, 인증 기능 요구사항(FR-05) 추가, 배포 URL 기록
- [x] `PLAN.md` — v2.0 구현 계획 추가
- [x] `TASKS.md` — 이 파일 업데이트

---

---

## 완료된 작업 (v3.0.0 — 보드 공유·실시간·카드 상세)

### 다중 보드 관리 (`board.js`)
- [x] `getOrCreateDefaultBoard()` — 첫 로그인 시 기본 보드 생성 또는 기존 보드 반환
- [x] `getUserBoards()` — 내가 소유하거나 멤버로 초대된 보드 목록 조회
- [x] `getBoardMembers()` — 보드 멤버 목록 조회 (owner 포함)
- [x] `inviteMember()` — 이메일로 멤버 초대 (`get_user_id_by_email` RPC 활용)
- [x] `removeMember()` — 멤버 강제 제거

### Supabase DB 저장 (`db.js`)
- [x] `loadCardsFromDB()` / `addCardToDB()` / `updateCardInDB()` / `deleteCardFromDB()` — Supabase `cards` 테이블 CRUD
- [x] `batchUpdateOrder()` — 드래그 후 순서 일괄 업데이트
- [x] `logActivity()` — 카드 생성·이동·삭제 활동 로그 기록
- [x] `loadActivityLogs()` — 최근 50건 활동 로그 조회
- [x] `subscribeToBoard()` / `unsubscribeFromBoard()` — Supabase Realtime 구독

### 보드 공유 패널 (`app.js`)
- [x] 공유 버튼 → 공유 패널 슬라이드인
- [x] 이메일 입력 → `inviteMember()` 호출 → 결과 메시지 표시
- [x] 멤버 목록 렌더 (`renderBoardMembers`)

### 활동 로그 패널
- [x] 활동 버튼 → 활동 패널 슬라이드인
- [x] 최근 50건 로그 목록 표시 (시간, 사용자, 내용)
- [x] Realtime 신규 활동 자동 갱신

### 카드 상세 모달
- [x] 카드 클릭 → 상세 모달 열기 (`openCardModal`)
- [x] 제목, 설명, 마감일, 우선순위, 태그 편집 후 저장 (`saveCardModal`)
- [x] 모달에서 카드 삭제 (`deleteCardFromModal`)
- [x] 오버레이 클릭 / X 버튼으로 닫기

### 카드 속성 확장
- [x] 우선순위 배지 (`low` / `medium` / `high`) — 카드에 색상 뱃지 노출
- [x] 마감일 — 날짜 표시 + 기한 초과 시 빨간색 하이라이트
- [x] 태그 — 최대 3개 태그 칩 표시

### 실시간 협업
- [x] `subscribeToBoard()` — `cards`, `activity_logs` 테이블 실시간 변경 감지
- [x] `handleRealtimeCard()` — INSERT/UPDATE/DELETE를 로컬 `cards[]`에 반영
- [x] `handleRealtimeActivity()` — 새 활동 로그 자동 prepend

### Supabase 마이그레이션
- [x] `boards` 테이블 + RLS 정책 (v3 migration)
- [x] `board_members` 테이블 + RLS 정책
- [x] `activity_logs` 테이블 + RLS 정책
- [x] `cards` 테이블 `board_id` 외래키 추가

### 문서
- [x] `TASKS.md` — v3.0.0 작업 목록 추가

---

## 백로그

### 기능 개선
- [ ] 카드 검색 / 필터
- [ ] 컬럼 이름 커스터마이징
- [ ] 컬럼 추가 / 삭제

### UX 개선
- [ ] 터치 디바이스 드래그 지원 (Touch Events API)
- [ ] 실행 취소 (Ctrl+Z) 기능
- [ ] 비밀번호 재설정 이메일 (`resetPasswordForEmail`)

### 접근성
- [ ] 키보드만으로 카드 이동 (화살표 키 + 스페이스)
- [ ] ARIA live region으로 상태 변경 알림

---

## 알려진 이슈

| 번호 | 내용 | 심각도 | 상태 |
|---|---|---|---|
| #001 | 모바일 터치로 드래그 앤 드롭 불가 (HTML5 DnD API 터치 미지원) | Medium | 미해결 |
| #002 | 카드 수가 매우 많을 때 전체 재렌더 성능 저하 가능 | Low | 백로그 |
| #003 | 브라우저 다른 탭/창에서 수정 시 현재 탭 상태 미동기화 | Low | 백로그 |
