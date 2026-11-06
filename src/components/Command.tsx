import { CopyButton } from "./CopyButton";
import s from "./Download.module.css";

// A terminal command to copy: one line, or several run in order (copied together, one per line).
export function Command({ cmd, copy, copied }: { cmd: string | readonly string[]; copy: string; copied: string }) {
  const lines = typeof cmd === "string" ? [cmd] : cmd;
  const text = lines.join("\n");
  return (
    <div className={s.cmd}>
      <code data-cmd={text} tabIndex={0}>
        {lines.map((l) => (
          <span key={l} className={s.line}>
            <span aria-hidden="true">$ </span>
            {l}
          </span>
        ))}
      </code>
      <CopyButton text={text} label={copy} done={copied} />
    </div>
  );
}
