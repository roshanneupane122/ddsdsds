const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));

  console.log("Navigating to localhost:5173...");
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  
  console.log("Taking screenshot...");
  await page.screenshot({ path: 'C:\\Users\\kunwa\\.gemini\\antigravity-ide\\brain\\d6202b34-ecce-4295-946d-fb8fe88f357d\\browser\\screenshot.png' });
  
  console.log("Done.");
  await browser.close();
})();
