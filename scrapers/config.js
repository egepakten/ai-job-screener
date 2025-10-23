// scrapers/config.js
/**
 * Configuration for the job scraper
 * All settings in one place for easy maintenance
 */

import dotenv from "dotenv";
dotenv.config();

export const CONFIG = {
  // OpenAI settings
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    visionModel: "gpt-4o", // For screenshot analysis
    extractionModel: "gpt-4", // For HTML extraction
    maxTokens: 50, // For salary extraction
    temperature: 0, // Deterministic responses
  },

  // Puppeteer settings
  browser: {
    headless: false, // Set to true for production
    userDataDir: "./chrome-profile", // Persistent browser profile
    viewport: {
      width: 1280,
      height: 800,
    },
    timeout: 10000, // Default timeout in ms
  },

  // Scraping settings
  scraping: {
    maxJobs: 10, // Maximum jobs to scrape per run
    delayBetweenJobs: 1500, // ms delay between job clicks
    selectors: {
      // Glassdoor-specific selectors
      jobCardWrapper: '[data-test="job-card-wrapper"]',
      jobDescription: 'div[class^="JobDetails_jobDescription__"]',
      salaryInCard: 'span[data-test="detailSalary"]',
      cookieAccept: "#onetrust-accept-btn-handler",
      jobAlertClose:
        'div[data-test="JobAlertModal"] button[aria-label="Close"]',
    },
  },

  // File paths
  paths: {
    outputDir: "jobs_raw", // Where to save scraped jobs
    jobPrefix: "job_", // Prefix for job files
  },

  // Job sites URLs (can add more later)
  jobSites: {
    glassdoor: {
      baseUrl: "https://www.glassdoor.co.uk",
      searchUrl:
        "https://www.glassdoor.co.uk/Job/london-england-graduate-software-engineer-jobs-SRCH_IL.0,14_IC2671300_KO15,41.htm",
    },
    // TODO: Add Indeed, Reed, LinkedIn, etc.
  },
};

export default CONFIG;
