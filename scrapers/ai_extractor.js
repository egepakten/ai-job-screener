// scrapers/ai_extractor.js
/**
 * AI Extractor - Handles all OpenAI API interactions
 *
 * Responsibilities:
 * - Extract salary from screenshots using GPT-4o Vision
 * - Parse job details from HTML using GPT-4
 * - Clean and structure job data
 */

import OpenAI from "openai";
import CONFIG from "./config.js";

const openai = new OpenAI({ apiKey: CONFIG.openai.apiKey });

/**
 * Extract salary from a screenshot buffer using GPT-4o Vision
 *
 * @param {Buffer} imageBuffer - Screenshot as buffer
 * @returns {Promise<string>} Extracted salary or "N/A"
 */
export async function extractSalaryFromScreenshot(imageBuffer) {
  try {
    const base64Image = imageBuffer.toString("base64");

    const response = await openai.chat.completions.create({
      model: CONFIG.openai.visionModel,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that extracts salary details from job listing screenshots. " +
            "Look for salary ranges, annual salaries, hourly rates, or any compensation information.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "What is the salary for this job? Only respond with the value (e.g., '£60,000 - £80,000') or 'N/A' if not found.",
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
      max_tokens: CONFIG.openai.maxTokens,
    });

    const salary = response.choices[0].message.content.trim();
    console.log(`📸 Extracted salary from screenshot: ${salary}`);
    return salary || "N/A";
  } catch (error) {
    console.error("❌ Error extracting salary from screenshot:", error.message);
    return "N/A";
  }
}

/**
 * Extract structured job information from HTML using GPT-4
 *
 * @param {string} html - Raw HTML of job description
 * @param {string} fallbackSalary - Salary from job card if available
 * @returns {Promise<Object>} Parsed job data
 */
export async function extractJobInfoFromHTML(html, fallbackSalary = "N/A") {
  try {
    const prompt = [
      {
        role: "system",
        content: `You are an expert at extracting structured data from job posting HTML.
You must return ONLY valid JSON, no markdown, no explanations.`,
      },
      {
        role: "user",
        content: `
Extract the following information from this job posting HTML and return as JSON:

{
  "title": "Job title",
  "company": "Company name",
  "description": "Brief job description (2-3 sentences)",
  "technologies": ["AWS", "Docker", "Python", ...],  // All tech mentioned
  "visa_sponsorship": "yes" | "no" | "unknown",  // Check if visa sponsorship is offered
  "salary": "Salary range or null",  // Use this fallback if not in HTML: ${fallbackSalary}
  "location": "Job location",
  "remote": "yes" | "no" | "hybrid" | "unknown",
  "experience_level": "junior" | "mid" | "senior" | "unknown"
}

Rules:
- Extract ALL technologies, frameworks, languages mentioned
- For visa_sponsorship: look for phrases like "visa sponsor", "tier 2", "right to work"
- If salary is in the HTML, use it; otherwise use the fallback: ${fallbackSalary}
- Be thorough with technologies - include cloud platforms, databases, frameworks, languages
- Return ONLY the JSON object, no other text

HTML:
${html}
`,
      },
    ];

    const response = await openai.chat.completions.create({
      model: CONFIG.openai.extractionModel,
      messages: prompt,
      temperature: CONFIG.openai.temperature,
    });

    const jsonString = response.choices[0].message.content;

    // Parse and validate JSON
    const parsed = JSON.parse(jsonString);

    console.log(`✅ Extracted job: ${parsed.title} at ${parsed.company}`);
    return parsed;
  } catch (error) {
    console.error("❌ Error extracting job info:", error.message);

    // Return a minimal valid object if extraction fails
    return {
      title: "Unknown",
      company: "Unknown",
      description: "Extraction failed",
      technologies: [],
      visa_sponsorship: "unknown",
      salary: fallbackSalary,
      location: "Unknown",
      remote: "unknown",
      experience_level: "unknown",
      extraction_error: error.message,
    };
  }
}

/**
 * Clean and enhance extracted job data
 *
 * @param {Object} jobData - Raw extracted job data
 * @param {string} jobUrl - URL of the job posting
 * @param {string} rawHtml - Original HTML for reference
 * @returns {Object} Enhanced job data
 */
export function enhanceJobData(jobData, jobUrl, rawHtml) {
  return {
    ...jobData,

    // Add metadata
    link: jobUrl,
    scraped_at: new Date().toISOString(),
    source: "glassdoor",

    // Store raw HTML for later re-processing if needed
    requirements_html: rawHtml,

    // Normalize technologies (remove duplicates, standardize names)
    technologies: normalizeTechnologies(jobData.technologies || []),

    // Ensure salary is properly formatted
    salary: normalizeSalary(jobData.salary),
  };
}

/**
 * Normalize technology names (e.g., "nodejs" → "Node.js")
 *
 * @param {Array<string>} technologies - Raw technology list
 * @returns {Array<string>} Normalized technology list
 */
function normalizeTechnologies(technologies) {
  const techMap = {
    nodejs: "Node.js",
    reactjs: "React",
    vuejs: "Vue.js",
    javascript: "JavaScript",
    typescript: "TypeScript",
    python: "Python",
    java: "Java",
    golang: "Go",
    postgresql: "PostgreSQL",
    mongodb: "MongoDB",
    // Add more mappings as needed
  };

  // Remove duplicates and normalize
  const normalized = technologies
    .map((tech) => tech.toLowerCase().trim())
    .map((tech) => techMap[tech] || tech)
    .filter((tech, index, self) => self.indexOf(tech) === index);

  return normalized;
}

/**
 * Normalize salary format
 *
 * @param {string} salary - Raw salary string
 * @returns {string} Normalized salary
 */
function normalizeSalary(salary) {
  if (!salary || salary === "N/A" || salary.toLowerCase() === "not specified") {
    return "Not specified";
  }

  // Remove extra whitespace
  return salary.trim();
}

export default {
  extractSalaryFromScreenshot,
  extractJobInfoFromHTML,
  enhanceJobData,
};
