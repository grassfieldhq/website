// Renders public/og.png (1200 × 630) from the built site's hero. Run after `npm run build`: node scripts/og.mjs
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const server = spawn("node", ["scripts/serve.mjs", "4399"], { stdio: "ignore" });
await new Promise((r) => setTimeout(r, 500));
try {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto("http://localhost:4399/en/", { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "nav{display:none!important} header{padding-top:52px!important}" });
  await page.waitForTimeout(300);
  await page.screenshot({ path: "public/og.png" });
  await browser.close();
} finally {
  server.kill();
}
