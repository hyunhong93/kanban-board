# PLAN.md — Kanban Board

## 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 프로젝트명 | Kanban Board |
| 위치 | `src/exercise/hyunhong93/day03/kanban/` |
| 작성일 | 2026-05-20 |
| 작성자 | hyunhong93 |
| 과정 | KOSA 바이브 코딩 — Day 03 실습 |

## 배경 및 목적

Day 03 실습 과제로 작업 관리용 칸반보드를 순수 HTML/CSS/JS로 구현한다.
별도 프레임워크나 백엔드 없이 브라우저만으로 동작해야 하며, 카드의 드래그 앤 드롭 이동이 핵심 기능이다.

동일 사용자(hyunhong93)의 day03/todo 앱과 동일한 Material Design 다크 테마를 적용해 시각적 일관성을 유지한다.

## 구현 범위

### In-Scope
- 3개 컬럼 (To-do / In-Progress / Done)
- 카드 CRUD (추가, 삭제)
- 컬럼 간 / 컬럼 내 드래그 앤 드롭 이동
- 컬럼별 카드 수 뱃지
- localStorage 상태 지속성 (새로고침 유지)
- 반응형 레이아웃 (700px 이하: 1열)

### Out-of-Scope
- 사용자 인증
- 백엔드/DB
- 카드 상세 편집 (설명, 날짜, 담당자)
- 실시간 협업

## 파일 구조

```
kanban/
├── index.html        # 보드 레이아웃 마크업
├── style.css         # 스타일 (CSS 변수, 컴포넌트)
├── app.js            # 상태 관리 + 드래그 앤 드롭 로직
├── PLAN.md           # 이 파일
├── PRD.md            # 제품 요구사항 정의서
├── TRD.md            # 기술 요구사항 정의서
├── USER_FLOW.md      # 사용자 흐름도 (Mermaid)
├── DATABASE_DESIGN.md # 데이터 설계 (Mermaid ERD)
├── DESIGN_SYSTEM.md  # 디자인 시스템
├── TASKS.md          # 작업 목록
└── CONVENTION.md     # 컨벤션 & 협업 가이드
```

## 기술 선택 근거

| 결정 | 이유 |
|---|---|
| 순수 HTML/CSS/JS | 외부 의존성 없이 파일만으로 실행 가능 (과정 요구사항) |
| HTML5 Drag and Drop API | 네이티브 API, 추가 라이브러리 불필요 |
| localStorage | 백엔드 없이 상태 지속, 구현 단순 |
| 전체 재렌더(full re-render) | 상태→DOM 단방향, 버그 추적 용이 |
| Material Design 다크 테마 | day03/todo 앱과 일관성, CSS 변수 재사용 |

## 구현 순서

1. `index.html` — 보드 골격 마크업
2. `style.css` — CSS 변수, 레이아웃, 컴포넌트 스타일
3. `app.js` — 데이터 모델 + render() + CRUD
4. 드래그 앤 드롭 핸들러 연결
5. 로컬 서버(`python3 -m http.server 8765`) 기동 후 동작 검증

## 검증 기준

- [x] 세 컬럼과 샘플 카드가 렌더된다
- [x] 카드를 입력하고 추가하면 선택한 컬럼에 나타난다
- [x] X 버튼으로 카드를 삭제할 수 있다
- [x] 카드를 드래그해 다른 컬럼으로 이동할 수 있다
- [x] 컬럼 내에서 순서를 바꿀 수 있다
- [x] 새로고침 후에도 상태가 유지된다
- [x] 700px 이하에서 컬럼이 수직으로 쌓인다
