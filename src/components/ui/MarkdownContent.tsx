"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { normalizeMarkdown } from "@/lib/markdown";

type Props = {
  content: string;
  className?: string;
};

export function MarkdownContent({ content, className = "" }: Props) {
  const normalized = normalizeMarkdown(content);

  return (
    <div
      className={`markdown-content min-w-0 max-w-full text-[15px] leading-7 text-[var(--muted)] md:text-base md:leading-7 ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-[var(--ink)]">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="mb-3 list-disc space-y-2 pl-5 last:mb-0">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 list-decimal space-y-2 pl-5 last:mb-0">{children}</ol>
          ),
          li: ({ children }) => <li className="pl-0.5">{children}</li>,
          h3: ({ children }) => (
            <h3 className="mb-2 text-base font-medium text-[var(--ink)] md:text-lg">{children}</h3>
          ),
          pre: ({ children }) => (
            <div className="mb-3 whitespace-pre-wrap font-[family-name:var(--font-body)] text-[15px] leading-7 last:mb-0 md:text-base">
              {children}
            </div>
          ),
          code: ({ children, className: codeClassName }) => {
            if (codeClassName) {
              return (
                <code className="whitespace-pre-wrap font-[family-name:var(--font-body)] text-[15px] leading-7 md:text-base">
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded bg-[var(--sand)] px-1 py-0.5 text-[0.92em] text-[var(--ink)]">
                {children}
              </code>
            );
          },
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}
