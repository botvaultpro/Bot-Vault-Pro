'use strict';
const fs = require('fs');
const path = require('path');
const { chat } = require('../lib/claude');
const { sendEmail } = require('../lib/emailer');
const logger = require('../lib/logger');

const SENT_FILE = path.join(__dirname, 'sent-leads.json');

function loadSentLeads() {
  if (fs.existsSync(SENT_FILE)) {
    return JSON.parse(fs.readFileSync(SENT_FILE, 'utf8'));
  }
  return {};
}

function saveSentLeads(data) {
  fs.writeFileSync(SENT_FILE, JSON.stringify(data, null, 2));
}

const EMAIL_SEQUENCES = [
  {
    day: 1,
    type: 'intro',
    instruction: 'Write a short, personalized cold outreach email introducing our automation services. Be conversational, not salesy. Max 150 words.',
  },
  {
    day: 3,
    type: 'value',
    instruction: 'Write a follow-up email sharing one specific value point or case study about how we saved a similar company time/money. Max 120 words.',
  },
  {
    day: 7,
    type: 'breakup',
    instruction: 'Write a polite "breakup" email asking if timing is off. Keep it extremely brief and human. Max 60 words.',
  },
];

const EMAIL_SYSTEM = `You are an expert B2B cold email copywriter. You write concise, human, non-spammy outreach emails. Return ONLY a JSON object with "subject" and "body" (plain text). No markdown, no preamble.`;

/**
 * Generate a single email using Claude.
 */
async function generateEmail(lead, sequenceStep, fromName, fromCompany) {
  const user = `
Sender: ${fromName} at ${fromCompany}
Recipient company domain: ${lead.domain}
Recipient email: ${lead.email}
Lead context: ${lead.context || 'no additional context'}
Lead qualification reason: ${lead.reason || ''}
Task: ${sequenceStep.instruction}`;

  const raw = await chat(EMAIL_SYSTEM, user, 512);
  return JSON.parse(raw);
}

/**
 * Send the full 3-email drip sequence to a qualified lead.
 * Tracks sent state so leads are never emailed twice per step.
 * @param {object} lead
 * @param {boolean} dryRun  - if true, log but don't send
 */
async function sendSequence(lead, dryRun = false) {
  const sent = loadSentLeads();
  const key = lead.email;
  if (!sent[key]) sent[key] = {};

  const fromName = process.env.FROM_NAME || 'Bot Vault Pro';
  const fromCompany = process.env.FROM_COMPANY || 'Bot Vault Pro';

  for (const step of EMAIL_SEQUENCES) {
    if (sent[key][step.type]) {
      logger.info(`  Skipping ${step.type} email to ${lead.email} (already sent)`);
      continue;
    }

    try {
      logger.info(`  Generating ${step.type} email for ${lead.email}...`);
      const { subject, body } = await generateEmail(lead, step, fromName, fromCompany);

      if (dryRun) {
        logger.data(`  [DRY RUN] To: ${lead.email}`);
        logger.data(`  Subject: ${subject}`);
        logger.data(`  Body:\n${body}`);
      } else {
        await sendEmail({ to: lead.email, subject, text: body });
        logger.success(`  Sent ${step.type} email to ${lead.email}`);
      }

      sent[key][step.type] = new Date().toISOString();
      saveSentLeads(sent);
    } catch (err) {
      logger.error(`  Failed to send ${step.type} email to ${lead.email}: ${err.message}`);
    }

    await new Promise((r) => setTimeout(r, 800));
  }
}

/**
 * Send sequences to all qualified leads.
 */
async function sendToAllQualified(leads, dryRun = false) {
  const qualified = leads.filter((l) => l.isQualified);
  logger.step(`Sending sequences to ${qualified.length} qualified lead(s)...`);
  for (const lead of qualified) {
    await sendSequence(lead, dryRun);
  }
}

module.exports = { sendSequence, sendToAllQualified };
