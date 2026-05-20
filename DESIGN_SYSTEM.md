# DESIGN_SYSTEM — 기초 디자인 시스템

## 1. 디자인 원칙

| 원칙 | 설명 |
|---|---|
| **Dark First** | 기본 테마는 다크. 눈의 피로 감소, 집중력 향상 |
| **Material Design 3** | Google MD3 색상 체계 참조. 보라 계열 primary |
| **색상으로 의미 전달** | To-do=파랑(중립), In-Progress=앰버(진행), Done=초록(완료) |
| **최소 마찰** | 호버 시에만 보조 UI 노출, 화면은 콘텐츠 중심 유지 |
| **즉각 피드백** | 드래그 중 실시간 인디케이터, 전환 애니메이션 |

---

## 2. 색상 팔레트

### 2.1 기본 색상 (CSS Custom Properties)

```css
:root {
  /* 배경 계층 */
  --bg:        #0f0f13;   /* 최하단 배경 */
  --surface:   #1c1b1f;   /* 카드 폼, 컬럼 배경 */
  --surface-v: #2b2930;   /* 카드 배경 */

  /* Primary — 보라 (MD3 Purple) */
  --primary:    #d0bcff;  /* 버튼, 포커스, 강조 */
  --on-primary: #381e72;  /* primary 위 텍스트 */

  /* 텍스트 */
  --on-surface: #e6e1e5;  /* 기본 텍스트 */
  --on-sv:      #cac4d0;  /* 보조 텍스트 */
  --outline:    #49454f;  /* 비활성 아이콘, 보더, placeholder */

  /* 오류 */
  --error:      #f2b8b5;  /* 삭제 버튼 hover */
}
```

### 2.2 컬럼 테마 색상

| 컬럼 | 헤더 텍스트 | 헤더 배경 | 헤더 보더 |
|---|---|---|---|
| To-do | `#93c5fd` (파랑) | `#1e2d3d` | `#2d4a6a` |
| In-Progress | `#fbbf24` (앰버) | `#2d2410` | `#5a4c18` |
| Done | `#86efac` (초록) | `#1b2d20` | `#2a4d35` |

```
색상 의미:
  파랑  → 대기/중립  (아직 시작 안 함)
  앰버  → 진행/주의  (지금 하고 있음)
  초록  → 완료/긍정  (끝났음)
```

### 2.3 색상 샘플

```
배경 레이어
  ████ #0f0f13  --bg (가장 어두운 배경)
  ████ #1c1b1f  --surface (컴포넌트 배경)
  ████ #2b2930  --surface-v (카드 배경)

Primary
  ████ #d0bcff  --primary
  ████ #381e72  --on-primary

컬럼 색
  ████ #93c5fd  To-do
  ████ #fbbf24  In-Progress
  ████ #86efac  Done
```

---

## 3. 타이포그래피

| 용도 | 폰트 | 크기 | 굵기 | 특이사항 |
|---|---|---|---|---|
| 앱 제목 | Roboto | 1.125rem (18px) | 500 | letter-spacing 0.01em |
| 컬럼 헤더 | Roboto | 0.8125rem (13px) | 500 | uppercase, letter-spacing 0.06em |
| 카드 텍스트 | Roboto | 0.9375rem (15px) | 400 | line-height 1.45 |
| 보조 텍스트 (count) | Roboto | 0.75rem (12px) | 400 | — |
| 빈 컬럼 안내 | Roboto | 0.875rem (14px) | 400 | italic |
| 셀렉트/입력 | Roboto | 0.875rem–0.9375rem | 400 | — |

기본 폰트 로딩: Google Fonts CDN
Fallback: `sans-serif`

---

## 4. 간격 시스템 (8px 기반)

| 토큰 | 값 | 사용처 |
|---|---|---|
| space-1 | 4px | 아이콘 내부 패딩 |
| space-2 | 8px | 카드 목록 gap, 컬럼 내부 패딩 |
| space-3 | 12px | 컬럼 헤더 패딩, 추가폼 패딩 상하 |
| space-4 | 16px | 메인 레이아웃 패딩, 컬럼 간 gap, 헤더 패딩 좌우 |
| space-5 | 20px | 앱바 좌우 패딩 |
| space-6 | 24px | 빈 컬럼 안내 패딩 상하 |

---

## 5. 보더 반지름

| 컴포넌트 | 반지름 |
|---|---|
| 컬럼, 추가 폼 | 16px |
| 카드 | 10px |
| 셀렉트 | 8px |
| 추가 버튼 (원형) | 50% |
| 삭제 버튼 (원형) | 50% |
| 카운트 뱃지 | 10px |

---

## 6. 그림자

| 컴포넌트 | 그림자 |
|---|---|
| 컬럼 (기본) | `0 2px 8px rgba(0,0,0,.3)` |
| 컬럼 (drag-over) | `0 0 0 2px var(--primary), 0 4px 16px rgba(0,0,0,.4)` |
| 추가 폼 | `0 2px 8px rgba(0,0,0,.3)` |

---

## 7. 컴포넌트 명세

### 7.1 App Bar

```
높이:        56px
배경:        --surface
하단 보더:   1px solid --outline
텍스트:      --primary
아이콘 크기: 24px (Material Icons)
```

### 7.2 Column

```
배경:        --surface
보더:        2px solid transparent (기본)
             2px solid --primary (drag-over)
보더 반지름: 16px
레이아웃:    flex column
헤더:        컬럼별 bg/color/border-color
```

### 7.3 Card

| 상태 | 스타일 |
|---|---|
| 기본 | `background: --surface-v`, `border: 1.5px solid transparent` |
| hover | `background: #312f38` |
| dragging (드래그 중) | `opacity: 0.25`, `transform: scale(0.97)` |
| drop-above | `border-top-color: --primary` |
| drop-below | `border-bottom-color: --primary` |

### 7.4 Delete Button

```
기본:        opacity 0 (숨김)
card:hover:  opacity 1 (노출)
버튼 hover:  background rgba(--error, .12), color --error
크기:        28×28px (원형)
아이콘:      Material Icons 'close', 18px
```

### 7.5 Add Button

```
배경:        --primary
텍스트:      --on-primary
크기:        36×36px (원형)
hover:       opacity 0.85
active:      opacity 0.70
전환:        opacity 0.15s
```

### 7.6 Count Badge

```
배경:        rgba(255,255,255,.1)
보더 반지름: 10px
패딩:        1px 8px
폰트:        0.75rem
최소 너비:   22px
```

---

## 8. 상호작용 / 애니메이션

| 요소 | 속성 | 시간 | 이징 |
|---|---|---|---|
| 카드 background | transition | 0.15s | ease |
| 카드 border-color | transition | 0.15s | ease |
| 카드 opacity, transform | transition | 0.20s | ease |
| 컬럼 border-color | transition | 0.15s | ease |
| 삭제 버튼 opacity | transition | 0.15s | ease |
| 추가 버튼 opacity | transition | 0.15s | ease |

---

## 9. 반응형 브레이크포인트

| 구분 | 조건 | 레이아웃 |
|---|---|---|
| Desktop | ≥700px | 3열 그리드 |
| Mobile/Tablet | <700px | 1열 수직 스택 |

모바일에서는 `body` 스크롤이 활성화되고 각 컬럼은 최소 200px 높이를 유지한다.

---

## 10. 아이콘 체계 (Material Icons)

| 위치 | 아이콘 | 의미 |
|---|---|---|
| 앱바 | `view_kanban` | 칸반보드 |
| 추가 폼 | `add_card` | 카드 추가 |
| 추가 버튼 | `add` | 추가 |
| To-do 헤더 | `checklist` | 할 일 목록 |
| In-Progress 헤더 | `autorenew` | 진행 중 |
| Done 헤더 | `done_all` | 모두 완료 |
| 삭제 버튼 | `close` | 닫기/삭제 |
