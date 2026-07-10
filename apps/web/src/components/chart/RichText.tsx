/**
 * Minimal rich text for authored interpretations: paragraphs split on
 * blank lines, **bold** becomes <strong>. No HTML injection — everything
 * renders as React text nodes.
 */
export function RichText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  return (
    <>
      {paragraphs.map((para, i) => (
        <p key={i} className={className}>
          {para.split(/(\*\*[^*]+\*\*)/g).map((chunk, j) =>
            chunk.startsWith("**") && chunk.endsWith("**") ? (
              <strong key={j} className="font-semibold text-ink-900">
                {chunk.slice(2, -2)}
              </strong>
            ) : (
              chunk
            )
          )}
        </p>
      ))}
    </>
  );
}
