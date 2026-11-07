---
title: >-
  Why Scroll Restoration Breaks in WebView (React Router ScrollRestoration
  Analysis)
excerpt: >-
  Tracking and fixing scroll restoration in in-app browsers by dynamically
  detecting the scroll root at runtime.
tags:
  - WebView
  - ScrollRestoration
  - React Router
  - SPA
---
## **Problem Definition**

On iOS and Android, when accessing via Slack or Instagram in-app browsers,

scroll restoration did not work correctly.

The structure was simple.
- User list page
- Click a user to navigate to the user profile page

Expected behavior was:
1. After scrolling down the list and navigating to the profile, the profile should always start at the top.
2. When going back from the profile, the list should restore to the previous scroll position.

But in in-app browsers, the following occurred:
- New pages started in the middle instead of the top
- When going back, instead of the previous page position, it jumped to the scroll position from the profile page

Scroll state that should be separate per page was mixing together.
Since we were already using `React Router`'s `ScrollRestoration`, we initially thought it was a routing configuration issue.
But the problem was not "routing" but
the **scroll root** itself.

## **Root Cause Analysis**

![Browser vs In-app WebView Scroll Comparison](/images/webview-scroll-comparison.png)


During debugging, we found that **the scroll root differed by environment**.
In normal browsers, `window.scrollY` increased correctly.

But in some in-app browsers
```tsx
window.scrollY // always 0
document.body.scrollTop // actual scroll value
```
the scroll was happening on body, not window.

**React Router**'s **ScrollRestoration** internally [saves scroll position](https://github1s.com/remix-run/react-router/blob/main/packages/react-router/lib/dom/lib.tsx#L3127-L3139) based on `window`.

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

That is, the scroll host differed by environment.

This happens because in some WebView implementations the viewport and document scroll container are set to body rather than window.
Such implementation differences often appear in iOS-based in-app browsers.

When restoring only based on window, the scroll value remaining in body was not reset and stayed as-is.

Result:
- On PUSH, previous page position remained
- On POP, saved position did not match actual screen position

The essence of the problem was:
> Before saving scroll state, we must first determine where scrolling actually occurs.

## **Constraints**

While considering solutions, we organized these constraints:
- Keep the existing SPA structure.
- Continue using React Router.
- Avoid hardcoding branches for specific in-app browsers.
- Must work the same way regardless of added environments.

In other words, branches like "if Slack then use body" would be hard to maintain long-term.

## **Solution: Abstracting the Scroll Root**

Instead of branching by environment,
we changed the structure to determine the actual scroll target at runtime.
For this purpose, we **`designed our own component to replace ScrollRestoration`**.

### **1️⃣ Dynamic Scroll Root Detection**

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

The idea is simple:
- Find the root that actually has a scroll value.
- If any candidate has a non-zero value, prefer it.
- If all are zero, default to window.

The important point is that we do not guess the environment.
We **designed it to judge based on actual scroll state rather than branching by specific WebView**.
(This code assumes the scroll root is the same across the entire app)

### **2️⃣ location.key-based Scroll Storage**

```tsx
const scrollPositionsRef = useRef<Map<string, number>>(new Map());
```

Store scroll per `React Router` `location.key`.

- `PUSH`/`REPLACE` → initialize to 0
- `POP` → restore saved position

**LRU** cap to prevent unbounded memory growth.

```tsx
// LRU: oldest item is always at the front of the Map
if (map.size > MAX_STORED_POSITIONS) {
  const oldestKey = map.keys().next().value;
  if (oldestKey !== undefined) map.delete(oldestKey);
}
```

This is a safeguard for real service environments.

## **3️⃣ In-app WebView: rAF Double Restore**

In some in-app browsers,
the first scroll application was ignored.
So we apply again in the next frame.

```tsx
const rafId = requestAnimationFrame(() => {
  restoreScrollByRoot(root, savedY);
});
```

```tsx
/**
 * Apply scrollTop by detected root.
 * Some in-app WebViews use document.body, not window, as scroll root.
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

## **Result**

After this, we ensured:
- List → profile navigation always starts at top
- Back navigation restores the correct position
- No dependency on specific in-app browsers, so no structural changes when new WebView environments are added
- No hardcoding for specific apps

We learned that assumptions that work in normal browsers do not necessarily hold in WebView environments.

Although scroll feels like a basic browser behavior, the scroll root itself can vary by execution environment. This issue was closer to a difference in execution environment than a logic bug.

In this process, instead of using React Router's default implementation as-is, we chose to first understand its internals and redesign it to fit our service environment.
Going forward, when implementing features, we will double-check whether any assumptions might differ in WebView-like environments rather than extending general browser assumptions blindly.

Ultimately, this work was not just fixing a scroll bug but structurally compensating for execution environment differences.

