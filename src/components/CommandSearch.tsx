"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Dict, Locale } from "@/i18n";
import { search, type Hit } from "@/lib/searchIndex";
import { Mask } from "./Mask";
import s from "./Shell.module.css";

const OPEN = "gf-search-open";

/** The loupe in the header: it asks the search to open. */
export function SearchButton({ label }: { label: string }) {
  return (
    <button type="button" className={s.barButton} aria-label={label} onClick={() => window.dispatchEvent(new Event(OPEN))}>
      <Mask name="search" />
    </button>
  );
}

// The index is a static file per language (app/[lang]/search.json): fetched once, the first time Search opens.
// null means it could not be read (offline, a failed response): the next opening tries again.
let loading: Promise<Hit[] | null> | null = null;
const loadIndex = (lang: Locale) =>
  (loading ??= fetch(`/${lang}/search.json`)
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<Hit[]>;
    })
    .catch(() => {
      loading = null;
      return null;
    }));

// Grassfield's Search, for the site: ⌘K (or Ctrl+K, or the loupe) opens it over the page; a few letters reach any
// page, FAQ answer or captured scene. A native <dialog>, so focus stays inside and Escape closes it.
export function CommandSearch({ t, lang }: { t: Dict["shell"]; lang: Locale }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [index, setIndex] = useState<Hit[] | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const listId = useId();
  const hits = index ? search(index, q) : [];
  const load = () =>
    loadIndex(lang).then((idx) => {
      setIndex(idx);
      setStatus(idx ? "ready" : "failed");
      return idx;
    });

  useEffect(() => {
    const open = () => {
      const d = dialog.current;
      if (!d || d.open) return;
      setQ("");
      setActive(0);
      d.showModal();
      input.current?.focus();
      if (!index) {
        setStatus("loading");
        void load();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else open();
      }
    };
    window.addEventListener(OPEN, open);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN, open);
      window.removeEventListener("keydown", onKey);
    };
  });

  const go = (hit: Hit) => {
    dialog.current?.close();
    window.location.assign(hit.href);
  };
  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(hits.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      const hit = hits[active];
      if (hit) go(hit);
      // typed before the index arrived: wait for it, then open the best match for what was typed
      else if (!index) {
        const typed = q;
        void load().then((idx) => {
          const first = idx && search(idx, typed)[0];
          if (first) go(first);
        });
      }
    } else if (e.key === "Escape") {
      // a search input clears itself on Escape before the dialog sees the key: close the dialog ourselves
      e.preventDefault();
      dialog.current?.close();
    }
  };

  const groups = (["pages", "faq", "tour"] as const).map((g) => ({ g, items: hits.map((h, i) => ({ h, i })).filter((x) => x.h.group === g) })).filter((x) => x.items.length);

  return (
    <dialog ref={dialog} className={s.search} aria-label={t.search} onClick={(e) => e.target === dialog.current && dialog.current.close()}>
      <div className={s.searchPanel}>
        <div className={s.searchField}>
          <Mask name="search" />
          <input
            ref={input}
            id="site-search"
            type="search"
            placeholder={t.searchPlaceholder}
            autoComplete="off"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={hits[active] ? `${listId}-${active}` : undefined}
            aria-autocomplete="list"
          />
          <kbd>esc</kbd>
        </div>
        <div className={s.searchResults} id={listId} role="listbox">
          {groups.map(({ g, items }) => (
            <div key={g} role="group" aria-label={t.groups[g]}>
              <div className={s.groupLabel}>{t.groups[g]}</div>
              {items.map(({ h, i }) => (
                <a
                  key={h.href + h.title}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  href={h.href}
                  className={s.hit}
                  data-active={i === active || undefined}
                  onMouseEnter={() => setActive(i)}
                  onClick={(e) => {
                    e.preventDefault();
                    go(h);
                  }}
                >
                  <span className={s.hitIcon}>
                    <Mask name={h.icon} />
                  </span>
                  <span className={s.hitText}>
                    <b>{h.title}</b>
                    {h.sub && <small>{h.sub}</small>}
                  </span>
                </a>
              ))}
            </div>
          ))}
          {!hits.length && (
            <p className={s.empty} role="status">
              {status === "loading" ? t.searchLoading : status === "failed" ? t.searchUnavailable : q ? `${t.noResults} « ${q} »` : ""}
            </p>
          )}
        </div>
        <p className={s.searchHint}>{t.searchHint}</p>
      </div>
    </dialog>
  );
}
