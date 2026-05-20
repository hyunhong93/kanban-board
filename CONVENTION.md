# CONVENTION & COLLABORATION GUIDE — 컨벤션 & 협업 가이드

## 1. 프로젝트 구조 원칙

- **파일 3개 분리 원칙**: 마크업(HTML), 스타일(CSS), 로직(JS)은 항상 별개 파일로 유지한다.
- **인라인 스타일 금지**: HTML 요소에 `style=""` 속성을 직접 쓰지 않는다.
- **인라인 스크립트 금지**: HTML 내 `<script>` 태그에 로직을 쓰지 않는다.
- **단일 책임**: 각 함수는 하나의 일만 한다.

---

## 2. HTML 컨벤션

### 2.1 기본 규칙

```html
<!-- 들여쓰기: 스페이스 2칸 -->
<div class="column" id="col-todo" data-column="todo">
  <div class="column-header">
    ...
  </div>
</div>

<!-- 속성 순서: class → id → data-* → aria-* → 기타 -->
<div class="card" id="card-123" data-id="abc" aria-label="카드">
```

### 2.2 ID / Class 명명

| 패턴 | 예시 | 용도 |
|---|---|---|
| `col-{name}` | `col-todo` | 컬럼 컨테이너 |
| `list-{name}` | `list-todo` | 카드 목록 (드롭 대상) |
| `count-{name}` | `count-todo` | 카운트 뱃지 |
| `.kebab-case` | `.add-card-form` | CSS 클래스 |

### 2.3 접근성

- 버튼에는 반드시 `aria-label` 또는 텍스트 콘텐츠를 제공한다.
- `<select>`에는 `aria-label`을 제공한다.
- 이미지 아이콘에는 `aria-hidden="true"`를 붙인다.

---

## 3. CSS 컨벤션

### 3.1 파일 구조

섹션을 구분선 주석으로 나눈다:

```css
/* ── 섹션 이름 ──────────────────────────────────── */
```

섹션 순서:
1. `:root` CSS 변수
2. 전역 리셋
3. `body`
4. App Bar
5. Main Layout
6. 컴포넌트 (추가 폼 → 보드 → 컬럼 → 카드 → ...)
7. 반응형

### 3.2 CSS 변수 사용 원칙

- 색상값을 직접 사용하지 않는다. 반드시 `var(--*)` 변수를 사용한다.
- 예외: `rgba(0,0,0,.3)` 같이 변수화하기 어려운 일회성 그림자 값.

```css
/* 좋음 */
color: var(--on-surface);

/* 나쁨 */
color: #e6e1e5;
```

### 3.3 선택자 규칙

- ID 선택자(`#id`)는 단독 요소(입력 필드, 버튼 등)에만 사용한다.
- 컴포넌트 스타일은 클래스 선택자(`.class`)로 작성한다.
- `[data-column]` 속성 선택자를 컬럼별 테마 적용에 활용한다.
- 선택자 깊이는 3단계 이하로 유지한다.

### 3.4 전환 (Transition)

인터랙션이 있는 요소에는 반드시 `transition`을 명시한다:

```css
transition: background .15s, border-color .15s;
```

`all`은 사용하지 않는다 (성능 이슈).

---

## 4. JavaScript 컨벤션

### 4.1 기본 규칙

```js
'use strict';          // 파일 최상단에 항상 선언

// 들여쓰기: 스페이스 2칸
// 세미콜론: 항상 붙임
// 문자열: 작은따옴표 (템플릿 리터럴 제외)
// 변수: const 우선, 재할당 필요 시 let. var 금지
```

### 4.2 명명 규칙

| 종류 | 규칙 | 예시 |
|---|---|---|
| 변수/함수 | camelCase | `dragId`, `addCard` |
| 상수 (불변 배열/객체) | UPPER_SNAKE_CASE | `COLUMNS` |
| 이벤트 핸들러 | `handle{Event}` | `handleDragStart` |
| 설정 함수 | `setup{Name}` | `setupColumnDropZones` |
| 초기화 함수 | `get{Name}` | `getDefaultCards` |

### 4.3 함수 설계

- 함수 하나는 한 가지 일만 한다.
- 함수 길이는 30줄 이하를 지향한다.
- DOM 쿼리는 이벤트 핸들러 내 또는 초기화 시점에만 수행한다.
- `document.getElementById`를 `querySelector`보다 선호한다 (성능).

### 4.4 이벤트 핸들러 패턴

```js
// 핸들러는 named function으로 선언 (디버깅 용이)
function handleDragStart(e) {
  // ...
}

// 등록은 buildCard / setupColumnDropZones 내에서
el.addEventListener('dragstart', handleDragStart);
```

### 4.5 상태 변경 원칙

상태 변경 후 반드시 `render()` → `saveCards()` 순서를 지킨다:

```js
// 항상 이 순서
mutateState();
render();
saveCards();
```

`render()` 없이 DOM을 직접 조작하지 않는다.

### 4.6 주석

- WHY가 명확한 경우만 주석을 쓴다.
- WHAT을 설명하는 주석은 쓰지 않는다 (코드가 직접 설명해야 함).

```js
// 좋음: setTimeout이 필요한 이유를 설명
setTimeout(() => {
  el.classList.add('dragging');
}, 0);
// 브라우저가 ghost 이미지를 캡처한 뒤 opacity를 변경해야 ghost가 정상 표시됨

// 나쁨: 코드가 이미 설명하는 것을 반복
cards.push(newCard); // 카드 배열에 새 카드를 추가한다
```

---

## 5. Git 컨벤션

### 5.1 커밋 메시지 형식

```
{type}({scope}): {subject}

{body}  ← 선택사항. 줄 길이 72자 이하
```

| type | 의미 |
|---|---|
| `feat` | 새 기능 추가 |
| `fix` | 버그 수정 |
| `style` | 코드 스타일 변경 (기능 무관) |
| `refactor` | 리팩터링 |
| `docs` | 문서만 변경 |
| `chore` | 빌드, 설정 변경 |

scope는 파일명 또는 기능명 사용 (`kanban`, `drag-drop`, `card`, `css`).

```bash
# 예시
feat(kanban): 칸반보드 초기 구현 (HTML/CSS/JS)
fix(drag-drop): dragleave 오발사 방지 (contains 체크 추가)
docs(kanban): PRD, TRD, USER_FLOW 등 문서 추가
```

### 5.2 브랜치 전략 (현재 프로젝트)

이 저장소는 공유 모노레포로 **main 브랜치 직접 커밋**을 사용한다.
pull은 반드시 merge로:

```bash
git pull --no-rebase origin main
```

rebase는 절대 사용하지 않는다 (다른 참가자 커밋 해시 파괴 위험).

### 5.3 스테이징

```bash
# 명시적 경로 지정 — 다른 참가자 파일 혼입 방지
git add src/exercise/hyunhong93/day03/kanban/

# git add -A 또는 git add . 사용 금지
```

---

## 6. 로컬 개발 환경

### 6.1 서버 실행

```bash
cd src/exercise/hyunhong93/day03/kanban
python3 -m http.server 8765
```

브라우저: `http://localhost:8765/index.html`
WSL 환경: Windows 브라우저에서 동일 URL 접속

### 6.2 개발 도구 (권장)

| 도구 | 용도 |
|---|---|
| VS Code | 편집기 |
| Live Server (VS Code 확장) | 자동 새로고침 |
| Chrome DevTools | 디버깅, Network, Storage 탭 |
| `localStorage` 초기화 | DevTools → Application → Local Storage → Clear |

### 6.3 디버깅 팁

```js
// localStorage 현재 상태 확인
JSON.parse(localStorage.getItem('kanban-cards'))

// localStorage 초기화 (샘플 카드로 리셋)
localStorage.removeItem('kanban-cards'); location.reload();
```

---

## 7. 코드 리뷰 체크리스트

PR 또는 커밋 전 확인 사항:

### HTML
- [ ] 시맨틱 태그 사용 여부
- [ ] aria-label / aria-* 속성 누락 없음
- [ ] `data-*` 속성이 일관되게 사용됨

### CSS
- [ ] 하드코딩 색상값 없음 (CSS 변수 사용)
- [ ] 새 컴포넌트는 적절한 섹션에 추가됨
- [ ] 반응형 고려 여부

### JavaScript
- [ ] `'use strict'` 선언됨
- [ ] `var` 사용 없음
- [ ] 상태 변경 후 `render()` → `saveCards()` 순서 지킴
- [ ] DOM 직접 조작 없음 (render를 통해서만)
- [ ] 이벤트 리스너 메모리 누수 없음

### 기능
- [ ] 공백 입력 거부 동작 확인
- [ ] 드래그 후 order 정규화 확인
- [ ] localStorage 지속성 확인 (새로고침)
- [ ] 모바일 레이아웃 확인 (700px 이하)
