// The Grassfield signature: a headline's final full stop becomes a small rising sun. The last word and the sun stay
// on one line, so a narrow screen never leaves the sun alone at the start of a line.
export function Dot({ children = "" }: { children?: string }) {
  if (!children.endsWith(".") || children.endsWith("..")) return <>{children}</>;
  const text = children.slice(0, -1);
  const cut = text.lastIndexOf(" ") + 1;
  return (
    <>
      {text.slice(0, cut)}
      <span className="nowrap">
        {text.slice(cut)}
        <span className="sun-dot" aria-hidden="true" />
      </span>
    </>
  );
}
