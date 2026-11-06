import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { shotData } from "../src/lib/shots.generated";
import fr from "../src/i18n/fr";
import en from "../src/i18n/en";
import published from "../src/lib/published.json";

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
  { path: "", h1: { fr: "Grassfield OS", en: "Grassfield OS" } },
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
      // axe reads every node of the page: 4 to 5 s alone, past the default 30 s on a loaded machine (seen 23 times
      // in one local run while another build ran)
      test.slow();
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
  const night = "rgb(21, 19, 15)"; // "night on the plateau", --bg in dark
  expect(await bg()).toBe(night);
  // applied by the inline script before any React code runs
  await page.route("**/_next/static/chunks/**/*.js", (r) => r.abort());
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "dark");
  expect(await bg()).toBe(night);
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

// The published install (grassfield ADR-0043 IN3, docs/install.md): the one-liner first, the download-check-run form
// below it, the script's --uninstall as the way back. Written out here, not read from release.ts, so a slip there fails.
const script = "https://packages.grassfield.site/install/grassfield-install.sh";
const installCommands = {
  checked: `curl -fsSLO ${script}\ncurl -fsSLO ${script}.sha256\nsha256sum -c grassfield-install.sh.sha256 && bash grassfield-install.sh`,
  oneLine: `curl -fsSL ${script} | bash`,
  uninstall: "bash grassfield-install.sh --uninstall",
  download: `curl -fsSLO ${script}`, // under the uninstall command: fetches the script without running it
};

// The version and date the beta channel serves (src/lib/published.json, kept up to date by scripts/sync-release.mjs).
const versionHeading = new RegExp(`Version ${published.version.replace(/\./g, "\\.")}`);
const longDate = (locale: string) =>
  new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(published.date));

for (const [lang, copyLabel, copiedLabel, beta, date] of [
  ["fr", "Copier", "Copié", "Bêta", longDate("fr-FR")],
  ["en", "Copy", "Copied", "Beta", longDate("en-GB")],
] as const) {
  test(`${lang}: the download page gives the beta's install script, its requirements and the way back, to copy`, async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(`/${lang}/download/`);
    const card = page.locator("#release");
    await expect(card.getByRole("heading", { level: 2, name: versionHeading })).toBeVisible();
    await expect(card.locator(".tag")).toHaveText(beta);
    await expect(card).toContainText(date);
    await expect(card).toContainText("Omarchy 4.0.6+");
    await expect(page.getByText("x86_64").first()).toBeVisible();
    await expect(page.locator("#requirements li")).toHaveCount(7);
    await expect(page.locator("#requirements")).toContainText("packages.grassfield.site");
    for (const pkg of ["grassfield-desktop", "grassfield-compositor", "grassfield-store", "grassfield-login-themes", "grassfield-icons", "grassfield-wallpapers", "grassfield-keyring"]) {
      await expect(page.locator("#packages code", { hasText: pkg }).first()).toBeVisible();
    }
    for (const option of ["--dry-run", "--session grassfield|omarchy", "--without-login-themes", "--no-snapshot", "--yes", "--uninstall"]) {
      await expect(page.locator("#install-steps dt code", { hasText: option })).toHaveCount(1);
    }
    await expect(page.locator("code", { hasText: "E492 1A38 2C34 9308 BAA5" })).toBeVisible();
    // ADR-0043 IN8: the script's SHA-256 on the site, next to the download-check-run form (the live .sha256 of 2026-11-05)
    await expect(page.locator("#install-steps code", { hasText: "c395efb5 28b93bcc 0ea2f6a4 3d1fed8b ba7ae4d3 64ce62bc 4e792637 40964df2" })).toBeVisible();
    await expect(page.locator('a[href="https://packages.grassfield.site/grassfield-signing-key.asc"]')).toBeVisible();

    // the one-liner first, then the download-check-run form, then the way back
    await hydrated(page);
    // both labels, so that a button stays in the list once it says it copied
    const copies = page.locator("main button", { hasText: new RegExp(`^(${copyLabel}|${copiedLabel})$`) });
    for (const [i, expected] of [installCommands.oneLine, installCommands.checked, installCommands.uninstall, installCommands.download].entries()) {
      const copy = copies.nth(i);
      await expect(copy).toHaveText(copyLabel);
      await copy.click();
      await expect(copy).toHaveText(copiedLabel);
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(expected);
    }
  });
}

test("no page says the release is still to come", async ({ page }) => {
  for (const path of ["/fr/", "/en/", "/fr/os/", "/en/os/", "/fr/download/", "/en/download/", "/fr/faq/", "/en/faq/"]) {
    await page.goto(path);
    await expect(page.locator("main")).not.toContainText(/pas encore publi|arrive bientôt|bientôt disponible|not released yet|coming soon|in testing|en test\b/i);
  }
  await page.goto("/fr/");
  await expect(page.locator("#install")).toContainText(`Version ${published.version} en bêta`);
});

test("the header reaches every page and marks the current one", async ({ page }) => {
  // eight page loads, each with a view transition and its checks: over the default 30 s on a loaded machine
  test.slow();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/");
  const header = page.getByRole("banner");
  const nav = header.getByRole("navigation", { name: "Main navigation" });
  for (const [name, path] of [["Desktop", "desktop/"], ["Apps", "apps/"], ["Security", "security/"], ["Grassfield OS", "os/"], ["Tour", "tour/"], ["FAQ", "faq/"]]) {
    await nav.getByRole("link", { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/en/${path}$`));
    await expect(nav.getByRole("link", { name, exact: true })).toHaveAttribute("aria-current", "page");
  }
  await header.getByRole("link", { name: "Download", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/download\/$/);
  await expect(header.getByRole("link", { name: "Download", exact: true })).toHaveAttribute("aria-current", "page");
  await header.getByRole("link", { name: "Grassfield, home" }).click();
  await expect(page).toHaveURL(/\/en\/$/);
  await expect(header.getByRole("link", { name: "Grassfield, home" })).toHaveAttribute("aria-current", "page");
});

test("on a phone the pages fold into a menu that opens without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/fr/apps/");
  const header = page.getByRole("banner");
  await expect(header.getByRole("navigation", { name: "Navigation principale" })).toHaveCount(0); // inline one hidden, menu closed
  await header.getByRole("button", { name: "Menu" }).or(header.locator("summary")).first().click();
  const sheet = header.getByRole("navigation", { name: "Navigation principale" });
  for (const name of ["Grassfield OS", "Bureau", "Apps", "Sécurité", "Visite", "Questions", "Télécharger"]) await expect(sheet.getByRole("link", { name, exact: true })).toBeVisible();
  await expect(sheet.getByRole("link", { name: "Apps", exact: true })).toHaveAttribute("aria-current", "page");
  await context.close();
});

test("the header's language link keeps the same page", async ({ page }) => {
  await page.goto("/fr/security/");
  await page.getByRole("banner").getByRole("link", { name: /^EN, Read this page in English$/ }).click();
  await expect(page).toHaveURL(/\/en\/security\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Secure by design");
  await page.getByRole("banner").getByRole("link", { name: /^FR, Lire cette page en français$/ }).click();
  await expect(page).toHaveURL(/\/fr\/security\/$/);
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
  await expect(page.getByRole("option").first()).toBeVisible(); // the index of this page load has arrived
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

test("Search: Enter typed before the index arrives still opens the best match, and a missing index says so", async ({ page }) => {
  await page.goto("/fr/");
  await hydrated(page);
  let release!: () => void;
  const held = new Promise<void>((r) => (release = r));
  await page.route("**/fr/search.json", async (route) => {
    await held;
    await route.continue();
  });
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("status")).toHaveText("Chargement de la recherche…");
  await page.getByRole("combobox").fill("sécu");
  await page.keyboard.press("Enter");
  release();
  await expect(page).toHaveURL(/\/fr\/security\/$/);
  await page.unroute("**/fr/search.json");
  await page.route("**/fr/search.json", (route) => route.fulfill({ status: 503, body: "" }));
  await page.reload();
  await hydrated(page);
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog").getByRole("status")).toContainText("pas disponible");
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
  await expect(road.getByText("En bêta")).toBeVisible();
  await expect(road.getByText("Prévu")).toBeVisible();
});

test("puts Grassfield OS first: the home hero leads to the OS page, which shows the whole system and how it is built", async ({ page }) => {
  await page.goto("/fr/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Grassfield OS");
  await page.locator("#top").getByRole("link", { name: "Découvrir Grassfield OS" }).click();
  await expect(page).toHaveURL(/\/fr\/os\/$/);
  const system = page.locator("#system");
  await expect(system.getByRole("heading", { level: 3 })).toHaveText(["Le bureau", "Les apps", "Le système"]);
  // every tile is named by its title, and each capture tile opens its capture in the tour
  await expect(system.getByRole("link", { name: /^Les vrais menus Ceux de vos apps/ })).toHaveAttribute("href", /\/fr\/tour\/#shot-/);
  const targets = await system.locator('a[href*="/tour/#shot-"]').evaluateAll((as) => as.map((a) => a.getAttribute("href")!.split("#")[1]!));
  expect(targets.length).toBeGreaterThan(10);
  await expect(page.locator("#stack ol > li")).toHaveCount(4);
  await expect(page.locator("#origin")).toContainText("Cameroun");
  // the header lists Grassfield OS first (read every link, shown or not: on a phone they fold into the menu)
  const order = await page.getByRole("banner").locator("nav").first().locator("a").evaluateAll((as) => as.map((a) => a.textContent));
  expect(order[0]).toBe("Grassfield OS");
  await page.goto("/fr/tour/");
  for (const id of targets) await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
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
    test.slow(); // every capture page, each image requested: over 30 s on a loaded machine
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
  for (const path of ["/fr/tour/", "/fr/desktop/", "/fr/", "/fr/os/"]) {
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
          // an image that covers its box (object-fit: cover) is drawn as wide as the box's height asks when it is wider
          const cover = getComputedStyle(img).objectFit === "cover" ? (img.clientHeight * img.naturalWidth) / img.naturalHeight : 0;
          const need = Math.max(img.clientWidth, cover) * Number(img.dataset.zoom ?? 1) * devicePixelRatio * 1.25;
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
  const targets = await page.locator('#system a[href*="/tour/#shot-"]').evaluateAll((as) => as.map((a) => a.getAttribute("href")!.split("#")[1]!));
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

test("the plateau: every page opens on the contour map, home's first figure is the real desktop, pages crossfade", async ({ page }) => {
  for (const path of ["", "desktop/", "apps/", "security/", "os/", "tour/", "faq/", "legal/"]) {
    await page.goto(`/fr/${path}`);
    const map = page.locator("main header .contours").first();
    await expect(map).toHaveCount(1);
    expect(await map.evaluate((el) => getComputedStyle(el).maskImage || getComputedStyle(el).webkitMaskImage)).toContain("contours.svg");
  }
  await page.goto("/fr/");
  const figure = page.locator("#top figure");
  await expect(figure.locator("img").filter({ visible: true })).toHaveAttribute("src", /\/shots\/desktop-(dark|light)-/);
  await expect(figure.locator("figcaption")).toContainText("capturé sur l'instance de développement");
  const hasRule = await page.evaluate(() => [...document.styleSheets].some((sh) => [...sh.cssRules].some((r) => r.constructor.name === "CSSViewTransitionRule")));
  expect(hasRule).toBe(true);
  const map = await page.request.get("/contours.svg");
  expect(map.ok()).toBe(true);
  expect((await map.body()).length).toBeLessThan(40 * 1024);
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

test("keyboard: the navigation is a few tabs away, headings never skip a level, every target is 24 px", async ({ page }) => {
  await page.goto("/fr/desktop/");
  let tabs = 0;
  for (; tabs < 8; tabs++) {
    await page.keyboard.press("Tab");
    // the pages' links, or on a phone the menu that holds them
    if (await page.evaluate(() => !!document.activeElement?.closest('header nav[aria-label="Navigation principale"], header details summary'))) break;
  }
  expect(tabs).toBeLessThan(8);
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

test("long pages carry a table of contents that follows the scroll, and the header names every page", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/fr/desktop/");
  const toc = page.getByRole("navigation", { name: "Sommaire de la page" });
  await expect(toc.getByRole("link")).toHaveCount(5);
  await expect(toc.getByRole("link", { name: "Vue d'ensemble" })).toHaveAttribute("aria-current", "true");
  await page.locator("#glass").scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 200));
  await expect(toc.getByRole("link", { name: "Verre" })).toHaveAttribute("aria-current", "true");
  await expect(page.getByRole("banner").getByRole("navigation", { name: "Navigation principale" }).getByRole("link")).toHaveText(["Grassfield OS", "Bureau", "Apps", "Sécurité", "Visite", "Questions"]);
  await expect(page.locator("footer").getByRole("link", { name: "Mentions légales et confidentialité" })).toBeVisible();
});

// The names Grassfield no longer shows (docs/legal/visual-review.md section 3.1, the owner's renames of 2026-10-18 and
// 2026-10-27, tests/ci/ui_names.py in the Grassfield repository) stay out of the site's words and its captures' text.
test("no banned product name in the site's text or its captures' titles, captions and alt text", () => {
  const banned = ["Finder", "Spotlight", "Mission Control", "Launchpad", "Stage Manager", "Quick Look", "Siri", "iCloud", "macOS", "Mac OS", "Apple", "Liquid Glass", "Tahoe", "Golden Gate", "AirDrop", "AirPlay", "Exposé", "Time Machine", "Handoff", "Sidecar", "FaceTime", "Safari", "Keychain", "Retina", "Touch ID", "Aqua", "Cupertino", "Sequoia", "Sonoma", "SF Pro", "SF Symbols", "San Francisco", "Night Shift", "True Tone", "Notification Center", "Dashboard", "Continuity", "Ventura", "Monterey", "Big Sur", "Catalina", "Mojave", "Split View", "Control Center", "Hot Corners?", "Spaces", "Centre de contrôle", "Centre de notifications", "Coins actifs"];
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}])(?:${banned.join("|")})(?![\\p{L}\\p{N}])`, "iu");
  const words = (v: unknown): string[] => (typeof v === "string" ? [v] : Array.isArray(v) ? v.flatMap(words) : v && typeof v === "object" ? Object.values(v).flatMap(words) : []);
  const texts = [...words(fr), ...words(en), ...shotData.flatMap((d) => [d.title, d.caption, d.alt])];
  expect(texts.filter((t) => pattern.test(t) || /(?<!\w)Mac(?!\w)/.test(t))).toEqual([]);
});
