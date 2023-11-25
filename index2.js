import puppeteer from "puppeteer";
import { PuppeteerScreenRecorder } from "puppeteer-screen-recorder";

(async () => {
  const browser = await puppeteer.launch({
    headless: true      // headless browser true or false .....
  });
  console.log("Recording start......(Please wait..)");
  const page = await browser.newPage();
  
  const recorder = new PuppeteerScreenRecorder(page);
  await recorder.start("output.mp4");

  await page.goto('https://interactly.video');


  await page.evaluate(async () => {       // Scrollint the entire page........
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const maxScrollAttempts = 100;

      const scrollInterval = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight || maxScrollAttempts <= 0) {
          clearInterval(scrollInterval);
          resolve();
        }
        maxScrollAttempts--;
      }, 100); 
    });
  });

  await page.waitForTimeout(2000);
  
  await recorder.stop();
  await browser.close();
  console.log("Recording Completed !)")
})();
