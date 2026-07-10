import ReactMarkdown from "react-markdown";

type Props = {
  content: string;
  className?: string;
};

export function MarkdownContent({ content, className = "" }: Props) {
  return (
    <div className={`markdown-content leading-relaxed text-[var(--muted)] ${className}`}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-medium text-[var(--ink)]">{children}</strong>
          ),
          em: ({ children }) => <em>{children}</em>,
          ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
          ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          h3: ({ children }) => (
            <h3 className="mb-2 font-medium text-[var(--ink)]">{children}</h3>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
