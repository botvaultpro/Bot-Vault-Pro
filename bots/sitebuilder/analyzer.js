'use strict';
const cheerio = require('cheerio');
const { chat } = require('../lib/claude');
const logger = require('../lib/logger');

/**
 * Run lightweight heuristic checks on HTML without a browser.
 * Returns a signals object used for both quick scoring and AI prompting.
 */
function extractSignals(html, url) {
  if (!html) {
    return {
      hasSSL: url ? url.startsWith('https') : false,
      hasMobileViewport: false,
      hasTitle: false,
      hasMetaDescription: false,
      hasContactInfo: false,
      hasImages: false,
      wordCount: 0,
      isTablesLayout: false,
      hasModernFramework: false,
      copyrightYear: null,
      pageSize: 0,
    };
  }

  const $ = cheerio.load(html);

  // Check for tables-based layout (sign of very old site)
  const tableCount = $('table').length;
  const divCount = $('div').length;
  const isTablesLayout = tableCount > 3 && tableCount > divCount;

  // Copyright year in footer
  const bodyText = $('body').text();
  const yearMatch = bodyText.match(/©\s*(\d{4})/);
  const copyrightYear = yearMatch ? parseInt(yearMatch[1], 10) : null;

  // Word count (rough)
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;

  // Contact info signals
  const hasPhone = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/.test(bodyText);
  const hasEmailContact = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/.test(bodyText);

  return {
    hasSSL: url ? url.startsWith('https') : false,
    hasMobileViewport: $('meta[name="viewport"]').length > 0,
    hasTitle: $('title').text().trim().length > 3,
    hasMetaDescription: $('meta[name="description"]').attr('content')?.length > 10,
    hasContactInfo: hasPhone || hasEmailContact,
    hasImages: $('img').length > 0,
    wordCount,
    isTablesLayout,
    hasModernFramework: html.includes('bootstrap') || html.includes('tailwind') || html.includes('react') || html.includes('vue'),
    copyrightYear,
    pageSize: html.length,
  };
}

/**
 * Quick heuristic score (0-10). Used on Starter tier instead of AI.
 */
function heuristicScore(signals) {
  let score = 10;
  if (!signals.hasSSL) score -= 2;
  if (!signals.hasMobileViewport) score -= 2;
  if (!signals.hasTitle) score -= 1;
  if (!signals.hasMetaDescription) score -= 1;
  if (!signals.hasContactInfo) score -= 1;
  if (!signals.hasImages) score -= 1;
  if (signals.isTablesLayout) score -= 2;
  if (signals.wordCount < 100) score -= 1;
  if (signals.copyrightYear && signals.copyrightYear < 2018) score -= 1;
  return Math.max(1, score);
}

/**
 * AI-powered site analysis using Claude. Returns score + weakness list.
 * Growth/Enterprise only.
 */
async function aiAnalyzeSite(prospect, signals) {
  const system = `You are a professional web designer and digital marketing consultant. Analyze a business website and identify improvement opportunities. Return ONLY valid JSON with:
- "score": integer 1-10 (1=terrible, 10=excellent modern site)
- "weaknesses": array of 3-5 specific, actionable weakness strings
- "opportunity": one sentence describing the business opportunity for a web designer
- "estimatedValue": estimated project value in USD as a number (e.g. 1500)`;

  const user = `Business: ${prospect.name} (${prospect.business_type || 'local business'}) in ${prospect.location}
Website URL: ${prospect.resolvedUrl}
Has SSL: ${signals.hasSSL}
Mobile-optimized: ${signals.hasMobileViewport}
Has meta description: ${signals.hasMetaDescription}
Word count: ${signals.wordCount}
Has contact info: ${signals.hasContactInfo}
Tables-based layout: ${signals.isTablesLayout}
Modern framework: ${signals.hasModernFramework}
Copyright year: ${signals.copyrightYear || 'unknown'}
Page size (bytes): ${signals.pageSize}

Assess this site and provide your analysis.`;

  const raw = await chat(system, user, 512);
  return JSON.parse(raw);
}

/**
 * Full analysis of a single prospect.
 * @param {object} prospect  - from discoverer, must have html, resolvedUrl, needsWebsite
 * @param {boolean} useAI    - true = Growth/Enterprise tier
 * @returns {object}  prospect enriched with siteScore, weaknesses, opportunity, estimatedValue
 */
async function analyzeProspect(prospect, useAI = true) {
  logger.info(`  Analyzing: ${prospect.name}`);

  if (prospect.needsWebsite || !prospect.html) {
    logger.warn(`  No website detected — highest priority prospect`);
    return {
      ...prospect,
      siteScore: 0,
      weaknesses: ['No website found', 'Missing from online search results', 'Losing customers to competitors with websites'],
      opportunity: `${prospect.name} has no online presence — ideal candidate for a new website build.`,
      estimatedValue: 2500,
      stage: 'analyzed',
    };
  }

  const signals = extractSignals(prospect.html, prospect.resolvedUrl);

  let score, weaknesses, opportunity, estimatedValue;

  if (useAI) {
    try {
      const ai = await aiAnalyzeSite(prospect, signals);
      score = ai.score;
      weaknesses = ai.weaknesses;
      opportunity = ai.opportunity;
      estimatedValue = ai.estimatedValue;
    } catch (err) {
      logger.warn(`  AI analysis failed (${err.message}) — falling back to heuristic`);
      score = heuristicScore(signals);
      weaknesses = buildHeuristicWeaknesses(signals);
      opportunity = `${prospect.name}'s website scores ${score}/10 and could be significantly improved.`;
      estimatedValue = score <= 4 ? 2000 : 1000;
    }
  } else {
    score = heuristicScore(signals);
    weaknesses = buildHeuristicWeaknesses(signals);
    opportunity = `${prospect.name}'s website scores ${score}/10 and could be significantly improved.`;
    estimatedValue = score <= 4 ? 2000 : 1000;
  }

  const isGoodLead = score <= 6; // Only pursue weak sites

  logger.info(`  Score: ${score}/10 | Lead: ${isGoodLead ? 'YES' : 'skip (site too good)'} | Est. value: $${estimatedValue}`);

  return {
    ...prospect,
    siteScore: score,
    signals,
    weaknesses,
    opportunity,
    estimatedValue,
    isGoodLead,
    stage: 'analyzed',
  };
}

function buildHeuristicWeaknesses(signals) {
  const w = [];
  if (!signals.hasSSL) w.push('No SSL certificate (site shows as "Not Secure" in browsers)');
  if (!signals.hasMobileViewport) w.push('Not mobile-optimized — fails on smartphones');
  if (!signals.hasMetaDescription) w.push('Missing meta description — hurts Google ranking');
  if (!signals.hasContactInfo) w.push('No visible contact information');
  if (signals.isTablesLayout) w.push('Outdated table-based layout from early 2000s');
  if (signals.wordCount < 100) w.push('Very thin content — not enough for search engines');
  if (signals.copyrightYear && signals.copyrightYear < 2018) w.push(`Last updated ${signals.copyrightYear} — looks abandoned`);
  return w.slice(0, 4).length ? w.slice(0, 4) : ['Website needs a modern redesign'];
}

module.exports = { analyzeProspect, extractSignals, heuristicScore };
