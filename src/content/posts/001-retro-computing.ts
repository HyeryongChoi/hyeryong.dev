import type { BlogPost } from "@/data/blog.types";

export const post: BlogPost = {
  id: "001",
  title: "RETRO_COMPUTING.MD",
  date: "2026.02.06",
  excerpt: "레트로 컴퓨팅의 매력과 웹 디자인에 적용하기",
  tags: ["DESIGN", "RETRO", "CSS"],
  content: `# 레트로 컴퓨팅의 매력

## 서론

1980-90년대 컴퓨터의 UI/UX는 지금 보면 투박하지만,
그 시대만의 독특한 매력이 있습니다.

## CRT 모니터의 특징

- 스캔라인 효과
- 글로우 효과
- 모노크롬 또는 제한된 컬러 팔레트
- 픽셀 폰트

## 웹에 적용하기

CSS를 활용하면 이런 레트로한 느낌을 쉽게 재현할 수 있습니다.

\`\`\`css
.crt-screen::before {
  content: '';
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.15) 0px,
    rgba(0, 0, 0, 0.15) 1px,
    transparent 1px,
    transparent 2px
  );
}
\`\`\`

## 결론

레트로 디자인은 단순한 향수를 넘어,
미니멀하고 집중력을 높이는 UI를 제공합니다.

> SYSTEM: POST_END
`,
};
