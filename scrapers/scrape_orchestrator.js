// scrapers/scrape_orchestrator.js
/**
 * Scrape Orchestrator - Main entry point
 *
 * This is the SIMPLE coordinator that brings everything together:
 * - Uses glassdoor_scraper for browser automation
 * - Uses ai_extractor for OpenAI processing
 * - Uses file_manager for saving data
 *
 * This file should be EASY to read and understand!
 */

import * as Scraper from "./glassdoor_scraper.js";
import * as AIExtractor from "./ai_extractor.js";
import * as FileManager from "./file_manager.js";
import CONFIG from "./config.js";

/**
 * Main scraping function
 * Orchestrates the entire scraping process
 */
async function scrapeGlassdoorJobs() {
  console.log("🚀 Starting Glassdoor Job Scraper");
  console.log("=".repeat(60));

  // Track session statistics
  const sessionStats = {
    startTime: new Date().toISOString(),
    totalJobs: 0,
    successfulJobs: 0,
    failedJobs: 0,
    errors: [],
  };

  let browser;

  try {
    // Step 1: Initialize
    console.log("\n📁 Step 1: Initializing...");
    FileManager.initializeOutputDirectory();
    const existingJobs = FileManager.loadExistingJobs();
    let jobIndex = FileManager.getNextJobIndex();

    // Step 2: Launch browser
    console.log("\n🌐 Step 2: Launching browser...");
    browser = await Scraper.launchBrowser();
    const page = await Scraper.createPage(browser);

    // Step 3: Navigate to job search
    console.log("\n🔍 Step 3: Navigating to Glassdoor...");
    await Scraper.navigateToJobSearch(
      page,
      CONFIG.jobSites.glassdoor.searchUrl
    );

    // Step 4: Get job cards
    console.log("\n📋 Step 4: Finding job listings...");
    const jobCards = await Scraper.getJobCards(page);
    const maxJobs = Math.min(CONFIG.scraping.maxJobs, jobCards.length);
    sessionStats.totalJobs = maxJobs;

    console.log(`\n🎯 Will scrape ${maxJobs} jobs`);
    console.log("=".repeat(60));

    // Step 5: Scrape each job
    for (let i = 0; i < maxJobs; i++) {
      try {
        console.log(`\n📦 Processing job ${i + 1}/${maxJobs}`);
        console.log("-".repeat(60));

        // 5a: Scrape job data (Puppeteer)
        const scrapedData = await Scraper.scrapeSingleJob(page, jobCards[i], i);

        // Check if we already have this job
        if (FileManager.jobExists(scrapedData.url, existingJobs)) {
          console.log("⏭️  Job already exists, skipping...");
          continue;
        }

        // 5b: Extract job info using AI
        console.log("🤖 Extracting job details with AI...");
        let jobData = await AIExtractor.extractJobInfoFromHTML(
          scrapedData.html,
          scrapedData.salaryFromCard
        );

        // 5c: If salary is still missing, try screenshot
        if (!jobData.salary || jobData.salary === "N/A") {
          console.log("💰 Salary missing, analyzing screenshot...");
          const salaryFromScreenshot =
            await AIExtractor.extractSalaryFromScreenshot(
              scrapedData.screenshot
            );
          jobData.salary = salaryFromScreenshot;
        }

        // 5d: Enhance job data with metadata
        jobData = AIExtractor.enhanceJobData(
          jobData,
          scrapedData.url,
          scrapedData.html
        );

        // 5e: Save to file
        console.log("💾 Saving job data...");
        FileManager.saveJob(jobData, jobIndex);

        jobIndex++;
        sessionStats.successfulJobs++;

        console.log(`✅ Job ${i + 1} complete!`);

        // Small delay between jobs to be nice to the server
        if (i < maxJobs - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, CONFIG.scraping.delayBetweenJobs)
          );
        }
      } catch (error) {
        console.error(`❌ Failed to process job ${i + 1}:`, error.message);
        sessionStats.failedJobs++;
        sessionStats.errors.push({
          jobIndex: i + 1,
          error: error.message,
        });
        // Continue with next job
      }
    }
  } catch (error) {
    console.error("❌ Fatal error during scraping:", error);
    sessionStats.errors.push({
      type: "fatal",
      error: error.message,
    });
  } finally {
    // Step 6: Cleanup
    console.log("\n🧹 Cleaning up...");

    if (browser) {
      await Scraper.closeBrowser(browser);
    }

    // Save session stats
    sessionStats.endTime = new Date().toISOString();
    FileManager.saveScrapingSession(sessionStats);

    // Print summary
    printSummary(sessionStats);
  }
}

/**
 * Print scraping session summary
 *
 * @param {Object} stats - Session statistics
 */
function printSummary(stats) {
  console.log("\n" + "=".repeat(60));
  console.log("📊 SCRAPING SESSION SUMMARY");
  console.log("=".repeat(60));
  console.log(`⏰ Start Time: ${stats.startTime}`);
  console.log(`⏰ End Time: ${stats.endTime}`);
  console.log(`📋 Total Jobs Attempted: ${stats.totalJobs}`);
  console.log(`✅ Successful: ${stats.successfulJobs}`);
  console.log(`❌ Failed: ${stats.failedJobs}`);

  if (stats.errors.length > 0) {
    console.log(`\n⚠️  Errors (${stats.errors.length}):`);
    stats.errors.forEach((err, idx) => {
      console.log(`  ${idx + 1}. Job ${err.jobIndex || "N/A"}: ${err.error}`);
    });
  }

  console.log("=".repeat(60));
  console.log("✨ Done!");
}

/**
 * CLI Entry point
 * Run this file to start scraping
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeGlassdoorJobs()
    .then(() => {
      console.log("\n👋 Scraper finished successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Scraper crashed:", error);
      process.exit(1);
    });
}

export default scrapeGlassdoorJobs;
