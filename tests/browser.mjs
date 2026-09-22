import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, stat } from "node:fs/promises";
import { chromium } from "playwright";
import { newRun, act, promote, upgradeChoices, key } from "../src/game.js";
import { chooseAction } from "./play-policy.mjs";
const server = spawn(process.execPath, ["scripts/serve.mjs"], {
  env: { ...process.env, PORT: "5178" },
});
await new Promise((resolve, reject) => {
  server.stdout.once("data", resolve);
  server.once("error", reject);
  server.once("exit", (code) => reject(Error("Server exited: " + code)));
});
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH
      ? {
          executablePath: process.env.CHROMIUM_PATH,
          args: [
            "--no-sandbox",
            "--no-zygote",
            "--use-gl=angle",
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
          ],
        }
      : {}),
  });
  const page = await browser.newPage({
      viewport: { width: 1440, height: 1100 },
    }),
    errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.addInitScript(() => {
    crypto.getRandomValues = (array) => {
      array.fill(1);
      return array;
    };
    window.gameEvents = [];
    window.addEventListener("criticalpath:analytics", (e) =>
      window.gameEvents.push(e.detail),
    );
  });
  await mkdir("test-results", { recursive: true });
  await page.goto("http://localhost:5178");
  await page.screenshot({
    path: "test-results/desktop-intro.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "How to play" }).click();
  assert.equal(await page.locator("dialog[open]").count(), 1);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Start your initiative" }).click();
  assert.equal(await page.locator("[data-cell]").count(), 37);
  await page.locator('[data-cell][tabindex="0"]').focus();
  await page.keyboard.press("ArrowRight");
  assert.notEqual(
    await page.evaluate(() => document.activeElement.dataset.cell),
    "-3,2",
  );
  await page.screenshot({
    path: "test-results/desktop-game.png",
    fullPage: true,
  });
  for (const width of [390, 320, 768]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `overflow at ${width}`,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/mobile-game.png",
    fullPage: true,
  });
  const s = newRun(1),
    visits = new Map();
  let promotionSeen = false;
  for (
    let i = 0;
    i < 220 && s.status !== "won" && s.status !== "stalled";
    i++
  ) {
    if (s.status === "upgrade") {
      if (!promotionSeen) {
        await page.screenshot({
          path: "test-results/mobile-promotion.png",
          fullPage: true,
        });
        promotionSeen = true;
      }
      const opts = upgradeChoices(s),
        u =
          opts.find((u) => u.id === "power") ||
          opts.find((u) => u.id === "range") ||
          opts[0];
      await page.locator(`[data-upgrade="${u.id}"]`).click();
      promote(s, u.id);
      continue;
    }
    const k = `${s.stage}:${key(s.player)}`;
    visits.set(k, (visits.get(k) || 0) + 1);
    const c = chooseAction(s, visits);
    if (c.id === "wait") await page.locator('[data-action="wait"]').click();
    else {
      await page.locator(`[data-ability="${c.id}"]`).click();
      if (c.p) await page.locator(`[data-cell="${key(c.p)}"]`).click();
    }
    act(s, c.id, c.p);
  }
  assert.equal(s.status, "won");
  assert.match(
    await page.locator("h1").innerText(),
    /Transformation Architect/,
  );
  const events = await page.evaluate(() => window.gameEvents);
  assert.equal(events.filter((e) => e.name === "stage_completed").length, 6);
  assert.equal(events.filter((e) => e.name === "promotion_earned").length, 5);
  await page.screenshot({
    path: "test-results/mobile-result.png",
    fullPage: true,
  });
  const downloadEvent = page.waitForEvent("download");
  await page.locator('[data-action="download"]').click();
  const download = await downloadEvent;
  assert.equal(download.suggestedFilename(), "critical-path-result.png");
  await download.saveAs("test-results/result.png");
  assert.ok((await stat("test-results/result.png")).size > 10000);
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.screenshot({
    path: "test-results/desktop-result.png",
    fullPage: true,
  });
  await page.locator('[data-action="start"]').click();
  for (
    let i = 0;
    i < 60 && (await page.locator('[data-action="wait"]').count());
    i++
  )
    await page.locator('[data-action="wait"]').click();
  assert.match(await page.locator("h1").innerText(), /Momentum Maker/);
  assert.equal(await page.locator('[data-action="download"]').count(), 1);
  assert.deepEqual(errors, []);
  console.log(
    "Browser checks passed: six-stage victory, promotions, stall/restart, PNG export, keyboard navigation, help, 320/390/768/1440 layouts.",
  );
} finally {
  await browser?.close();
  server.kill();
}
