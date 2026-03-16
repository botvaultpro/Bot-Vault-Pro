'use strict';
const { chat } = require('../lib/claude');
const logger = require('../lib/logger');

const SYSTEM_PROMPT = `You are a B2B sales qualification expert. Given a list of leads and an Ideal Customer Profile (ICP) description, score each lead on a scale of 1-10 for fit. Return ONLY a valid JSON array — no markdown, no explanation.

Each item must have:
- "email": the lead's email (unchanged)
- "score": integer 1-10 (10 = perfect fit)
- "reason": one sentence explaining the score
- "isQualified": boolean (true if score >= 6)

Be strict. Low scores for generic emails (info@, hello@, noreply@). Higher scores for named decision-maker emails.`;

/**
 * Qualify a batch of raw leads using Claude.
 * @param {Array} leads  [{ domain, email, context }]
 * @param {string} icpDescription
 * @returns {Promise<Array>} leads enriched with score, reason, isQualified
 */
async function qualifyLeads(leads, icpDescription) {
  const BATCH_SIZE = 15;
  const qualified = [];

  for (let i = 0; i < leads.length; i += BATCH_SIZE) {
    const batch = leads.slice(i, i + BATCH_SIZE);
    logger.info(`  Qualifying leads ${i + 1}–${Math.min(i + BATCH_SIZE, leads.length)}...`);

    const userMessage = `ICP: ${icpDescription}\n\nLeads:\n${JSON.stringify(batch, null, 2)}`;

    try {
      const raw = await chat(SYSTEM_PROMPT, userMessage, 2048);
      const parsed = JSON.parse(raw);

      // Merge qualification data back into original leads
      batch.forEach((lead) => {
        const result = parsed.find((p) => p.email === lead.email) || {
          score: 1,
          reason: 'Unable to qualify',
          isQualified: false,
        };
        qualified.push({ ...lead, ...result });
      });
    } catch (err) {
      logger.warn(`  Qualification batch failed: ${err.message}. Skipping batch.`);
      batch.forEach((lead) => qualified.push({ ...lead, score: 0, reason: 'Error', isQualified: false }));
    }

    // Brief pause between batches
    if (i + BATCH_SIZE < leads.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return qualified;
}

module.exports = { qualifyLeads };
