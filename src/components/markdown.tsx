import type { ReactNode } from "react";

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={`${keyPrefix}-${i}`} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={`${keyPrefix}-${i}`} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

export function renderMarkdown(text: string): ReactNode {
  const lines = text.split(/\n/);
  return lines.map((line, i) => {
    if (line.trim() === "") return <div key={i} className="h-2" />;
    return (
      <p key={i} className="leading-relaxed">
        {renderInline(line, `line-${i}`)}
      </p>
    );
  });
}