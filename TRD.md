# TRD — 기술 요구사항 정의서

## 1. 기술 스택

| 분류 | 기술 | 버전/비고 |
|---|---|---|
| 마크업 | HTML5 | Semantic elements |
| 스타일 | CSS3 | CSS Custom Properties, Grid, Flexbox |
| 스크립트 | Vanilla JavaScript | ES2020, `'use strict'` |
| 폰트 | Google Fonts CDN | Roboto 400/500/700 |
| 아이콘 | Material Icons CDN | Google Fonts Icon |
| 저장소 | Web Storage API | `localStorage` (사용자별 키 스코핑) |
| 드래그 앤 드롭 | HTML5 Drag and Drop API | 네이티브 |
| 인증 | Supabase Auth | `@supabase/supabase-js@2` CDN |
| 배포 | GitHub Pages | `https://hyunhong93.github.io/kanban-board` |
| 로컬 서버 | Python http.server | `python3 -m http.server 8765` |

---

## 2. 아키텍처

### 2.1 전체 구조

```
브라우저
  └── index.html (레이아웃 + 인증 오버레이)
        ├── style.css (스타일)
        ├── auth.js (Supabase 인증 로직)
        │     └── Supabase CDN (@supabase/supabase-js@2)
        └── app.js (칸반 로직)
              ├── State: cards[] (메모리)
              └── Persistence: localStorage['kanban-cards-{userId}']
```

### 2.2 데이터 흐름

```
사용자 액션
    │
    ▼
이벤트 핸들러 (app.js)
    │
    ├─► 상태 변경 (cards 배열 조작)
    │
    ├─► saveCards() → localStorage 저장
    │
    └─► render() → DOM 전체 재렌더
```

단방향 데이터 흐름 채택. 상태(cards[])가 유일한 진실의 원천(single source of truth).

---

## 3. 파일별 역할

### 3.1 index.html

- 정적 뼈대 마크업만 담당
- 동적 카드 DOM은 `app.js`의 `render()`가 주입
- `data-column` 속성이 컬럼 식별자로 사용됨
- ID 패턴: `col-{name}`, `list-{name}`, `count-{name}`

### 3.2 style.css

- `:root`에 전체 색상을 CSS 변수로 선언
- 컴포넌트별 섹션 분리 (App Bar / Board / Column / Card / ...)
- 드래그 상태 클래스: `.dragging`, `.drag-over`, `.drop-above`, `.drop-below`
- `[data-column]` 속성 선택자로 컬럼별 테마 적용

### 3.3 auth.js (신규)

```
Supabase 클라이언트 초기화
  SUPABASE_URL / SUPABASE_ANON_KEY — 환경 상수

전역 공개 함수
  window.getAuthUser()    — 현재 로그인 사용자 반환 (app.js에서 참조)

인증 상태 관리
  initAuth()              — 세션 복원 + onAuthStateChange 구독
  showLogin() / showBoard()

OAuth 로그인
  signInWithGoogle()      — Google OAuth 리다이렉트
  signInWithGithub()      — GitHub OAuth 리다이렉트

이메일 인증
  handleEmailSubmit(e)    — 로그인 / 회원가입 (isSignUp 플래그 분기)
  toggleMode()            — 로그인 ↔ 회원가입 UI 전환

기타
  signOut()               — 세션 제거
  updateUserInfo()        — 헤더 아바타·이름 갱신
```

### 3.4 app.js

```
모듈 레벨 상태
  cards: Card[]          — 전체 카드 배열
  dragId: string         — 드래그 중인 카드 ID
  appInitialized: bool   — 이벤트 리스너 중복 등록 방지 플래그

Card 타입: { id: string, text: string, column: string, order: number }

핵심 함수 그룹
  [지속성]   uid / getStorageKey / loadCards / saveCards / getDefaultCards
  [렌더링]   render / buildCard
  [CRUD]     addCard / deleteCard
  [DnD-카드] handleDragStart / handleDragEnd / handleCardDragOver / handleCardDrop
  [DnD-컬럼] setupColumnDropZones
  [유틸]     clearCardDropStyles / clearDropStyles
  [진입점]   initApp()  — auth.js가 로그인 후 호출
```

---

## 4. 핵심 기술 결정

### 4.1 전체 재렌더 (Full Re-render)

부분 DOM 업데이트 대신 `render()` 호출 시 각 컬럼의 `innerHTML = ''` 후 전체 재생성.

- 장점: 상태와 DOM 불일치 버그 원천 차단, 코드 단순
- 단점: 카드가 수백 개일 때 성능 저하 가능 (현 규모에서는 무관)

### 4.2 HTML5 Drag and Drop API

- `dragstart` / `dragend` / `dragover` / `drop` / `dragleave` 이벤트 사용
- 두 레벨의 drop target: 카드(정밀 삽입) + 컬럼 card-list(빈 영역 드롭)
- `e.stopPropagation()` 로 카드 이벤트가 컬럼으로 버블링되는 것 차단
- `dragleave` 오발사: `colEl.contains(e.relatedTarget)` 체크로 방지

### 4.3 order 정규화

드롭 후 해당 컬럼의 카드 order를 `0, 1, 2...`로 재정규화.
정수 갭 누적 방지. 드롭 전: 배열 정렬 → splice 삽입 → forEach 재부여.

### 4.4 삽입 위치 계산

```js
const { top, height } = el.getBoundingClientRect();
e.clientY < top + height / 2  →  drop-above (위에 삽입)
e.clientY >= top + height / 2 →  drop-below (아래에 삽입)
```

### 4.5 dragstart 타이밍

`classList.add('dragging')`을 `setTimeout(..., 0)`으로 지연.
브라우저가 ghost 이미지를 캡처한 뒤 opacity를 변경해야 ghost가 정상 표시됨.

---

## 5. 인증 아키텍처

### 5.1 Supabase Auth 설정

| 항목 | 값 |
|---|---|
| Project URL | `https://dhikkucdbjqprrlduuqa.supabase.co` |
| Anon Key | 코드 내 상수로 관리 (public key, 노출 무방) |
| 활성화 Provider | Email/Password, Google OAuth, GitHub OAuth |

### 5.2 인증 흐름

```
페이지 로드
    │
    ▼
initAuth() — getSession() 세션 확인
    │
    ├── 세션 있음 → showBoard() → initApp()
    └── 세션 없음 → showLogin() (오버레이 표시)

사용자 로그인 (OAuth / 이메일)
    │
    ▼
Supabase onAuthStateChange (SIGNED_IN)
    │
    ▼
showBoard() → updateUserInfo() → initApp()

로그아웃
    │
    ▼
signOut() → onAuthStateChange (SIGNED_OUT) → showLogin()
```

### 5.3 OAuth 리다이렉트 URL

`redirectTo: window.location.origin + window.location.pathname`

Supabase 대시보드 Authentication > URL Configuration에 등록 필요:
- `https://hyunhong93.github.io/kanban-board/`
- `http://localhost:8765/index.html` (로컬 개발)

---

## 6. localStorage 스키마

```
Key:   'kanban-cards-{userId}'   // userId = Supabase auth.user.id (UUID)
Value: JSON.stringify(Card[])

Card {
  id:     string   // uid() 생성값 — timestamp36 + random5
  text:   string   // 카드 텍스트
  column: 'todo' | 'inprogress' | 'done'
  order:  number   // 컬럼 내 정렬 순서 (0-based 정수)
}
```

사용자별 스코핑으로 다른 계정의 데이터가 섞이지 않음.

---

## 7. 배포 (GitHub Pages)

```
레포지토리: https://github.com/hyunhong93/kanban-board
배포 URL:   https://hyunhong93.github.io/kanban-board

설정: Settings > Pages > Source: Deploy from branch > main / (root)
```

정적 파일만으로 구성되므로 별도 빌드 없이 GitHub Pages에서 직접 서빙 가능.

---

## 8. 브라우저 호환성

| 기능 | 최소 버전 |
|---|---|
| CSS Grid | Chrome 57+, Firefox 52+, Safari 10.1+ |
| CSS Custom Properties | Chrome 49+, Firefox 31+, Safari 9.1+ |
| HTML5 DnD API | Chrome 4+, Firefox 3.5+, Safari 3.1+ |
| localStorage | Chrome 4+, Firefox 3.5+, Safari 4+ |
| ES2020 (optional chaining 미사용) | Chrome 80+, Firefox 74+, Safari 13.1+ |

대상: 모던 브라우저 (IE 미지원)

---

## 9. 성능 고려사항

- 카드 수 ~100개 이하: 전체 재렌더 성능 문제 없음
- localStorage 용량 한계: 도메인당 5MB (카드 텍스트 기준 수만 건 저장 가능)
- CDN 폰트 로딩 실패 시: `font-family` fallback `sans-serif` 적용됨

---

## 10. 실행 방법

```bash
# kanban 디렉터리에서
python3 -m http.server 8765

# 브라우저에서 접속
http://localhost:8765/index.html
# WSL 환경: Windows 브라우저에서 동일 URL 접속 가능
```
