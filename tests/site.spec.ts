import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { shotData } from "../src/lib/shots.generated";

const langs = ["fr", "en"] as const;

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("requestfailed", (r) => errors.push(`request failed: ${r.url()}`));
  return errors;
}

async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 40));
    }
  });
}

// Every rendered image loaded. A fast scroll on a busy machine can step past a lazy image between two intersection
// checks, so the browser never requests it: bring each image still loading into view. (The capture of the other
// appearance is display:none, never rendered, never loaded: it is not waited for.)
async function loadRendered(page: Page) {
  await expect
    .poll(
      () =>
        page.evaluate(async () => {
          const pending = [...document.images].filter((i) => i.getClientRects().length > 0 && !i.complete);
          for (const i of pending) {
            i.scrollIntoView({ block: "center", behavior: "instant" });
            await new Promise((r) => setTimeout(r, 60));
          }
          return pending.length;
        }),
      { timeout: 25_000 },
    )
    .toBe(0);
}

// React has attached its handlers. "networkidle" was the signal before, but it can stall for 20 s and more on a busy
// machine even with no request pending (seen on origin/main too, ten pages in parallel).
async function hydrated(page: Page) {
  await page.waitForFunction(() => {
    const el = document.querySelector("header button");
    return !!el && Object.keys(el).some((k) => k.startsWith("__react"));
  });
}

const pages = [
  { path: "", h1: { fr: "Grassfield", en: "Grassfield" } },
  { path: "desktop/", h1: { fr: "Le bureau", en: "The desktop" } },
  { path: "apps/", h1: { fr: "Des apps qui se sentent chez elles", en: "Apps that feel at home" } },
  { path: "security/", h1: { fr: "Sûr, par conception", en: "Secure by design" } },
  { path: "os/", h1: { fr: "Grassfield OS", en: "Grassfield OS" } },
  { path: "tour/", h1: { fr: "Grassfield, en vrai", en: "Grassfield, for real" } },
  { path: "download/", h1: { fr: "Grassfield Desktop", en: "Grassfield Desktop" } },
  { path: "faq/", h1: { fr: "Bon à savoir", en: "Good to know" } },
  { path: "legal/", h1: { fr: "Mentions légales et confidentialité", en: "Legal and privacy" } },
];

for (const lang of langs) {
  for (const { path, h1 } of pages) {
  test.describe(`${lang} /${path}`, () => {
    test("renders without errors, overflow or broken images", async ({ page }) => {
      const errors = collectErrors(page);
      await page.goto(`/${lang}/${path}`);
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1[lang]);
      await scrollThrough(page);
      await loadRendered(page);
      const broken = await page.$$eval("img", (imgs) => imgs.filter((i) => i.getClientRects().length > 0 && (!i.complete || i.naturalWidth === 0)).map((i) => i.src));
      expect(broken).toEqual([]);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      expect(errors).toEqual([]);
    });

    test("has no serious accessibility violations", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/${lang}/${path}`);
      const { violations } = await new AxeBuilder({ page: page as unknown as ConstructorParameters<typeof AxeBuilder>[0]["page"] }).analyze();
      const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    });

    test("links to the same page in the other language", async ({ page }) => {
      const other = lang === "fr" ? "en" : "fr";
      await page.goto(`/${lang}/${path}`);
      await page.locator(`footer a[hreflang="${other}"]`).click();
      await expect(page).toHaveURL(new RegExp(`/${other}/${path}$`));
    });
  });
  }
}

test("root picks the visitor's language", async ({ browser }) => {
  for (const [locale, lang] of [["en-US", "en"], ["fr-FR", "fr"], ["de-DE", "fr"]] as const) {
    const ctx = await browser.newContext({ locale });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page).toHaveURL(new RegExp(`/${lang}/$`));
    await ctx.close();
  }
});

test("Overview scrubs from the desktop to the arranged windows", async ({ page }) => {
  await page.goto("/fr/desktop/");
  const stage = page.locator("#overview [data-step]");
  await expect(stage).toHaveAttribute("data-step", "0");
  const track = page.locator("#overview [data-step] >> xpath=..");
  const box = await track.evaluate((el) => ({ top: el.getBoundingClientRect().top + window.scrollY, h: (el as HTMLElement).offsetHeight }));
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), box.top + box.h);
  await expect(stage).toHaveAttribute("data-step", "2");
});

test("glass demo changes the accent", async ({ page }) => {
  await page.goto("/en/desktop/");
  const blue = page.getByRole("button", { name: "Blue" });
  await blue.click();
  await expect(blue).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#glass fieldset output").first()).toHaveText("Blue");
  await page.getByRole("slider", { name: "Transparency" }).fill("50");
  await expect(page.locator('output[for="glass-transparency"]')).toHaveText("50%");
});

test("theme toggle cycles system, light, dark and survives a reload without a flash", async ({ page }) => {
  await page.goto("/en/");
  const html = page.locator("html");
  const toggle = page.getByRole("button", { name: /^Site appearance/ });
  await expect(toggle).toHaveAccessibleName("Site appearance, Automatic");
  await expect(html).not.toHaveAttribute("data-theme", /.+/);
  await toggle.click();
  await expect(html).toHaveAttribute("data-theme", "light");
  await toggle.click();
  await expect(html).toHaveAttribute("data-theme", "dark");
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(await bg()).toBe("rgb(0, 0, 0)");
  // applied by the inline script before any React code runs
  await page.route("**/_next/static/chunks/**/*.js", (r) => r.abort());
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "dark");
  expect(await bg()).toBe("rgb(0, 0, 0)");
});

test("FAQ answers open and are described for search engines", async ({ page }) => {
  await page.goto("/fr/");
  const first = page.locator("#faq details").first();
  await first.locator("summary").click();
  await expect(first).toHaveAttribute("open", "");
  await expect(first.locator("p")).toBeVisible();
  const ld = await page.locator('#faq script[type="application/ld+json"]').textContent();
  const data = JSON.parse(ld ?? "{}");
  expect(data["@type"]).toBe("FAQPage");
  expect(data.mainEntity.length).toBe(await page.locator("#faq details").count());
});

test("download page states the version, requirements and an uninstall command to copy", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/fr/download/");
  await expect(page.getByRole("heading", { level: 2, name: /Version 1\.0\.0-rc1/ })).toBeVisible();
  await expect(page.getByText("x86_64").first()).toBeVisible();
  for (const pkg of ["grassfield-desktop", "grassfield-compositor", "grassfield-icons", "grassfield-store"]) {
    await expect(page.locator("code", { hasText: pkg }).first()).toBeVisible();
  }
  const copy = page.locator("main button", { hasText: /^Copi/ }).first();
  await expect(copy).toHaveText("Copier");
  await hydrated(page);
  await copy.click();
  await expect(copy).toHaveText("Copié");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "sudo pacman -Rns grassfield-desktop grassfield-compositor grassfield-icons",
  );
});

test("the Dock reaches every page and marks the current one", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/");
  const dock = page.getByRole("navigation", { name: "Dock" });
  for (const [name, path] of [["Desktop", "desktop/"], ["Apps", "apps/"], ["Security", "security/"], ["Grassfield OS", "os/"], ["Tour", "tour/"], ["Download", "download/"], ["FAQ", "faq/"], ["Home", ""]]) {
    await dock.getByRole("link", { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/en/${path}$`));
    await expect(dock.getByRole("link", { name, exact: true })).toHaveAttribute("aria-current", "page");
  }
});

test("the menu bar names the page and keeps the language link on the same page", async ({ page }) => {
  await page.goto("/fr/security/");
  const bar = page.getByRole("banner");
  await expect(bar.locator("b")).toHaveText("Sécurité");
  await bar.getByRole("link", { name: "EN" }).click();
  await expect(page).toHaveURL(/\/en\/security\/$/);
  await expect(page.getByRole("banner").locator("b")).toHaveText("Security");
});

test("⌘K search reaches a page, a FAQ answer and a captured scene", async ({ page }) => {
  await page.goto("/fr/");
  await hydrated(page);
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Rechercher" });
  await expect(dialog).toBeVisible();
  const input = dialog.getByRole("combobox");
  await expect(input).toBeFocused();
  await input.fill("sécu");
  await expect(dialog.getByRole("option").first()).toContainText("Sécurité");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/fr\/security\/$/);
  await hydrated(page);

  await page.getByRole("button", { name: /Rechercher sur le site/ }).click();
  await page.getByRole("combobox").fill("désinstaller");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/fr\/faq\/#faq-\d+$/);
  await expect(page.locator(":target")).toHaveCount(1);
  await hydrated(page);

  await page.keyboard.press("Control+k");
  await page.getByRole("combobox").fill("verrouillage");
  const option = page.getByRole("option").filter({ hasText: /verrouill/i }).first();
  await expect(option).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("home is an index: four teasers and a short FAQ that links to the full one", async ({ page }) => {
  await page.goto("/fr/");
  for (const href of ["desktop/", "apps/", "security/", "os/"]) await expect(page.locator(`main a[href="/fr/${href}"]`).first()).toBeVisible();
  await expect(page.locator("#faq details")).toHaveCount(4);
  await page.getByRole("link", { name: "Toutes les questions" }).click();
  await expect(page).toHaveURL(/\/fr\/faq\/$/);
  expect(await page.locator("#faq details").count()).toBeGreaterThan(4);
});

test("minimise demo tucks the window into the Dock and brings it back", async ({ page }) => {
  await page.goto("/en/desktop/");
  await hydrated(page);
  const proof = page.locator("#proof");
  await proof.getByRole("button", { name: "Minimise the window" }).click();
  await expect(proof.locator("[data-min]")).toHaveCount(1);
  await expect(proof.getByText("Click the window in the Dock.")).toBeVisible();
  await proof.getByRole("button", { name: "Reopen the Notes window" }).click();
  await expect(proof.locator("[data-min]")).toHaveCount(0);
});

test("the site loads nothing from other origins and sets no cookies", async ({ page, context }) => {
  const foreign: string[] = [];
  page.on("request", (r) => {
    const u = new URL(r.url());
    if (!["localhost", "127.0.0.1"].includes(u.hostname) && !u.protocol.startsWith("data")) foreign.push(r.url());
  });
  for (const path of ["/fr/", "/fr/desktop/", "/en/download/"]) {
    await page.goto(path);
    await scrollThrough(page);
    await page.waitForLoadState("networkidle");
  }
  expect(foreign).toEqual([]);
  expect(await context.cookies()).toEqual([]);
});

test("a content security policy runs each page's own inline scripts and refuses any other", async ({ page }) => {
  const errors = collectErrors(page);
  for (const path of ["/fr/", "/en/faq/", "/fr/tour/"]) {
    await page.goto(path);
    await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveCount(1);
    await expect(page.locator("html")).toHaveAttribute("data-theme-pref", "system"); // the inline theme script ran
    await hydrated(page);
  }
  await page.goto("/missing/");
  await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveCount(1);
  expect(errors.filter((e) => !e.includes("404"))).toEqual([]);
  const injected = await page.evaluate(() => {
    const s = document.createElement("script");
    s.textContent = "document.documentElement.dataset.injected = '1'";
    document.head.append(s);
    return document.documentElement.dataset.injected ?? null;
  });
  expect(injected).toBeNull();
});

test("presents Grassfield OS with the desktop as its first step", async ({ page }) => {
  await page.goto("/fr/os/");
  await expect(page).toHaveTitle(/Grassfield OS/);
  const road = page.locator("#roadmap");
  await expect(road.getByRole("heading", { level: 3, name: "Grassfield Desktop" })).toBeVisible();
  await expect(road.getByRole("heading", { level: 3, name: "Grassfield OS" })).toBeVisible();
  await expect(road.getByText("En test")).toBeVisible();
  await expect(road.getByText("Prévu")).toBeVisible();
});

// ---------------------------------------------------------------- captures (scripts/shots.mjs → src/lib/shots.generated.ts)
// These hold for any capture set, from none to the full one; checks that need a kind of capture skip without it.

const capturePages = ["", "desktop/", "apps/", "security/", "tour/"];
const firstOf = (kind: string, lang = "en") => shotData.find((d) => d.kind === kind && d.lang === lang);
const hasPair = (lang: string) => {
  const seen = new Map<string, Set<string>>();
  for (const d of shotData.filter((x) => x.lang === lang)) seen.set(`${d.kind}:${d.base}`, (seen.get(`${d.kind}:${d.base}`) ?? new Set()).add(d.theme));
  return [...seen.values()].some((t) => t.size === 2);
};

for (const lang of langs) {
  test(`${lang}: every capture has an alt in the page's language, and every file it names is served`, async ({ page, request }) => {
    const alts = [...new Set(shotData.filter((d) => d.lang === lang).map((d) => d.alt))];
    const urls = new Set<string>();
    for (const path of capturePages) {
      await page.goto(`/${lang}/${path}`);
      const found = await page.evaluate(() => {
        const pics = [...document.querySelectorAll("main picture")].filter((p) => p.querySelector("source[srcset]"));
        return {
          // a clip's poster is decorative: the <video> beside it carries the label
          images: pics.map((p) => ({ alt: p.querySelector("img")!.alt, poster: !!p.parentElement?.querySelector(":scope > video") })),
          videos: [...document.querySelectorAll("main video")].map((v) => v.getAttribute("aria-label") ?? ""),
          urls: [
            ...pics.flatMap((p) => [...p.querySelectorAll("source")].flatMap((s) => s.srcset.split(",").map((c) => c.trim().split(" ")[0]!))),
            ...pics.map((p) => p.querySelector("img")!.getAttribute("src")!),
            ...[...document.querySelectorAll("main a[data-lightbox]")].map((a) => a.getAttribute("href")!),
            ...[...document.querySelectorAll("main video source")].map((s) => s.getAttribute("src")!),
          ],
        };
      });
      for (const im of found.images) {
        if (im.poster) expect(im.alt).toBe("");
        else expect(alts, `/${lang}/${path}: alt not from the ${lang} captures`).toContain(im.alt);
      }
      for (const label of found.videos) expect(alts).toContain(label);
      found.urls.forEach((u) => urls.add(u));
    }
    for (const u of urls) {
      const r = await request.get(u);
      expect(r.status(), u).toBe(200);
      expect(r.headers()["content-type"], u).toMatch(/^(image\/(avif|webp)|video\/(webm|mp4))/);
    }
  });
}

test("captures are never larger than their place needs, and the tour starts light", async ({ page }, info) => {
  const sizes: number[] = [];
  page.on("response", async (r) => {
    if (r.url().includes("/shots/") && r.request().resourceType() === "image") sizes.push((await r.body().catch(() => Buffer.alloc(0))).length);
  });
  await page.goto("/fr/tour/");
  await page.waitForLoadState("load");
  await page.waitForTimeout(1000); // lazy images near the first screen start loading
  const first = sizes.reduce((a, b) => a + b, 0);
  expect(first, "image bytes before any scroll").toBeLessThan(1.5 * 1024 * 1024);
  for (const path of ["/fr/tour/", "/fr/desktop/", "/fr/"]) {
    await page.goto(path);
    await scrollThrough(page);
    await loadRendered(page);
    // the image the browser picked is at most the smallest candidate covering the box at this pixel density (+25%
    // for the approximations in `sizes`): a phone never gets the 2880 px file
    const over = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLImageElement>("main picture img")]
        .filter((i) => i.getClientRects().length > 0 && i.currentSrc && i.naturalWidth > 0)
        .flatMap((img) => {
          const ext = img.currentSrc.split(".").pop();
          const source = [...img.parentElement!.querySelectorAll("source")].find((s) => s.type === `image/${ext}`);
          const widths = (source?.srcset ?? "").split(",").map((c) => parseInt(c.trim().split(" ")[1] ?? "0", 10)).sort((a, b) => a - b);
          const need = img.clientWidth * Number(img.dataset.zoom ?? 1) * devicePixelRatio * 1.25;
          const ideal = widths.find((w) => w >= need) ?? widths[widths.length - 1] ?? img.naturalWidth;
          return img.naturalWidth > ideal ? [`${img.currentSrc} (${img.naturalWidth}px for ${Math.round(need)}px)`] : [];
        }),
    );
    expect(over, `${info.project.name} ${path}`).toEqual([]);
  }
  expect(Math.max(0, ...sizes), "largest capture file loaded").toBeLessThan(400 * 1024);
});

test("the tour does not shift while its captures load", async ({ page }) => {
  await page.goto("/fr/tour/");
  await page.evaluate(() => {
    const w = window as unknown as { cls: number };
    w.cls = 0;
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) if (!e.hadRecentInput) w.cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  await scrollThrough(page);
  await loadRendered(page);
  expect(await page.evaluate(() => (window as unknown as { cls: number }).cls)).toBeLessThan(0.02);
});

test("the tour's index leads to each feature, and home's captures to their place in the tour", async ({ page }) => {
  test.skip(!shotData.length, "no capture in the set");
  await page.goto("/en/tour/");
  const links = page.getByRole("navigation", { name: "Features" }).getByRole("link");
  const n = await links.count();
  expect(n).toBeGreaterThan(0);
  expect(await page.locator("main section h2").count()).toBe(n);
  const href = (await links.last().getAttribute("href"))!;
  await links.last().click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(page.locator(`${href} h2`)).toBeInViewport();
  await page.goto("/en/");
  const targets = await page.locator('#tour a[href*="/tour/#shot-"]').evaluateAll((as) => as.map((a) => a.getAttribute("href")!.split("#")[1]!));
  expect(targets.length).toBeGreaterThan(0);
  await page.goto("/en/tour/");
  for (const id of targets) await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
});

test("captures follow the site's appearance where both exist", async ({ page }) => {
  test.skip(!hasPair("en"), "no scene captured in both appearances");
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/en/tour/");
  const pair = page.locator('li:has(> [data-v="dark"]):has(> [data-v="light"])').first();
  await expect(pair.locator(':scope > [data-v="light"]')).toBeVisible();
  await expect(pair.locator(':scope > [data-v="dark"]')).toBeHidden();
  const toggle = page.getByRole("button", { name: /^Site appearance/ });
  await toggle.click(); // light
  await toggle.click(); // dark
  await expect(pair.locator(':scope > [data-v="dark"]')).toBeVisible();
  await expect(pair.locator(':scope > [data-v="light"]')).toBeHidden();
});

test("the lightbox shows a capture large, moves with the arrow keys and closes with Escape", async ({ page }) => {
  test.skip(!shotData.some((d) => d.kind !== "clip"), "no image in the capture set");
  await page.goto("/fr/tour/");
  await hydrated(page);
  const links = page.locator("main a[data-lightbox]").filter({ visible: true });
  const total = await links.count();
  const first = links.first();
  const alt = (await first.locator("img").getAttribute("alt"))!;
  await first.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("img")).toHaveAttribute("alt", alt);
  await expect(dialog.getByText(`1 sur ${total}`)).toBeVisible();
  if (total > 1) {
    await page.keyboard.press("ArrowRight");
    await expect(dialog.getByText(`2 sur ${total}`)).toBeVisible();
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(first).toBeFocused();
});

test("clips show their poster, stay still when motion is reduced, and play when visible otherwise", async ({ page }) => {
  const clip = firstOf("clip");
  test.skip(!clip, "no clip in the capture set");
  const videoBytes: string[] = [];
  page.on("request", (r) => /\.(webm|mp4)$/.test(r.url()) && videoBytes.push(r.url()));
  // scrolled into view instantly: with motion allowed the site scrolls smoothly, which races Playwright's own scrolling
  const show = (v: typeof video) => v.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
  const video = page.locator(`[id="shot-${clip!.base}"] video`).first();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/tour/");
  await hydrated(page);
  await show(video);
  const poster = video.locator("xpath=..").locator("picture img");
  await expect(poster).toBeVisible();
  await expect.poll(() => poster.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  await page.waitForTimeout(600);
  expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  expect(videoBytes).toEqual([]); // preload="none": nothing fetched until it plays
  const button = video.locator("xpath=..").getByRole("button", { name: "Play the animation" });
  await button.click(); // the visitor may still play it
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused), { timeout: 15_000 }).toBe(true);
  await expect(video.locator("xpath=..").getByRole("button", { name: "Pause the animation" })).toBeVisible();

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/en/tour/");
  await hydrated(page);
  await show(video);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.muted && v.loop), { timeout: 15_000 }).toBe(true);
  expect(await video.getAttribute("preload")).toBe("none");
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the tour still shows its captures, and clips their poster with native controls", async ({ page }) => {
    test.skip(!shotData.length, "no capture in the set");
    await page.goto("/en/tour/");
    const img = page.locator("main picture img").filter({ visible: true }).first();
    await img.scrollIntoViewIfNeeded();
    await expect(img).toBeVisible();
    await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
    await expect(page.locator("main a[data-lightbox]").first()).toHaveAttribute("href", /\/shots\/.+\.(webp|avif)$/);
    const clip = firstOf("clip");
    if (clip) {
      const video = page.locator(`[id="shot-${clip.base}"] video`).first();
      await expect(video).toHaveAttribute("controls", "");
      const poster = video.locator("xpath=..").locator("picture img");
      await poster.scrollIntoViewIfNeeded();
      await expect.poll(() => poster.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
    }
  });
});

test("pages are a day: the sun sits later on each page, and a view transition carries the field over", async ({ page }) => {
  const times: number[] = [];
  for (const path of ["desktop/", "apps/", "security/", "os/", "faq/"]) {
    await page.goto(`/fr/${path}`);
    const land = page.locator("header [data-land]").first();
    times.push(parseFloat(await land.evaluate((el) => getComputedStyle(el).getPropertyValue("--t"))));
    await expect(land).toHaveCSS("view-transition-name", "land");
  }
  expect(times).toEqual([...times].sort((a, b) => a - b));
  expect(times[0]).toBeLessThan(times[times.length - 1]!);
  const hasRule = await page.evaluate(() => [...document.styleSheets].some((sh) => [...sh.cssRules].some((r) => r.constructor.name === "CSSViewTransitionRule")));
  expect(hasRule).toBe(true);
});

test("the sky follows the visitor's clock: night at 23:00, day at 12:00", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 30, 23, 0, 0));
  await page.goto("/fr/");
  expect(await page.evaluate(() => document.documentElement.style.getPropertyValue("--night"))).toBe("1.00");
  await page.clock.setFixedTime(new Date(2026, 9, 30, 12, 0, 0));
  await page.goto("/fr/");
  expect(await page.evaluate(() => document.documentElement.style.getPropertyValue("--night"))).toBe("0.00");
});

// Scenes: scrolling through a Stage's track drives --e from 0 to 1 and the captions step along.
async function scrubStage(page: Page, path: string, nth = 0) {
  await page.goto(path);
  await hydrated(page);
  const stage = page.locator("[data-step]").nth(nth);
  const box = await stage.evaluate((el) => {
    const t = el.parentElement as HTMLElement;
    return { top: t.getBoundingClientRect().top + window.scrollY, h: t.offsetHeight };
  });
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), box.top);
  await expect(stage).toHaveAttribute("data-step", "0");
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), box.top + box.h);
  return stage;
}

test("the security scene locks the desktop and ends on the permission sheet", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const stage = await scrubStage(page, "/fr/security/");
  await expect(stage).toHaveAttribute("data-step", "2");
  await expect(stage.getByText("Autoriser", { exact: true })).toBeVisible();
  const e = await stage.evaluate((el) => parseFloat(getComputedStyle(el).getPropertyValue("--e")));
  expect(e).toBe(1);
});

test("the apps scene opens four windows, the last one the Store", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const stage = await scrubStage(page, "/en/apps/");
  await expect(stage).toHaveAttribute("data-step", "3");
  const opacities = await stage.locator("[class*=win]").evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
  expect(opacities).toEqual(["1", "1", "1", "1"]);
  await expect(stage.locator("b", { hasText: "Grassfield Store" }).last()).toBeVisible();
});

test("the install scene ends on the Grassfield desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const stage = await scrubStage(page, "/fr/download/");
  await expect(stage).toHaveAttribute("data-step", "2");
  const desk = stage.locator("picture").last();
  await expect(desk).toBeVisible();
  expect(await desk.evaluate((el) => getComputedStyle(el.parentElement!).opacity)).toBe("1");
});

test("the roadmap's sun travels towards step 2 and stops before it", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr/os/");
  await hydrated(page);
  const road = page.locator("[data-road]");
  await road.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 400));
  await expect.poll(() => road.evaluate((el) => parseFloat(getComputedStyle(el).getPropertyValue("--e")))).toBeGreaterThan(0.5);
});

test("keyboard: the Dock is a few tabs away, headings never skip a level, every target is 24 px", async ({ page }) => {
  await page.goto("/fr/desktop/");
  let tabs = 0;
  for (; tabs < 12; tabs++) {
    await page.keyboard.press("Tab");
    if (await page.evaluate(() => !!document.activeElement?.closest('nav[aria-label="Dock"]'))) break;
  }
  expect(tabs).toBeLessThan(12);
  const levels = await page.$$eval("h1,h2,h3,h4,h5,h6", (hs) => hs.map((h) => Number(h.tagName[1])));
  for (let i = 1; i < levels.length; i++) expect(levels[i]! - levels[i - 1]!).toBeLessThanOrEqual(1);
  const small = await page.$$eval("a,button", (els) =>
    els
      .filter((e) => {
        const r = e.getBoundingClientRect();
        return r.width > 0 && (r.width < 24 || r.height < 24);
      })
      .map((e) => `${e.getAttribute("aria-label") ?? e.textContent?.trim()} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`),
  );
  expect(small).toEqual([]);
});

test("long pages carry a table of contents that follows the scroll, and the Dock names every page", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr/desktop/");
  const toc = page.getByRole("navigation", { name: "Sommaire de la page" });
  await expect(toc.getByRole("link")).toHaveCount(5);
  await expect(toc.getByRole("link", { name: "Vue d'ensemble" })).toHaveAttribute("aria-current", "true");
  await page.locator("#glass").scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 200));
  await expect(toc.getByRole("link", { name: "Verre" })).toHaveAttribute("aria-current", "true");
  const labels = await page.getByRole("navigation", { name: "Dock" }).locator("a").evaluateAll((as) => as.map((a) => { const l = a.querySelector("span:nth-child(2)") as HTMLElement; return getComputedStyle(l).display !== "none" && getComputedStyle(l).opacity === "1"; }));
  expect(labels.every(Boolean)).toBe(true);
  await expect(page.locator("footer").getByRole("link", { name: "Mentions légales et confidentialité" })).toBeVisible();
});
