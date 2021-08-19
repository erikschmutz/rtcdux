import { Page } from "puppeteer";

describe("How many messages are possible at once", () => {
  let page1: Page, page2: Page;

  jest.setTimeout(1000000);

  beforeAll(async () => {
    if (page1 && !page1.isClosed()) page1.close();
    if (page2 && !page2.isClosed()) page2.close();

    page1 = await browser.newPage();
    page2 = await browser.newPage();
  });

  it("Should connect to eachother", async () => {
    await page1.goto("http://localhost:1234?id=test_1&event_interval=100");
    await page2.goto(
      "http://localhost:1234?id=test_2&connect_to=test_1&event_interval=100"
    );

    let element = await page1.$("#connected");
    expect(await element!.evaluate((node) => node.childNodes.length)).toBe(1);

    // waits 10 second for each to connect
    await new Promise((res) => setTimeout(res, 30000));
    element = await page1.$("#connected");
    await page1.screenshot({ path: "image1.png" });
    await page2.screenshot({ path: "image2.png" });
    expect(await element!.evaluate((node) => node.childNodes.length)).toBe(2);
  });
});
