// scrapers/file_manager.js
/**
 * File Manager - Handles all file system operations
 *
 * Responsibilities:
 * - Save job data to JSON files
 * - Load existing jobs
 * - Manage output directories
 * - Prevent duplicate scraping
 */

import fs from "node:fs";
import path from "node:path";
import CONFIG from "./config.js";

/**
 * Initialize output directory
 * Creates the directory if it doesn't exist
 */
export function initializeOutputDirectory() {
  const outputDir = CONFIG.paths.outputDir;

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${outputDir}`);
  } else {
    console.log(`📁 Using existing output directory: ${outputDir}`);
  }
}

/**
 * Save job data to a JSON file
 *
 * @param {Object} jobData - Job data to save
 * @param {number} jobIndex - Index of the job (for filename)
 * @returns {string} Path to saved file
 */
export function saveJob(jobData, jobIndex) {
  try {
    const filename = `${CONFIG.paths.jobPrefix}${jobIndex}.json`;
    const filepath = path.join(CONFIG.paths.outputDir, filename);

    // Pretty print JSON with 2-space indentation
    const jsonString = JSON.stringify(jobData, null, 2);

    fs.writeFileSync(filepath, jsonString);
    console.log(`💾 Saved: ${filepath}`);

    return filepath;
  } catch (error) {
    console.error(`❌ Failed to save job ${jobIndex}:`, error.message);
    return null;
  }
}

/**
 * Load all existing job files
 *
 * @returns {Array<Object>} Array of job data objects
 */
export function loadExistingJobs() {
  try {
    const outputDir = CONFIG.paths.outputDir;

    if (!fs.existsSync(outputDir)) {
      return [];
    }

    const files = fs
      .readdirSync(outputDir)
      .filter((file) => file.endsWith(".json"));

    const jobs = files.map((file) => {
      const filepath = path.join(outputDir, file);
      const content = fs.readFileSync(filepath, "utf-8");
      return JSON.parse(content);
    });

    console.log(`📂 Loaded ${jobs.length} existing jobs`);
    return jobs;
  } catch (error) {
    console.error("❌ Failed to load existing jobs:", error.message);
    return [];
  }
}

/**
 * Check if a job already exists (by URL)
 *
 * @param {string} jobUrl - URL to check
 * @param {Array<Object>} existingJobs - Array of existing job data
 * @returns {boolean} True if job exists
 */
export function jobExists(jobUrl, existingJobs) {
  return existingJobs.some((job) => job.link === jobUrl);
}

/**
 * Get the next available job index
 *
 * @returns {number} Next available index
 */
export function getNextJobIndex() {
  try {
    const outputDir = CONFIG.paths.outputDir;

    if (!fs.existsSync(outputDir)) {
      return 1;
    }

    const files = fs
      .readdirSync(outputDir)
      .filter(
        (file) =>
          file.startsWith(CONFIG.paths.jobPrefix) && file.endsWith(".json")
      );

    if (files.length === 0) {
      return 1;
    }

    // Extract numbers from filenames and find max
    const indices = files.map((file) => {
      const match = file.match(/job_(\d+)\.json/);
      return match ? parseInt(match[1]) : 0;
    });

    return Math.max(...indices) + 1;
  } catch (error) {
    console.error("❌ Failed to get next job index:", error.message);
    return 1;
  }
}

/**
 * Save scraping session metadata
 *
 * @param {Object} metadata - Session metadata (start time, end time, jobs scraped, errors)
 */
export function saveScrapingSession(metadata) {
  try {
    const sessionsDir = path.join(CONFIG.paths.outputDir, "sessions");

    if (!fs.existsSync(sessionsDir)) {
      fs.mkdirSync(sessionsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, "-");
    const filename = `session_${timestamp}.json`;
    const filepath = path.join(sessionsDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(metadata, null, 2));
    console.log(`📊 Saved session metadata: ${filepath}`);
  } catch (error) {
    console.error("❌ Failed to save session metadata:", error.message);
  }
}

/**
 * Clean up old job files (optional - for maintenance)
 *
 * @param {number} daysToKeep - Keep files newer than this many days
 */
export function cleanupOldJobs(daysToKeep = 30) {
  try {
    const outputDir = CONFIG.paths.outputDir;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const files = fs
      .readdirSync(outputDir)
      .filter((file) => file.endsWith(".json"));

    let deletedCount = 0;

    files.forEach((file) => {
      const filepath = path.join(outputDir, file);
      const stats = fs.statSync(filepath);

      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filepath);
        deletedCount++;
      }
    });

    console.log(`🧹 Cleaned up ${deletedCount} old job files`);
  } catch (error) {
    console.error("❌ Failed to cleanup old jobs:", error.message);
  }
}

export default {
  initializeOutputDirectory,
  saveJob,
  loadExistingJobs,
  jobExists,
  getNextJobIndex,
  saveScrapingSession,
  cleanupOldJobs,
};
