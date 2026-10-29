// The Grassfield signature: a headline's final full stop becomes a small rising sun.
export function Dot({ children = "" }: { children?: string }) {
  if (!children.endsWith(".") || children.endsWith("..")) return <>{children}</>;
  return (
    <>
      {children.slice(0, -1)}
      <span className="sun-dot" aria-hidden="true" />
    </>
  );
}
