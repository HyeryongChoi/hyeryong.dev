"use client";

import { ReactNode } from "react";

interface MarkdownRendererProps {
  content: string;
}

/** 언어별 Velog 스타일 테마 (배지 배경, 테두리) */
const CODE_LANG_THEMES: Record<string, { badge: string; border: string }> = {
  javascript: {
    badge: "bg-amber-400/20 text-amber-600 border-amber-400/40",
    border: "border-l-amber-500",
  },
  js: {
    badge: "bg-amber-400/20 text-amber-600 border-amber-400/40",
    border: "border-l-amber-500",
  },
  typescript: {
    badge: "bg-blue-400/20 text-blue-600 border-blue-400/40",
    border: "border-l-blue-500",
  },
  ts: {
    badge: "bg-blue-400/20 text-blue-600 border-blue-400/40",
    border: "border-l-blue-500",
  },
  css: {
    badge: "bg-purple-400/20 text-purple-600 border-purple-400/40",
    border: "border-l-purple-500",
  },
  json: {
    badge: "bg-emerald-400/20 text-emerald-600 border-emerald-400/40",
    border: "border-l-emerald-500",
  },
  html: {
    badge: "bg-orange-400/20 text-orange-600 border-orange-400/40",
    border: "border-l-orange-500",
  },
  python: {
    badge: "bg-yellow-400/20 text-yellow-700 border-yellow-400/40",
    border: "border-l-yellow-500",
  },
  py: {
    badge: "bg-yellow-400/20 text-yellow-700 border-yellow-400/40",
    border: "border-l-yellow-500",
  },
  shell: {
    badge: "bg-gray-400/20 text-gray-600 border-gray-400/40",
    border: "border-l-gray-500",
  },
  bash: {
    badge: "bg-gray-400/20 text-gray-600 border-gray-400/40",
    border: "border-l-gray-500",
  },
  default: {
    badge: "bg-slate-400/20 text-slate-600 border-slate-400/40",
    border: "border-l-slate-500",
  },
};

function getCodeTheme(lang: string) {
  const key = lang.toLowerCase().trim() || "default";
  return CODE_LANG_THEMES[key] ?? CODE_LANG_THEMES.default;
}

const JS_KEYWORDS = new Set([
  "const",
  "let",
  "var",
  "if",
  "else",
  "for",
  "while",
  "try",
  "catch",
  "async",
  "await",
  "return",
  "function",
  "class",
  "extends",
  "import",
  "export",
  "from",
  "default",
  "new",
  "this",
  "typeof",
  "instanceof",
  "in",
  "of",
  "true",
  "false",
  "null",
  "undefined",
]);

const TOKEN_STYLES: Record<string, React.CSSProperties> = {
  comment: { color: "#6a737d" },
  string: { color: "#22863a" },
  keyword: { color: "#6f42c1" },
  number: { color: "#005cc5" },
  plain: {},
};

/** 한 줄 코드에 구문 강조 적용 */
function highlightLine(line: string): ReactNode {
  const regex =
    /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|\b[\w]+\b|\b\d+\.?\d*\b|.)/g;
  const parts: {
    text: string;
    type: "comment" | "string" | "keyword" | "number" | "plain";
  }[] = [];
  let m;

  while ((m = regex.exec(line)) !== null) {
    const t = m[0];
    if (t.startsWith("//") || t.startsWith("/*")) {
      parts.push({ text: t, type: "comment" });
    } else if (
      (t.startsWith('"') || t.startsWith("'") || t.startsWith("`")) &&
      t.length > 1
    ) {
      parts.push({ text: t, type: "string" });
    } else if (/^\d/.test(t)) {
      parts.push({ text: t, type: "number" });
    } else if (/^\w+$/.test(t) && JS_KEYWORDS.has(t)) {
      parts.push({ text: t, type: "keyword" });
    } else {
      parts.push({ text: t, type: "plain" });
    }
  }

  return (
    <>
      {parts.map((p, i) => (
        <span key={i} style={TOKEN_STYLES[p.type]}>
          {p.text}
        </span>
      ))}
    </>
  );
}

/** 인라인 마크다운(코드, 볼드, 링크) 파싱 */
function parseInline(text: string): ReactNode[] {
  const result: ReactNode[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // 인라인 코드 `...`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    // 볼드 **...**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    // 링크 [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);

    if (codeMatch) {
      result.push(
        <code
          key={`code-${result.length}`}
          className="prose-retro-inline-code font-mono"
          style={{
            backgroundColor: "#f0f0f0",
            color: "#24292e",
            border: "1px solid #e1e4e8",
            padding: "2px",
            borderRadius: "4px",
          }}
        >
          {codeMatch[1]}
        </code>,
      );
      remaining = remaining.slice(codeMatch[0].length);
    } else if (boldMatch) {
      result.push(
        <strong
          key={`bold-${result.length}`}
          className="font-bold text-crt-amber"
        >
          {boldMatch[1]}
        </strong>,
      );
      remaining = remaining.slice(boldMatch[0].length);
    } else if (linkMatch) {
      result.push(
        <a
          key={`link-${result.length}`}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-80"
          style={{ color: "#008080", textDecoration: "none" }}
        >
          {linkMatch[1]}
        </a>,
      );
      remaining = remaining.slice(linkMatch[0].length);
    } else {
      const nextSpecial = remaining.search(/[`*[]/);
      const chunk =
        nextSpecial >= 0 ? remaining.slice(0, nextSpecial) : remaining;
      if (chunk) result.push(chunk);
      remaining = nextSpecial >= 0 ? remaining.slice(nextSpecial) : "";
    }
  }

  return result;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const parseMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: ReactNode[] = [];
    let inCodeBlock = false;
    let codeContent: string[] = [];
    let codeLanguage = "";
    const listBuffer: { key: number; content: ReactNode }[] = [];

    const flushList = () => {
      if (listBuffer.length > 0) {
        elements.push(
          <ul
            key={`ul-${listBuffer[0].key}`}
            className="prose-retro-list my-4"
          >
            {listBuffer.map((item) => (
              <li
                key={item.key}
                className="font-retro text-crt-green my-2"
              >
                {item.content}
              </li>
            ))}
          </ul>,
        );
        listBuffer.length = 0;
      }
    };

    lines.forEach((line, index) => {
      // 코드 블록 시작/끝
      if (line.startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.slice(3).trim();
          codeContent = [];
        } else {
          inCodeBlock = false;
          const theme = getCodeTheme(codeLanguage);
          const codeText = codeContent.join("\n");
          const codeLines = codeText.split("\n");

          elements.push(
            <div
              key={`code-${index}`}
              className="my-6 overflow-hidden rounded-lg border border-gray-200 shadow-sm"
            >
              <div
                className="flex items-center gap-2 border-b border-gray-200 px-4 py-2.5"
                style={{ backgroundColor: "#f5f6f8" }}
              >
                <span
                  className={`rounded-md border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${theme.badge}`}
                >
                  {codeLanguage || "plain"}
                </span>
              </div>
              <pre
                className="overflow-x-auto font-mono text-sm leading-relaxed text-gray-800"
                style={{
                  backgroundColor: "#fbfcfd",
                  margin: 0,
                  padding: "1rem",
                }}
              >
                <code>
                  {codeLines.map((line, i) => (
                    <div key={i} style={{ minHeight: "1.25em" }}>
                      {highlightLine(line)}
                    </div>
                  ))}
                </code>
              </pre>
            </div>,
          );
        }
        return;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return;
      }

      // 헤딩
      if (line.startsWith("### ")) {
        flushList();
        elements.push(
          <h3
            key={index}
            className="font-retro text-crt-cyan text-glow"
          >
            &gt; {parseInline(line.slice(4))}
          </h3>,
        );
      } else if (line.startsWith("## ")) {
        flushList();
        elements.push(
          <h2
            key={index}
            className="font-retro text-crt-amber text-glow"
          >
            &gt;&gt; {parseInline(line.slice(3))}
          </h2>,
        );
      } else if (line.startsWith("# ")) {
        flushList();
        elements.push(
          <h1
            key={index}
            className="text-5xl font-pixel text-crt-green text-glow mt-12 mb-8"
          >
            {parseInline(line.slice(2))}
          </h1>,
        );
      }
      // 블록쿼트
      else if (line.startsWith("> ")) {
        flushList();
        elements.push(
          <blockquote
            key={index}
            className="border-l-4 border-crt-cyan pl-6 my-6 font-retro text-crt-cyan italic"
          >
            {parseInline(line.slice(2))}
          </blockquote>,
        );
      }
      // 리스트
      else if (line.startsWith("- ")) {
        listBuffer.push({
          key: index,
          content: <>{parseInline(line.slice(2))}</>,
        });
      }
      // 일반 텍스트
      else if (line.trim()) {
        flushList();
        elements.push(
          <p
            key={index}
            className="text-2xl font-retro text-crt-green leading-relaxed my-4"
          >
            {parseInline(line)}
          </p>,
        );
      }
      // 빈 줄
      else {
        flushList();
        elements.push(<div key={index} className="h-4" />);
      }
    });

    flushList();
    return elements;
  };

  return <div className="prose-retro">{parseMarkdown(content)}</div>;
}
