"use client";

import { useEffect, useRef, useState } from "react";
import s from "./Lightbox.module.css";

type Item = { href: string; avif: string; alt: string; title: string; caption: string; w: number; h: number };
type T = { close: string; prev: string; next: string; of: string };

const read = (a: HTMLAnchorElement): Item => ({
  href: a.getAttribute("href") ?? "",
  avif: a.dataset.avif ?? "",
  alt: a.querySelector("img")?.alt ?? "",
  title: a.dataset.title ?? "",
  caption: a.dataset.caption ?? "",
  w: Number(a.dataset.w) || 16,
  h: Number(a.dataset.h) || 10,
});

// The visible gallery links, in page order (a light/dark variant hidden by the site's appearance is skipped).
const links = () => [...document.querySelectorAll<HTMLAnchorElement>("a[data-lightbox]")].filter((a) => a.getClientRects().length > 0);

/**
 * Progressive enhancement of the gallery links (`a[data-lightbox]`, see Frame): without JavaScript they open the
 * full-size image; with it, a modal <dialog> shows it at the size of the window, with the caption, previous and
 * next (buttons, ← →), and Escape, the close button or a click outside to close. Focus returns to the link.
 */
export function Lightbox({ t }: { t: T }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState<{ items: Item[]; i: number } | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.<HTMLAnchorElement>("a[data-lightbox]");
      if (!a) return;
      const all = links();
      const i = all.indexOf(a);
      if (i < 0) return;
      e.preventDefault();
      setState({ items: all.map(read), i });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    const d = dialog.current;
    if (state && d && !d.open) d.showModal();
  }, [state]);

  const go = (step: number) => setState((st) => st && { ...st, i: (st.i + step + st.items.length) % st.items.length });
  const item = state?.items[state.i];

  return (
    <dialog
      ref={dialog}
      className={s.box}
      aria-label={item?.title}
      onClose={() => setState(null)}
      onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
    >
      {state && item && (
        <div className={s.inner}>
          <picture key={item.href}>
            {item.avif && <source type="image/avif" srcSet={item.avif} sizes="100vw" />}
            <img src={item.href} alt={item.alt} width={item.w} height={item.h} className={s.img} />
          </picture>
          <div className={s.bar}>
            <p aria-live="polite">
              <b>{item.title}</b> {item.caption}{" "}
              <span className={s.count}>
                {state.i + 1} {t.of} {state.items.length}
              </span>
            </p>
            <div className={s.buttons}>
              {state.items.length > 1 && (
                <>
                  <button type="button" onClick={() => go(-1)} aria-label={t.prev}>
                    ‹
                  </button>
                  <button type="button" onClick={() => go(1)} aria-label={t.next}>
                    ›
                  </button>
                </>
              )}
              <button type="button" onClick={() => dialog.current?.close()} aria-label={t.close}>
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
