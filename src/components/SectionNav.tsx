"use client";

import { useEffect, useRef, useState } from "react";
import s from "./Shell.module.css";

// A page's table of contents, pinned under the menu bar: one link per chapter, the one on screen highlighted.
// `items` are [id, text] pairs (the dictionaries type them as string[][])
export function SectionNav({ label, items }: { label: string; items: string[][] }) {
  const [current, setCurrent] = useState(items[0]?.[0] ?? "");
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    const targets = items.map(([id]) => document.getElementById(id ?? "")).filter((el): el is HTMLElement => !!el);
    if (!targets.length) return;
    // the chapter whose top is nearest above the middle of the screen is the current one
    const pick = () => {
      const line = window.innerHeight * 0.4;
      let best = targets[0]!;
      for (const el of targets) if (el.getBoundingClientRect().top <= line) best = el;
      setCurrent(best.id);
    };
    let raf = 0;
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(() => ((raf = 0), pick()));
    };
    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  const mounted = useRef(false);
  useEffect(() => {
    // on narrow screens the list scrolls sideways: keep the current link in view, by scrolling the list itself
    // (never scrollIntoView, which would move the page and the keyboard's starting point)
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const list = nav.current?.querySelector("ul");
    const link = nav.current?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!list || !link || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2, behavior: "smooth" });
  }, [current]);

  return (
    <nav className={s.subnav} aria-label={label} ref={nav}>
      <ul>
        {items.map(([id = "", text = ""]) => (
          <li key={id}>
            <a href={`#${id}`} aria-current={current === id ? "true" : undefined}>
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
