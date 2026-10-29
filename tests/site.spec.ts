import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

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

for (const lang of langs) {
  test.describe(lang, () => {
    test("renders without errors, overflow or broken images", async ({ page }) => {
      const errors = collectErrors(page);
      await page.goto(`/${lang}/`);
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Grassfield.");
      await scrollThrough(page);
      await page.waitForFunction(() => [...document.images].every((i) => i.complete));
      const broken = await page.$$eval("img", (imgs) => imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src));
      expect(broken).toEqual([]);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      expect(errors).toEqual([]);
    });

    test("has no serious accessibility violations", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`/${lang}/`);
      const { violations } = await new AxeBuilder({ page: page as unknown as ConstructorParameters<typeof AxeBuilder>[0]["page"] }).analyze();
      const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    });

    test("links to the other language", async ({ page }) => {
      const other = lang === "fr" ? "en" : "fr";
      await page.goto(`/${lang}/`);
      await page.locator(`footer a[hreflang="${other}"]`).click();
      await expect(page).toHaveURL(new RegExp(`/${other}/$`));
    });
  });
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
  await page.goto("/fr/");
  const stage = page.locator("#overview [data-step]");
  await expect(stage).toHaveAttribute("data-step", "0");
  const track = page.locator("#overview [data-step] >> xpath=..");
  const box = await track.evaluate((el) => ({ top: el.getBoundingClientRect().top + window.scrollY, h: (el as HTMLElement).offsetHeight }));
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), box.top + box.h);
  await expect(stage).toHaveAttribute("data-step", "2");
});

test("glass demo changes the accent", async ({ page }) => {
  await page.goto("/en/");
  const blue = page.getByRole("button", { name: "Blue" });
  await blue.click();
  await expect(blue).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#glass fieldset output").first()).toHaveText("Blue");
  await page.getByRole("slider", { name: "Transparency" }).fill("50");
  await expect(page.locator('output[for="glass-transparency"]')).toHaveText("50%");
});
