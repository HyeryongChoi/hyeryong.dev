# PRD: 블로그 웹 에디터 (`/editor`)

- 작성일: 2026-11-08
- 대상 레포: `HyeryongChoi/hyeryong.dev` (Next.js 15, Vercel 배포)

## 1. 개요

배포된 블로그(`hyeryong.dev`)에 관리자 전용 웹 에디터 `/editor`를 추가한다. 로컬 개발 환경이나 VS Code 없이 브라우저에서 글을 작성·수정·발행하는 것이 목적이다.

- 저장소는 계속 GitHub 레포다. 발행하면 `main`에 커밋되고 Vercel이 자동으로 배포한다(반영까지 1~2분).
- 이를 위해 글 저장 형식을 `.ts` 문자열에서 마크다운 파일로 바꾼다.
- 데스크톱 전용이며, 블로그의 레트로 Windows 콘셉트를 살린 전체 화면 페이지로 만든다.
- 추가 비용이 드는 외부 서비스(유료 API, DB, 외부 스토리지)는 쓰지 않는다.

### 첫 버전 범위

1. 새 글 작성 + 발행
2. 기존 글 수정
3. 브라우저 자동 임시저장

## 2. 사용자 스토리

- **US-1 로그인**: 블로그 주인으로서 나는 `/editor`에 GitHub 계정으로 로그인하고 싶다. 다른 사람이 내 블로그에 글을 올리면 안 되기 때문이다.
- **US-2 새 글 작성**: 나는 마크다운을 쓰면서 오른쪽에서 실제 블로그와 똑같은 미리보기를 보고 싶다. 발행 후 모양이 달라지면 안 되기 때문이다.
- **US-3 이미지**: 나는 캡처를 붙여넣거나 파일을 끌어다 놓아 본문에 이미지를 넣고 싶다. `public/images`에 직접 파일을 넣는 과정이 번거롭기 때문이다.
- **US-4 영어 버전**: 나는 KO/EN 탭을 전환하며 영어 버전을 쓰고 싶다. 영어를 비워둔 채로도 발행할 수 있어야 한다. 영어는 나중에 쓸 수도 있기 때문이다.
- **US-5 발행**: 나는 [발행] 한 번으로 글과 이미지가 하나의 커밋으로 `main`에 올라가길 원한다. 1~2분 뒤 사이트에 반영되면 된다.
- **US-6 수정**: 나는 에디터의 글 목록에서 기존 글을 열어 고치고 다시 발행하고 싶다.
- **US-7 임시저장**: 나는 쓰던 글이 브라우저에 자동 저장되길 원한다. 탭을 실수로 닫아도 날아가지 않아야 하기 때문이다.

## 3. 기술 결정 (ADR)

### Context

- 배포된 사이트에서 글을 쓰고 GitHub `main`에 커밋해야 한다.
- 지금은 글이 `.ts` 파일 안의 템플릿 문자열이다. 백틱·`${}` 이스케이프 문제와 `src/data/posts.ts` 수동 등록 때문에 에디터가 자동으로 만들기 어렵다.
- 블로그 페이지(`blog/page.tsx`, `blog/[id]/page.tsx`)는 모두 클라이언트 컴포넌트이고, 정적 배열 `blogPosts`를 직접 import한다. 언어(locale)는 클라이언트 `LanguageContext`가 정한다.

### Decision (1안: 서버 로더 + props 주입)

- **저장 형식**: `src/content/posts/{id}-{slug}/ko.md`(필수)와 `en.md`(선택) + frontmatter. 기존 글 2개(`001`, `002`)도 변환한다.
- **로더**: 서버 전용 `src/lib/posts.ts`가 `fs`와 `gray-matter`로 md를 읽어 `BlogPost[]`(날짜 내림차순)를 반환한다. 기존 `BlogPost` 타입과 `getLocalizedPost`는 그대로 쓴다. `src/data/posts.ts`의 수동 import 배열은 없앤다.
- **블로그 페이지**: `blog/page.tsx`와 `blog/[id]/page.tsx`를 서버 컴포넌트로 바꾼다. 기존 UI는 `BlogListClient`, `BlogPostClient`로 옮기고 `posts`를 props로 받는다. `generateStaticParams`로 정적 생성한다.
- **인증**: Auth.js(next-auth) GitHub Provider를 쓴다. `signIn` 콜백에서 GitHub login이 `HyeryongChoi`일 때만 허용한다. 사용자 OAuth access token은 서버 측 JWT 세션에만 두고 클라이언트에 내보내지 않는다.
- **에디터 API**: `/api/editor/*` Route Handler에서 사용자 토큰으로 Octokit을 호출한다. 모든 핸들러는 세션과 계정을 확인한다.
- **발행**: Git Data API로 이미지 blob, 글 blob, tree, commit을 만든 뒤 `main` ref를 갱신한다. **발행 1번 = 커밋 1개**다. `baseSha`가 `main`의 최신 커밋과 다르면 409를 반환한다. 커밋 전에 frontmatter를 검증한다.
- **에디터 UI**: `/editor` 전체 화면 페이지. 좌우 분할(마크다운 / 미리보기), KO/EN 탭, 미리보기는 기존 `MarkdownRenderer`를 그대로 쓴다. 레트로 Windows 스타일(제목 표시줄, 회색 툴바, 버튼)을 맞춘다.
- **임시저장**: `useEditorDraft` 훅이 localStorage에 자동 저장한다. 모든 읽기·쓰기는 try/catch로 감싼다. 발행에 성공하면 임시저장을 지운다.
- **이미지**: 브라우저에서 webp로 변환하고 리사이즈한다(최대 가로 1600px). `POST /api/editor/images`로 blob만 미리 만들고, 미리보기는 object URL로 보여준다. 발행 시 `public/images/`에 함께 커밋한다.

### Alternatives

- **2안 (빌드 전 코드 생성)**: 거부. `prebuild` 스크립트가 `posts.generated.ts`를 만드는 방식이다. 생성 파일과 dev watch 스크립트라는 관리 대상이 늘고, md를 고친 뒤 재생성을 잊으면 결과가 어긋난다.
- **3안 (Keystatic 등 기성 Git CMS)**: 거부. 미리보기가 실제 `MarkdownRenderer`와 다르고, 레트로 UI를 맞추기 어렵고, 커밋 단위를 제어할 수 없다. "미리보기 = 실제 렌더링", "레트로 UI", "커밋 1개로 발행" 세 요구사항과 충돌한다.
- **Server Actions**: 거부. API 계약을 표로 고정하고 mock으로 테스트하기에는 Route Handler가 더 명확하다.

### Consequences

- 👍 Next.js App Router 표준 구조가 된다. 블로그 페이지가 정적 HTML로 생성돼 SEO와 첫 로딩이 좋아진다.
- 👍 글이 순수 마크다운이라 로컬에서 직접 고치기도 쉽다. `posts.ts`를 수동으로 등록할 필요가 없다.
- 👍 발행마다 커밋 1개가 생겨 git 기록이 깔끔하고 되돌리기 쉽다.
- 👎 **블로그 페이지 2개를 서버/클라이언트로 나누는 리팩터링**이 필요하다. 기존 동작(검색, 무한 스크롤, 페이지네이션, 이전/다음 글, 언어 전환) 회귀 확인이 필요하다.
- 👎 발행 후 반영까지 **1~2분** 걸린다(Vercel 빌드). 빌드가 실패하면 반영되지 않는다(기존 배포는 유지된다).
- 👎 frontmatter 형식이 틀린 md가 커밋되면 **빌드가 실패**할 수 있다. 그래서 발행 API에서 검증해야 한다.
- 👎 **보안 부담**: OAuth 토큰에 레포 쓰기 권한(`public_repo`, 비공개 레포면 `repo`)이 있다. `AUTH_SECRET` 관리와 API별 권한 확인이 필수다.
- 👎 의존성이 늘어난다: `next-auth`, `@octokit/rest`, `gray-matter`.
- 👎 두 곳에서 동시에 수정하면 409 충돌이 난다. 자동 병합은 하지 않는다.

## 4. API 계약 초안

모든 엔드포인트는 로그인 세션이 필요하다. 세션이 없으면 `401`, `HyeryongChoi`가 아니면 `403`을 반환한다.

| 엔드포인트 | 요청 | 응답 | 비고 |
|---|---|---|---|
| `GET /api/editor/posts` | - | `{ posts: [{ id, slug, title, date, hasEn }] }` | 빌드 결과물이 아니라 GitHub `main`의 최신 상태를 읽음 |
| `GET /api/editor/posts/:id` | - | `{ id, slug, ko: { frontmatter, body }, en: { frontmatter, body } \| null, headSha }` | `headSha`는 충돌 감지용 |
| `POST /api/editor/images` | `{ filename, base64 }` (webp, 클라이언트에서 압축) | `{ blobSha, path: "/images/{name}.webp" }` | GitHub blob만 만들고 아직 커밋하지 않음 |
| `POST /api/editor/publish` | `{ id?, slug, ko: { frontmatter, body }, en?: { frontmatter, body }, images: [{ path, blobSha }], baseSha? }` | `{ commitSha, id, url }` | 글과 이미지를 커밋 1개로 묶음. `id`가 없으면 새 글로 번호를 자동 부여 |

에러 응답:

| 상태 | 본문 | 조건 |
|---|---|---|
| `400` | `{ error: "invalid_frontmatter", fields: [...] }` | 필수 frontmatter 누락·형식 오류 |
| `401` / `403` | `{ error: "unauthorized" \| "forbidden" }` | 미로그인 / 허용되지 않은 계정 |
| `409` | `{ error: "conflict", headSha }` | 열어둔 뒤 `main`이 바뀌어 `baseSha`와 다를 때 |

이미지를 따로 미리 올리는 이유: Vercel 함수의 요청 크기 제한(4.5MB) 때문에 발행 요청에 이미지를 한꺼번에 담을 수 없다.

### frontmatter 스키마

```yaml
---
title: 글 제목          # 필수
excerpt: 목록용 짧은 설명 # 필수
tags: [REACT, WEBVIEW]  # 필수 (빈 배열 허용)
date: 2026.11.08        # ko.md 필수, 기본값은 발행일
thumbnail: /images/x.webp # 선택. 없으면 본문 첫 이미지 사용
---
```

- `id`와 `slug`는 폴더 이름(`{id}-{slug}`)에서 읽는다.
- `en.md`의 `date`, `thumbnail`은 생략하고 `ko.md` 값을 따른다.

## 5. Out of Scope

첫 버전에서는 다음을 만들지 않는다.

1. AI 번역 등 유료 API를 쓰는 기능
2. 모바일 레이아웃과 터치 대응 (데스크톱 전용)
3. 서버 임시저장(`draft: true` 커밋)과 여러 기기 간 임시저장 동기화
4. 글 삭제
5. 썸네일 별도 업로드 UI (본문 첫 이미지를 자동 사용하는 기존 로직 유지)
6. 브랜치·PR·미리보기 배포를 거치는 발행 흐름 (`main` 직접 커밋만)
7. 예약 발행, 발행 상태 폴링, 배포 완료 알림
8. 여러 사용자, 권한 등급, 관리자 화면
9. WYSIWYG 편집, 서식 툴바 버튼 (마크다운 직접 입력만)
10. 이미지 관리: 갤러리, 쓰지 않는 이미지 정리, 이미 올린 이미지 교체
11. URL 구조 변경 (`/blog/{id}` 유지, slug는 URL에 쓰지 않음)
12. `MarkdownRenderer` 기능 추가나 변경 (지원 문법은 지금 그대로)
13. 충돌 시 자동 병합 (409로 알려주기만 함)
14. 블로그 목록, 검색, 페이지네이션 UI 변경 (서버/클라이언트 분리 외 동작 변경 없음)
15. RSS, sitemap, 태그 관리 페이지

## 6. 용어 정의

| 용어 | 뜻 |
|---|---|
| 글(Post) | `src/content/posts/{id}-{slug}/` 폴더 하나. `ko.md`는 필수, `en.md`는 선택 |
| id | 3자리 일련번호(`003`). URL `/blog/003`에 쓰임. 기존 링크 유지를 위해 그대로 씀 |
| slug | 폴더 이름용 영문 식별자. URL에는 쓰지 않음 |
| frontmatter | md 파일 맨 위의 YAML 메타데이터 (`title`, `excerpt`, `tags`, `date`, `thumbnail?`) |
| 발행(Publish) | 글과 이미지를 `main`에 커밋 1개로 올리는 동작 |
| 임시저장(Draft) | 브라우저 localStorage 자동 저장. 서버에는 저장하지 않음 |
| 미리보기(Preview) | 기존 `MarkdownRenderer`로 그린 화면. 실제 블로그 렌더링과 동일 |
| 로더(Loader) | 빌드 시 서버에서 md를 읽어 `BlogPost[]`를 만드는 `src/lib/posts.ts` |
| 충돌(Conflict) | 에디터에서 글을 연 뒤 `main`이 바뀐 상태. 발행 시 409로 알림 |
