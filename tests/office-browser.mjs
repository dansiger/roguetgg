import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, stat } from "node:fs/promises";
import { chromium } from "playwright";

const server = spawn(process.execPath, ["scripts/serve.mjs"], {
  env: { ...process.env, PORT: "5180" },
});
await new Promise((resolve, reject) => {
  server.stdout.once("data", resolve);
  server.once("error", reject);
  server.once("exit", (code) => reject(Error("Server exited " + code)));
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
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.addInitScript(() => {
    window.officeEvents = [];
    window.addEventListener("office:analytics", (e) =>
      window.officeEvents.push(e.detail),
    );
  });
  await mkdir("test-results", { recursive: true });
  await page.goto("http://localhost:5180");
  await page.screenshot({
    path: "test-results/office-desktop-intro.png",
    fullPage: true,
  });
  assert.equal(await page.getByRole("button", { name: "Clock in" }).count(), 1);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "test-results/office-mobile-intro.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Clock in" }).click();
  await page.waitForTimeout(250);
  assert.match(await page.locator("#timer-label").innerText(), /Timer starts/);
  await page.locator('[data-note="0"]').click();
  await page.locator("#pause").click();
  const frozen = await page.locator("#timer-label").innerText();
  await page.waitForTimeout(350);
  assert.equal(await page.locator("#timer-label").innerText(), frozen);
  await page.locator('[data-action="resume"]').click();
  await page.locator('[data-action="untimed"]').click();
  for (const i of [1, 2, 3]) {
    await page.locator(`[data-note="${i}"]`).focus();
    await page.keyboard.press("Enter");
  }
  assert.equal(await page.locator(".punchline.success").count(), 1);
  await page.screenshot({
    path: "test-results/office-mobile-punchline.png",
    fullPage: true,
  });
  await page.locator('[data-action="continue"]').click();
  for (let index = 1; index < 8; index++) {
    const type = await page.locator(".game-frame").getAttribute("data-type");
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `overflow ${type} ${width}`,
      );
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: `test-results/office-${index}-${type}.png`,
      fullPage: true,
    });
    if (index === 4) await page.locator('[data-action="untimed"]').click();
    async function dismissTwist() {
      const box = page.locator(".interruption");
      if (!(await box.count())) return;
      assert.match(await page.locator("#timer-label").innerText(), /paused/);
      const width = await page.locator("#timer-fill").getAttribute("style");
      await page.waitForTimeout(300);
      assert.equal(
        await page.locator("#timer-fill").getAttribute("style"),
        width,
      );
      await page.screenshot({
        path: `test-results/office-twist-${type}.png`,
        fullPage: true,
      });
      if (index === 4) {
        await page.locator("#pause").click();
        await page.waitForTimeout(4700);
        assert.equal(await box.count(), 1);
        await page.locator('[data-action="resume"]').click();
        await box.waitFor({ state: "detached", timeout: 6000 });
        await page.locator('[data-action="untimed"]').click();
      } else await page.locator('[data-action="dismiss-interruption"]').click();
      for (const width of [320, 390, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
      }
      await page.setViewportSize({ width: 390, height: 844 });
      await page.screenshot({
        path: `test-results/office-twist-${type}-resumed.png`,
        fullPage: true,
      });
    }
    if (type === "scope") {
      while (!(await page.locator(".punchline.success").count())) {
        await page.locator("[data-note]:not(:disabled)").first().click();
        await dismissTwist();
      }
      assert.equal(await page.locator(".request-note.returned").count(), 1);
    } else if (type === "align") {
      while (!(await page.locator(".punchline.success").count())) {
        await page.locator(".manager:not(.aligned)").first().click();
        await dismissTwist();
      }
    } else if (type === "coffee") {
      const b = page.locator("[data-pour]");
      if (index === 2) {
        await b.focus();
        await page.keyboard.down("Space");
        await page.waitForTimeout(180);
        await page.keyboard.up("Space");
        assert.match(await page.locator(".coffee-tip").innerText(), /A sip/);
        await page.keyboard.down("Space");
        await page.waitForFunction(
          () =>
            parseFloat(document.querySelector(".coffee-fill").style.height) >=
            73,
        );
        await page.keyboard.up("Space");
      } else {
        const box = await b.boundingBox();
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.waitForSelector(".interruption");
        await page.mouse.up();
        const fill = await page.locator(".coffee-fill").getAttribute("style");
        await page.waitForTimeout(200);
        assert.equal(
          await page.locator(".coffee-fill").getAttribute("style"),
          fill,
        );
        await dismissTwist();
        assert.equal(await page.locator(".tall-cup").count(), 1);
        const newBox = await b.boundingBox();
        await page.mouse.move(
          newBox.x + newBox.width / 2,
          newBox.y + newBox.height / 2,
        );
        await page.mouse.down();
        await page.waitForFunction(
          () =>
            parseFloat(document.querySelector(".coffee-fill").style.height) >=
            84,
        );
        await page.mouse.up();
      }
    } else {
      const goal = index === 3 ? 3 : 5;
      await page.locator(".alarm-cell:not(.red)").first().click();
      assert.equal(
        await page.locator("#round-progress").innerText(),
        `0 / ${goal}`,
      );
      while (!(await page.locator(".punchline.success").count())) {
        await page.locator(".alarm-cell.red").click();
        await dismissTwist();
      }
    }
    assert.equal(
      await page.locator(".punchline.success").count(),
      1,
      `round ${index} succeeds`,
    );
    await page.locator('[data-action="continue"]').click();
  }
  assert.match(
    await page.locator(".promotion-title").innerText(),
    /Director of Somehow/,
  );
  assert.match(await page.locator(".result-score>strong").innerText(), /8/);
  await page.screenshot({
    path: "test-results/office-mobile-result.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "test-results/office-desktop-result.png",
    fullPage: true,
  });
  const downloadEvent = page.waitForEvent("download");
  await page.locator('[data-action="download"]').click();
  const download = await downloadEvent;
  assert.equal(download.suggestedFilename(), "everything-is-fine.png");
  await download.saveAs("test-results/office-result.png");
  assert.ok((await stat("test-results/office-result.png")).size > 10000);
  const events = await page.evaluate(() => window.officeEvents);
  assert.equal(events.filter((e) => e.name === "challenge_ended").length, 8);
  assert.equal(events.filter((e) => e.name === "session_ended").length, 1);
  assert.equal(
    events.filter((e) => e.name === "office_interruption").length,
    4,
  );
  await page.locator('[data-action="start"]').click();
  await page.locator('[data-note="0"]').click();
  await page.waitForSelector(".punchline.failure", { timeout: 12000 });
  assert.match(await page.locator(".punchline").innerText(), /subsidiary/);
  await page.waitForSelector('[data-type="align"]', { timeout: 5000 });
  assert.deepEqual(errors, []);
  const touch = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  const mobile = await touch.newPage();
  await mobile.goto("http://localhost:5180");
  await mobile.getByRole("button", { name: "Clock in" }).tap();
  await mobile.locator('[data-action="untimed"]').tap();
  for (let i = 0; i < 4; i++) await mobile.locator(`[data-note="${i}"]`).tap();
  assert.equal(await mobile.locator(".punchline.success").count(), 1);
  assert.equal(await mobile.locator(".paper-bit").count(), 0);
  await touch.close();
  console.log(
    "Office arcade browser checks passed: eight wins, timeout/auto-advance, keyboard and pointer pouring, pause, no-timer, touch, reduced motion, PNG export, responsive widths.",
  );
} finally {
  await browser?.close();
  server.kill();
}
