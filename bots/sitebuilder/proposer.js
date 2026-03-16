'use strict';
const { chat } = require('../lib/claude');
const { sendEmail } = require('../lib/emailer');
const { recordEmail } = require('./pipeline');
const logger = require('../lib/logger');

// Email sequence definitions — indexed by step number (0-based)
const SEQUENCE_STEPS = [
  {
    type: 'intro',
    dayLabel: 'Day 1',
    instruction: `Write a short, genuine cold outreach email from a web designer to a local business owner.
The designer has already built a FREE sample website for the business and wants to share it.
Tone: friendly, professional, no hard sell. Lead with the value (free demo). Max 180 words.
Mention 2 specific weaknesses of their current site (or that they have no website).
End with a simple CTA: reply to see the demo or book a free 15-min call.
Include a P.S. line that reinforces the free demo.`,
  },
  {
    type: 'followup_1',
    dayLabel: 'Day 4',
    instruction: `Write a brief, warm follow-up email (they didn't reply to the first).
Reference the demo site built for them. Share one quick stat or benefit (e.g. mobile traffic = 60% of searches).
Very short — 80 words max. Soft CTA only.`,
  },
  {
    type: 'followup_2',
    dayLabel: 'Day 10',
    instruction: `Write a final "breakup" email. Acknowledge they're probably busy.
Mention the demo will be taken down soon (creates mild urgency — do NOT be pushy).
Offer to send the demo files for free if they're not interested in services.
50 words max. Completely no-pressure.`,
  },
];

const EMAIL_SYSTEM = `You are an expert freelance web designer writing outreach emails. You write concise, warm, authentic emails — not salesy or spammy. Return ONLY a JSON object with "subject" and "body" (plain text, use line breaks). No markdown, no preamble.`;

/**
 * Generate one proposal email with Claude.
 */
async function generateProposalEmail(prospect, step, freelancerName, demoUrl) {
  const weaknessList = (prospect.weaknesses || []).slice(0, 2).join('; ');

  const user = `
Freelancer name: ${freelancerName}
Business name: ${prospect.name}
Business type: ${prospect.business_type || 'local business'}
Location: ${prospect.location}
Current site score: ${prospect.siteScore === 0 ? 'NO WEBSITE' : `${prospect.siteScore}/10`}
Key weaknesses: ${weaknessList || 'outdated website'}
Demo URL/location: ${demoUrl || 'available on request'}
Estimated project value: $${prospect.estimatedValue || 1500}
Email sequence step: ${step.dayLabel}
Task: ${step.instruction}`;

  const raw = await chat(EMAIL_SYSTEM, user, 600);
  return JSON.parse(raw);
}

/**
 * Send a single proposal step to a prospect.
 * @param {object} prospect
 * @param {object} step        - from SEQUENCE_STEPS
 * @param {string} freelancerName
 * @param {string} demoUrl     - URL or file path to demo
 * @param {boolean} dryRun
 */
async function sendProposalStep(prospect, step, freelancerName, demoUrl, dryRun) {
  logger.info(`  Generating ${step.type} email for ${prospect.name}...`);

  const { subject, body } = await generateProposalEmail(prospect, step, freelancerName, demoUrl);

  if (dryRun) {
    logger.data(`  [DRY RUN] To: ${prospect.email}`);
    logger.data(`  Subject: ${subject}`);
    logger.data(`  Body:\n${body}\n`);
    recordEmail(prospect.email, step.type);
    return;
  }

  await sendEmail({ to: prospect.email, subject, text: body });
  logger.success(`  Sent ${step.type} to ${prospect.email}`);
  recordEmail(prospect.email, step.type);
}

/**
 * Send the full proposal sequence to a prospect.
 * @param {object} prospect
 * @param {object} opts
 * @param {string} opts.freelancerName
 * @param {string} opts.demoUrl
 * @param {number} opts.maxSteps       - tier limit (1 = intro only, 3 = full sequence)
 * @param {boolean} opts.dryRun
 */
async function sendProposal(prospect, { freelancerName, demoUrl, maxSteps = 1, dryRun = false }) {
  if (!prospect.email) {
    logger.warn(`  No email for ${prospect.name} — skipping`);
    return;
  }

  const stepsToSend = SEQUENCE_STEPS.slice(0, maxSteps);
  logger.step(`Sending ${stepsToSend.length}-step proposal to ${prospect.name} (${prospect.email})`);

  for (const step of stepsToSend) {
    try {
      await sendProposalStep(prospect, step, freelancerName, demoUrl, dryRun);
    } catch (err) {
      logger.error(`  Failed ${step.type} email: ${err.message}`);
    }
    if (stepsToSend.indexOf(step) < stepsToSend.length - 1) {
      await new Promise((r) => setTimeout(r, 800));
    }
  }
}

module.exports = { sendProposal, SEQUENCE_STEPS };
