'use client';

import { ReactNode } from 'react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // 간단한 마크다운 파싱 함수
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: ReactNode[] = [];
    let inCodeBlock = false;
    let codeContent: string[] = [];
    let codeLanguage = '';

    lines.forEach((line, index) => {
      // 코드 블록 시작/끝
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.slice(3).trim();
          codeContent = [];
        } else {
          inCodeBlock = false;
          elements.push(
            <div key={`code-${index}`} className="my-6 border-2 border-crt-amber bg-black bg-opacity-50 p-4 overflow-x-auto">
              {codeLanguage && (
                <div className="text-sm font-retro text-crt-amber mb-2">
                  LANG: {codeLanguage.toUpperCase()}
                </div>
              )}
              <pre className="font-retro text-lg text-crt-green">
                {codeContent.join('\n')}
              </pre>
            </div>
          );
        }
        return;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return;
      }

      // 헤딩
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-3xl font-retro text-crt-cyan text-glow mt-8 mb-4">
            &gt; {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="text-4xl font-retro text-crt-amber text-glow mt-10 mb-6">
            &gt;&gt; {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-5xl font-pixel text-crt-green text-glow mt-12 mb-8">
            {line.slice(2)}
          </h1>
        );
      }
      // 블록쿼트
      else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={index} className="border-l-4 border-crt-cyan pl-6 my-6 text-2xl font-retro text-crt-cyan italic">
            {line.slice(2)}
          </blockquote>
        );
      }
      // 리스트
      else if (line.startsWith('- ')) {
        elements.push(
          <li key={index} className="text-2xl font-retro text-crt-green ml-8 my-2">
            <span className="text-crt-amber">▸</span> {line.slice(2)}
          </li>
        );
      }
      // 일반 텍스트
      else if (line.trim()) {
        elements.push(
          <p key={index} className="text-2xl font-retro text-crt-green leading-relaxed my-4">
            {line}
          </p>
        );
      }
      // 빈 줄
      else {
        elements.push(<div key={index} className="h-4" />);
      }
    });

    return elements;
  };

  return (
    <div className="prose-retro">
      {parseMarkdown(content)}
    </div>
  );
}
