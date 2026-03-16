'use strict';
const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../lib/logger');

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const PAGES_TO_TRY = ['', '/contact', '/contact-us', '/about', '/about-us', '/team'];
const DELAY_MS = 1500;

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Extract emails and context from raw HTML.
 */
function extractFromHtml(html, domain) {
  const $ = cheerio.load(html);
  const text = $('body').text();

  // Extract emails
  const emails = [...new Set(text.match(EMAIL_REGEX) || [])].filter(
    (e) => !e.includes('example.') && !e.includes('domain.')
  );

  // Extract potential names + titles from common patterns
  const leads = [];
  $('[class*="team"], [class*="people"], [class*="staff"], [class*="about"]').each((_, el) => {
    const blockText = $(el).text().trim();
    const blockEmails = [...new Set(blockText.match(EMAIL_REGEX) || [])];
    blockEmails.forEach((email) => {
      leads.push({ domain, email, context: blockText.slice(0, 200) });
    });
  });

  // Fallback: add all found emails without context
  emails.forEach((email) => {
    if (!leads.find((l) => l.email === email)) {
      leads.push({ domain, email, context: '' });
    }
  });

  return leads;
}

/**
 * Fetch a single URL with timeout and simple retry.
 */
async function fetchUrl(url) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BotVaultPro/1.0)',
          Accept: 'text/html',
        },
        maxRedirects: 5,
      });
      return res.data;
    } catch (err) {
      if (attempt === 2) return null;
      await sleep(1000);
    }
  }
  return null;
}

/**
 * Scrape a single domain across multiple pages.
 * @param {string} domain  e.g. "acme.com"
 * @returns {Promise<Array>} array of lead objects
 */
async function scrapeDomain(domain) {
  const base = domain.startsWith('http') ? domain : `https://${domain}`;
  const allLeads = [];

  for (const page of PAGES_TO_TRY) {
    const url = `${base}${page}`;
    logger.info(`  Fetching ${url}`);
    const html = await fetchUrl(url);
    if (html) {
      const found = extractFromHtml(html, domain);
      found.forEach((lead) => {
        if (!allLeads.find((l) => l.email === lead.email)) {
          allLeads.push(lead);
        }
      });
    }
    await sleep(DELAY_MS);
  }

  return allLeads;
}

/**
 * Scrape multiple domains from a text file (one domain per line).
 * @param {string} filePath
 * @returns {Promise<Array>}
 */
async function scrapeFromFile(filePath) {
  const fs = require('fs');
  const lines = fs.readFileSync(filePath, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));

  const allLeads = [];
  for (const domain of lines) {
    logger.step(`Scraping ${domain}...`);
    const leads = await scrapeDomain(domain);
    logger.success(`  Found ${leads.length} lead(s) on ${domain}`);
    allLeads.push(...leads);
  }
  return allLeads;
}

module.exports = { scrapeDomain, scrapeFromFile };
