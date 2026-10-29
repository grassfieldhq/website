"use client";

import { useState } from "react";
import s from "./Download.module.css";

export function CopyButton({ text, label, done }: { text: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false);
  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard refused: select the command so the visitor can copy it
      const code = document.querySelector<HTMLElement>(`[data-cmd="${CSS.escape(text)}"]`);
      if (code) window.getSelection()?.selectAllChildren(code);
    }
  };
  return (
    <button type="button" className={s.copy} onClick={onClick} aria-live="polite">
      {copied ? done : label}
    </button>
  );
}
