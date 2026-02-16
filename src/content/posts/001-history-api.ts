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

function displayContent(content) {
  document.title = \`Creatures: \${content.name}\`;
  const description = document.querySelector("#description");
  description.textContent = content.description;
  const photo = document.querySelector("#photo");
  photo.setAttribute("src", content.image.src);
  photo.setAttribute("alt", content.image.alt);
}
\`\`\`

여기서 문제는 \`link\`의 기본 동작을 막았기 때문에 브라우저의 \`뒤로가기\` 및 \`앞으로 가기\` 버튼이 예상대로 작동하지 않는다는 점이다.

사용자 관점에서 보면, 링크를 클릭했을 때 페이지가 업데이트 되고 이것은 마치 새로운 페이지처럼 보인다.

그래서 사용자는 브라우저의\`뒤로가기\` 버튼을 클릭했을 때 링크를 클릭하기 전 상태로 돌아가기를 예상한다. 하지만 위 코드에서 브라우저는 새 페이지를 로드하지 않았으므로\`뒤로가기\`를 클릭하면 사용자가 SPA 페이지를 열기 이전에 열었던 페이지로 이동하게 된다.

하지만 이는, History API의 \`pushState()\`, \`replaceState()\` 메서드들과 \`popstate\` 이벤트가 해결한다.

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
      history.pushState(json, "", creature);
    } catch (err) {
      console.error(err);
    }
  }
});
\`\`\`

\`pushState(state object, title, URL)\`에서 사용한 3개의 파라미터는 다음과 같다.

- **state**: 방금 fetch해온 데이터로 history entry와 함께 저장되며 나중에\`popstate\` 이벤트 핸들러의 state 프로퍼티로 전달된다.
- **creature**: 해당 entry의 URL로 사용되며 브라우저 주소창에 표시된다. HTTP 요청의 Referer 헤더 값으로도 사용된다.
- **""**: 레거시 사이트와의 호환성을 위해 필요하며 항상 빈 문자열이어야 한다.

## popstate event

\`popstate\` 이벤트가 발생하는 조건

- JavaScript로 \`history.back()\`, \`history.forward()\`, \`history.go()\` 호출
- 브라우저의 \`뒤로가기\`, \`앞으로 가기\` 버튼 클릭

**주의)** \`pushState\`나 \`replaceState\`를 호출해도 \`popstate\` 이벤트는 발생하지 않는다.

SPA에서 다음과 같은 상황을 가정해보자

1. '뒤로가기' 버튼 클릭
2. 또 다른 링크 클릭 → 페이지 업데이트 → \`pushState()\`로 history entry B 추가
3. 링크 클릭 → 페이지 업데이트 → \`pushState()\`로 history entry A 추가

\`popstate\` 이벤트 핸들러의 파라미터에는 \`pushState\`를 호출할 때 전달한 데이터가 포함되어 있으므로 이전 콘텐츠를 올바르게 복원할 수 있다.

\`\`\`javascript
window.addEventListener("popstate", (event) => {
  if (event.state) {
    displayContent(event.state);
  }
});
\`\`\`

## history.replaceState()

\`history.replaceState()\`는 \`history.pushState()\`와 동일하게 동작하지만, 새 history entry를 만드는 대신 **현재 entry를 수정**한다는 점이 다르다.

SPA에서 초기 페이지 로드 시, 사용자가 시작 지점으로 돌아올 때 복원해야 할 상태(\`initialState\`)를 \`replaceState()\`에 전달하면 된다.

\`\`\`javascript
const initialState = {
  description: document.querySelector("#description").textContent,
  image: {
    src: document.querySelector("#photo").getAttribute("src"),
    alt: document.querySelector("#photo").getAttribute("alt"),
  },
  name: "Home",
};
history.replaceState(initialState, "", document.location.href);
\`\`\`

따라서 사용자가 시작 지점으로 돌아오면\`popstate\` 이벤트의 파라미터에 이\`initialState\`가 포함되며, 페이지를 올바르게 업데이트할 수 있다.

## 결론

\`History API\`는 \`SPA\`의 발전에 따라 등장한 기술로 사용자의 브라우저 내비게이션 경험을 개선하기 위해 만들어진 기능이다. 즉, \`History API\`를 사용하여 \`SPA\`에서 페이지 리로드 없이 브라우저의 \`URL\`을 변경하고 내비게이션 기록을 관리할 수 있다.

**참고)** React Router는 \`History API\`를 추상화한 라이브러리로, \`navigate()\` 메서드의 \`replace\` 옵션으로 **push/replace**를 제어할 수 있다.

\`\`\`javascript
// React Router v6+
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/about');              // push
navigate('/contact', { replace: true });  // replace
\`\`\`

## 참고

- [React Router - useNavigate](https://reactrouter.com/en/main/hooks/use-navigate)
- [MDN - Working with the History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API)
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
document.addEventListener("click", async (event) => {
  const creature = event.target.getAttribute("data-creature");

  if (creature) {
    event.preventDefault();

    try {
      const response = await fetch(\`creatures/\${creature}.json\`);
      const json = await response.json();
      displayContent(json);
    } catch (err) {
      console.error(err);
    }
  }
});

function displayContent(content) {
  document.title = \`Creatures: \${content.name}\`;
  const description = document.querySelector("#description");
  description.textContent = content.description;
  const photo = document.querySelector("#photo");
  photo.setAttribute("src", content.image.src);
  photo.setAttribute("alt", content.image.alt);
}
\`\`\`

The problem here is that by preventing the default link behavior, the browser's Back and Forward buttons don't work as expected.

From the user's perspective, when they click a link the page updates and looks like a new page. So they expect the Back button to return to the state before the link was clicked. But since the browser didn't load a new page, clicking Back takes them to the page they had open before the SPA.

This is solved by the History API's \`pushState()\`, \`replaceState()\` methods and the \`popstate\` event.

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
      history.pushState(json, "", creature);
    } catch (err) {
      console.error(err);
    }
  }
});
\`\`\`

The three parameters of \`pushState(state, title, URL)\`:

- **state**: Data stored with the history entry, later passed to the \`popstate\` event handler's state property.
- **creature**: Used as the entry's URL and displayed in the address bar. Also used as the Referer header for HTTP requests.
- **""**: Required for legacy compatibility; should always be an empty string.

## popstate event

\`popstate\` fires when:

- \`history.back()\`, \`history.forward()\`, or \`history.go()\` is called
- The browser's Back or Forward button is clicked

**Note:** \`popstate\` does not fire when \`pushState\` or \`replaceState\` is called.

In an SPA scenario:

1. User clicks Back
2. User clicks another link → page updates → \`pushState()\` adds history entry B
3. User clicks link → page updates → \`pushState()\` adds history entry A

The \`popstate\` event handler receives the data passed to \`pushState()\`, so you can correctly restore previous content.

\`\`\`javascript
window.addEventListener("popstate", (event) => {
  if (event.state) {
    displayContent(event.state);
  }
});
\`\`\`

## history.replaceState()

\`history.replaceState()\` works like \`history.pushState()\` but **modifies the current entry** instead of creating a new one.

For SPA initial load, pass the state that must be restored when the user returns to the starting point:

\`\`\`javascript
const initialState = {
  description: document.querySelector("#description").textContent,
  image: {
    src: document.querySelector("#photo").getAttribute("src"),
    alt: document.querySelector("#photo").getAttribute("alt"),
  },
  name: "Home",
};
history.replaceState(initialState, "", document.location.href);
\`\`\`

When the user returns to the starting point, the \`popstate\` event includes this \`initialState\`, so the page can be updated correctly.

## Conclusion

The History API emerged with the growth of SPAs and is designed to improve the browser navigation experience. With it, you can change the URL and manage navigation history in an SPA without reloading the page.

**Note:** React Router abstracts the History API; use the \`replace\` option of \`navigate()\` to control push vs replace.

\`\`\`javascript
// React Router v6+
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/about');                      // push
navigate('/contact', { replace: true }); // replace
\`\`\`

## References

- [React Router - useNavigate](https://reactrouter.com/en/main/hooks/use-navigate)
- [MDN - Working with the History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API)
`,
};
