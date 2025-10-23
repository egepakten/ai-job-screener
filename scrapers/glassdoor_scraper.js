// scrapers/glassdoor_scraper.js
/**
 * Glassdoor Scraper - Pure Puppeteer logic for scraping Glassdoor
 *
 * Responsibilities:
 * - Launch browser
 * - Navigate to job listings
 * - Click through jobs
 * - Extract HTML and screenshots
 * - Handle popups and cookies
 */

import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import CONFIG from "./config.js";

puppeteer.use(StealthPlugin());

/**
 * Launch Puppeteer browser with configuration
 *
 * @returns {Promise<Browser>} Puppeteer browser instance
 */
export async function launchBrowser() {
  console.log("🚀 Launching browser...");

  const browser = await puppeteer.launch({
    headless: CONFIG.browser.headless,
    userDataDir: CONFIG.browser.userDataDir,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  console.log("✅ Browser launched");
  return browser;
}

/**
 * Create a new page and set viewport
 *
 * @param {Browser} browser - Puppeteer browser instance
 * @returns {Promise<Page>} Puppeteer page instance
 */
export async function createPage(browser) {
  const page = await browser.newPage();
  await page.setViewport(CONFIG.browser.viewport);
  return page;
}

/**
 * Navigate to Glassdoor job search page and handle popups
 *
 * @param {Page} page - Puppeteer page instance
 * @param {string} searchUrl - URL to navigate to
 */
export async function navigateToJobSearch(page, searchUrl) {
  console.log(`🌐 Navigating to: ${searchUrl}`);

  await page.goto(searchUrl, {
    waitUntil: "domcontentloaded",
    timeout: CONFIG.browser.timeout,
  });

  // Handle cookie consent popup
  await handleCookiePopup(page);

  // Handle job alert popup
  await handleJobAlertPopup(page);

  // Wait for job cards to load
  await page.waitForSelector(CONFIG.scraping.selectors.jobCardWrapper, {
    timeout: CONFIG.browser.timeout,
  });

  console.log("✅ Page loaded and popups handled");
}

/**
 * Handle cookie consent popup (if it appears)
 *
 * @param {Page} page - Puppeteer page instance
 */
async function handleCookiePopup(page) {
  try {
    await page.waitForSelector(CONFIG.scraping.selectors.cookieAccept, {
      timeout: 2000,
    });
    await page.click(CONFIG.scraping.selectors.cookieAccept);
    console.log("✅ Accepted cookies");
  } catch (error) {
    // Popup didn't appear, that's okay
    console.log("ℹ️  No cookie popup found");
  }
}

/**
 * Handle job alert signup popup (if it appears)
 *
 * @param {Page} page - Puppeteer page instance
 */
async function handleJobAlertPopup(page) {
  try {
    await page.waitForSelector(CONFIG.scraping.selectors.jobAlertClose, {
      timeout: 2000,
    });
    await page.click(CONFIG.scraping.selectors.jobAlertClose);
    console.log("✅ Closed job alert popup");
  } catch (error) {
    // Popup didn't appear, that's okay
    console.log("ℹ️  No job alert popup found");
  }
}

/**
 * Get all job cards on the page
 *
 * @param {Page} page - Puppeteer page instance
 * @returns {Promise<Array>} Array of job card elements
 */
export async function getJobCards(page) {
  const jobCards = await page.$$(CONFIG.scraping.selectors.jobCardWrapper);
  console.log(`📋 Found ${jobCards.length} job cards`);
  return jobCards;
}

/**
 * Click on a job card and wait for details to load
 *
 * @param {Page} page - Puppeteer page instance
 * @param {ElementHandle} jobCard - Job card element to click
 * @param {number} index - Index of the job (for logging)
 */
export async function clickJobCard(page, jobCard, index) {
  console.log(`🔍 Clicking job ${index + 1}...`);

  await jobCard.click();

  // Wait for job description to load
  await page.waitForSelector(CONFIG.scraping.selectors.jobDescription, {
    visible: true,
    timeout: CONFIG.browser.timeout,
  });

  // Small delay to ensure content is fully loaded
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

/**
 * Extract job description HTML from the page
 *
 * @param {Page} page - Puppeteer page instance
 * @returns {Promise<string>} HTML content of job description
 */
export async function extractJobHTML(page) {
  try {
    const html = await page.$eval(
      CONFIG.scraping.selectors.jobDescription,
      (el) => el.outerHTML
    );

    console.log(`📄 Extracted HTML (${html.length} characters)`);
    return html;
  } catch (error) {
    console.error("❌ Failed to extract HTML:", error.message);
    return "";
  }
}

/**
 * Take a screenshot of the current page
 *
 * @param {Page} page - Puppeteer page instance
 * @returns {Promise<Buffer>} Screenshot as buffer
 */
export async function takeScreenshot(page) {
  try {
    const screenshot = await page.screenshot({ type: "png" });
    console.log("📸 Screenshot captured");
    return screenshot;
  } catch (error) {
    console.error("❌ Failed to take screenshot:", error.message);
    return null;
  }
}

/**
 * Extract salary from job card (left panel)
 * This is the fallback before using AI screenshot analysis
 *
 * @param {ElementHandle} jobCard - Job card element
 * @returns {Promise<string>} Salary string or "N/A"
 */
export async function extractSalaryFromCard(jobCard) {
  try {
    const salary = await jobCard.$eval(
      CONFIG.scraping.selectors.salaryInCard,
      (el) => el.innerText.trim()
    );

    console.log(`💰 Found salary in card: ${salary}`);
    return salary;
  } catch (error) {
    console.log("ℹ️  No salary found in job card");
    return "N/A";
  }
}

/**
 * Get current page URL
 *
 * @param {Page} page - Puppeteer page instance
 * @returns {string} Current URL
 */
export function getCurrentUrl(page) {
  return page.url();
}

/**
 * Close browser instance
 *
 * @param {Browser} browser - Puppeteer browser instance
 */
export async function closeBrowser(browser) {
  await browser.close();
  console.log("🔒 Browser closed");
}

/**
 * Scrape a single job
 * This is a convenience method that combines multiple operations
 *
 * @param {Page} page - Puppeteer page instance
 * @param {ElementHandle} jobCard - Job card element
 * @param {number} index - Job index
 * @returns {Promise<Object>} Scraped job data
 */
export async function scrapeSingleJob(page, jobCard, index) {
  // Click the job card
  await clickJobCard(page, jobCard, index);

  // Extract data
  const html = await extractJobHTML(page);
  const screenshot = await takeScreenshot(page);
  const salaryFromCard = await extractSalaryFromCard(jobCard);
  const url = getCurrentUrl(page);

  return {
    html,
    screenshot,
    salaryFromCard,
    url,
    index,
  };
}

export default {
  launchBrowser,
  createPage,
  navigateToJobSearch,
  getJobCards,
  clickJobCard,
  extractJobHTML,
  takeScreenshot,
  extractSalaryFromCard,
  getCurrentUrl,
  closeBrowser,
  scrapeSingleJob,
};
