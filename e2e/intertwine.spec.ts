import { Page } from "puppeteer";

describe("It should intertwine events", () => {
  let page1: Page, page2: Page, page3: Page;

  beforeAll(async () => {
    page1 = await browser.newPage();
    page2 = await browser.newPage();
    page3 = await browser.newPage();
  });

  it("Should intertwine the events", async () => {
    await page.screenshot({
      path: "./screen.png",
    });
  });
});
