---
title: WebView에서 스크롤 복원이 깨지는 이유 (React Router ScrollRestoration 분석)
excerpt: '인앱 브라우저에서 스크롤 복원이 정상 동작하지 않는 문제를 추적하고, 스크롤 루트를 런타임에 동적 감지하여 해결한 경험을 공유합니다.'
tags:
  - WebView
  - ScrollRestoration
  - React Router
  - SPA
date: 2026. 3. 1.
---
## **문제 정의**

iOS와 Android 환경에서 슬랙, 인스타그램 인앱 브라우저로 접속했을 때

스크롤 복원이 정상적으로 동작하지 않는 문제가 발생했습니다.

구조는 단순했습니다.
- 사용자 목록 페이지
- 사용자를 클릭하면 사용자 프로필 페이지로 이동

기대한 동작은 다음과 같았습니다.
1. 목록에서 스크롤을 내린 뒤 프로필로 이동하면, 프로필은 항상 최상단에서 시작해야 한다.
2. 프로필에서 뒤로 가면, 목록은 이전 스크롤 위치로 복원되어야 한다.

하지만 인앱 브라우저에서는 다음과 같은 현상이 발생했습니다.
- 새 페이지가 최상단이 아닌 중간 지점에서 시작
- 뒤로 가기 시 이전 페이지 위치가 아니라, 프로필에서 스크롤하던 위치로 이동

페이지 단위로 분리되어야 할 스크롤 상태가 서로 섞이고 있었습니다.
`React Router`의 `ScrollRestoration`을 이미 사용하고 있었기 때문에, 처음에는 라우팅 설정 문제라고 생각했습니다. 
하지만 문제는 "라우팅"이 아니라 **스크롤 기준(scroll root)** 자체에 있었습니다.

## **원인 분석**

![브라우저 vs 인앱 WebView 스크롤 비교](/images/webview-scroll-comparison.png)


디버깅 과정에서 **스크롤 기준이 환경마다 다르다**는 점을 발견했습니다.
일반 브라우저에서는 `window.scrollY` 값이 정상적으로 증가했습니다.

하지만 일부 인앱 브라우저에서는
```tsx
window.scrollY // 항상 0
document.body.scrollTop // 실제 스크롤 값
```
이처럼 스크롤이 window가 아닌 body에서 발생하고 있었습니다.

**React Router**의 **ScrollRestoration**은 내부적으로 `window`를 기준으로 [스크롤 위치를 저장](https://github1s.com/remix-run/react-router/blob/main/packages/react-router/lib/dom/lib.tsx#L3127-L3139)합니다.

```tsx
    // Enable scroll restoration in the router
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useLayoutEffect(() => {
      let disableScrollRestoration = router?.enableScrollRestoration(
        savedScrollPositions,
        () => window.scrollY,
        getKey
          ? (location, matches) =>
              getScrollRestorationKey(location, matches, basename, getKey)
          : undefined,
      );
      return () => disableScrollRestoration && disableScrollRestoration();
    }, [router, basename, getKey]);
```

즉, 스크롤이 발생하는 주체가 환경마다 달랐습니다.

이는 일부 WebView 구현에서 viewport와 document의 scroll container가
window가 아닌 body로 설정되는 경우가 있기 때문입니다.
특히 iOS 기반 인앱 브라우저에서 이런 구현 차이가 종종 나타납니다.

window 기준으로만 복원하면 body에 남아 있는 스크롤 값은 초기화되지 않고 그대로 유지됩니다.

그 결과:
- PUSH 시에도 이전 페이지 위치가 남음
- POP 시 저장된 위치와 실제 화면 위치가 불일치

문제의 본질은 이것이었습니다.
> 스크롤 상태를 저장하기 전에, 스크롤이 발생하는 기준을 먼저 확정해야 한다.

## **제약 조건**

해결 방안을 고민하며 다음 조건을 정리했습니다.
- 기존 SPA 구조는 유지해야 한다.
- React Router는 계속 사용한다.
- 특정 인앱 브라우저를 하드코딩으로 분기하지 않는다.
- 환경이 추가되어도 동일한 구조로 동작해야 한다.

즉, "슬랙이면 body 사용" 같은 조건 분기는 장기적으로 유지보수가 어려운 선택이었습니다.

## **해결 전략: 스크롤 기준을 추상화하기**

환경을 분기하는 대신,
실제로 스크롤이 발생하는 대상을 런타임에 결정하도록 구조를 변경했습니다.
이를 위해 **`React Router`의 `ScrollRestoration`을 대체하는 컴포넌트를 직접 설계**했습니다.

### **1️⃣ 스크롤 루트 동적 감지**

```tsx
function detectScrollRootOnDemand(): { root: ScrollRoot; top: number } {
  const candidates: Array<[ScrollRoot, number]> = [
    ['body', document.body.scrollTop],
    ['scrollingElement', document.scrollingElement?.scrollTop ?? 0],
    ['documentElement', document.documentElement.scrollTop],
    ['window', window.scrollY],
  ];

  for (const [root, top] of candidates) {
    if (top > 0) return { root, top };
  }

  return { root: 'window', top: 0 };
}
```

핵심은 간단합니다.
- 실제로 스크롤 값이 존재하는 루트를 찾는다.
- 값이 0이 아닌 후보가 있다면 그것을 우선한다.
- 전부 0이면 기본값은 window.

중요한 점은 환경을 추측하지 않는다는 것입니다.
**특정 WebView를 분기하는 대신 실제 스크롤 상태를 기반으로 판단**하도록 설계했습니다.
(이 코드는 앱 전체에서 스크롤 루트가 동일하다는 전제로 동작합니다)

### **2️⃣ location.key 기반 스크롤 저장**

```tsx
const scrollPositionsRef = useRef<Map<string, number>>(new Map());
```

`React Router`의 `location.key` 단위로 스크롤을 저장합니다.

- `PUSH`/`REPLACE` → 0으로 초기화
- `POP` → 저장된 위치 복원

**LRU** 방식으로 상한을 둬 메모리 무한 증가를 방지했습니다.

```tsx
// 가장 오래 전에 사용된 항목이 항상 Map의 맨 앞에 있도록 설계하여 LRU 방식으로 동작하도록 함
if (map.size > MAX_STORED_POSITIONS) {
  const oldestKey = map.keys().next().value;
  if (oldestKey !== undefined) map.delete(oldestKey);
}
```

이 부분은 실제 서비스 환경을 고려한 안전장치입니다.

## **3️⃣ 인앱 WebView 대응: rAF 이중 복원**

일부 인앱 브라우저에서는
첫 번째 scroll 적용이 무시되는 현상이 있었습니다.
그래서 다음 프레임에 한 번 더 적용했습니다.

```tsx
const rafId = requestAnimationFrame(() => {
  restoreScrollByRoot(root, savedY);
});
```

```tsx
/**
 * 감지된 루트 기준으로 scrollTop 적용
 * 일부 인앱 WebView는 window가 아닌 document.body 등이 스크롤 루트인 경우가 있음.
 */
function restoreScrollByRoot(root: ScrollRoot, top: number): void {
  switch (root) {
    case 'body':
      document.body.scrollTop = top;
      break;
    case 'scrollingElement':
      document.scrollingElement?.scrollTo(0, top);
      break;
    case 'documentElement':
      document.documentElement.scrollTop = top;
      break;
    default:
      window.scrollTo(0, top);
  }
}
```

## **결과**

이후 다음이 보장되었습니다.
- 목록 → 프로필 이동 시 항상 최상단 시작
- 뒤로 가기 시 정확한 위치 복원
- 특정 인앱 브라우저에 의존하지 않기 때문에 새로운 WebView 환경이 추가되어도 구조 변경 없음
- 특정 앱을 하드코딩하지 않음

일반 브라우저에서 당연하게 동작하던 전제가 WebView 환경에서도 그대로 유지되지는 않는다는 점을 이번에 알게 되었습니다.

스크롤은 브라우저의 기본 동작에 가깝다고 생각했지만, 실제로는 실행 환경에 따라 그 기준 자체가 달라질 수 있었습니다. 이번 문제도 로직 오류라기보다 실행 환경 차이에서 비롯된 동작 차이에 가까웠습니다.

이 과정에서 React Router의 기본 구현을 그대로 사용하는 대신, 내부 동작을 먼저 이해하고 우리 서비스 환경에 맞게 다시 설계하는 방향을 선택했습니다.
앞으로도 기능을 구현할 때 일반 브라우저 기준을 그대로 확장하기보다는, WebView와 같은 환경에서 전제가 달라질 수 있는 부분이 없는지 한 번 더 확인하려고 합니다. 결과적으로 이번 작업은 단순히 스크롤 버그를 수정한 것이 아니라, 실행 환경 차이를 구조적으로 보완한 경험이었습니다.

