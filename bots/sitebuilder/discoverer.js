'use strict';
const fs = require('fs');
const axios = require('axios');
const logger = require('../lib/logger');

const DELAY_MS = 1200;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Parse a CSV file into an array of prospect objects.
 * Expected columns: name, location, email, website, business_type
 */
function parseProspectsCSV(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split('\n').filter((l) => l.trim() && !l.startsWith('#'));
  const [headerLine, ...rows] = lines;
  const headers = headerLine.split(',').map((h) => h.trim().toLowerCase());

  return rows.map((row) => {
    const vals = row.split(',').map((v) => v.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  }).filter((p) => p.name);
}

/**
 * Try to resolve a business's website URL using DuckDuckGo HTML search.
 * Falls back to a common domain pattern guess.
 */
async function findWebsite(name, location) {
  const query = encodeURIComponent(`"${name}" ${location} official website`);
  try {
    const res = await axios.get(`https://html.duckduckgo.com/html/?q=${query}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BotVaultPro/1.0)',
        Accept: 'text/html',
      },
    });

    // Extract first result URL
    const urlMatch = res.data.match(/uddg=([^"&]+)/);
    if (urlMatch) {
      const decoded = decodeURIComponent(urlMatch[1]);
      // Filter out social/directory sites
      const skip = ['facebook.com', 'yelp.com', 'google.com', 'yellowpages', 'linkedin.com', 'instagram.com'];
      if (!skip.some((s) => decoded.includes(s))) {
        return decoded;
      }
    }
  } catch {
    // Search failed — fall through to guess
  }

  // Guess from business name
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 20);
  return `https://${slug}.com`;
}

/**
 * Check if a URL is reachable and return basic metadata.
 * @returns {{ reachable: boolean, url: string, statusCode: number|null, html: string|null }}
 */
async function probeWebsite(url) {
  if (!url) return { reachable: false, url: '', statusCode: null, html: null };

  const normalized = url.startsWith('http') ? url : `https://${url}`;
  try {
    const res = await axios.get(normalized, {
      timeout: 12000,
      maxRedirects: 5,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BotVaultPro/1.0)' },
    });
    return { reachable: true, url: res.request.res?.responseUrl || normalized, statusCode: res.status, html: res.data };
  } catch (err) {
    const status = err.response?.status || null;
    return { reachable: false, url: normalized, statusCode: status, html: null };
  }
}

/**
 * Discover + classify all prospects from a CSV file.
 * Adds: resolvedUrl, reachable, html, needsWebsite (true = high priority lead)
 */
async function discoverProspects(filePath) {
  const prospects = parseProspectsCSV(filePath);
  logger.info(`Loaded ${prospects.length} prospect(s) from ${filePath}`);

  const enriched = [];
  for (const p of prospects) {
    logger.step(`Discovering: ${p.name} (${p.location})`);

    let website = p.website;
    if (!website) {
      logger.info('  No website in CSV — searching...');
      website = await findWebsite(p.name, p.location);
      logger.info(`  Found candidate: ${website}`);
      await sleep(DELAY_MS);
    }

    const probe = await probeWebsite(website);

    if (!probe.reachable) {
      logger.warn(`  Site unreachable (${probe.statusCode || 'no response'}) — flagged as NO WEBSITE`);
    } else {
      logger.success(`  Site live: ${probe.url}`);
    }

    enriched.push({
      ...p,
      resolvedUrl: probe.url,
      reachable: probe.reachable,
      html: probe.html,
      needsWebsite: !probe.reachable,
      stage: 'new',
      discoveredAt: new Date().toISOString(),
    });

    await sleep(DELAY_MS);
  }

  return enriched;
}

module.exports = { discoverProspects, probeWebsite, parseProspectsCSV };
