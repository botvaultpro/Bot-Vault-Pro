#!/usr/bin/env node
'use strict';
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const logger = require('../lib/logger');
const { sendEmail } = require('../lib/emailer');
const { getTier, printTierBanner, checkMonthlyQuota, requireFeature, incrementUsage } = require('../lib/tiers');
const { loadKnowledgeBase, generateReply } = require('./responder');
const { pollInbox } = require('./imap-listener');

const TICKETS_LOG = path.join(__dirname, 'tickets.log');

function logTicket(from, subject, status, confidence) {
  const line = `[${new Date().toISOString()}] FROM: ${from} | SUBJECT: ${subject} | STATUS: ${status} | CONFIDENCE: ${confidence}\n`;
  fs.appendFileSync(TICKETS_LOG, line, 'utf8');
}

async function handleEmail(email, knowledgeBase, companyName, dryRun, minConfidence, tierLimits) {
  // Enforce monthly ticket quota
  checkMonthlyQuota('supportdesk', tierLimits.maxTicketsPerMonth, 'tickets');

  logger.step(`Processing email from ${email.from}: "${email.subject}"`);

  const { subject, body, confidence } = await generateReply(email.text, knowledgeBase, companyName);

  logger.info(`  AI confidence: ${(confidence * 100).toFixed(0)}% (threshold: ${(minConfidence * 100).toFixed(0)}%)`);

  if (confidence < minConfidence) {
    logger.warn(`  Low confidence — escalating to human agent`);
    logTicket(email.from, email.subject, 'escalated', confidence);

    // Escalation email is a Growth+ feature
    if (tierLimits.escalationEmail && !dryRun) {
      const supportInbox = process.env.ESCALATION_EMAIL || process.env.SMTP_USER;
      if (supportInbox) {
        await sendEmail({
          to: supportInbox,
          subject: `[ESCALATION NEEDED] ${email.subject}`,
          text: `This ticket requires human review.\n\nFrom: ${email.from}\nSubject: ${email.subject}\n\nOriginal message:\n${email.text}\n\n---\nAI draft (confidence ${(confidence * 100).toFixed(0)}%):\n${body}`,
        });
      }
    } else if (!tierLimits.escalationEmail) {
      logger.warn('  Escalation email requires Growth or Enterprise plan.');
    }
    return;
  }

  const toMatch = email.from.match(/<(.+?)>/) || [null, email.from.trim()];
  const toEmail = toMatch[1];

  if (dryRun) {
    logger.data('\n--- DRY RUN REPLY PREVIEW ---');
    logger.data(`To:      ${toEmail}`);
    logger.data(`Subject: ${subject}`);
    logger.data(`Body:\n${body}`);
    logger.data('---\n');
  } else {
    await sendEmail({ to: toEmail, subject, text: body });
    logger.success(`  Reply sent to ${toEmail}`);
  }

  logTicket(email.from, email.subject, dryRun ? 'dry-run' : 'replied', confidence);

  // Track usage
  incrementUsage('supportdesk');
}

// ─── Commands ─────────────────────────────────────────────────────────────────

program
  .name('supportdesk')
  .description('SupportDesk Bot — AI-powered email support with knowledge base')
  .version('1.0.0');

program
  .command('reply')
  .description('Answer a one-off customer message (available on all plans)')
  .option('-m, --message <text>', 'Customer message text')
  .option('--dry-run', 'Print reply to console, do not send', true)
  .action(async (opts) => {
    printTierBanner('SupportDesk Bot');

    const message = opts.message || '';
    if (!message) {
      logger.error('Please provide a message with --message "..."');
      process.exit(1);
    }

    const tier = getTier();
    const limits = tier.supportdesk;

    // Enforce monthly quota even in reply mode
    checkMonthlyQuota('supportdesk', limits.maxTicketsPerMonth, 'tickets');

    logger.step('Loading knowledge base...');
    const knowledgeBase = loadKnowledgeBase(limits.maxKnowledgeFiles);
    const companyName = process.env.COMPANY_NAME || 'Bot Vault Pro';

    // On Starter, min confidence is fixed; on Growth+ it's configurable
    const minConfidence = limits.minConfidenceFixed !== null
      ? limits.minConfidenceFixed
      : parseFloat(process.env.AUTO_REPLY_MIN_CONFIDENCE || '0.7');

    logger.info(`Tier: ${tier.label} | Knowledge files cap: ${limits.maxKnowledgeFiles === Infinity ? 'Unlimited' : limits.maxKnowledgeFiles} | Min confidence: ${(minConfidence * 100).toFixed(0)}%`);
    logger.blank();

    logger.step('Generating AI reply...');
    const { subject, body, confidence } = await generateReply(message, knowledgeBase, companyName);

    logger.blank();
    logger.data(`Subject: ${subject}`);
    logger.data(`Confidence: ${(confidence * 100).toFixed(0)}%`);
    logger.data('Reply:');
    console.log('\n' + body + '\n');

    incrementUsage('supportdesk');
    logger.divider();
  });

program
  .command('start')
  .description('Start polling inbox for new emails and auto-reply (Growth/Enterprise only)')
  .option('-i, --interval <seconds>', 'Poll interval in seconds', '60')
  .option('--dry-run', 'Generate replies but do not send them', false)
  .action(async (opts) => {
    printTierBanner('SupportDesk Bot');

    const tier = getTier();
    const limits = tier.supportdesk;

    // Gate: IMAP polling is a Growth+ feature
    requireFeature(limits.imapPolling, 'Inbox polling (IMAP)');

    const intervalMs = parseInt(opts.interval, 10) * 1000;
    const minConfidence = limits.minConfidenceFixed !== null
      ? limits.minConfidenceFixed
      : parseFloat(process.env.AUTO_REPLY_MIN_CONFIDENCE || '0.7');
    const companyName = process.env.COMPANY_NAME || 'Bot Vault Pro';

    logger.step('SupportDesk Bot — Starting inbox polling');
    logger.step(`Tier: ${tier.label} | Poll interval: ${opts.interval}s | Dry run: ${opts.dryRun} | Min confidence: ${(minConfidence * 100).toFixed(0)}% | Ticket quota: ${limits.maxTicketsPerMonth === Infinity ? 'Unlimited' : limits.maxTicketsPerMonth}/mo`);
    logger.divider();

    logger.step('Loading knowledge base...');
    const knowledgeBase = loadKnowledgeBase(limits.maxKnowledgeFiles);

    if (!knowledgeBase) {
      logger.warn('Knowledge base is empty. Add .md files to supportdesk/knowledge/');
    }

    const tick = async () => {
      logger.step('Polling inbox...');
      try {
        await pollInbox((email) =>
          handleEmail(email, knowledgeBase, companyName, opts.dryRun, minConfidence, limits)
        );
      } catch (err) {
        logger.error(`Inbox poll failed: ${err.message}`);
      }
    };

    await tick();
    setInterval(tick, intervalMs);
    logger.info(`Next poll in ${opts.interval}s... (Press Ctrl+C to stop)`);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.help();
}
