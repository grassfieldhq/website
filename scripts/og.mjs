// Renders public/og.png (1200 × 630) from the built site's hero. Run after `npm run build`: node scripts/og.mjs
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const server = spawn("node", ["scripts/serve.mjs", "4399"], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 500));
try {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, colorScheme: "light", reducedMotion: "reduce" });
  await page.goto("http://localhost:4399/en/", { waitUntil: "networkidle" });
  // the header (the mark and the name) and the hero, drawn tighter so the top of the real desktop shows; no page
  // links (the image is about the product, not the site's map), no tools
  await page.addStyleTag({ content: "header nav,header [class*=tools]>*:not([class*=cta]){display:none!important}#top{padding-top:44px!important}#top figure{margin-top:40px!important}" });
  await page.evaluate(() => Promise.all([...document.images].filter((i) => i.getClientRects().length).map((i) => (i.loading = "eager", i.decode().catch(() => {})))));
  await page.waitForTimeout(300);
  await page.screenshot({ path: "public/og.png" });
  await browser.close();
} finally {
  server.kill();
}
