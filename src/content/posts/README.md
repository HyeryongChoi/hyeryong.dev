# 블로그 포스트 작성 가이드

글은 보통 배포된 사이트의 `/editor`에서 작성·발행한다. 로컬에서 직접 추가하려면 아래 형식을 따른다.

## 폴더 구조

```
src/content/posts/
  003-my-post/        # {3자리 id}-{slug} (slug: 영문 소문자·숫자·-)
    ko.md             # 필수
    en.md             # 선택 — 없으면 EN 화면에 한국어가 보인다
```

폴더만 추가하면 빌드할 때 자동으로 목록에 등록된다. 별도 등록 파일은 없다.

## frontmatter

```md
---
title: 글 제목
excerpt: 목록에 표시될 짧은 설명
tags: [TAG1, TAG2]
date: "2026.11.08"
thumbnail: /images/thumbnail.webp   # 선택. 없으면 본문 첫 이미지
---
마크다운 본문...
```

- `ko.md`: `title`, `excerpt`, `tags`, `date` 필수
- `en.md`: `title`, `excerpt`, `tags` 필수 (`date`, `thumbnail`은 ko 값을 따른다)
- 필수 값이 빠지면 빌드가 어떤 파일의 어떤 필드가 문제인지 알려주며 실패한다.
- URL은 `/blog/{id}` 이다 (slug는 URL에 쓰지 않는다).
