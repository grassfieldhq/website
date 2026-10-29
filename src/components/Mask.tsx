import type { CSSProperties } from "react";
import { icon } from "@/lib/site";

// A Grassfield symbolic icon drawn in currentColor.
export function Mask({ name, className = "", style }: { name: string; className?: string; style?: CSSProperties }) {
  return (
    <i
      className={`mask ${className}`}
      aria-hidden="true"
      style={{ ["--m" as string]: `url(${icon(name)})`, ...style } as CSSProperties}
    />
  );
}
