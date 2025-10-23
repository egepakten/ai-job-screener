"use strict";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import OpenAI from "openai";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

puppeteer.use(StealthPlugin());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Try to extract salary from job card (left panel)
async function extractSalaryFromScreenshot(imageBuffer) {
  const base64Image = imageBuffer.toString("base64");

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that extracts salary details from job listing screenshots.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "What is the salary for this job? Only respond with the value or 'N/A' if not found.",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    max_tokens: 50,
  });

  const message = res.choices[0].message.content.trim();
  return message || "N/A";
}

async function extractJobInfoFromHTML(html, fallbackSalary) {
  const prompt = [
    {
      role: "system",
      content: `You are an assistant that extracts structured data from raw HTML of job descriptions.`,
    },
    {
      role: "user",
      content: `
Given the HTML below, extract the following as JSON:
- title
- company
- description
- technologies (list of techs mentioned like AWS, Docker, GCP)
- visa_sponsorship (true if job offers visa sponsorship, false if explicitly says no, unknown otherwise)
- salary (string or null if not listed, fallback: ${fallbackSalary})

Note: If salary is mentioned anywhere in the job post (even in text), extract it as a string.

Return ONLY valid JSON. HTML:
${html}
    `,
    },
  ];

  const res = await openai.chat.completions.create({
    model: "gpt-4",
    messages: prompt,
    temperature: 0,
  });

  return res.choices[0].message.content;
}

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    userDataDir: "./chrome-profile",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const url =
    "https://www.glassdoor.co.uk/Job/london-england-graduate-software-engineer-jobs-SRCH_IL.0,14_IC2671300_KO15,41.htm";

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 10000 });

  // Accept cookies
  try {
    await page.waitForSelector("#onetrust-accept-btn-handler", {
      timeout: 1000,
    });
    await page.click("#onetrust-accept-btn-handler");
  } catch {}

  // Close job alert popup
  try {
    await page.waitForSelector(
      'div[data-test="JobAlertModal"] button[aria-label="Close"]',
      { timeout: 1000 }
    );
    await page.click(
      'div[data-test="JobAlertModal"] button[aria-label="Close"]'
    );
  } catch {}

  await page.waitForSelector('[data-test="job-card-wrapper"]', {
    timeout: 1000,
  });
  const jobCards = await page.$$('div[data-test="job-card-wrapper"]');

  fs.mkdirSync("jobs_raw", { recursive: true });

  const maxJobs = 10;
  for (let i = 0; i < Math.min(maxJobs, jobCards.length); i++) {
    try {
      console.log(`🔍 Checking job ${i + 1}`);
      await jobCards[i].click();
      // await new Promise((resolve) => setTimeout(resolve, 3000));

      const descriptionSelector = 'div[class^="JobDetails_jobDescription__"]';

      await page.waitForSelector(descriptionSelector, {
        visible: true,
        timeout: 10000,
      });

      const html = await page.$eval(descriptionSelector, (el) => el.outerHTML);

      const screenshotBuffer = await page.screenshot({ type: "png" });

      const cardSalarySelector = 'span[data-test="detailSalary"]';
      let fallbackSalary = "N/A";
      try {
        fallbackSalary = await jobCards[i].$eval(cardSalarySelector, (el) =>
          el.innerText.trim()
        );
      } catch (e) {
        console.log(
          `⚠️ Salary not found in job card fallback: ${fallbackSalary}`
        );
      }

      // Send HTML to GPT
      const result = await extractJobInfoFromHTML(html, fallbackSalary);

      // Parse JSON string response from GPT
      let parsed;
      try {
        parsed = JSON.parse(result);
      } catch (e) {
        console.log(`❌ Failed to parse JSON for job ${i + 1}`);
        console.log(result);
        continue;
      }

      // ✅ Add link and raw HTML to the parsed object
      parsed.link = page.url();
      parsed.requirements_html = html;

      // Add fallback in case salary is missing
      if (!parsed.salary || parsed.salary === "N/A") {
        console.log("📸 Trying to extract salary from screenshot...");
        parsed.salary = await extractSalaryFromScreenshot(screenshotBuffer);
      }

      // Save full JSON to file
      const jsonPath = path.join("jobs_raw", `job_${i + 1}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(parsed, null, 2));
      console.log(`✅ Saved: ${jsonPath}`);
      // fs.unlinkSync(screenshotPath); // Delete the temp screenshot to save space

      // await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (e) {
      console.log(`⚠️ Job ${i + 1} failed:`, e.message);
    }
  }

  // await browser.close(); // Close browser
})();
