import type { BlogPost } from "@/data/blog.types";

export const post: BlogPost = {
  id: "001",
  title: "History API",
  date: "2024.11.15",
  excerpt:
    "브라우저가 관리하는 session history를 제어하기 위한 웹 표준 API입니다.",
  tags: ["HistoryAPI", "SPA", "Web API"],
  titleKo: "History API",
  titleEn: "History API",
  excerptKo:
    "브라우저가 관리하는 session history를 제어하기 위한 웹 표준 API입니다.",
  excerptEn:
    "A web standard API for controlling the session history managed by the browser.",
  tagsKo: ["HistoryAPI", "SPA", "Web API"],
  tagsEn: ["HistoryAPI", "SPA", "Web API"],
  content: "", // fallback; contentKo/contentEn 사용
  contentKo: `## History API란?

브라우저가 관리하는 session history를 제어하기 위한 웹 표준 API이다.

\`history\` 전역 객체 또는 \`window\`, \`document\` 전역 객체를 통해서 사용할 수 있다.

\`\`\`
history.back(); // 뒤로 가기
history.forward(); // 앞으로 가기

history.go(-2); // 뒤로 2번 가기
history.go(-1); // 뒤로 1번 가기
history.go(0); // 새로고침
history.go(1); // 앞으로 1번 가기
history.go(2); // 앞으로 2번 가기
\`\`\`

여기서 \`history.back()\`, \`history.forward()\`, \`history.go()\` 메서드를 호출하면 페이지를 리로드(Reload) 한다.

## 등장배경

전통적으로 웹사이트는 여러 페이지들의 묶음으로 구현되었다.

사용자가 링크를 클릭하여 다른 페이지로 이동할 때마다 브라우저는 완전히 새로운 페이지를 로드한다.

여기서 발생하는 문제점들은 다음과 같다.

- 페이지 이동 시 애플리케이션의 상태를 유지하기 어렵다.
- 페이지의 일부분에서만 업데이트가 필요할 때에도 매번 페이지 전체를 로드하는 것은 비효율적일 수 있다.

위와 같은 문제점들로, SPA(Single-Page-Application)가 인기 패턴이 되었다.

- 새로운 콘텐츠로 페이지를 업데이트한다.
- 화면에 표시할 새로운 콘텐츠를 페칭해온다.
- 새로운 페이지를 로딩할 때 새로고침을 방지한다.

\`\`\`javascript
// For example - click link
document.addEventListener("click", async (event) => {
  const creature = event.target.getAttribute("data-creature");

  if (creature) {
    event.preventDefault(); // Prevent a new page from loading

    try {
      // Fetch new content
      const response = await fetch(\`creatures/\${creature}.json\`);
      const json = await response.json();

      // Update the page with the new content
      displayContent(json);
    } catch (err) {
      console.error(err);
    }
  }
});

// Update the page with the new content
function displayContent(content) {
  document.title = \`Creatures: \${content.name}\`;

  const description = document.querySelector("#description");
  description.textContent = content.description;

  const photo = document.querySelector("#photo");
  photo.setAttribute("src", content.image.src);
  photo.setAttribute("alt", content.image.alt);
}
\`\`\`

\`\`\`
{
  "description": "Bald eagles are not actually bald.",
  "image": {
    "src": "images/eagle.jpg",
    "alt": "A bald eagle"
  },
  "name": "Eagle"
}
\`\`\`

여기서 문제는 \`link\` 의 기본 동작을 막았기 때문에 브라우저의 \`뒤로가기\` 및 \`앞으로 가기\` 버튼이 예상대로 작동하지 않는다는 점이다.

사용자 관점에서 보면, 링크를 클릭했을 때 페이지가 업데이트 되고 이것은 마치 새로운 페이지처럼 보인다.

그래서 사용자는 브라우저의 \`뒤로가기\` 버튼을 클릭했을 때 링크를 클릭하기 전 상태로 돌아가기를 예상한다. 하지만 위 코드에서 브라우저는 새 페이지를 로드하지 않았으므로 \`뒤로가기\` 를 클릭하면 사용자가 SPA 페이지를 열기 이전에 열었던 페이지로 이동하게 된다.

하지만 이는, **History API**의 \`pushState()\`, \`replaceState()\` 메서드들과 \`popstate\` 이벤트가 해결한다.

## history.pushState()

\`\`\`javascript
document.addEventListener("click", async (event) => {
  const creature = event.target.getAttribute("data-creature");

  if (creature) {
    event.preventDefault();

    try {
      const response = await fetch(\`creatures/\${creature}.json\`);
      const json = await response.json();

      displayContent(json);

      // Add a new entry to the history.
      // This simulates loading a new page.
      history.pushState(json, "", creature);
    } catch (err) {
      console.error(err);
    }
  }
});
\`\`\`

\`pushState(state object, title, URL)\` 에서 사용한 3개의 파라미터는 다음과 같다.


\`\`\`
// Log the state of
addEventListener("popstate", (event) => {
  console.log("State received: ", event.state); // State received: { name: "Example" }
  });
  
  // Now push something on the stack
  history.pushState({ name: "Example" }, "pushState example", "page1.html");
\`\`\`
  
- state object(\`json\`): 방금 fetch해온 데이터로 history entry와 함께 저장되며 나중에 \`popstate\` 이벤트 핸들러에 전달된 파라미터의 state 프로퍼티로 포함된다.
- title(\`""\`): 레거시 사이트와의 호환성(compatibility)을 위해 필요하며 항상 빈 문자열이어야 한다.
- URL(\`creature\`): 해당 entry의 URL로 사용되며 브라우저 주소창에 표시된다. 또한 해당 페이지에서 발생하는 모든 HTTP 요청의 \`Referer\` 헤더 값으로 사용된다.

## popstate event

\`popstate\` 이벤트가 발생하는 조건

- \`JavaScript\` 로 \`history.back()\`, \`history.forward()\`, \`history.go()\` 호출
- 브라우저의 \`뒤로가기\`, \`앞으로 가기\` 버튼 클릭

주의) \`pushState\` 나 \`replaceState\` 를 호출해도 \`popstate\` 이벤트는 발생하지 않는다.

SPA에서 다음과 같은 상황을 가정해보자

1. 링크 클릭 → (이벤트 핸들러에서) 페이지 업데이트 → (이벤트 핸들러에서) \`pushState()\` 를 사용해 history 스택에 history entry A 추가
2. 또 다른 링크 클릭 → (이벤트 핸들러에서) 페이지 업데이트 → (이벤트 핸들러에서) \`pushState()\` 를 사용해 history 스택에 history entry B 추가
3. '뒤로가기' 버튼 클릭

그럼 이제 history entry는 A가 되어야 한다.

따라서 브라우저는 \`popstate\` 이벤트를 실행하는데, 이 때 \`popstate\` 이벤트 핸들러의 파라미터에는 \`pushState\` 를 호출했을 때 전달한 \`JSON\` 데이터가 포함되어 있으므로 이전의 콘텐츠를 올바르게 복원할 수 있다.

\`\`\`
// Handle forward/back buttons
window.addEventListener("popstate", (event) => {
  // If a state has been provided, we have a "simulated" page
  // and we update the current page.
  if (event.state) {
    // Simulate the loading of the previous page
    displayContent(event.state);
  }
});
\`\`\`

## history.replaceState()

\`history.replaceState()\` 는 \`history.pushState()\` 와 똑같이 동작하지만, 새 history entry를 만드는 대신 현재 entry를 수정한다는 점이 다르다.

SPA에서 다음과 같은 상황을 가정해보자

1. SPA 페이지 로드 → 브라우저가 history 스택에 history entry A 추가
2. 또 다른 링크 클릭 → (이벤트 핸들러에서) 페이지 업데이트 → (이벤트 핸들러에서) \`pushState()\` 를 사용해 history 스택에 history entry B 추가
3. '뒤로가기' 버튼 클릭

이제 우리는 SPA의 초기 상태로 돌아가고 싶지만 초기 페이지의 history entry에 \`state\` 가 없으므로 (\`null\`) \`popstate\` 를 사용할 수 없다. 이 때 사용하는 것이 \`replaceState()\` 이다.

\`\`\`
[A(state=null)] -> [B(state={page: 'B'})]
\`\`\`

\`\`\`
// Create state on page load and replace the current history with it
const image = document.querySelector("#photo");
const initialState = {
  description: document.querySelector("#description").textContent,
  image: {
    src: image.getAttribute("src"),
    alt: image.getAttribute("alt"),
  },
  name: "Home",
};
history.replaceState(initialState, "", document.location.href);
\`\`\`

페이지 로드 시, SPA 시작 지점으로 돌아올 때 복원해야하는 모든 부분들 (\`initialState\`)을 저장한다. 이 \`initialState\` 객체를 \`replaceState()\` 에 전달하면 현재 history entry의 state에 해당 객체가 할당된다.

따라서 사용자가 시작 지점으로 돌아오면 \`popstate\` 이벤트의 파라미터에 이 \`initialState\` 가 포함되며, 페이지를 올바르게 업데이트 할 수 있다.

## 결론

\`History API\` 는 \`SPA\` 의 발전에 따라 등장한 기술로 사용자의 브라우저 내비게이션 경험을 개선하기 위해 만들어진 기능이다. 즉, **\`History API\` 를 사용하여 \`SPA\` 에서 페이지 리로드 없이 브라우저의 \`URL\` 을 변경하고 내비게이션 기록을 관리**할 수 있다.

참고) React Router는 \`History API\` 를 추상화한 라이브러리로 라우팅 기능을 제공하며, 버전 6부터는 \`navigate()\` 메서드를 통해 \`push\`, \`replace\` 여부를 옵션 인자로 받아 제어한다.

\`\`\`javascript
// React router v6+
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  const goToAbout = () => {
    // 기본 동작: push
    navigate('/about');
  };

  const replaceWithContact = () => {
    // replace 동작으로 히스토리 대체
    navigate('/contact', { replace: true });
  };

  return (
    <>
      Home Page
      <a onClick={goToAbout}>Go to About Page (push)</a>
      <a onClick={replaceWithContact}>Go to Contact Page (replace)</a>
    </>
  );
}
\`\`\`

## 참고

- [react router v6 - useNavigate](https://api.reactrouter.com/v7/functions/react-router.useNavigate.html)
- [Working with the History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API)
`,
  contentEn: `## What is the History API?

A web standard API for controlling the session history managed by the browser.

It can be used through the \`history\` global object or the \`window\` and \`document\` global objects.

\`\`\`
history.back(); // Go back
history.forward(); // Go forward

history.go(-2); // Go back 2 times
history.go(-1); // Go back 1 time
history.go(0); // Refresh
history.go(1); // Go forward 1 time
history.go(2); // Go forward 2 times
\`\`\`

Calling \`history.back()\`, \`history.forward()\`, or \`history.go()\` causes the page to reload.

## Background

Traditionally, websites were implemented as a collection of multiple pages.

Each time a user clicked a link to navigate to another page, the browser loaded a completely new page.

This led to several problems:

- It was difficult to maintain application state during page navigation.
- Loading the entire page for partial updates was often inefficient.

Because of these issues, SPA (Single-Page Application) became a popular pattern.

- Update the page with new content.
- Fetch new content to display.
- Prevent refresh when loading new pages.

\`\`\`javascript
// For example - click link
document.addEventListener("click", async (event) => {
  const creature = event.target.getAttribute("data-creature");

  if (creature) {
    event.preventDefault(); // Prevent a new page from loading

    try {
      // Fetch new content
      const response = await fetch(\`creatures/\${creature}.json\`);
      const json = await response.json();

      // Update the page with the new content
      displayContent(json);
    } catch (err) {
      console.error(err);
    }
  }
});

// Update the page with the new content
function displayContent(content) {
  document.title = \`Creatures: \${content.name}\`;

  const description = document.querySelector("#description");
  description.textContent = content.description;

  const photo = document.querySelector("#photo");
  photo.setAttribute("src", content.image.src);
  photo.setAttribute("alt", content.image.alt);
}
\`\`\`

\`\`\`
{
  "description": "Bald eagles are not actually bald.",
  "image": {
    "src": "images/eagle.jpg",
    "alt": "A bald eagle"
  },
  "name": "Eagle"
}
\`\`\`

The problem here is that by preventing the default \`link\` behavior, the browser's \`Back\` and \`Forward\` buttons don't work as expected.

From the user's perspective, when they click a link the page updates and looks like a new page. So they expect the \`Back\` button to return to the state before the link was clicked. But since the browser didn't load a new page, clicking \`Back\` takes them to the page they had open before the SPA.

This is solved by the **History API**'s \`pushState()\`, \`replaceState()\` methods and the \`popstate\` event.

## history.pushState()

\`\`\`javascript
document.addEventListener("click", async (event) => {
  const creature = event.target.getAttribute("data-creature");

  if (creature) {
    event.preventDefault();

    try {
      const response = await fetch(\`creatures/\${creature}.json\`);
      const json = await response.json();

      displayContent(json);

      // Add a new entry to the history.
      // This simulates loading a new page.
      history.pushState(json, "", creature);
    } catch (err) {
      console.error(err);
    }
  }
});
\`\`\`

The three parameters of \`pushState(state object, title, URL)\` are as follows.

\`\`\`
// Log the state of
addEventListener("popstate", (event) => {
  console.log("State received: ", event.state); // State received: { name: "Example" }
});

// Now push something on the stack
history.pushState({ name: "Example" }, "pushState example", "page1.html");
\`\`\`

- state object (\`json\`): The freshly fetched data is stored with the history entry and later included in the state property of the parameter passed to the \`popstate\` event handler.
- title (\`""\`): Required for legacy site compatibility; must always be an empty string.
- URL (\`creature\`): Used as the entry's URL, displayed in the address bar. Also used as the \`Referer\` header value for all HTTP requests originating from that page.

## popstate event

When \`popstate\` fires:

- \`JavaScript\` calls \`history.back()\`, \`history.forward()\`, or \`history.go()\`
- The browser's \`Back\` or \`Forward\` button is clicked

Note) \`popstate\` does not fire when \`pushState\` or \`replaceState\` is called.

Consider this SPA scenario:

1. User clicks link → (in event handler) page updates → (in event handler) \`pushState()\` adds history entry A to the history stack
2. User clicks another link → (in event handler) page updates → (in event handler) \`pushState()\` adds history entry B to the history stack
3. User clicks Back button

So now history entry should be A.

Therefore the browser runs the \`popstate\` event, and at that moment the \`popstate\` event handler receives the \`JSON\` data passed to \`pushState()\`, so you can correctly restore the previous content.

\`\`\`
// Handle forward/back buttons
window.addEventListener("popstate", (event) => {
  // If a state has been provided, we have a "simulated" page
  // and we update the current page.
  if (event.state) {
    // Simulate the loading of the previous page
    displayContent(event.state);
  }
});
\`\`\`

## history.replaceState()

\`history.replaceState()\` works like \`history.pushState()\` but modifies the current entry instead of creating a new one.

Consider this SPA scenario:

1. SPA page loads → browser adds history entry A to the history stack
2. User clicks another link → (in event handler) page updates → (in event handler) \`pushState()\` adds history entry B to the history stack
3. User clicks Back

We want to return to the initial SPA state, but the initial page's history entry has no \`state\` (\`null\`), so we cannot use \`popstate\`. That is when \`replaceState()\` comes in.

\`\`\`
[A(state=null)] -> [B(state={page: 'B'})]
\`\`\`

\`\`\`
// Create state on page load and replace the current history with it
const image = document.querySelector("#photo");
const initialState = {
  description: document.querySelector("#description").textContent,
  image: {
    src: image.getAttribute("src"),
    alt: image.getAttribute("alt"),
  },
  name: "Home",
};
history.replaceState(initialState, "", document.location.href);
\`\`\`

On page load, when returning to the SPA starting point, save all parts that need to be restored (\`initialState\`). Passing this \`initialState\` object to \`replaceState()\` assigns it to the current history entry's state.

Therefore when the user returns to the starting point, the \`popstate\` event's parameter includes this \`initialState\`, and the page can be updated correctly.

## Conclusion

The \`History API\` emerged with the growth of \`SPA\`s and was created to improve the user's browser navigation experience. That is, **with the \`History API\`, you can change the browser's \`URL\` and manage navigation history in an \`SPA\` without page reload**.

Note) React Router abstracts the \`History API\` and provides routing; from v6 onward, the \`navigate()\` method controls \`push\` vs \`replace\` via an options argument.

\`\`\`javascript
// React router v6+
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  const goToAbout = () => {
    // Default behavior: push
    navigate('/about');
  };

  const replaceWithContact = () => {
    // Replace history
    navigate('/contact', { replace: true });
  };

  return (
    <>
      Home Page
      <a onClick={goToAbout}>Go to About Page (push)</a>
      <a onClick={replaceWithContact}>Go to Contact Page (replace)</a>
    </>
  );
}
\`\`\`

## References

- [react router v6 - useNavigate](https://api.reactrouter.com/v7/functions/react-router.useNavigate.html)
- [Working with the History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API)
`,
};
