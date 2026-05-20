# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

순수 HTML/CSS/JS 칸반보드. 백엔드 없음. To-do / In-Progress / Done 3컬럼 간 카드 드래그 앤 드롭 이동 지원. 상태는 `localStorage`에만 저장.

설계 문서: [PLAN.md](PLAN.md) | [PRD.md](PRD.md) | [TRD.md](TRD.md)

---

## 실행 방법

```bash
# 이 디렉터리에서 실행
python3 -m http.server 8765
# 브라우저: http://localhost:8765/index.html
# WSL: Windows 브라우저에서 동일 URL 접속
```

별도 빌드 없음. 테스트 프레임워크 없음. 린터 없음.

---

## 파일 구조

```
index.html   — 정적 보드 레이아웃 (동적 카드 DOM은 render()가 주입)
style.css    — CSS 변수, 컴포넌트 스타일, 드래그 상태 클래스
app.js       — 상태 관리 + 렌더링 + 드래그 앤 드롭 로직
```

---

## 아키텍처

### 단방향 데이터 흐름

```
사용자 액션 → 이벤트 핸들러 → cards[] 변경 → render() → saveCards()
```

`cards[]`가 유일한 진실의 원천(single source of truth). DOM을 직접 조작하지 않는다. 상태 변경 후 반드시 `render()` → `saveCards()` 순서를 지킨다.

### 상태 구조

```js
cards = [{ id: string, text: string, column: 'todo'|'inprogress'|'done', order: number }]
```

`localStorage['kanban-cards']`에 JSON 직렬화. 자세한 스키마 → [DATABASE_DESIGN.md](DATABASE_DESIGN.md)

### 드래그 앤 드롭 구조

두 레벨의 drop target:
- **카드 위** (`handleCardDragOver` / `handleCardDrop`): 마우스 Y가 카드 중앙 기준으로 위/아래 판별 → `drop-above` / `drop-below` 클래스. `e.stopPropagation()`으로 컬럼 이벤트 버블링 차단.
- **컬럼 card-list** (`setupColumnDropZones`): 빈 컬럼 또는 카드 없는 영역에 드롭. `dragleave`는 `colEl.contains(e.relatedTarget)` 체크로 오발사 방지.

`dragstart`에서 `.dragging` 클래스 추가를 `setTimeout(..., 0)`으로 지연 — 브라우저가 ghost 이미지를 캡처한 뒤 opacity를 바꿔야 ghost가 정상 표시됨.

드롭 후 해당 컬럼의 `order`를 `0, 1, 2...`로 재정규화.

---

## CSS 핵심 패턴

- 모든 색상은 `:root` CSS 변수로 선언. 하드코딩 금지.
- 컬럼별 테마는 `[data-column="todo"]` 속성 선택자로 적용.
- 드래그 상태 클래스: `.dragging` `.drag-over` `.drop-above` `.drop-below`
- 디자인 토큰 전체 → [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)

---

## ID 패턴

HTML 요소 ID 규칙 (`app.js`가 이 패턴으로 쿼리함):

| 패턴 | 예시 | 역할 |
|---|---|---|
| `col-{name}` | `col-todo` | 컬럼 컨테이너 (drag-over 클래스 대상) |
| `list-{name}` | `list-todo` | 카드 목록 + 드롭 존 |
| `count-{name}` | `count-todo` | 카운트 뱃지 |

---

## 기타 참고 문서

- 사용자 시나리오 흐름 → [USER_FLOW.md](USER_FLOW.md)
- 작업 목록 및 알려진 이슈 → [TASKS.md](TASKS.md)
- 코딩 / Git / 리뷰 컨벤션 → [CONVENTION.md](CONVENTION.md)
