import { CopyButton } from "./CopyButton";
import s from "./Download.module.css";

export function Command({ cmd, copy, copied }: { cmd: string; copy: string; copied: string }) {
  return (
    <div className={s.cmd}>
      <code data-cmd={cmd} tabIndex={0}>
        <span aria-hidden="true">$ </span>
        {cmd}
      </code>
      <CopyButton text={cmd} label={copy} done={copied} />
    </div>
  );
}
