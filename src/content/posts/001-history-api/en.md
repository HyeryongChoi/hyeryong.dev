---
title: History API
excerpt: A web standard API for controlling the session history managed by the browser.
tags:
  - HistoryAPI
  - SPA
  - Web API
---
## What is the History API?

A web standard API for controlling the session history managed by the browser.
It can be used through the `history` global object or the `window` and `document` global objects.

```
history.back(); // Go back
history.forward(); // Go forward

history.go(-2); // Go back 2 times
history.go(-1); // Go back 1 time
history.go(0); // Refresh
history.go(1); // Go forward 1 time
history.go(2); // Go forward 2 times
```

Calling `history.back()`, `history.forward()`, or `history.go()` causes the page to reload.

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

```javascript
// For example - click link
document.addEventListener("click", async (event) => {
  const creature = event.target.getAttribute("data-creature");

  if (creature) {
    event.preventDefault(); // Prevent a new page from loading

    try {
      // Fetch new content
      const response = await fetch(`creatures/${creature}.json`);
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
  document.title = `Creatures: ${content.name}`;

  const description = document.querySelector("#description");
  description.textContent = content.description;

  const photo = document.querySelector("#photo");
  photo.setAttribute("src", content.image.src);
  photo.setAttribute("alt", content.image.alt);
}
```

```
{
  "description": "Bald eagles are not actually bald.",
  "image": {
    "src": "images/eagle.jpg",
    "alt": "A bald eagle"
  },
  "name": "Eagle"
}
```

The problem here is that by preventing the default `link` behavior, the browser's `Back` and `Forward` buttons don't work as expected.

From the user's perspective, when they click a link the page updates and looks like a new page. So they expect the `Back` button to return to the state before the link was clicked. But since the browser didn't load a new page, clicking `Back` takes them to the page they had open before the SPA.

This is solved by the **History API**'s `pushState()`, `replaceState()` methods and the `popstate` event.

## history.pushState()

```javascript
document.addEventListener("click", async (event) => {
  const creature = event.target.getAttribute("data-creature");

  if (creature) {
    event.preventDefault();

    try {
      const response = await fetch(`creatures/${creature}.json`);
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
```

The three parameters of `pushState(state object, title, URL)` are as follows.

```
// Log the state of
addEventListener("popstate", (event) => {
  console.log("State received: ", event.state); // State received: { name: "Example" }
});

// Now push something on the stack
history.pushState({ name: "Example" }, "pushState example", "page1.html");
```

- state object (`json`): The freshly fetched data is stored with the history entry and later included in the state property of the parameter passed to the `popstate` event handler.
- title (`""`): Required for legacy site compatibility; must always be an empty string.
- URL (`creature`): Used as the entry's URL, displayed in the address bar. Also used as the `Referer` header value for all HTTP requests originating from that page.

## popstate event

When `popstate` fires:

- `JavaScript` calls `history.back()`, `history.forward()`, or `history.go()`
- The browser's `Back` or `Forward` button is clicked

Note) `popstate` does not fire when `pushState` or `replaceState` is called.

Consider this SPA scenario:

1. User clicks link → (in event handler) page updates → (in event handler) `pushState()` adds history entry A to the history stack
2. User clicks another link → (in event handler) page updates → (in event handler) `pushState()` adds history entry B to the history stack
3. User clicks Back button

So now history entry should be A.

Therefore the browser runs the `popstate` event, and at that moment the `popstate` event handler receives the `JSON` data passed to `pushState()`, so you can correctly restore the previous content.

```
// Handle forward/back buttons
window.addEventListener("popstate", (event) => {
  // If a state has been provided, we have a "simulated" page
  // and we update the current page.
  if (event.state) {
    // Simulate the loading of the previous page
    displayContent(event.state);
  }
});
```

## history.replaceState()

`history.replaceState()` works like `history.pushState()` but modifies the current entry instead of creating a new one.

Consider this SPA scenario:

1. SPA page loads → browser adds history entry A to the history stack
2. User clicks another link → (in event handler) page updates → (in event handler) `pushState()` adds history entry B to the history stack
3. User clicks Back

We want to return to the initial SPA state, but the initial page's history entry has no `state` (`null`), so we cannot use `popstate`. That is when `replaceState()` comes in.

```
[A(state=null)] -> [B(state={page: 'B'})]
```

```
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
```

On page load, when returning to the SPA starting point, save all parts that need to be restored (`initialState`). Passing this `initialState` object to `replaceState()` assigns it to the current history entry's state.

Therefore when the user returns to the starting point, the `popstate` event's parameter includes this `initialState`, and the page can be updated correctly.

## Conclusion

The `History API` emerged with the growth of `SPA`s and was created to improve the user's browser navigation experience. That is, **with the `History API`, you can change the browser's `URL` and manage navigation history in an `SPA` without page reload**.

Note) React Router abstracts the `History API` and provides routing; from v6 onward, the `navigate()` method controls `push` vs `replace` via an options argument.

```javascript
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
```

## References
- [react router v6 - useNavigate](https://api.reactrouter.com/v7/functions/react-router.useNavigate.html)
- [Working with the History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API)

