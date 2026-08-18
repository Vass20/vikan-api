try {
  const puppeteer = require('puppeteer-core');
  console.log("SUCCESS: puppeteer-core is available");
} catch (e) {
  console.log("ERROR: " + e.message);
}
