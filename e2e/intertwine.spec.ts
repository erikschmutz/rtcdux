import { Page } from "puppeteer";

describe("It should intertwine events", () => {
  let page1: Page, page2: Page, page3: Page;

  beforeAll(async () => {
    if (page1 && !page1.isClosed()) page1.close();
    if (page2 && !page2.isClosed()) page2.close();
    if (page3 && !page3.isClosed()) page3.close();
    page1 = await browser.newPage();
    page2 = await browser.newPage();
    page3 = await browser.newPage();
  });

  jest.setTimeout(30 * 1000);

  it("Should connect to eachother", async () => {
    await page1.goto("http://localhost:1234?id=test_1");
    await page2.goto("http://localhost:1234?id=test_2&connect_to=test_1");
    await page3.goto("http://localhost:1234?id=test_3&connect_to=test_2");

    let element = await page1.$("#connected");
    expect(await element!.evaluate((node) => node.childNodes.length)).toBe(1);

    // waits 10 second for each to connect
    await new Promise((res) => setTimeout(res, 15000));
    element = await page1.$("#connected");
    expect(await element!.evaluate((node) => node.childNodes.length)).toBe(3);
  });

  it("Should connect to eachother", async () => {
    await page1.goto("http://localhost:1234?id=test_4");
    await page2.goto("http://localhost:1234?id=test_5&connect_to=test_1");

    // waits 10 second for each to connect
    await new Promise((res) => setTimeout(res, 15000));
    let element = await page1.$("#connected");
    expect(await element!.evaluate((node) => node.childNodes.length)).toBe(2);
  });
});
